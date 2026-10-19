-- Semilla de desarrollo. No son personas reales ni habilita inicio de sesión.

INSERT INTO terminales (id, codigo, nombre) VALUES
  ('11111111-1111-4111-8111-111111111111', 'GARITA-PRINCIPAL', 'Garita Principal'),
  ('22222222-2222-4222-8222-222222222222', 'GARITA-NORTE', 'Garita Norte');

INSERT INTO horarios (
  id, nombre, dias, hora_ingreso, hora_salida_almuerzo, hora_retorno_almuerzo,
  hora_salida, tolerancia_ingreso_min, tolerancia_retorno_min, vigente_desde
) VALUES
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
    'Planta turno mañana',
    ARRAY[1, 2, 3, 4, 5, 6]::smallint[],
    '06:00', '11:30', '12:30', '15:00',
    5, 5, DATE '2026-01-01'
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
    'Administrativo',
    ARRAY[1, 2, 3, 4, 5]::smallint[],
    '08:00', '13:00', '14:00', '18:00',
    5, 5, DATE '2026-01-01'
  );

INSERT INTO trabajadores (
  id, codigo, nombre, apellido, dni, telefono, email, area, cargo,
  fecha_ingreso, estado, horario_id, terminal_id, en_flujo_control
) VALUES
  ('10000000-0000-4000-8000-000000000001', 'W001', 'Carlos', 'Mendoza', '47382910', '987654321', 'c.mendoza@empresa.pe', 'Producción', 'Operario de línea', DATE '2021-03-15', 'activo', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', '11111111-1111-4111-8111-111111111111', true),
  ('10000000-0000-4000-8000-000000000002', 'W002', 'Ana', 'Torres', '52819374', '912345678', 'a.torres@empresa.pe', 'Logística', 'Coordinadora de almacén', DATE '2020-07-01', 'activo', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', '11111111-1111-4111-8111-111111111111', true),
  ('10000000-0000-4000-8000-000000000003', 'W003', 'Luis', 'Paredes', '61029384', '956789012', 'l.paredes@empresa.pe', 'Administración', 'Analista contable', DATE '2019-11-20', 'activo', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', '22222222-2222-4222-8222-222222222222', true),
  ('10000000-0000-4000-8000-000000000004', 'W004', 'María', 'Quispe', '73849201', '934567890', 'm.quispe@empresa.pe', 'Calidad', 'Inspector de calidad', DATE '2022-01-10', 'activo', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', '11111111-1111-4111-8111-111111111111', true),
  ('10000000-0000-4000-8000-000000000005', 'W005', 'José', 'Flores', '39201847', '978901234', 'j.flores@empresa.pe', 'Producción', 'Técnico de mantenimiento', DATE '2020-04-05', 'activo', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', '11111111-1111-4111-8111-111111111111', true),
  ('10000000-0000-4000-8000-000000000006', 'W006', 'Rosa', 'Huanca', '82910374', '945678901', 'r.huanca@empresa.pe', 'RR.HH.', 'Asistente de RR.HH.', DATE '2023-02-14', 'activo', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', '22222222-2222-4222-8222-222222222222', true),
  ('10000000-0000-4000-8000-000000000007', 'W007', 'Pedro', 'Sánchez', '45671829', '901234567', 'p.sanchez@empresa.pe', 'Mantenimiento', 'Electricista industrial', DATE '2018-09-30', 'activo', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', '11111111-1111-4111-8111-111111111111', true),
  ('10000000-0000-4000-8000-000000000008', 'W008', 'Carmen', 'López', '19283746', '967890123', 'c.lopez@empresa.pe', 'Logística', 'Despachadora', DATE '2021-08-22', 'inactivo', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', '22222222-2222-4222-8222-222222222222', false);
