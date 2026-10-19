import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "./db.js";

export async function migrate(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id text PRIMARY KEY,
      aplicado_en timestamptz NOT NULL DEFAULT now()
    )
  `);

  const directory = path.join(path.dirname(fileURLToPath(import.meta.url)), "../migrations");
  const files = (await readdir(directory)).filter((name) => name.endsWith(".sql")).sort();
  for (const file of files) {
    const applied = await pool.query("SELECT 1 FROM schema_migrations WHERE id = $1", [file]);
    if (applied.rowCount) continue;
    const sql = await readFile(path.join(directory, file), "utf8");
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations (id) VALUES ($1)", [file]);
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}
