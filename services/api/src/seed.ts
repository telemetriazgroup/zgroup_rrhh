import { config } from "./config.js";
import { pool } from "./db.js";
import { hashPassword } from "./passwords.js";

const DEV_USERS = [
  { username: "vigilante", nombre: "R. Chávez", rol: "vigilante", terminal: "GARITA-PRINCIPAL" },
  { username: "rrhh", nombre: "Administración RR.HH.", rol: "rrhh_admin", terminal: null },
  { username: "jefe", nombre: "Jefe de Producción", rol: "jefe", terminal: null },
] as const;

export async function seedDevUsers(): Promise<void> {
  if (!config.seedDevUsers) return;
  const passwordHash = await hashPassword(config.seedDevPassword);

  for (const user of DEV_USERS) {
    const existing = await pool.query("SELECT 1 FROM usuarios WHERE username = $1", [user.username]);
    if (existing.rowCount) continue;

    let terminalId: string | null = null;
    if (user.terminal) {
      const terminal = await pool.query<{ id: string }>(
        "SELECT id FROM terminales WHERE codigo = $1",
        [user.terminal],
      );
      terminalId = terminal.rows[0]?.id ?? null;
    }

    await pool.query(
      `INSERT INTO usuarios (username, password_hash, nombre, rol, terminal_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [user.username, passwordHash, user.nombre, user.rol, terminalId],
    );
  }
}
