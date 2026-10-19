ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_rol_check;

ALTER TABLE usuarios
  ADD CONSTRAINT usuarios_rol_check
  CHECK (rol IN ('vigilante', 'rrhh_consulta', 'rrhh_admin', 'jefe'));

CREATE TABLE IF NOT EXISTS sesiones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL REFERENCES usuarios (id),
  token_hash text NOT NULL UNIQUE,
  expira_en timestamptz NOT NULL,
  revocada_en timestamptz,
  creado_en timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sesiones_usuario_idx ON sesiones (usuario_id);
