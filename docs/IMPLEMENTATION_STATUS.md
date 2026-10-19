# GaritaControl — Estado de implementación y guía para IA

> Este documento describe el repositorio actual. No sustituye los requisitos de `PRODUCT_SPEC.md` ni el catálogo de funcionalidades de `MODULES.md`.

## 1. Resumen

El repositorio contiene un **prototipo front-end navegable** en React y, desde la fase 0, el esqueleto ejecutable de la API, PostgreSQL y el servicio de reconocimiento. Las pantallas siguen usando datos en memoria. La base y los contenedores no convierten todavía esas pantallas en un sistema persistente.

La arquitectura objetivo y el plan de sprints están en `ARCHITECTURE.md` y `ROADMAP.md`.

Usar estas etiquetas al documentar una función:

- **Implementado:** comportamiento conectado al estado actual y visible en el prototipo.
- **Simulado:** interacción demostrativa sin servicio o persistencia real.
- **Pendiente:** requisito definido pero no implementado.

No describir una función simulada como lista para producción.

## 2. Mapa del código

| Ruta | Responsabilidad |
| --- | --- |
| `src/App.tsx` | Navegación local entre login, garita y RR.HH. |
| `src/screens/conceptual/ConceptualTour.tsx` | Maqueta de presentación. No es un sprint ni usa la API |
| `src/screens/Login.tsx` | Acceso con token contra la API. El rol sale de la cuenta, no del texto del usuario. Desde aquí se abre la maqueta |
| `src/api/client.ts` | Cliente web: login, logout y captura de documento |
| `src/screens/Scanner.tsx` | Scanner simulado, contadores, recientes, búsqueda manual y overlays |
| `src/screens/hr/Layout.tsx` | Navegación RR.HH. y estado compartido en memoria de trabajadores |
| `src/screens/hr/DashboardView.tsx` | KPI, gráficos y acceso al detalle |
| `src/screens/hr/RecordsView.tsx` | CRUD local de perfiles, filtros y control de participación |
| `src/screens/hr/ExceptionsView.tsx` | Lista, filtros y modal de resolución simulado |
| `src/screens/hr/SchedulesView.tsx` | Lista y editor local de horarios con línea de tiempo |
| `src/screens/hr/WorkersView.tsx` | Grid, comparación ordenable y detalle inline |
| `src/screens/hr/WorkerDetailView.tsx` | Detalle abierto desde Dashboard |
| `src/screens/hr/ReportsView.tsx` | Tipos, filtros, vista previa y menú de exportación |
| `src/data/mockData.ts` | Tipos y datos mock |
| `src/index.css` | Fuentes, tokens globales y animaciones |
| `services/api/` | API intermedia: sesión por token, captura de documento, cotejo por DNI y auditoría |
| `apps/movil/` | Cliente celular en este repositorio. Usa las mismas rutas que la web |
| `services/vision/` | Reconocimiento en contenedor propio. `GET /v1/contrato` es su salida para otras aplicaciones |
| `services/vision/training/` | Medición con fotos etiquetadas. El algoritmo entrenado todavía no existe |
| `db/init/` | Esquema PostgreSQL inicial. No incluye servicio, situación, horario rígido ni autorización; esos cambios están descritos en `ARCHITECTURE.md` y entran por migración |
| `docker-compose.yml` | Orquesta `web`, `movil`, `api`, `vision` y `db` |

No hay router por URL. `App.tsx` y `Layout.tsx` conmutan componentes mediante estado local.

## 3. Estado por área

| Área | Estado actual | Observaciones |
| --- | --- | --- |
| Login | Conectado a la API | La web pide un token a `POST /api/v1/auth/login`. Cuentas y funciones en `docs/cuentas_rrhh.md`. El resto del panel sigue con datos en memoria |
| Scanner QR | Simulado | El toque elige un trabajador y salida/retorno al azar; no usa cámara ni máquina de cuatro estados |
| Búsqueda manual | Parcial | Busca ID o DNI en mocks; comparte la simulación aleatoria del scanner |
| Overlays | Implementado en UI | Variantes salida, retorno y error; faltan ingreso y salida del día |
| Estado de trabajadores | Parcial | `Layout.tsx` lo centraliza para Registros y Trabajadores; no persiste |
| CRUD de perfiles | Implementado localmente | Crear, editar y eliminar actualizan memoria en `Layout.tsx` |
| Control de flujo | Implementado localmente | Toggle en memoria; el scanner no consume ese estado compartido |
| Dashboard | Simulado | Visualizaciones y KPI derivan parcial o totalmente de mocks fijos |
| Excepciones | Simulado/inconsistente | `Layout` mantiene una lista, pero `ExceptionsView` importa directamente la constante mock y guardar solo cierra el modal |
| Horarios | Implementado localmente | Alta/edición viven dentro de la vista; asignaciones no actualizan trabajadores |
| Trabajadores | Implementado en UI | Filtros, tabla ordenable y detalle; registros provienen de mocks fijos |
| Detalle | Implementado en UI | Muestra los cuatro periodos y KPI mock; revocar no cambia estado |
| Reportes | Simulado | Menú de exportación no genera archivos; varios filtros no afectan las filas |
| Sesión y roles | Pendiente | No hay autenticación, autorización ni almacenamiento seguro |
| Persistencia/API | Esqueleto | Compose levanta API y PostgreSQL. La interfaz todavía no los consume |
| Reconocimiento de documento | Contrato listo | El contenedor valida la imagen y responde sin inventar datos. `ModelExtractor.extract` está pendiente del equipo de visión |
| Captura en garita | Pendiente | UC-12, UC-13 y UC-14 no están conectados a la pantalla del scanner |
| Relectura de 10 minutos, servicio y alertas | Pendiente | La política ya está en `PRODUCT_SPEC.md`. La pantalla sigue sin Ingreso, Salida, Servicio, desvinculación ni vacaciones |
| Autorizaciones y cola offline | Pendiente | UC-18, UC-19 y UC-20 no tienen interfaz ni persistencia |
| Auditoría | Pendiente | No se guardan responsables ni historial de correcciones |
| Offline | Pendiente | Solo se muestra un estado “Online” fijo |

## 4. Fuente de verdad actual

- Perfiles iniciales, jornadas, excepciones, horarios y series de gráficos: `src/data/mockData.ts`.
- Perfiles modificados durante la sesión RR.HH.: estado `workers` en `src/screens/hr/Layout.tsx`.
- Horarios editados: estado local en `SchedulesView.tsx`.
- Scanner: estado local en `Scanner.tsx`, inicializado desde mocks.
- Excepciones mostradas: constante `EXCEPTIONS`, no el estado `exceptions` de `Layout.tsx`.

Antes de añadir funcionalidad transversal, elevar la entidad afectada a una sola fuente de verdad o crear una capa de datos. No añadir otra copia local del mismo dominio.

## 5. Decisiones de diseño vigentes

- Inter como tipografía principal y JetBrains Mono para tiempos/cifras.
- Colores y radios base definidos en `src/index.css`.
- Garita usa fondo oscuro; RR.HH. contenido claro con sidebar oscuro.
- Tailwind CSS 4 se usa directamente en JSX.
- Iconos SVG inline; no hay librería de iconos.
- Breakpoint principal del panel: `lg`.
- Fotos mock remotas de Unsplash.

La especificación prohíbe gradientes. Existe actualmente un gradiente radial decorativo y otro en la línea del scanner; deben considerarse deuda visual y no un patrón para reutilizar.

## 6. Deuda funcional priorizada

### P0 — Integridad del flujo

1. Sustituir la selección aleatoria del scanner por la máquina de cuatro estados.
2. Conectar la interfaz a la API y dejar de usar mocks como fuente de jornadas, perfiles y horarios.
3. Garantizar idempotencia y prevención de doble lectura.
4. Implementar autenticación/autorización real y terminales autorizadas.

### P1 — Coherencia del panel

1. Unificar estado de trabajadores, registros, horarios y excepciones.
2. Hacer efectiva y auditable la resolución de excepciones.
3. Conectar filtros, KPI y gráficos a una misma consulta.
4. Generar archivos reales al exportar.
5. Aplicar cambios de horario/asignación sin alterar registros históricos.

### P2 — Operación robusta

1. Integrar cámara/lector QR y permisos.
2. Construir la cola offline ya definida: tabla local de personal autorizado y fotos de DNI ajenas a la empresa.
3. Añadir estados de carga, vacío y error.
4. Mejorar accesibilidad y foco de modales/paneles.
5. Añadir pruebas de reglas de negocio y flujos críticos.

## 7. Reglas para futuras modificaciones con IA

1. Leer `PRODUCT_SPEC.md`, `MODULES.md`, `ARCHITECTURE.md`, este documento y los archivos de la vista afectada.
2. Distinguir requisito esperado de comportamiento actual.
3. No inventar endpoints, permisos o políticas de turnos fuera de lo ya definido en la especificación y la arquitectura.
4. No usar los datos mock como reglas de negocio.
5. Mantener los periodos de jornada:
   - `ingreso`
   - `salidaAlmuerzo`
   - `retornoAlmuerzo`
   - `salidaDia`
   - `servicio`
   - `regresoServicio`
6. Conservar `tardanzaIngreso` y `excesoAlmuerzo` como minutos calculados.
7. No degradar el scanner a solo “salida/retorno”.
8. Si una modificación toca más de una vista, evitar estados duplicados.
9. Mantener textos de producto en español y nombres técnicos consistentes con el modelo existente.
10. Actualizar la tabla de estado cuando una capacidad deje de ser simulada o cambie su fuente de verdad.

## 8. Verificación recomendada

- Para cambios solo documentales, revisar enlaces, rutas y consistencia con el código.
- Para cambios localizados de UI, validar la vista afectada en su viewport principal.
- Para cambios transversales o de modelo, ejecutar la verificación indicada por las instrucciones del repositorio y probar ambos roles.
- Casos críticos del scanner que necesitarán pruebas: secuencia completa, relectura antes de 10 minutos, servicio sin retorno, regreso de servicio, desvinculado, vacaciones, QR inválido, fuera de flujo, exceso y reintento de red.

## 9. Decisiones de producto

Ya quedaron definidas en `PRODUCT_SPEC.md`:

- un segundo escaneo en menos de 10 minutos avisa la hora existente y pregunta si se actualiza o si es el movimiento contrario;
- el vigilante registra Ingreso, Salida o Servicio; la salida en horario de almuerzo es almuerzo;
- un servicio sin retorno queda abierto, y el retorno después del horario es regreso de servicio;
- jefes y directivos se registran sin horario rígido;
- la marcación es desde el celular, por QR o por foto validada en la API;
- sin red se consulta una tabla local y la foto de un DNI ajeno a la empresa se sube después;
- la desvinculación bloquea el pase y las vacaciones solo alertan;
- el trabajador pide autorización a su jefe y el jefe autoriza, modifica o rechaza.

Siguen abiertas, y no deben corregirse en silencio:

- cómo se determina la fecha operativa en turnos nocturnos;
- si un trabajador puede marcar desde cualquier terminal;
- acciones permitidas a cada subtipo de usuario de RR.HH.;
- política de retención de fotos y de datos;
- jornada incompleta del día anterior;
- señal semántica definitiva para Ingreso y Salida del día;
- formato exacto y columnas de cada exportación.
