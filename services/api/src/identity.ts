import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { config } from "./config.js";
import { pool } from "./db.js";
import { extractDocument, type VisionExtraction } from "./vision.js";

const documentTypeSchema = z.enum(["fotocheck", "dni"]);
const dniSchema = z.string().regex(/^[0-9]{8}$/);

type WorkerMatch = {
  id: string;
  codigo: string;
  nombre: string;
  apellido: string;
  area: string;
  cargo: string;
  estado: string;
  enFlujoControl: boolean;
};

type CaptureStatus =
  | "extraida_con_perfil"
  | "extraida_sin_perfil"
  | "requiere_revision"
  | "rechazada"
  | "ilegible"
  | "motor_no_disponible";

function maskDni(dni: string | null): string | null {
  if (!dni) return null;
  if (dni.length <= 3) return "***";
  return `${"*".repeat(dni.length - 3)}${dni.slice(-3)}`;
}

function needsReview(extraction: VisionExtraction): boolean {
  const scores = extraction.confianza;
  return [scores.nombre, scores.apellido, scores.dni, scores.foto].some(
    (score) => score < config.minConfidence,
  );
}

function resolveStatus(
  extraction: VisionExtraction,
  worker: WorkerMatch | null,
): CaptureStatus {
  if (extraction.estado === "rechazado") return "rechazada";
  if (extraction.estado === "ilegible") return "ilegible";
  if (extraction.estado === "motor_no_disponible") return "motor_no_disponible";
  if (!dniSchema.safeParse(extraction.dni).success || needsReview(extraction)) {
    return "requiere_revision";
  }
  return worker ? "extraida_con_perfil" : "extraida_sin_perfil";
}

function nextStep(status: CaptureStatus): string {
  switch (status) {
    case "extraida_con_perfil":
      return "Confirme visualmente nombre, DNI y foto antes de marcar. Esta captura no registra la marcación.";
    case "extraida_sin_perfil":
      return "No hay un perfil con ese DNI. No se creó un trabajador.";
    case "requiere_revision":
      return "La extracción no alcanza el umbral de confianza. Use QR o búsqueda manual.";
    case "rechazada":
      return "La imagen no es válida. Tome otra foto del documento.";
    case "ilegible":
      return "No se pudo leer el documento. Tome otra foto con mejor luz y encuadre.";
    case "motor_no_disponible":
      return "El reconocimiento no está disponible. Use QR o búsqueda manual.";
  }
}

export function registerIdentityRoutes(app: FastifyInstance): void {
  app.post("/api/v1/identidad/capturas", async (request, reply) => {
    let tipoDocumento: string | undefined;
    let image: Buffer | undefined;
    let mime = "application/octet-stream";

    for await (const part of request.parts()) {
      if (part.type === "file" && part.fieldname === "imagen") {
        image = await part.toBuffer();
        mime = part.mimetype;
      } else if (part.type === "field" && part.fieldname === "tipoDocumento") {
        tipoDocumento = String(part.value);
      }
    }

    const parsedType = documentTypeSchema.safeParse(tipoDocumento);
    if (!parsedType.success || !image || image.length === 0) {
      return reply.code(400).send({
        message: "Envíe tipoDocumento (fotocheck o dni) y una imagen.",
      });
    }

    const inserted = await pool.query<{ id: string }>(
      `INSERT INTO capturas_documento (tipo_documento, estado, motor, vigilante_id, terminal_id)
       VALUES ($1, 'recibida', 'pendiente', $2, $3)
       RETURNING id`,
      [parsedType.data, request.usuario?.id ?? null, request.usuario?.terminalId ?? null],
    );
    const capturaId = inserted.rows[0]?.id;
    if (!capturaId) {
      throw new Error("No se pudo registrar la captura");
    }

    let extraction: VisionExtraction;
    try {
      extraction = await extractDocument(image, mime, parsedType.data);
    } catch (error) {
      const advertencias = ["No se pudo consultar el servicio de reconocimiento."];
      await pool.query(
        `UPDATE capturas_documento
         SET estado = 'motor_no_disponible', motor = 'unreachable', advertencias = $2::jsonb
         WHERE id = $1`,
        [capturaId, JSON.stringify(advertencias)],
      );
      request.log.error(
        { capturaId, message: error instanceof Error ? error.message : "vision" },
        "vision no disponible",
      );
      return reply.code(502).send({
        capturaId,
        tipoDocumento: parsedType.data,
        motor: "unreachable",
        estado: "motor_no_disponible",
        extraccion: null,
        cotejo: null,
        advertencias,
        siguientePaso: nextStep("motor_no_disponible"),
      });
    }

    let worker: WorkerMatch | null = null;
    if (dniSchema.safeParse(extraction.dni).success) {
      const found = await pool.query<{
        id: string;
        codigo: string;
        nombre: string;
        apellido: string;
        area: string;
        cargo: string;
        estado: string;
        en_flujo_control: boolean;
      }>(
        `SELECT id, codigo, nombre, apellido, area, cargo, estado, en_flujo_control
         FROM trabajadores
         WHERE dni = $1`,
        [extraction.dni],
      );
      const row = found.rows[0];
      if (row) {
        worker = {
          id: row.id,
          codigo: row.codigo,
          nombre: row.nombre,
          apellido: row.apellido,
          area: row.area,
          cargo: row.cargo,
          estado: row.estado,
          enFlujoControl: row.en_flujo_control,
        };
      }
    }

    const estado = resolveStatus(extraction, worker);
    await pool.query(
      `UPDATE capturas_documento
       SET estado = $2,
           motor = $3,
           nombre_extraido = $4,
           apellido_extraido = $5,
           dni_extraido = $6,
           confianza = $7::jsonb,
           advertencias = $8::jsonb,
           trabajador_id = $9
       WHERE id = $1`,
      [
        capturaId,
        estado,
        extraction.motor,
        extraction.nombre,
        extraction.apellido,
        extraction.dni,
        JSON.stringify(extraction.confianza),
        JSON.stringify(extraction.advertencias),
        worker?.id ?? null,
      ],
    );
    await pool.query(
      `INSERT INTO auditoria (entidad, entidad_id, accion, detalle)
       VALUES ('capturas_documento', $1, 'extraer', $2::jsonb)`,
      [
        capturaId,
        JSON.stringify({
          motor: extraction.motor,
          estado,
          dni: maskDni(extraction.dni),
          cotejo: worker ? "encontrado" : "sin_perfil",
        }),
      ],
    );

    request.log.info(
      { capturaId, estado, motor: extraction.motor, dni: maskDni(extraction.dni) },
      "captura procesada",
    );

    return reply.send({
      capturaId,
      tipoDocumento: parsedType.data,
      motor: extraction.motor,
      estado,
      extraccion: {
        nombre: extraction.nombre,
        apellido: extraction.apellido,
        dni: extraction.dni,
        foto: extraction.foto,
        confianza: extraction.confianza,
      },
      cotejo: worker,
      advertencias: extraction.advertencias,
      siguientePaso: nextStep(estado),
    });
  });
}
