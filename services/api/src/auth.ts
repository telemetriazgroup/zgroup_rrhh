import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { config } from "./config.js";
import { pool } from "./db.js";
import { hashSessionToken, newSessionToken, verifyPassword } from "./passwords.js";

export type SessionUser = {
  id: string;
  username: string;
  nombre: string;
  rol: "vigilante" | "rrhh_consulta" | "rrhh_admin" | "jefe";
  terminalId: string | null;
  terminalNombre: string | null;
};

declare module "fastify" {
  interface FastifyRequest {
    usuario: SessionUser | null;
  }
}

const loginSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
  mantenerSesion: z.boolean().optional(),
});

const INVALID = { message: "Credenciales inválidas." };

export function registerAuth(app: FastifyInstance): void {
  app.decorateRequest("usuario", null);

  app.addHook("onRequest", async (request, reply) => {
    if (!request.url.startsWith("/api/") || request.url === "/api/v1/auth/login") return;

    const header = request.headers.authorization ?? "";
    const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : "";
    if (!token) {
      return reply.code(401).send({ message: "Sesión requerida." });
    }

    const user = await findSession(token);
    if (!user) {
      return reply.code(401).send({ message: "Sesión inválida o vencida." });
    }
    request.usuario = user;
  });

  app.post("/api/v1/auth/login", async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(401).send(INVALID);
    }

    const found = await pool.query<{
      id: string;
      username: string;
      nombre: string;
      rol: SessionUser["rol"];
      password_hash: string;
      activo: boolean;
      terminal_id: string | null;
      terminal_nombre: string | null;
    }>(
      `SELECT u.id, u.username, u.nombre, u.rol, u.password_hash, u.activo,
              u.terminal_id, t.nombre AS terminal_nombre
       FROM usuarios u
       LEFT JOIN terminales t ON t.id = u.terminal_id
       WHERE u.username = $1`,
      [parsed.data.username],
    );
    const account = found.rows[0];
    const passwordOk = account ? await verifyPassword(parsed.data.password, account.password_hash) : false;
    if (!account || !account.activo || !passwordOk) {
      return reply.code(401).send(INVALID);
    }

    const token = newSessionToken();
    const hours = parsed.data.mantenerSesion ? config.sessionRememberHours : config.sessionHours;
    const expires = new Date(Date.now() + hours * 60 * 60 * 1000);
    await pool.query(
      `INSERT INTO sesiones (usuario_id, token_hash, expira_en) VALUES ($1, $2, $3)`,
      [account.id, token.hash, expires.toISOString()],
    );

    const usuario = toUser(account);
    request.log.info({ usuarioId: usuario.id, rol: usuario.rol }, "sesión iniciada");
    return reply.send({
      token: token.raw,
      expiraEn: expires.toISOString(),
      usuario,
    });
  });

  app.get("/api/v1/auth/sesion", async (request) => {
    return { usuario: request.usuario };
  });

  app.post("/api/v1/auth/logout", async (request, reply) => {
    const header = request.headers.authorization ?? "";
    const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : "";
    if (token) {
      await pool.query(
        `UPDATE sesiones SET revocada_en = now() WHERE token_hash = $1 AND revocada_en IS NULL`,
        [hashSessionToken(token)],
      );
    }
    return reply.send({ ok: true });
  });
}

async function findSession(rawToken: string): Promise<SessionUser | null> {
  const found = await pool.query<{
    id: string;
    username: string;
    nombre: string;
    rol: SessionUser["rol"];
    terminal_id: string | null;
    terminal_nombre: string | null;
  }>(
    `SELECT u.id, u.username, u.nombre, u.rol, u.terminal_id, t.nombre AS terminal_nombre
     FROM sesiones s
     JOIN usuarios u ON u.id = s.usuario_id
     LEFT JOIN terminales t ON t.id = u.terminal_id
     WHERE s.token_hash = $1
       AND s.revocada_en IS NULL
       AND s.expira_en > now()
       AND u.activo = true`,
    [hashSessionToken(rawToken)],
  );
  const row = found.rows[0];
  return row ? toUser(row) : null;
}

function toUser(row: {
  id: string;
  username: string;
  nombre: string;
  rol: SessionUser["rol"];
  terminal_id: string | null;
  terminal_nombre: string | null;
}): SessionUser {
  return {
    id: row.id,
    username: row.username,
    nombre: row.nombre,
    rol: row.rol,
    terminalId: row.terminal_id,
    terminalNombre: row.terminal_nombre,
  };
}
