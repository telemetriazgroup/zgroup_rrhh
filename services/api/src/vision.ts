import { z } from "zod";
import { config } from "./config.js";

const extractionSchema = z.object({
  tipoDocumento: z.enum(["fotocheck", "dni"]),
  motor: z.string(),
  estado: z.enum(["extraido", "ilegible", "rechazado", "motor_no_disponible"]),
  nombre: z.string().nullable(),
  apellido: z.string().nullable(),
  dni: z.string().nullable(),
  foto: z.string().nullable(),
  confianza: z.object({
    nombre: z.number(),
    apellido: z.number(),
    dni: z.number(),
    foto: z.number(),
  }),
  advertencias: z.array(z.string()),
});

export type VisionExtraction = z.infer<typeof extractionSchema>;

export async function extractDocument(
  image: Buffer,
  mime: string,
  tipoDocumento: "fotocheck" | "dni",
): Promise<VisionExtraction> {
  const form = new FormData();
  form.append("tipoDocumento", tipoDocumento);
  form.append(
    "imagen",
    new Blob([new Uint8Array(image)], { type: mime || "image/jpeg" }),
    "captura.jpg",
  );

  const response = await fetch(`${config.visionUrl}/v1/documentos/extraer`, {
    method: "POST",
    headers: { "X-Vision-Key": config.visionKey },
    body: form,
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    throw new Error(`El servicio de visión respondió ${response.status}`);
  }

  const parsed = extractionSchema.safeParse(await response.json());
  if (!parsed.success) {
    throw new Error("La respuesta de visión no cumple el contrato");
  }
  return parsed.data;
}
