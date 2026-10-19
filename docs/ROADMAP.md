# GaritaControl — Fases y sprints

> Metodología de construcción. Los identificadores UC y de módulo remiten a `PRODUCT_SPEC.md` y `MODULES.md`. La evaluación técnica está en `ARCHITECTURE.md`. Cada sprint dura dos semanas y se cierra solo si sus pruebas de cumplimiento pasan sobre el stack de Compose.

## 1. Metodología

El trabajo sigue Scrum, con una pista de visión desacoplada.

- El objetivo de un sprint se demuestra en la API y, cuando hay pantalla, en el celular o el panel. No basta con datos mock.
- Una prueba de cumplimiento describe el dato de partida, la acción y el resultado observable.
- La pista de visión no bloquea sesión, perfiles ni jornada. Sí bloquea el uso productivo de UC-12, UC-13 y UC-14.
- No se da por cerrada una historia cuya interfaz siga leyendo `src/data/mockData.ts` para ese dato.
- Turno que cruza medianoche, terminal no asignada y jornada incompleta del día anterior siguen abiertos. Hasta decidirlos, la prueba esperada es una excepción auditable, no una corrección automática.
- Hay dos clientes. El panel web cubre escritorio: perfiles, horarios, excepciones, reportes y bandeja del jefe. La aplicación celular cubre la garita, la cámara, la cola sin red y la solicitud del trabajador. Los dos hablan solo con la API. El sprint 0 no construye el celular.

## 2. Mapa de casos de uso

| Caso | Actor | Sprint |
| --- | --- | --- |
| UC-01 Iniciar sesión | Vigilante, RR.HH. o jefe | 1 |
| UC-11 Cerrar sesión | Vigilante, RR.HH. o jefe | 1 |
| UC-05 Administrar perfiles | RR.HH. | 2 |
| UC-06 Incluir o excluir del flujo | RR.HH. | 2 |
| UC-17 Avisar desvinculación o vacaciones | Vigilante | 2 el dato; 4 la alerta |
| UC-12 Capturar fotocheck o DNI | Vigilante o RR.HH. | 3 el flujo; V4 el motor real |
| UC-02 Marcar con QR | Vigilante | 4 |
| UC-15 Segundo escaneo en menos de 10 minutos | Vigilante | 4 |
| UC-16 Registrar un servicio | Vigilante | 4 |
| UC-03 Marcar por búsqueda manual | Vigilante | 5 |
| UC-13 Confirmar identidad y marcar | Vigilante | 5, con motor real en V4 |
| UC-07 Administrar horarios | RR.HH. | 6 |
| UC-08 Resolver una excepción | RR.HH. | 6 |
| UC-04 Revisar el dashboard | RR.HH. | 7 |
| UC-09 Analizar trabajadores | RR.HH. | 7 |
| UC-10 Exportar reportes | RR.HH. | 8 |
| UC-14 Precargar un perfil desde el documento | RR.HH. | 8 la pantalla; V4 el motor real |
| UC-18 Marcar sin conectividad | Vigilante | 9 |
| UC-19 Solicitar ingreso fuera de horario | Trabajador | 10 |
| UC-20 Resolver o registrar una autorización | Jefe de área | 10 |

## 3. Sprint 0 — Base

**Estado:** cumplido en el stack actual.  
**Objetivo:** dejar Compose, el contrato de visión y un esquema inicial para trabajar en paralelo.

**Pruebas de cumplimiento, ya observadas:**

1. `docker compose up --build` deja sanos `web`, `api`, `vision` y `db`.
2. `POST /api/v1/identidad/capturas` con una imagen válida y motor `unconfigured` persiste `motor_no_disponible` y no devuelve nombre ni DNI.
3. Una imagen menor de 320×240 queda `rechazada`.
4. `vision` sin la clave compartida responde 401.
5. Con `VISION_ENGINE=fixture`, el DNI de prueba coteja un perfil semilla y la auditoría guarda el DNI enmascarado.

**Brecha que este sprint no cubre:** el esquema no tiene servicio, situación, horario rígido ni autorización. El panel web no llama a la API. La aplicación celular todavía no existe. Esos clientes comparten este backend y se abren en los sprints siguientes: el panel en los de escritorio y el celular en los de garita y de cola offline.

## 4. Sprint 1 — Sesión y roles

**Objetivo:** entrar según el rol guardado en la cuenta. El vigilante queda fijo a una terminal activa. El jefe puede autenticarse. El trabajador no recibe contraseña de panel.

**Alcance:** UC-01 y UC-11.

**Pruebas de cumplimiento:**

1. Un vigilante activo abre la garita de su terminal y ve su nombre y esa terminal.
2. Un usuario de RR.HH. abre el panel y no ve las acciones de marcación.
3. Un jefe abre solo la bandeja de autorizaciones.
4. Una contraseña incorrecta muestra el mismo mensaje exista o no la cuenta.
5. Cerrar sesión impide volver a una pantalla autenticada con el token anterior.
6. Un trabajador de la semilla no puede iniciar sesión con usuario y contraseña.

## 5. Sprint 2 — Perfil operativo

**Objetivo:** el perfil persistido distingue horario rígido, vacaciones, desvinculación y jefe asignado.

**Alcance:** UC-05, UC-06 y el dato de UC-17. Módulo REG.

**Pruebas de cumplimiento:**

1. Crear un operario con horario rígido, recargar y obtener el mismo DNI, área, horario y terminal desde la API.
2. Marcar un jefe o directivo con `horario_rigido = false`, recargar y seguir viendo ese valor.
3. Desvincular conserva el historial, deja `situacion = desvinculado` y queda auditado con el usuario de RR.HH.
4. Poner vacaciones deja `situacion = vacaciones` y no borra el horario.
5. Excluir del flujo de control impide nuevas marcaciones y se puede revertir.
6. Un DNI repetido no crea otro perfil.

## 6. Sprint 3 — Captura conectada

**Objetivo:** la aplicación celular toma la foto, la envía solo a la API y muestra extracción, confianza y cotejo, sin marcar todavía. El panel web no participa en esta captura.

**Alcance:** UC-12.

**Pruebas de cumplimiento:**

1. Desde el navegador no sale ninguna petición hacia el puerto de `vision`.
2. Con motor de prueba, un DNI de la semilla muestra el perfil y la advertencia de que no es reconocimiento real.
3. Con motor no configurado, la pantalla dice que el reconocimiento no está disponible y ofrece QR o búsqueda manual.
4. Confianza menor a 0.85 muestra revisión y no deja marcar.
5. Un DNI que no existe muestra el resultado sin crear trabajador.
6. Cerrar la sesión borra del celular cualquier foto de captura todavía no enviada.

## 7. Sprint 4 — Jornada en la garita

**Objetivo:** en el celular, reemplazar la marcación aleatoria del prototipo por Ingreso, Salida y Servicio, con la ventana de 10 minutos y las alertas.

**Alcance:** UC-02, UC-15, UC-16 y la alerta de UC-17. La hora del evento la pone la API.

**Pruebas de cumplimiento:**

1. Ingreso, salida a almuerzo, retorno y salida del día de un operario semilla quedan en `jornadas` y `marcaciones`, con tardanza y exceso calculados sobre el horario de ese momento.
2. Ingreso a las 08:01 y nueva identificación a las 08:06 no crean otro ingreso ni una tardanza. La respuesta muestra las 08:01 y las opciones de actualizar la hora o registrar una salida.
3. Elegir actualizar la hora deja 08:06 en la marcación y 08:01 en la auditoría. Cancelar no cambia la fila.
4. Si lo primero fue una salida, la segunda opción ofrecida es un ingreso, no otra salida.
5. Elegir Salida dentro del almuerzo programado guarda `salidaAlmuerzo`. Elegir Servicio en ese mismo tramo no guarda `servicio` y ofrece la salida a almorzar.
6. Dos servicios el mismo día generan dos filas. Si no hay retorno, la excepción queda como servicio sin retorno.
7. Volver durante el horario cierra el servicio con un ingreso. Volver después de `hora_salida` guarda `regresoServicio`.
8. Un jefe sin horario rígido registra ingreso, salida y servicio con tardanza y exceso en `null`.
9. Identificar a un desvinculado muestra el texto "Desvinculado", no crea marcación y no abre la consulta de 10 minutos.
10. Identificar a alguien de vacaciones muestra el texto "De vacaciones" y permite continuar si el resto de reglas lo permite.
11. Un rebote de la misma lectura crea una sola marcación.

## 8. Sprint 5 — QR, búsqueda y documento

**Objetivo:** los tres orígenes obedecen las reglas del sprint 4.

**Alcance:** UC-02 con cámara, UC-03 y UC-13.

**Pruebas de cumplimiento:**

1. El QR, el DNI manual y un documento confirmado producen el mismo periodo siguiente para el mismo estado de jornada.
2. La búsqueda manual guarda origen `manual` y el vigilante responsable.
3. El documento confirmado guarda origen `documento`.
4. Una extracción por debajo del umbral no marca.
5. Los contadores de dentro y fuera salen de las jornadas del día, no de una lista fija.
6. Un inactivo o fuera de flujo recibe un rechazo específico y no altera contadores.

## 9. Sprint 6 — Horarios y excepciones

**Objetivo:** cambiar un horario no reescribe la historia, y resolver un servicio sin retorno deja auditoría.

**Alcance:** UC-07 y UC-08.

**Pruebas de cumplimiento:**

1. Editar la hora de salida de un horario no modifica una jornada ya iniciada: esa jornada conserva `horario_snapshot`.
2. Un horario inactivo no puede asignarse a un perfil nuevo.
3. Resolver "servicio sin retorno" exige motivo, guarda la hora anterior y la nueva, y actualiza el cierre del servicio.
4. Cerrar el modal sin guardar no resuelve la excepción.
5. El contador de pendientes del menú coincide con el listado.

## 10. Sprint 7 — Lectura operativa

**Objetivo:** dashboard, comparación y detalle usan la misma consulta y muestran servicio.

**Alcance:** UC-04, UC-09 y el detalle del trabajador.

**Pruebas de cumplimiento:**

1. Cambiar área o fechas recalcula tarjetas, gráfico y tabla con el mismo conjunto.
2. Una jornada sin retorno no entra en el promedio de duración de almuerzo.
3. Los jefes sin horario rígido no suman tardanza ni exceso.
4. El detalle lista ingreso, almuerzo, cada servicio y salida. Un servicio abierto se ve como no retornó, no como `00:00`.
5. Abrir una persona desde el dashboard conserva el filtro al volver.

## 11. Sprint 8 — Reportes y alta asistida

**Objetivo:** exportar el conjunto filtrado y crear un perfil solo después de que RR.HH. corrija la extracción.

**Alcance:** UC-10 y UC-14.

**Pruebas de cumplimiento:**

1. La vista previa y el archivo CSV o Excel tienen las mismas filas, el mismo orden, la zona horaria, el origen y el estado.
2. Un archivo vacío no se descarga sin explicación.
3. Precargar desde un documento muestra nombre, DNI y foto editables. Guardar crea el perfil. Cancelar no lo crea.
4. El perfil creado en esta pantalla aparece en la garita sin recargar datos mock.

## 12. Sprint 9 — Sin conectividad

**Objetivo:** la aplicación celular sigue identificando al personal autorizado y no pierde la foto de quien no es de la empresa. El panel web, sin red, no ofrece este modo.

**Alcance:** UC-18.

**Pruebas de cumplimiento:**

1. Con la red cortada después de abrir la sesión, la búsqueda por nombre encuentra a una persona de la tabla local y muestra si está desvinculada o de vacaciones.
2. Una marcación hecha sin red no llama a la API ni a `vision`. Al recuperar la red se sube una sola vez y queda `sincronizada`.
3. La foto de un DNI de alguien que no es de la empresa permanece en el dispositivo sin red. Al subirla, entra por `POST /api/v1/identidad/capturas` y el dispositivo la elimina solo si la API responde con éxito.
4. Si durante la desconexión el servidor ya tiene otra marcación incompatible, la subida crea una excepción y no pisa la jornada en silencio.
5. Cerrar sesión borra la tabla local y la cola.

## 13. Sprint 10 — Autorizaciones

**Objetivo:** el trabajador pide el tramo, el jefe decide y la garita muestra el resultado.

**Alcance:** UC-19 y UC-20.

**Pruebas de cumplimiento:**

1. El trabajador se acredita con fotocheck o DNI, indica día, inicio y fin, y la solicitud queda pendiente para su jefe. No puede enviarla a otro jefe.
2. El jefe autoriza y la garita, al identificar a esa persona en ese tramo, muestra la autorización.
3. El jefe modifica el horario. La garita muestra el tramo nuevo y la solicitud original sigue consultable.
4. El jefe rechaza. La garita informa que no hay autorización para ese momento.
5. El jefe crea una autorización directa, sin solicitud, y la garita la muestra igual.
6. Una llegada fuera de horario, de noche o en domingo sin autorización muestra ese aviso y no lo oculta.
7. Una hora de fin anterior a la de inicio no se guarda.

## 14. Pista de visión

Puede avanzar desde el sprint 1. No cambia el contrato ni la API de negocio.

| Sprint | Objetivo | Prueba de cumplimiento |
| --- | --- | --- |
| V1 | Conjunto de evaluación sintético o autorizado, sin documentos reales en el repositorio | Cada caso tiene resultado esperado de nombre, apellido, DNI y si la foto es usable |
| V2 | Extraer nombre, apellido y DNI de fotocheck y de DNI | En el conjunto acordado, la confianza acompaña cada campo y un documento ilegible vuelve con campos vacíos |
| V3 | Recortar la foto y rechazar imagen borrosa, cortada o de otro tipo | La respuesta trae un JPEG recortado o un estado `rechazado` / `ilegible`, sin inventar la foto |
| V4 | Activar `VISION_ENGINE=model` | El contenedor responde `extraido` con un motor distinto de `fixture` y de `unconfigured`, y las pruebas del sprint 3 siguen pasando sin cambiar la interfaz |

## 15. Sprint 11 — Casos todavía abiertos

**Objetivo:** no implementar una política adivinada. Cada caso abierto debe producir una excepción auditable hasta que exista una decisión escrita en `PRODUCT_SPEC.md`.

**Pruebas de cumplimiento mientras sigan abiertos:**

1. Un turno que cruza medianoche no se parte ni se fusiona en silencio: queda una excepción.
2. Una marcación desde una terminal distinta de la asignada queda una excepción y no se descarta sin registro.
3. Una jornada incompleta del día anterior no se cierra sola al primer ingreso del día siguiente.

Cuando una de esas decisiones se escriba en la especificación, su prueba de cumplimiento se reemplaza por el comportamiento decidido y sale de esta lista.

## 16. Orden de integración

1. El equipo de visión publica mejoras dentro de `services/vision` y mantiene `openapi.yaml`.
2. La API solo cambia si cambia un campo del contrato de visión. Ese cambio se versiona y se refleja en la interfaz en el mismo sprint.
3. Mientras el motor no esté evaluado, el entorno de desarrollo puede usar `fixture` para UC-13. Producción permanece en `unconfigured` o en `model`, nunca en `fixture`.
