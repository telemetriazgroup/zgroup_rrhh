# GaritaControl — Especificación funcional

> Documento canónico de producto para personas y agentes de IA. Describe la intención funcional, incluso cuando el prototipo todavía no la implementa por completo. Consultar `MODULES.md` para el detalle funcional de cada módulo e `IMPLEMENTATION_STATUS.md` antes de asumir que un requisito ya está operativo. La tecnología, los contenedores y el orden de construcción están en `ARCHITECTURE.md` y `ROADMAP.md`.

## 1. Propósito

GaritaControl registra y permite auditar los movimientos de los trabajadores durante su jornada. El vigilante marca desde la aplicación del celular, con el QR del fotocheck o con una foto validada por la API de reconocimiento. Debe mostrar confirmación inmediata, impedir el pase de quien está desvinculado y dar a RR.HH. información confiable sobre tardanzas, almuerzo, servicios, registros incompletos y excepciones.

El sistema no es una herramienta de vigilancia pública ni de geolocalización. Su alcance es el control interno de acceso y jornada en terminales autorizados.

## 2. Usuarios y contexto

### Vigilante de garita

- Opera desde celular o tablet.
- Puede trabajar con prisa, ruido, luz variable y filas de personas.
- Necesita identificar el resultado del escaneo en menos de unos segundos.
- Elige **Ingreso**, **Salida** o **Servicio**. El sistema propone el evento según la jornada y el horario, y convierte en almuerzo la salida hecha dentro de ese horario.
- Puede recurrir a búsqueda por DNI o ID si el QR no se puede leer.
- Puede fotografiar el fotocheck o el DNI. La foto sale de la aplicación hacia la API de GaritaControl; el reconocimiento vive en otro servicio y devuelve nombre, DNI y recorte de la foto.
- Ve una alerta de color, siempre con texto, cuando la persona está desvinculada o de vacaciones.
- Ve la autorización del jefe cuando la persona llega fuera de horario, de noche o un domingo.

### Personal de RR.HH.

- Opera principalmente desde laptop o escritorio.
- Supervisa indicadores, trabajadores, marcaciones, horarios, excepciones y reportes.
- Puede corregir información, pero toda corrección debe tener motivo, responsable y trazabilidad.
- Necesita comparar personas y periodos sin perder el contexto del trabajador.
- Crea el perfil y marca la desvinculación o las vacaciones. La desvinculación impide el pase; las vacaciones informan al vigilante.

### Jefe de área

- Recibe la solicitud de un trabajador que irá a la empresa fuera del horario laboral, un domingo o de noche.
- Puede autorizarla, modificarla o rechazarla.
- También puede registrar esa autorización directamente, sin esperar la solicitud.

### Trabajador

- No opera la garita.
- Se acredita con su fotocheck o su DNI para pedir a su jefe autorización de ingreso fuera de horario.
- Indica el día y el horario en que irá a la empresa.

## 3. Vocabulario de dominio

- **Trabajador:** persona vinculada a un perfil, DNI, área, cargo, horario y terminal.
- **Fotocheck:** credencial física cuyo QR identifica de forma inequívoca al trabajador.
- **Terminal:** punto de control, por ejemplo Garita Principal, Norte o Sur.
- **Marcación:** evento de tiempo generado por escaneo o ajuste manual.
- **Jornada:** conjunto ordenado de marcaciones de un trabajador en una fecha operativa.
- **Periodo:** `ingreso`, `salidaAlmuerzo`, `retornoAlmuerzo`, `salidaDia`, `servicio` o `regresoServicio`.
- **Servicio:** salida en medio del horario por una comisión de trabajo. Puede repetirse durante la jornada. No es la salida a almorzar.
- **Regreso de servicio:** retorno después del horario de trabajo de quien había salido de servicio.
- **No retornó:** servicio que queda abierto porque la persona no volvió.
- **Tolerancia:** minutos permitidos antes de clasificar una marcación como tardía o excedida.
- **Ventana de relectura:** 10 minutos desde la última marcación. Dentro de ese plazo no se crea otro evento en silencio.
- **Excepción:** inconsistencia o caso que requiere revisión humana.
- **Flujo de control:** condición que habilita al trabajador para generar marcaciones en GaritaControl.
- **Horario rígido:** pauta que calcula tardanza y exceso de almuerzo. Los jefes y directivos no están sujetos a ella, pero sí se registra su ingreso, su salida y su servicio.
- **Desvinculación:** baja que impide el pase a la oficina.
- **Autorización:** permiso del jefe para ingresar fuera del horario laboral, un domingo o de noche.

Usar siempre estos términos en interfaz, código y documentación. En particular, **Registros** administra perfiles de trabajadores; **Trabajadores** analiza su comportamiento y jornadas. Si se rediseña la navegación, considerar renombrar “Registros” a “Perfiles” para eliminar esa ambigüedad.

## 4. Jornada y máquina de estados

Cada trabajador tiene como máximo una jornada activa por fecha operativa y horario asignado. El siguiente evento válido se deduce en orden:

| Estado actual | Próximo evento | Resultado esperado |
| --- | --- | --- |
| Sin jornada del día | Ingreso | Crear jornada y guardar `ingreso` |
| Con ingreso, sin salida a almuerzo | Salida almuerzo | Guardar `salidaAlmuerzo` |
| Con salida a almuerzo, sin retorno | Retorno almuerzo | Guardar `retornoAlmuerzo`, calcular duración y exceso |
| Con retorno, sin salida del día | Salida | Guardar `salidaDia` y cerrar jornada |
| Jornada completa | Ninguno | Si la última marcación tiene menos de 10 minutos, ofrecer actualizar la hora o el movimiento contrario. Si ya pasaron, rechazar otro cierre |

La interfaz no debe inferir el periodo al azar. Propone el evento con el estado persistido, el horario y la fecha operativa, y el vigilante confirma Ingreso, Salida o Servicio.

Una salida dentro del horario de almuerzo programado se guarda como `salidaAlmuerzo`. Una salida fuera de ese tramo, elegida como Servicio, se guarda como `servicio`. Puede haber varios servicios en la misma jornada.

| Situación | Evento |
| --- | --- |
| Sale de servicio y no vuelve | La salida queda abierta como **no retornó** |
| Vuelve durante el horario, después de un servicio | `ingreso`, y ese servicio queda cerrado |
| Vuelve después del horario de trabajo, después de un servicio | `regresoServicio` |

Jefes y directivos no tienen horario rígido. Su ingreso, su salida y su servicio se registran igual. Para ese perfil, `tardanzaIngreso` y `excesoAlmuerzo` quedan en `null`.

### Cálculos

- `tardanzaIngreso = max(0, ingreso - horaIngresoProgramada - toleranciaIngreso)`, solo si el perfil tiene horario rígido.
- `duracionAlmuerzo = retornoAlmuerzo - salidaAlmuerzo`.
- `excesoAlmuerzo = max(0, duracionAlmuerzo - duracionAlmuerzoProgramada - toleranciaRetorno)`, solo si el perfil tiene horario rígido.
- Los valores de tiempo se guardan con fecha, hora, zona horaria y terminal; la presentación puede usar `HH:mm`.
- Los valores no disponibles son `null`, no cero ni una cadena vacía.
- No se deben recalcular registros históricos con un horario nuevo. Cada jornada debe conservar una referencia o instantánea del horario vigente al momento del registro.

### Segundo escaneo en menos de 10 minutos

Si la misma persona vuelve a identificarse antes de cumplirse 10 minutos desde su última marcación, el sistema no crea otro evento y no trata esa lectura como un ingreso nuevo.

Muestra que ya tiene un registro a la hora guardada. El vigilante elige una opción:

1. **Actualizar la hora** de ese mismo evento. Sirve cuando la persona fue escaneada y no llegó a salir, o cuando el vigilante repite la lectura porque no sabe si la primera se procesó. La hora anterior permanece en la auditoría.
2. **Registrar el movimiento contrario.** Si lo primero fue un ingreso, lo segundo puede ser una salida. Si lo primero fue una salida, lo segundo puede ser un ingreso.

Ejemplo: el ingreso queda a las 08:01 y el límite de tolerancia de ese horario es 08:05. El vigilante vuelve a escanear a las 08:06. Esa hora ya pasó la tolerancia, así que un ingreso nuevo saldría tardío, pero todavía está dentro de los 10 minutos. El sistema muestra el registro de las 08:01 y pregunta si se actualiza esa hora o si corresponde una salida. No abre un segundo ingreso.

Si el vigilante cancela, no cambia nada. A partir de los 10 minutos la lectura sigue las reglas normales de ingreso, salida, almuerzo o servicio. Un rebote de la misma lectura, sin una segunda presentación, sigue siendo una sola marcación.

### Casos de frontera todavía abiertos

Siguen sin una política cerrada, y la aplicación no debe corregirlos en silencio:

- Turnos que cruzan medianoche.
- Marcación desde una terminal no asignada.
- Cambio de horario durante una jornada abierta.
- Jornada incompleta del día anterior.

Esos casos generan una excepción auditable.

## 5. Casos de uso

### UC-01 — Iniciar sesión

**Actor:** Vigilante o RR.HH.  
**Precondición:** usuario activo y terminal autorizada.  
**Flujo principal:**

1. El usuario ingresa credenciales.
2. El sistema valida identidad, rol y terminal.
3. Se abre la experiencia correspondiente al rol.
4. Se registra el inicio de sesión.

**Alternos:** credenciales inválidas, usuario bloqueado, terminal no autorizada o servicio no disponible deben mostrar un mensaje claro sin revelar información sensible.

### UC-02 — Registrar una marcación mediante QR

**Actor:** Vigilante.  
**Precondición:** sesión activa, cámara disponible y trabajador reconocido.  
**Flujo principal:**

1. El scanner lee el QR.
2. El sistema resuelve al trabajador y obtiene su jornada activa.
3. Valida estado, horario, terminal, alertas y la ventana de 10 minutos.
4. Propone Ingreso, Salida o Servicio. Si la salida cae en el horario de almuerzo, la propone como salida a almorzar.
5. El vigilante confirma.
6. Guarda la marcación.
7. Actualiza contadores y actividad reciente.
8. Muestra confirmación a pantalla completa con nombre, foto, área, periodo y hora.

**Resultado visual:**

- Salida a almuerzo: ámbar.
- Retorno correcto: verde.
- Error o bloqueo: rojo.
- Para ingreso, salida del día, servicio y regreso de servicio se debe usar una señal inequívoca compatible con el sistema semántico, sin depender solo del color.
- Desvinculado: rojo y el texto "Desvinculado". No hay marcación ni pase.
- De vacaciones: ámbar y el texto "De vacaciones".

**Criterios:** no registrar dos eventos por una sola lectura; dentro de los 10 minutos se consulta antes de crear otro; el feedback debe ser inmediato y desaparecer de forma segura sin bloquear el próximo uso.

### UC-03 — Registrar mediante búsqueda manual

**Actor:** Vigilante.  
**Disparador:** QR dañado o cámara no disponible.  
**Flujo:** abrir búsqueda, ingresar DNI o ID exacto, verificar identidad visual, confirmar y ejecutar las mismas validaciones de UC-02.

La búsqueda manual debe quedar marcada como origen manual, incluir al vigilante responsable y no saltarse reglas de negocio.

### UC-04 — Revisar operación desde Dashboard

**Actor:** RR.HH.  
**Flujo:** seleccionar periodo y área; revisar KPI, flujo por franja, exceso por área y personas con exceso recurrente; abrir el detalle de una persona.

Todos los KPI y gráficos deben responder a los filtros activos y derivarse de la misma fuente de datos.

### UC-05 — Administrar perfiles

**Actor:** RR.HH.  
**Flujo:** buscar o filtrar; crear, editar, activar/inactivar o eliminar un perfil; asignar área, cargo, horario, terminal, foto y participación en el flujo.

**Validaciones mínimas:**

- nombre, apellido, DNI, área, cargo, horario y terminal obligatorios;
- DNI e ID únicos;
- formato válido de email y teléfono cuando se proporcionen;
- advertencia antes de eliminar;
- preferir baja lógica cuando existan jornadas históricas;
- cambios persistidos y reflejados en todas las vistas.

### UC-06 — Incluir o excluir del flujo de control

**Actor:** RR.HH.  
**Resultado:** un trabajador excluido conserva su historial, pero nuevas marcaciones deben rechazarse con un mensaje específico. La acción debe ser reversible y auditable.

### UC-07 — Administrar horarios

**Actor:** RR.HH.  
**Flujo:** crear o editar un esquema; definir ingreso, almuerzo, salida, tolerancias, días, reglas de sábado, vigencia y trabajadores asignados; revisar una línea de tiempo reactiva; guardar.

**Validaciones mínimas:** secuencia horaria coherente, al menos un día, nombre único, vigencia válida y aviso si el cambio afecta trabajadores.

### UC-08 — Resolver una excepción

**Actor:** RR.HH.  
**Tipos iniciales:** sin retorno, servicio sin retorno, cierre automático, retorno sin salida y duplicado.  
**Flujo:** filtrar; abrir una excepción; revisar trabajador y evento; indicar hora corregida, motivo y nota; guardar resolución.

La resolución debe actualizar la jornada relacionada, retirar el caso de pendientes y conservar antes/después, usuario y fecha. No se permite “resolver” solo cerrando el modal.

### UC-09 — Analizar trabajadores

**Actor:** RR.HH.  
**Flujo:** buscar y filtrar; revisar tarjetas; comparar en una tabla ordenable; desplegar detalle inline o abrir detalle completo.

El detalle muestra identidad, estado del fotocheck, KPI, tendencia y jornadas con los cuatro periodos: ingreso, salida de almuerzo, retorno de almuerzo y salida.

### UC-10 — Exportar reportes

**Actor:** RR.HH.  
**Flujo:** elegir tipo, rango y área; aplicar filtros; revisar vista previa; exportar Excel o CSV.

La exportación debe contener exactamente el conjunto filtrado, respetar zona horaria y mostrar estado/origen. Los tipos iniciales son detalle, resumen mensual, exceso recurrente y sesiones incompletas.

### UC-11 — Cerrar sesión

**Actor:** Vigilante o RR.HH.  
**Resultado:** invalidar la sesión, limpiar datos sensibles de memoria local y volver al login.

### UC-12 — Capturar fotocheck o documento de identidad

**Actor:** Vigilante. RR.HH. puede usar el mismo servicio al precargar un perfil.  
**Precondición:** sesión activa. En garita, terminal autorizada.  
**Disparador:** el QR no se lee, o se necesita extraer los datos impresos del documento.  
**Flujo principal:**

1. El usuario elige fotocheck o DNI y toma una foto.
2. La aplicación envía la imagen únicamente a la API de GaritaControl.
3. La API registra la captura y la reenvía al servicio de reconocimiento.
4. Ese servicio valida la imagen y devuelve nombre, apellido, DNI, recorte de la foto y la confianza de cada campo.
5. La API coteja el DNI con los perfiles existentes.
6. La pantalla muestra los datos extraídos, la foto recortada y si existe un perfil. No marca ni da de alta a nadie en este paso.

**Alternos:** imagen inválida, documento ilegible, motor no disponible, confianza bajo el umbral o DNI sin perfil. En todos esos casos se explica el resultado y se conserva el QR o la búsqueda manual como camino de marcación.

### UC-13 — Confirmar identidad extraída y marcar

**Actor:** Vigilante.  
**Precondición:** UC-12 devolvió un perfil activo, dentro del flujo, con confianza igual o superior al umbral.  
**Flujo principal:**

1. El vigilante compara a la persona presente con el nombre, el DNI y la foto extraídos.
2. Confirma la identidad.
3. El sistema ejecuta las mismas validaciones de jornada, horario, terminal y duplicado que UC-02.
4. Guarda la marcación con origen `documento`.

**Alternos:** si la persona no coincide, si la confianza es baja o si el perfil no puede marcar, no se registra el evento. La duda queda para búsqueda manual o para una excepción, según el caso.

### UC-14 — Precargar un perfil desde el documento

**Actor:** RR.HH. administrador.  
**Flujo:** capturar el documento con UC-12, revisar y corregir nombre, apellido, DNI y foto, completar área, cargo, horario y terminal, y guardar. La extracción nunca persiste un trabajador por sí sola.

### UC-15 — Resolver un segundo escaneo dentro de 10 minutos

**Actor:** Vigilante.  
**Precondición:** la persona ya tiene una marcación hace menos de 10 minutos.  
**Flujo principal:**

1. La aplicación muestra la hora del registro existente.
2. El vigilante elige actualizar esa hora o registrar el movimiento contrario: salida si lo primero fue ingreso, ingreso si lo primero fue salida.
3. Si actualiza la hora, el valor anterior queda en la auditoría.
4. Si elige el movimiento contrario y esa salida cae en el almuerzo, se guarda como salida a almorzar.

**Alternos:** cancelar deja la jornada intacta. Un desvinculado no llega a esta consulta: se bloquea antes.

### UC-16 — Registrar un servicio

**Actor:** Vigilante.  
**Flujo:** identificar a la persona, elegir Servicio y guardar la salida. Puede repetirse en la misma jornada. Si la persona no vuelve, el caso queda como no retornó. Si vuelve durante el horario, el vigilante registra Ingreso y el servicio se cierra. Si vuelve después del horario de trabajo, el evento es regreso de servicio.

Una salida dentro del horario de almuerzo no se guarda como servicio.

### UC-17 — Avisar desvinculación o vacaciones

**Actor:** Vigilante.  
**Precondición:** RR.HH. marcó esa situación en el perfil.  
**Flujo:** al identificar a la persona, la garita muestra la alerta con color y texto. Desvinculado impide el pase y no crea marcación. De vacaciones informa y deja continuar si el resto de reglas lo permite.

### UC-18 — Marcar sin conectividad

**Actor:** Vigilante.  
**Flujo:** la aplicación consulta la tabla local de nombres del personal autorizado a ingresar, registra la marcación en el dispositivo y la sube al recuperar la red. Si la persona no es de la empresa y se identifica con DNI, guarda la foto en el dispositivo y la envía a la API cuando haya conexión. Un conflicto al subir no se resuelve en silencio: queda como excepción para RR.HH.

### UC-19 — Solicitar ingreso fuera de horario

**Actor:** Trabajador de ZGroup.  
**Flujo:**

1. Se acredita con el fotocheck o el DNI.
2. Indica el día y el horario en que irá a la empresa.
3. Envía la solicitud a su jefe.

Cubre una llegada fuera del horario laboral, un domingo o la noche.

### UC-20 — Resolver o registrar una autorización

**Actor:** Jefe de área.  
**Flujo:** recibe la solicitud y autoriza, modifica el día o el horario, o rechaza. También puede crear la autorización directamente. La garita muestra la autorización vigente para que el vigilante no pida al trabajador que consiga el permiso de su jefe. Si no hay autorización para ese momento, la pantalla lo indica.

## 6. Requisitos por pantalla

El catálogo completo de responsabilidades, acciones, validaciones, estados e integraciones se encuentra en [`MODULES.md`](MODULES.md). El resumen siguiente define únicamente la composición principal de cada experiencia.

### Login

- Marca GaritaControl, usuario, contraseña, opción de mantener sesión y terminal.
- Estados: vacío, validando, error y éxito.
- No debe determinar roles a partir del texto del nombre de usuario en producción.

### Scanner

- Encabezado con vigilante, terminal, conectividad y reloj.
- Área de cámara dominante con guía de lectura.
- Contadores de personas dentro/fuera y lista de lecturas recientes.
- Alternativa de búsqueda manual.
- Acciones visibles de Ingreso, Salida y Servicio.
- Consulta de los 10 minutos: hora ya registrada, actualizar esa hora o registrar el movimiento contrario.
- Overlay de confirmación accesible por texto, icono y color.
- Alerta de desvinculación y alerta de vacaciones.
- Autorización vigente, o aviso de que no existe, cuando la llegada es fuera de horario, de noche o en domingo.
- Debe contemplar permiso de cámara denegado, sin cámara, sin conexión con tabla local, QR inválido, perfil inactivo, desvinculado y error de servidor.

### Panel de RR.HH.

- Sidebar en desktop y menú temporal en móvil.
- Fondo de contenido claro y navegación con estado activo.
- Vistas: Dashboard, Registros, Excepciones, Horarios, Trabajadores, Reportes y Detalle de trabajador.
- El jefe ve las solicitudes de autorización. El trabajador ve el formulario del día y el horario que enviará a su jefe.
- Tablas con scroll horizontal cuando no sea posible reordenar el contenido.
- Formularios largos en panel lateral o modal con acciones persistentes y prevención de pérdida de cambios.

## 7. Sistema visual y experiencia

### Identidad

- Estética industrial, sobria y funcional.
- Sin gradientes. La simulación visual de cámara tampoco debe introducir gradientes.
- Esquinas principales de `12px`.
- Tipografía principal: Inter.
- Datos horarios y numéricos: JetBrains Mono o cifras tabulares.

### Tokens base

| Uso | Valor |
| --- | --- |
| Fondo garita | `#0F1419` |
| Superficie oscura | `#161C25` |
| Fondo RR.HH. | `#F7F8FA` |
| Superficie clara | `#FFFFFF` |
| Borde claro | `#EAECF0` |
| Acento | `#1D6FD8` |
| Salida / advertencia | `#F5A524` |
| Retorno / éxito | `#17B26A` |
| Error / peligro / desvinculado | `#E5484D` |
| Servicio | `#1D6FD8` |
| Texto secundario | `#8B8FA3` |

### Interacción y accesibilidad

- Mobile-first; experiencia de garita optimizada para celular/tablet y RR.HH. para laptop.
- Áreas táctiles de al menos `48 × 48px` en acciones principales.
- Nunca comunicar estado solo con color: añadir etiqueta o icono.
- Contraste suficiente, foco visible, labels asociados y navegación por teclado.
- Botones con estados hover, focus, pressed, disabled y loading cuando correspondan.
- Confirmar acciones destructivas; permitir cancelar sin efectos.
- Mostrar estados vacío, carga, error y éxito en vistas basadas en datos.
- No usar emoji como iconografía; utilizar el sistema de iconos SVG existente.
- Formatear fechas para `es-PE` y tiempos de forma tabular.

## 8. Modelo funcional mínimo

### Worker

Campos actuales: `id`, `nombre`, `apellido`, `shortName`, `area`, `cargo`, `dni`, `telefono`, `email`, `fechaIngreso`, `photo`, `status`, `schedule`, `terminal`, `inControlFlow`.

En una implementación persistente, `schedule` y `terminal` son identificadores. El perfil también guarda `horarioRigido`, la situación `activo`, `vacaciones` o `desvinculado`, y el jefe que recibe sus autorizaciones. Jefes y directivos quedan con `horarioRigido = false`.

### Record

Campos actuales: `id`, `workerId`, `date`, `ingreso`, `salidaAlmuerzo`, `retornoAlmuerzo`, `duracionAlmuerzo`, `salidaDia`, `tardanzaIngreso`, `excesoAlmuerzo`, `origin`, `status`.

Campos de producción esperados: zona horaria, ID del horario aplicado, IDs de terminal y vigilante, timestamps completos, auditoría de creación/modificación y estado de sincronización. Cada servicio guarda su salida y, si existe, su cierre por ingreso o por `regresoServicio`. La hora sustituida dentro de los 10 minutos conserva el valor anterior.

### Schedule

Debe representar nombre, días, horas de los cuatro periodos, tolerancias, vigencia, estado, regla de sábado y asignaciones.

### Exception

Debe relacionarse con una jornada/evento, tipo, terminal, responsable, estado, motivo de resolución, nota, valores anterior/nuevo y marcas de auditoría. El servicio sin retorno entra en este modelo.

### Captura de documento

Registra el tipo (`fotocheck` o `dni`), el motor usado, nombre, apellido y DNI extraídos, la confianza, las advertencias y el perfil cotejado. No almacena la imagen cruda. El recorte de foto se muestra al confirmar; solo pasa al perfil cuando una persona lo guarda.

### Autorización

Relaciona trabajador, jefe, día, hora de inicio, hora de fin, estado (`pendiente`, `autorizada`, `rechazada`) y el motivo del rechazo cuando existe. Una modificación conserva la solicitud original y el resultado vigente.

### Cola offline

Guarda en el dispositivo la marcación del personal autorizado y, para quien no es de la empresa, la foto del DNI pendiente de subida. Al sincronizar registra el resultado o una excepción si hay conflicto.

## 9. Requisitos no funcionales

- **Consistencia:** una marcación se procesa de forma idempotente.
- **Auditoría:** los ajustes manuales nunca borran el valor original.
- **Seguridad:** autenticación y autorización por rol; no incluir datos personales en logs innecesarios.
- **Privacidad:** fotos y DNI se muestran solo a roles autorizados. La aplicación no habla con el reconocimiento. Los logs no guardan la imagen ni el DNI completo.
- **Identidad documental:** una extracción no crea perfiles ni marcaciones. Hace falta confirmación humana y, para marcar, confianza de al menos 0.85 en nombre, apellido, DNI y foto.
- **Resiliencia:** sin red, la garita usa la tabla local de personal autorizado y encola la marcación. La foto de quien no es de la empresa y se identifica con DNI queda en el dispositivo hasta que pueda subirse.
- **Rendimiento:** feedback del scanner percibido como inmediato; tablas grandes necesitan paginación o virtualización.
- **Responsive:** sin acciones inaccesibles ni contenido crítico cortado en anchos pequeños.
- **Localización:** español de Perú, zona horaria de la sede y calendario local configurables.

## 10. Criterio de terminado para cambios funcionales

Un cambio no está completo solo porque se ve en pantalla. Debe:

1. respetar las reglas de jornada y roles;
2. manejar carga, vacío, error y éxito cuando aplique;
3. funcionar en viewport móvil y desktop relevante;
4. conservar accesibilidad básica y áreas táctiles;
5. actualizar una única fuente de estado;
6. persistir o declarar explícitamente que sigue siendo demo;
7. incluir verificación proporcional al riesgo;
8. actualizar esta especificación, `MODULES.md` e `IMPLEMENTATION_STATUS.md` si cambia el alcance.
