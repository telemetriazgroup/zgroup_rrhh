# Cuentas de prueba

Cuentas locales para entrar a GaritaControl mientras se desarrolla. No son personas reales ni sirven en un entorno productivo.

La API las crea al arrancar si `SEED_DEV_USERS=true`. La contraseña sale de `SEED_DEV_PASSWORD`. En Compose ambos valores ya vienen definidos en `.env.example` y en `docker-compose.yml`.

| Usuario | Contraseña | Nombre en pantalla | Rol | Terminal |
| --- | --- | --- | --- | --- |
| `vigilante` | `GaritaDev2026` | R. Chávez | `vigilante` | Garita Principal (`GARITA-PRINCIPAL`) |
| `rrhh` | `GaritaDev2026` | Administración RR.HH. | `rrhh_admin` | Ninguna |
| `jefe` | `GaritaDev2026` | Jefe de Producción | `jefe` | Ninguna |

El rol lo decide la cuenta guardada. Escribir `rrhh` o cualquier otro texto en un usuario distinto no cambia la pantalla.

## Dónde entrar

Las tres cuentas usan el mismo login en la web y en el celular:

- Web construida: `http://localhost:18180`
- Celular de desarrollo: `http://localhost:18183`
- API: `POST http://localhost:18182/api/v1/auth/login`

La vista previa de Vite, cuando está levantada para este proyecto, muestra el mismo formulario. El botón **Ver funcionamiento conceptual** no usa estas cuentas: abre la maqueta y no inicia sesión.

**Mantener sesión en este dispositivo** deja el token 14 días. Sin esa opción, la sesión dura 12 horas. **Cerrar sesión** revoca el token. Una contraseña incorrecta, un usuario inexistente o una cuenta inactiva responden siempre `Credenciales inválidas.`

Si el usuario ya existe en la base, el arranque no vuelve a escribir la contraseña. Cambiar `SEED_DEV_PASSWORD` solo afecta a cuentas que todavía no se crearon. Con `SEED_DEV_USERS=false` no se crean.

Estas cuentas no son el usuario de PostgreSQL. La base local usa el usuario `garita` en el puerto `5432`.

## Qué abre cada cuenta hoy

| Cuenta | Pantalla al entrar | Qué está conectado | Qué sigue en maqueta o en memoria |
| --- | --- | --- | --- |
| `vigilante` | Garita | La sesión y la foto de DNI o fotocheck, que la API registra como captura | El escaneo, la búsqueda y las marcaciones siguen con datos de demostración |
| `rrhh` | Panel de escritorio | La sesión | Dashboard, registros, excepciones, horarios, trabajadores y reportes usan datos en memoria |
| `jefe` | Aviso de sesión de jefe | La sesión y el cierre | La bandeja para autorizar, modificar o rechazar todavía no está |

El trabajador no tiene usuario ni contraseña. Se acredita con fotocheck o DNI cuando pide una autorización. Los perfiles de `db/init/002_seed.sql` (Carlos Mendoza, Ana Torres y los demás) son personas de demostración para la jornada, no cuentas de acceso.

El rol `rrhh_consulta` existe en la base y en la matriz de permisos, pero no tiene cuenta de prueba.

## Funciones de `vigilante`

Opera la garita desde el celular o desde la web, en la terminal Garita Principal.

Puede:

- identificar a la persona por QR, por búsqueda de DNI o ID, o por foto de fotocheck o DNI;
- confirmar **Ingreso**, **Salida** o **Servicio**;
- ver la alerta de desvinculación, que bloquea el pase, y la de vacaciones, que informa;
- ver si el jefe ya autorizó una llegada fuera de horario, de noche o en domingo.

No puede crear perfiles, cambiar horarios, resolver excepciones, exportar reportes ni autorizar un ingreso fuera de horario.

## Funciones de `rrhh`

Es la cuenta de administración de RR.HH. El panel ofrece estas secciones:

- **Dashboard:** indicadores de la jornada.
- **Registros:** alta, edición y desactivación de perfiles, incluida la marca de desvinculación o vacaciones.
- **Excepciones:** revisar y resolver un caso con motivo, dejando la hora anterior en la auditoría.
- **Horarios:** definir y asignar horarios. Un cambio no reescribe lo ya marcado.
- **Trabajadores:** consultar y comparar jornadas.
- **Reportes:** consultar y exportar.

También puede precargar un perfil desde la foto de un documento. No marca en garita y no resuelve la autorización de un jefe.

La cuenta de consulta, cuando exista, podrá ver dashboard, perfiles, excepciones, horarios, trabajadores, reportes y alertas. No podrá crear ni editar perfiles, resolver excepciones, modificar horarios, marcar desvinculación o vacaciones, ni exportar datos personales salvo un permiso explícito.

## Funciones de `jefe`

Atiende las llegadas fuera del horario laboral, de noche o en domingo.

Puede:

- ver la solicitud de un trabajador de su área;
- autorizarla, modificar el día o el horario, o rechazarla;
- crear la autorización directamente, sin esperar la solicitud.

No usa el panel de RR.HH. y no registra marcaciones. La garita solo muestra el resultado para que el vigilante no pida al trabajador que consiga el permiso en ese momento.

## Lo que ninguna cuenta de prueba hace

- El reconocimiento de imágenes no se entra con estas cuentas. Quien lo consume usa la clave `X-Vision-Key`.
- La maqueta conceptual no representa una sesión de `vigilante`, `rrhh` ni `jefe`.
- Un trabajador de la semilla no puede iniciar sesión con usuario y contraseña.
