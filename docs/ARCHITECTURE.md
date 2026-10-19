# GaritaControl — Arquitectura, tecnología y bases

> Base técnica adoptada para salir del prototipo. El comportamiento de producto sigue en `PRODUCT_SPEC.md` y `MODULES.md`. Lo que ya corre de verdad está en `IMPLEMENTATION_STATUS.md`. Los sprints y sus pruebas están en `ROADMAP.md`.

## 1. Decisiones de borde

GaritaControl tiene dos clientes y tres servicios. Ningún cliente llama al reconocimiento de imágenes.

```text
Escritorio                         Celular
web (React)                        app de garita
RR.HH., jefe, reportes             vigilante, cámara, cola offline
        \                         /
         \                       /
          v                     v
        api (GaritaControl) ----> PostgreSQL
                 |
                 |  POST /v1/documentos/extraer
                 |  red interna + clave compartida
                 v
              vision
```

| Pieza | Responsabilidad | Lo que no hace |
| --- | --- | --- |
| `web` | Panel de escritorio: perfiles, horarios, excepciones, reportes y bandeja del jefe | No es la garita del vigilante y no guarda la cola offline |
| `movil` | Garita en el celular: QR, foto, Ingreso, Salida, Servicio, alertas y cola sin red. También la solicitud del trabajador | No decide la jornada, no lee el documento y no llama a `vision` |
| `api` | Contrato único para los dos clientes: sesión, perfiles, jornada, relectura, alertas, autorizaciones, sincronización y auditoría | No interpreta píxeles y no usa la hora del celular como hora del evento |
| `vision` | Validar la imagen y devolver nombre, apellido, DNI, recorte de foto y confianza | No tiene base de negocio ni crea marcaciones |
| `db` | Fuente de verdad una vez sincronizado | No guarda la imagen cruda del documento ni la foto offline del visitante |

Cuando el vigilante fotografía un fotocheck o un DNI con red:

1. El celular envía la imagen solo a `api`.
2. `api` registra la captura y reenvía la imagen a `vision`.
3. `vision` devuelve los datos extraídos y el recorte de la foto.
4. `api` coteja el DNI contra `trabajadores` y aplica alertas, autorización y reglas de jornada.
5. La garita muestra el resultado para confirmación visual.

La captura no crea un trabajador ni una marcación. Confirmar la identidad reutiliza UC-02 o UC-05, según el caso.

Sin red, solo el celular sigue operando. Identifica al personal autorizado con su tabla local, guarda la marcación en la cola y, si la persona no es de la empresa, guarda la foto del DNI. El panel web no tiene modo offline. Al volver la conexión, la API recibe esa cola y solo entonces llama a `vision`.

La sesión que entrega la API tiene que servirle a los dos clientes. El celular guarda un token. No depende de una cookie del navegador de escritorio. El CORS actual, limitado a `http://localhost:18180`, alcanza para el panel. La aplicación del celular llama a la API por la red y no usa ese origen.

## 2. Evaluación de los requisitos nuevos

El contenedor de visión y su contrato se mantienen. El cambio está en la API, en el esquema y en el celular.

| Requisito | Arquitectura actual | Cambio |
| --- | --- | --- |
| Ingreso, salida y servicio | `marcaciones.periodo` solo admite los cuatro hitos y `jornadas` guarda una sola hora por hito | Varios servicios no caben en columnas. Hace falta una fila por servicio, con su salida y su cierre |
| Salida en horario de almuerzo | La interfaz podría elegir el periodo | La API clasifica: Salida dentro del almuerzo programado se guarda como `salidaAlmuerzo`. Servicio dentro de ese tramo no se acepta como servicio; se ofrece como salida a almorzar |
| Relectura en menos de 10 minutos | La idempotencia actual evita un rebote, pero no consulta al vigilante | La API compara con la última marcación usando su reloj en `America/Lima`. Antes de 10 minutos no inserta otro evento: ofrece actualizar la hora o registrar el movimiento contrario. La hora anterior queda en `auditoria` |
| Ejemplo 08:01 y 08:06 | Un segundo ingreso usaría la tolerancia de las 08:05 y saldría tardío | La API rechaza ese segundo ingreso y devuelve la marcación de las 08:01 con las dos opciones |
| No retornó y regreso de servicio | `excepciones.tipo` no tiene servicio sin retorno | Un servicio abierto permanece así. Si el retorno ocurre después de `hora_salida` del horario aplicado, el cierre es `regresoServicio`. Si ocurre antes, es un ingreso que cierra ese servicio |
| Jefes y directivos | `horario_id` es obligatorio y la jornada siempre puede calcular tardanza | El perfil lleva `horario_rigido`. En `false`, se registran ingreso, salida y servicio, y `tardanzaIngreso` y `excesoAlmuerzo` quedan en `null`. Sin hora de salida de referencia, el retorno de un servicio se guarda como ingreso |
| Desvinculación y vacaciones | Solo existen `activo` e `inactivo` | La situación pasa a `activo`, `vacaciones` o `desvinculado`. La API bloquea al desvinculado antes de la consulta de 10 minutos. Vacaciones devuelve alerta y no bloquea por sí sola |
| App de celular con QR o foto | El único cliente existente es el prototipo web y no llama a la API | Cliente aparte, `movil`, que consume el mismo contrato. No entra como contenedor de Compose. El panel web se queda para escritorio |
| Falta de conectividad | La base 1 prohibía copias durables fuera de PostgreSQL | El celular guarda una réplica operativa. PostgreSQL sigue siendo la fuente de verdad después de sincronizar |
| Personal que no es de la empresa | La captura exige la API y la visión en el momento | La foto del DNI queda en el dispositivo. Al subirla, el flujo es el mismo `POST /api/v1/identidad/capturas` |
| Autorización del jefe | No hay actor jefe ni trabajador fuera de la garita | El trabajador no tiene contraseña de panel. Se acredita con fotocheck o DNI y recibe un trámite corto. El jefe es un rol de `usuarios` |

## 3. Tecnología

| Capa | Elección | Motivo |
| --- | --- | --- |
| Panel web | React 19, TypeScript, Vite 8, Tailwind CSS 4 | Ya es el prototipo de escritorio. No se reescribe para simular el celular. |
| App celular | Cliente aparte, por abrir. Comparte tipos y OpenAPI con la API | Cámara, QR y cola offline no viven en el panel. El framework se elige al abrir ese cliente. |
| Réplica del celular | Almacén local de la app, no de la web | Tabla de consulta y cola offline. |
| API de negocio | Node.js 22, Fastify, TypeScript, Zod, `pg` | Misma hora de negocio para la ventana de 10 minutos, el almuerzo y el regreso de servicio. |
| Reconocimiento | Python 3.12, FastAPI, Pillow, Pydantic | Contenedor aparte. Los requisitos nuevos no cambian su contrato. |
| Datos | PostgreSQL 16, zona `America/Lima` | Jornada, servicios repetibles, autorizaciones y auditoría. |
| Contratos | OpenAPI en `services/api/openapi.yaml` y `services/vision/openapi.yaml` | La pista de visión puede avanzar sin acoplarse a la UI. |
| Evolución del esquema | `db/migrations`, aplicadas al arrancar la API | `db/init/` solo corre con un volumen vacío y hoy no representa servicio ni autorización. |
| Ejecución local | Docker Compose | Un comando levanta web, API, visión y base. |

El motor real se implementa en `services/vision/app/engines/model.py`. La imagen base no instala frameworks de modelos. Esas dependencias viven en `services/vision/requirements.engine.txt`.

| `VISION_ENGINE` | Comportamiento |
| --- | --- |
| `unconfigured` | Valida la imagen y responde `motor_no_disponible`. No inventa nombre ni DNI. Es el valor de Compose. |
| `fixture` | Devuelve un resultado etiquetado de prueba. No es reconocimiento. |
| `model` | Carga `ModelExtractor`. |

## 4. Estructura

```text
src/                         Panel web actual (Vite). Sin cola offline
apps/movil/                  Cliente celular. Se desarrolla en este repositorio y llama a la API publicada
services/api/                Contrato único de web y celular
services/vision/             Reconocimiento, sin cambios de contrato
services/vision/app/engines/ Punto de extensión del modelo
db/init/                     Esquema inicial, ya aplicado en volúmenes existentes
db/migrations/               Cambios a partir de servicio, situación y autorización
docker-compose.yml           web, api, vision, db
docs/ARCHITECTURE.md         Este documento
docs/ROADMAP.md              Fases, objetivos y pruebas
```

## 5. Modelo persistente

### Lo que ya está en `db/init/001_schema.sql`

Terminales, usuarios, horarios, trabajadores, jornadas de cuatro hitos, marcaciones, excepciones, auditoría y capturas. Una jornada por trabajador y fecha operativa. La captura no guarda la imagen cruda. El DNI de trabajador es único y de 8 dígitos.

Ese esquema no puede representar los requisitos nuevos sin una migración.

### Modelo objetivo

- `trabajadores.situacion`: `activo`, `vacaciones` o `desvinculado`.
- `trabajadores.horario_rigido`: `false` para jefes y directivos.
- `trabajadores.jefe_id`: jefe que recibe la solicitud.
- `servicios`: una fila por salida de servicio, con `salida_en`, `cierre_en` y `cierre` (`abierto`, `ingreso` o `regresoServicio`).
- `marcaciones.periodo` incorpora `servicio` y `regresoServicio`.
- `marcaciones.estado_sincronizacion`: `en_linea` o `sincronizada`, para distinguir lo que llegó desde la cola.
- `excepciones.tipo` incorpora `servicio_sin_retorno`.
- `autorizaciones`: trabajador, jefe, día, inicio, fin, estado (`pendiente`, `autorizada`, `rechazada`) y la versión original si el jefe modificó el tramo.
- `usuarios.rol` incorpora `jefe`. El trabajador no se crea como usuario de contraseña.

La hora sustituida dentro de los 10 minutos no borra la anterior: `auditoria` guarda el valor previo, el vigilante y el momento del cambio.

La tabla local vive solo en el celular. No es una tabla de PostgreSQL ni un modo del panel web. Contiene el personal autorizado a ingresar para esa terminal: nombre, apellido, código, situación, si el horario es rígido y el tramo de almuerzo. La foto de un DNI ajeno a la empresa permanece en el dispositivo hasta la subida y no se escribe en `capturas_documento` antes de eso.

## 6. Contratos

### Reconocimiento

Sin cambio. `POST /v1/documentos/extraer` recibe `tipoDocumento` (`fotocheck` o `dni`) y la imagen. Devuelve nombre, apellido, DNI, foto recortada, confianza, estado y motor.

`POST /api/v1/identidad/capturas` sigue siendo la única puerta de la aplicación. También la usa la cola cuando sube la foto de un visitante.

Umbral de confianza: **0.85**, con `IDENTITY_MIN_CONFIDENCE`.

### Reglas que la API debe imponer

La interfaz propone Ingreso, Salida o Servicio. La API confirma o corrige:

1. Desvinculado: no hay marcación ni consulta de relectura.
2. Menos de 10 minutos desde la última marcación: no hay inserción; la respuesta trae la hora existente y las opciones de actualizar o registrar el movimiento contrario.
3. Salida dentro del almuerzo del `horario_snapshot`: `salidaAlmuerzo`.
4. Servicio dentro de ese almuerzo: no se guarda como servicio.
5. Retorno de un servicio después de `hora_salida`: `regresoServicio`.
6. Perfil sin horario rígido: no se calculan tardanza ni exceso de almuerzo.

Esas reglas valen igual para QR, búsqueda manual, documento confirmado y marcación sincronizada.

## 7. Bases de desarrollo

1. PostgreSQL es la fuente de verdad después de sincronizar. Solo el celular guarda la tabla de consulta y la cola. El panel web trabaja en línea.
2. Ni el panel ni el celular conocen la URL de `vision`, tampoco cuando el celular recupera la red.
3. `vision` no decide marcaciones, horarios, alertas ni autorizaciones.
4. Ninguna extracción crea un perfil o una marcación sin confirmación humana.
5. La ventana de 10 minutos y la clasificación de almuerzo, servicio y regreso se calculan en la API.
6. Los ajustes de hora conservan el valor anterior, el responsable y la fecha.
7. Los logs no incluyen imagen, foto recortada ni DNI completo.
8. Textos de producto en español de Perú. Tiempos en `America/Lima`.
9. La interfaz distingue desvinculación, vacaciones, servicio y autorización con texto, no solo con color.
10. Un cambio de alcance actualiza `PRODUCT_SPEC.md`, `MODULES.md`, `IMPLEMENTATION_STATUS.md` y, si mueve el diseño, este documento y `ROADMAP.md`.

## 8. Seguridad mínima del entorno local

Compose publica los cuatro servicios para poder desarrollar. La clave `VISION_SHARED_SECRET` evita llamadas anónimas al extractor. En un despliegue real la visión queda solo en la red interna.

La semilla de `db/init/002_seed.sql` son perfiles de demostración, no personas reales ni credenciales de acceso. La tabla local se descarga con la sesión del vigilante y se borra al cerrarla.

## 9. Cómo levantar el stack

Desde la raíz del repositorio:

```bash
docker compose up --build
```

| Servicio | URL local | Uso |
| --- | --- | --- |
| Interfaz | `http://localhost:18180` | Aplicación construida dentro del contenedor |
| API | `http://localhost:18182/health` | Negocio y captura |
| Visión | `http://localhost:18181/health` | Contrato para el equipo de reconocimiento |
| Postgres | `localhost:5432` | Base `garitacontrol`, usuario `garita` |

Los puertos publicados son 18180 para la interfaz, 18181 para la visión y 18182 para la API. Dentro de la red de Compose la interfaz sigue en el 8080, la visión en el 8081 y la API en el 3000.

La vista previa de Figma Make sigue en el puerto `8443` y no pasa por Compose. El celular de desarrollo queda en `http://localhost:18183`.

## 10. Dónde se escribe cada cliente

No hace falta otro repositorio. Desde esta carpeta se trabajan los tres proyectos, y los tres quedan separados en ejecución:

- `src/` es el panel web. Su sesión y su captura viven en `src/api/client.ts` y hablan con `http://localhost:18182`.
- `apps/movil/` es la aplicación del celular. Usa las mismas rutas (`/api/v1/auth/login` y `/api/v1/identidad/capturas`). Se puede abrir con `npm run dev` dentro de esa carpeta o con el servicio `movil` de Compose.
- `services/api/` es el software intermedio. La web y el celular no se llaman entre sí.
- `services/vision/` es el procesamiento de imágenes. Otras aplicaciones lo consumen en `GET /v1/contrato` y `POST /v1/documentos/extraer` con `X-Vision-Key`. El entrenamiento se mide con `python training/evaluar.py` cuando haya fotos etiquetadas en `training/dataset`. Ese comando no fabrica un modelo: compara el motor activo con las etiquetas y deja el algoritmo en `app/engines/model.py`.

Las cuentas locales de desarrollo, si `SEED_DEV_USERS` está activo, son `vigilante`, `rrhh` y `jefe`. La contraseña y la función de cada una están en `docs/cuentas_rrhh.md`. Son solo para este entorno.

Para probar el contrato de captura con el resultado de prueba, levantar la visión con `VISION_ENGINE=fixture`. La respuesta incluye `motor: fixture` y una advertencia de que no es reconocimiento real.
