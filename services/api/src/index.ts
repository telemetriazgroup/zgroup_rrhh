import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import Fastify from "fastify";
import { registerAuth } from "./auth.js";
import { config } from "./config.js";
import { pool } from "./db.js";
import { registerIdentityRoutes } from "./identity.js";
import { migrate } from "./migrate.js";
import { seedDevUsers } from "./seed.js";

const app = Fastify({ logger: true });

await migrate();
await seedDevUsers();

await app.register(cors, {
  origin: [
    config.corsOrigin,
    config.mobileOrigin,
    "http://localhost:8443",
    "http://127.0.0.1:8443",
    "http://localhost:18180",
    "http://localhost:18183",
  ],
  allowedHeaders: ["Content-Type", "Authorization"],
});
await app.register(multipart, {
  limits: { fileSize: 8 * 1024 * 1024, files: 1 },
});

app.setErrorHandler((error, request, reply) => {
  const code = typeof error === "object" && error !== null && "code" in error ? error.code : undefined;
  if (code === "FST_REQ_FILE_TOO_LARGE") {
    return reply.code(413).send({ message: "La imagen supera 8 MB." });
  }
  const message = error instanceof Error ? error.message : "error";
  request.log.error({ code, message }, "error no controlado");
  return reply.code(500).send({ message: "No se pudo procesar la solicitud." });
});

app.get("/health", async () => {
  await pool.query("select 1");
  const vision = await fetch(`${config.visionUrl}/health`, {
    signal: AbortSignal.timeout(3_000),
  });
  if (!vision.ok) {
    throw new Error("vision no disponible");
  }
  return { status: "ok" };
});

registerAuth(app);
registerIdentityRoutes(app);

const close = async () => {
  await app.close();
  await pool.end();
};

process.on("SIGTERM", () => {
  void close();
});
process.on("SIGINT", () => {
  void close();
});

await app.listen({ port: config.port, host: "0.0.0.0" });
