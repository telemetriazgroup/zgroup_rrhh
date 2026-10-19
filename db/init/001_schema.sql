-- Esquema inicial de GaritaControl.
-- Los scripts de esta carpeta se aplican solo al crear el volumen vacío.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE terminales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text NOT NULL UNIQUE,
  nombre text NOT NULL,
  activa boolean NOT NULL DEFAULT true,
  creado_en timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  nombre text NOT NULL,
  rol text NOT NULL CHECK (rol IN ('vigilante', 'rrhh_consulta', 'rrhh_admin')),
  activo boolean NOT NULL DEFAULT true,
  terminal_id uuid REFERENCES terminales (id),
  creado_en timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE horarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL UNIQUE,
  dias smallint[] NOT NULL,
  hora_ingreso time NOT NULL,
  hora_salida_almuerzo time NOT NULL,
  hora_retorno_almuerzo time NOT NULL,
  hora_salida time NOT NULL,
  tolerancia_ingreso_min integer NOT NULL DEFAULT 5 CHECK (tolerancia_ingreso_min >= 0),
  tolerancia_retorno_min integer NOT NULL DEFAULT 5 CHECK (tolerancia_retorno_min >= 0),
  regla_sabado text NOT NULL DEFAULT 'no_laborable',
  vigente_desde date NOT NULL,
  activo boolean NOT NULL DEFAULT true,
  creado_en timestamptz NOT NULL DEFAULT now(),
  CHECK (cardinality(dias) > 0)
);

CREATE TABLE trabajadores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text NOT NULL UNIQUE,
  nombre text NOT NULL,
  apellido text NOT NULL,
  dni text NOT NULL UNIQUE CHECK (dni ~ '^[0-9]{8}$'),
  telefono text,
  email text,
  area text NOT NULL,
  cargo text NOT NULL,
  fecha_ingreso date NOT NULL,
  foto_url text,
  estado text NOT NULL CHECK (estado IN ('activo', 'inactivo')),
  horario_id uuid NOT NULL REFERENCES horarios (id),
  terminal_id uuid NOT NULL REFERENCES terminales (id),
  en_flujo_control boolean NOT NULL DEFAULT true,
  creado_en timestamptz NOT NULL DEFAULT now(),
  actualizado_en timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE jornadas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trabajador_id uuid NOT NULL REFERENCES trabajadores (id),
  fecha_operativa date NOT NULL,
  horario_id uuid NOT NULL REFERENCES horarios (id),
  horario_snapshot jsonb NOT NULL,
  ingreso_en timestamptz,
  salida_almuerzo_en timestamptz,
  retorno_almuerzo_en timestamptz,
  salida_dia_en timestamptz,
  duracion_almuerzo_min integer,
  tardanza_ingreso_min integer,
  exceso_almuerzo_min integer,
  estado text NOT NULL CHECK (estado IN ('abierta', 'completa', 'incompleta', 'exceso', 'tardanza')),
  creado_en timestamptz NOT NULL DEFAULT now(),
  UNIQUE (trabajador_id, fecha_operativa)
);

CREATE TABLE marcaciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jornada_id uuid NOT NULL REFERENCES jornadas (id),
  periodo text NOT NULL CHECK (periodo IN ('ingreso', 'salidaAlmuerzo', 'retornoAlmuerzo', 'salidaDia')),
  ocurrido_en timestamptz NOT NULL,
  zona_horaria text NOT NULL DEFAULT 'America/Lima',
  origen text NOT NULL CHECK (origen IN ('scan', 'manual', 'documento')),
  terminal_id uuid NOT NULL REFERENCES terminales (id),
  vigilante_id uuid REFERENCES usuarios (id),
  idempotency_key text NOT NULL UNIQUE,
  creado_en timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE excepciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jornada_id uuid REFERENCES jornadas (id),
  trabajador_id uuid NOT NULL REFERENCES trabajadores (id),
  tipo text NOT NULL CHECK (tipo IN ('no_return', 'auto_closed', 'return_no_exit', 'duplicate')),
  estado text NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'resuelta')),
  terminal_id uuid REFERENCES terminales (id),
  valor_anterior text,
  valor_nuevo text,
  motivo text,
  nota text,
  resuelto_por uuid REFERENCES usuarios (id),
  resuelto_en timestamptz,
  creado_en timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE capturas_documento (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_documento text NOT NULL CHECK (tipo_documento IN ('fotocheck', 'dni')),
  estado text NOT NULL CHECK (
    estado IN (
      'recibida',
      'extraida_con_perfil',
      'extraida_sin_perfil',
      'requiere_revision',
      'rechazada',
      'ilegible',
      'motor_no_disponible'
    )
  ),
  motor text NOT NULL,
  nombre_extraido text,
  apellido_extraido text,
  dni_extraido text,
  confianza jsonb NOT NULL DEFAULT '{}'::jsonb,
  advertencias jsonb NOT NULL DEFAULT '[]'::jsonb,
  trabajador_id uuid REFERENCES trabajadores (id),
  terminal_id uuid REFERENCES terminales (id),
  vigilante_id uuid REFERENCES usuarios (id),
  creado_en timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE auditoria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entidad text NOT NULL,
  entidad_id uuid,
  accion text NOT NULL,
  usuario_id uuid REFERENCES usuarios (id),
  detalle jsonb NOT NULL DEFAULT '{}'::jsonb,
  creado_en timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX marcaciones_jornada_idx ON marcaciones (jornada_id, ocurrido_en);
CREATE INDEX excepciones_estado_idx ON excepciones (estado, creado_en DESC);
CREATE INDEX capturas_documento_dni_idx ON capturas_documento (dni_extraido, creado_en DESC);
