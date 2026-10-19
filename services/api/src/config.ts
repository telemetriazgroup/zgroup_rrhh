function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Falta la variable ${name}`);
  }
  return value;
}

const minConfidence = Number(process.env.IDENTITY_MIN_CONFIDENCE ?? 0.85);

export const config = {
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: required("DATABASE_URL"),
  visionUrl: required("VISION_URL", "http://vision:8081"),
  visionKey: process.env.VISION_SHARED_SECRET ?? "",
  minConfidence: Number.isFinite(minConfidence) ? minConfidence : 0.85,
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:18180",
  mobileOrigin: process.env.MOBILE_ORIGIN ?? "http://localhost:18183",
  seedDevUsers: (process.env.SEED_DEV_USERS ?? "true") === "true",
  seedDevPassword: process.env.SEED_DEV_PASSWORD ?? "GaritaDev2026",
  sessionHours: 12,
  sessionRememberHours: 24 * 14,
};
