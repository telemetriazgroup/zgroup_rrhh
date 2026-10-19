# GaritaControl — Funcionalidades por módulo

> Catálogo funcional del sistema. Define qué debe hacer cada módulo y sirve como referencia para análisis, diseño, implementación y pruebas. El estado real de cada capacidad se consulta en `IMPLEMENTATION_STATUS.md`.

## 1. Cómo leer este documento

Cada módulo incluye:

- **Objetivo:** responsabilidad del módulo.
- **Actores:** usuarios autorizados.
- **Entradas:** información que consume.
- **Funcionalidades:** comportamiento esperado, identificado con un código estable.
- **Reglas y validaciones:** restricciones que no deben omitirse.
- **Estados de interfaz:** variantes que debe representar la UI.
- **Salidas e integraciones:** datos que produce o módulos que afecta.

Los identificadores funcionales deben conservarse cuando se creen historias, pruebas o documentación adicional.

## 2. Mapa de módulos

| Código | Módulo | Actor principal | Propósito |
| --- | --- | --- | --- |
| AUT | Autenticación y sesión | Vigilante / RR.HH. | Controlar acceso, rol, terminal y cierre de sesión |
| GAR | Garita y scanner | Vigilante | Registrar ingreso, salida, almuerzo y servicio desde el celular |
| AUTZ | Autorizaciones | Jefe de área / Trabajador | Pedir, modificar o autorizar un ingreso fuera de horario |
| DASH | Dashboard | RR.HH. | Resumir el estado operativo y sus tendencias |
| REG | Registros de trabajadores | RR.HH. | Administrar perfiles y participación en el control |
| EXC | Excepciones | RR.HH. | Revisar y resolver inconsistencias auditables |
| HOR | Horarios | RR.HH. | Configurar jornadas, tolerancias, vigencia y asignaciones |
| TRA | Trabajadores | RR.HH. | Buscar, comparar y analizar trabajadores |
| DET | Detalle de trabajador | RR.HH. | Consultar identidad, métricas e historial individual |
| REP | Reportes | RR.HH. | Consultar y exportar información filtrada |
| NAV | Navegación y layout | Vigilante / RR.HH. | Proporcionar acceso responsivo y contexto de sesión |
| IDE | Identidad documental | Vigilante / RR.HH. | Recibir la foto, delegar la extracción y cotejar el DNI |
| VIS | Reconocimiento de documentos | Servicio interno | Leer nombre, DNI y foto desde el fotocheck o el DNI |

## 3. Módulo AUT — Autenticación y sesión

### Objetivo

Validar la identidad del usuario, determinar sus permisos y asociar la sesión a una terminal autorizada.

### Actores

- Vigilante.
- Personal de RR.HH.

### Entradas

- Usuario.
- Contraseña.
- Terminal o sede.
- Preferencia “Mantener sesión”.

### Funcionalidades

| ID | Funcionalidad | Comportamiento esperado |
| --- | --- | --- |
| AUT-01 | Iniciar sesión | Validar credenciales y abrir la experiencia correspondiente al rol autorizado |
| AUT-02 | Resolver rol | Obtener el rol desde la identidad autenticada; nunca inferirlo desde el texto del usuario |
| AUT-03 | Asociar terminal | Vincular la sesión del vigilante a una terminal habilitada |
| AUT-04 | Mantener sesión | Conservar la sesión de forma segura cuando el usuario lo solicite y la política lo permita |
| AUT-05 | Controlar acceso | Impedir que un rol acceda a módulos o acciones no autorizadas |
| AUT-06 | Cerrar sesión | Invalidar tokens, limpiar datos sensibles y volver al login |
| AUT-07 | Gestionar expiración | Avisar cuando la sesión expire y solicitar una nueva autenticación |

### Reglas y validaciones

- Usuario y contraseña son obligatorios.
- Los errores no deben revelar si una cuenta concreta existe.
- El usuario bloqueado, inactivo o sin terminal autorizada no puede iniciar operación.
- La sesión de garita debe mostrar vigilante y terminal activos.
- Las acciones sensibles de RR.HH. deben guardar el usuario responsable.

### Estados de interfaz

- Formulario vacío.
- Validando.
- Credenciales inválidas.
- Usuario bloqueado o inactivo.
- Terminal no autorizada.
- Servicio no disponible.
- Sesión expirada.
- Acceso concedido.

### Salidas e integraciones

- Contexto de sesión usado por GAR, REG, EXC, HOR, TRA, DET y REP.
- Identificador de usuario para auditoría.
- Rol y permisos para NAV.

## 4. Módulo GAR — Garita y scanner

### Objetivo

Registrar de forma rápida, inequívoca e idempotente las marcaciones de los trabajadores mediante QR o búsqueda manual.

### Actor

- Vigilante.

### Entradas

- QR del fotocheck.
- DNI o ID para búsqueda manual.
- Fecha y hora de la terminal.
- Trabajador, horario vigente y jornada activa.
- Terminal y vigilante autenticados.
- Estado de conectividad.

### Funcionalidades

| ID | Funcionalidad | Comportamiento esperado |
| --- | --- | --- |
| GAR-01 | Inicializar cámara | Solicitar permiso, elegir cámara disponible y mostrar una guía de lectura |
| GAR-02 | Leer QR | Decodificar una sola vez cada presentación del fotocheck |
| GAR-03 | Identificar trabajador | Resolver el QR contra un trabajador activo y autorizado |
| GAR-04 | Proponer evento | Proponer ingreso, salida o servicio según la jornada. Una salida en el horario de almuerzo se propone como salida a almorzar |
| GAR-05 | Registrar ingreso | Crear la jornada y calcular `tardanzaIngreso` |
| GAR-06 | Registrar salida a almuerzo | Guardar `salidaAlmuerzo` y marcar al trabajador como fuera |
| GAR-07 | Registrar retorno | Guardar `retornoAlmuerzo`, calcular duración y `excesoAlmuerzo` |
| GAR-08 | Registrar salida del día | Guardar `salidaDia` y cerrar la jornada |
| GAR-09 | Confirmar marcación | Mostrar nombre, foto, área, periodo y hora con señal visual y textual |
| GAR-10 | Rechazar marcación | Explicar QR inválido, trabajador inactivo, fuera de flujo, duplicado u otro bloqueo |
| GAR-11 | Buscar manualmente | Localizar por DNI o ID y solicitar verificación visual antes de confirmar |
| GAR-12 | Mostrar actividad reciente | Listar últimas marcaciones con trabajador, hora, periodo y resultado |
| GAR-13 | Mostrar contadores | Indicar personas dentro y fuera usando jornadas vigentes |
| GAR-14 | Gestionar conectividad | Informar estado online/offline y aplicar la política de sincronización definida |
| GAR-15 | Prevenir doble lectura | Bloquear rebotes y procesar cada solicitud de forma idempotente |
| GAR-16 | Capturar documento | Enviar la foto a la API de identidad y mostrar nombre, DNI, foto y cotejo antes de cualquier marcación |
| GAR-17 | Consultar relectura | Si la última marcación tiene menos de 10 minutos, mostrar su hora y pedir actualizarla o registrar el movimiento contrario |
| GAR-18 | Registrar servicio | Guardar una o varias salidas de servicio durante la jornada |
| GAR-19 | Cerrar servicio | Registrar ingreso si vuelve en horario, o regreso de servicio si vuelve después del horario. Si no vuelve, dejar no retornó |
| GAR-20 | Alertar situación | Mostrar desvinculado y bloquear el pase, o mostrar de vacaciones con texto y color |
| GAR-21 | Mostrar autorización | Informar si el jefe autorizó la llegada fuera de horario, de noche o en domingo |
| GAR-22 | Operar sin red | Consultar la tabla local de personal autorizado, encolar la marcación y guardar la foto del DNI de quien no es de la empresa |

### Reglas y validaciones

- El vigilante confirma Ingreso, Salida o Servicio. El sistema propone el evento y no lo elige al azar.
- Una salida dentro del almuerzo programado es `salidaAlmuerzo`, no `servicio`.
- Dentro de los 10 minutos siguientes no se crea otra marcación hasta que el vigilante actualice la hora o elija el movimiento contrario.
- Un desvinculado no marca y no pasa a la oficina. Un trabajador de vacaciones recibe alerta y puede continuar si el resto de reglas lo permite.
- Jefes y directivos registran ingreso, salida y servicio sin cálculo de tardanza ni de exceso de almuerzo.
- Una lectura duplicada de la misma presentación no debe alterar contadores ni crear otro registro.
- La búsqueda manual ejecuta las mismas validaciones que el QR.
- El origen debe guardarse como `scan` o `manual`.
- Cada evento debe registrar timestamp completo, terminal, vigilante y horario aplicado.
- Una inconsistencia no debe corregirse silenciosamente: debe generar o vincular una excepción.

### Estados de interfaz

- Solicitando permiso de cámara.
- Cámara activa y lista.
- Procesando lectura.
- Confirmación de ingreso.
- Confirmación de salida a almuerzo.
- Confirmación de retorno, con duración y exceso.
- Confirmación de salida del día.
- Consulta de relectura, con la hora ya registrada.
- Confirmación de servicio.
- Confirmación de regreso de servicio.
- Alerta de desvinculado.
- Alerta de vacaciones.
- Autorización vigente o ausencia de autorización.
- Error recuperable.
- Cámara denegada o no disponible.
- Sin conexión.
- Sin resultados en búsqueda manual.

### Salidas e integraciones

- Crea o actualiza una jornada consumida por DASH, TRA, DET y REP.
- Puede crear una excepción para EXC.
- Consulta perfiles de REG y reglas de HOR.
- Actualiza contadores y actividad reciente.
- Delega la foto del documento en IDE. No llama a VIS.

## 5. Módulo DASH — Dashboard

### Objetivo

Ofrecer a RR.HH. una lectura resumida y filtrable de la operación, con acceso al detalle subyacente.

### Actor

- Personal de RR.HH.

### Entradas

- Jornadas y marcaciones.
- Trabajadores y áreas.
- Horarios y tolerancias.
- Rango de fechas y filtros activos.

### Funcionalidades

| ID | Funcionalidad | Comportamiento esperado |
| --- | --- | --- |
| DASH-01 | Filtrar periodo | Cambiar el rango de análisis y recalcular todos los componentes |
| DASH-02 | Filtrar área | Limitar KPI, gráficos y listados a un área |
| DASH-03 | Mostrar minutos de exceso | Sumar `excesoAlmuerzo` del conjunto filtrado |
| DASH-04 | Mostrar duración promedio | Calcular promedio de almuerzos con salida y retorno válidos |
| DASH-05 | Detectar exceso recurrente | Contar trabajadores que superen el umbral configurado |
| DASH-06 | Mostrar sesiones incompletas | Calcular cantidad y porcentaje de jornadas incompletas |
| DASH-07 | Graficar flujo | Agrupar salidas y retornos por franja horaria |
| DASH-08 | Comparar áreas | Mostrar exceso promedio por área |
| DASH-09 | Listar reincidencias | Ordenar trabajadores por días o minutos de exceso |
| DASH-10 | Abrir detalle | Navegar desde una fila al detalle del trabajador |

### Reglas y validaciones

- Todos los elementos deben responder a los mismos filtros.
- Los KPI deben derivarse de registros, no de números fijos.
- Debe mostrarse el rango y zona horaria utilizados.
- Una jornada incompleta no participa en promedios que requieran duración completa.
- Debe existir una definición configurable de “exceso recurrente”.

### Estados de interfaz

- Cargando.
- Con datos.
- Sin datos para el filtro.
- Error de consulta.
- Datos parciales o desactualizados.

### Salidas e integraciones

- Navega a DET.
- Comparte criterios de cálculo con TRA y REP.

## 6. Módulo REG — Registros de trabajadores

### Objetivo

Administrar el perfil maestro de cada trabajador y su habilitación para participar en el flujo de control.

### Actor

- Personal de RR.HH. con permiso de mantenimiento.

### Entradas

- Nombre y apellido.
- DNI, teléfono y email.
- Área y cargo.
- Fecha de ingreso.
- Foto.
- Horario y terminal.
- Estado del fotocheck.
- Participación en el flujo de control.

### Funcionalidades

| ID | Funcionalidad | Comportamiento esperado |
| --- | --- | --- |
| REG-01 | Listar perfiles | Mostrar trabajadores con identidad, asignaciones y estado |
| REG-02 | Buscar | Buscar por nombre, apellido, DNI o ID |
| REG-03 | Filtrar | Filtrar por área y estado |
| REG-04 | Crear perfil | Registrar un trabajador con identificador único |
| REG-05 | Editar perfil | Modificar datos y reflejarlos en todos los módulos |
| REG-06 | Cargar foto | Aceptar archivo o URL válida y mostrar previsualización |
| REG-07 | Activar o inactivar | Cambiar disponibilidad del fotocheck sin borrar historial |
| REG-08 | Incluir o excluir del flujo | Habilitar o bloquear nuevas marcaciones |
| REG-09 | Asignar horario | Vincular un horario activo y vigente |
| REG-10 | Asignar terminal | Definir terminal principal según la política del sistema |
| REG-11 | Enviar a excepciones | Crear un caso manual relacionado con el trabajador |
| REG-12 | Eliminar o dar de baja | Confirmar la acción y preservar integridad histórica |
| REG-13 | Marcar desvinculación | Impedir nuevas marcaciones y mostrar la alerta roja en garita |
| REG-14 | Marcar vacaciones | Informar al vigilante con alerta ámbar sin bloquear por sí sola |
| REG-15 | Definir horario rígido | Excluir a jefes y directivos del cálculo de tardanza y exceso de almuerzo |

### Reglas y validaciones

- Nombre, apellido, DNI, área, cargo, horario y terminal son obligatorios.
- DNI e ID deben ser únicos.
- Email y teléfono deben validar su formato cuando se proporcionan.
- Solo se pueden asignar horarios habilitados y aplicables.
- Si existen jornadas relacionadas, se debe preferir baja lógica sobre eliminación física.
- La exclusión del flujo no elimina datos ni cierra jornadas silenciosamente.
- Los cambios deben quedar auditados.

### Estados de interfaz

- Listado con resultados.
- Sin resultados.
- Formulario nuevo.
- Formulario de edición.
- Errores de validación por campo.
- Guardando.
- Confirmación de eliminación o baja.
- Guardado exitoso.
- Error o conflicto por dato duplicado.

### Salidas e integraciones

- Proporciona identidad a GAR, EXC, TRA, DET y REP.
- Consume horarios de HOR.
- Puede crear casos en EXC.

## 7. Módulo EXC — Excepciones

### Objetivo

Centralizar inconsistencias de marcación y permitir su resolución con trazabilidad.

### Actor

- Personal de RR.HH. con permiso de corrección.

### Entradas

- Excepciones automáticas o manuales.
- Jornada y eventos relacionados.
- Trabajador, terminal y vigilante.
- Hora corregida, motivo y nota.

### Funcionalidades

| ID | Funcionalidad | Comportamiento esperado |
| --- | --- | --- |
| EXC-01 | Listar pendientes | Mostrar tipo, trabajador, fecha, hora, terminal y responsable |
| EXC-02 | Filtrar por tipo | Filtrar sin retorno, servicio sin retorno, cierre automático, retorno sin salida y duplicado |
| EXC-03 | Mostrar contador | Reflejar el número real de excepciones pendientes |
| EXC-04 | Abrir resolución | Mostrar contexto de trabajador, jornada y valores afectados |
| EXC-05 | Corregir hora | Validar y aplicar el nuevo valor al periodo correspondiente |
| EXC-06 | Registrar motivo | Exigir un motivo categorizado antes de resolver |
| EXC-07 | Registrar nota | Permitir explicación adicional |
| EXC-08 | Resolver | Actualizar la jornada y retirar el caso de pendientes |
| EXC-09 | Conservar auditoría | Guardar valores anterior/nuevo, usuario y fecha de resolución |
| EXC-10 | Cancelar | Cerrar sin modificar la excepción ni la jornada |

### Reglas y validaciones

- No se resuelve una excepción solo cerrando el modal.
- Motivo y hora corregida son obligatorios cuando la corrección altera un periodo.
- La hora corregida debe respetar la secuencia de la jornada o requerir una justificación explícita.
- Las correcciones no borran el valor original.
- El contador de navegación y el listado deben usar la misma fuente de datos.
- Las excepciones resueltas deben poder consultarse en el historial.

### Estados de interfaz

- Pendientes.
- Filtrado sin resultados.
- Resolución en edición.
- Validación inválida.
- Guardando.
- Resuelta.
- Error de concurrencia si otra persona ya la resolvió.

### Salidas e integraciones

- Actualiza la jornada consumida por DASH, TRA, DET y REP.
- Registra auditoría asociada a AUT.

## 8. Módulo HOR — Horarios

### Objetivo

Configurar esquemas de jornada y las reglas usadas para clasificar marcaciones.

### Actor

- Personal de RR.HH. con permiso de configuración.

### Entradas

- Nombre del esquema.
- Días laborables.
- Hora de ingreso.
- Salida y retorno de almuerzo.
- Hora de salida del día.
- Tolerancias.
- Vigencia y estado.
- Regla de sábado.
- Trabajadores asignados.

### Funcionalidades

| ID | Funcionalidad | Comportamiento esperado |
| --- | --- | --- |
| HOR-01 | Listar horarios | Mostrar nombre, días, resumen, asignados, vigencia y estado |
| HOR-02 | Crear horario | Configurar un nuevo esquema completo |
| HOR-03 | Editar horario | Modificar un esquema sin alterar registros históricos |
| HOR-04 | Visualizar línea de tiempo | Representar periodos y tolerancias de forma reactiva |
| HOR-05 | Configurar tolerancias | Definir ingreso, retorno, salida anticipada e incompletitud |
| HOR-06 | Configurar días | Seleccionar días laborables y comportamiento de sábado |
| HOR-07 | Configurar vigencia | Definir desde cuándo se aplica el horario |
| HOR-08 | Activar o inactivar | Controlar si puede asignarse a nuevos trabajadores |
| HOR-09 | Asignar trabajadores | Buscar, agregar y retirar trabajadores del esquema |
| HOR-10 | Informar impacto | Advertir cuántos trabajadores serán afectados por un cambio |

### Reglas y validaciones

- El nombre debe ser único.
- Debe existir al menos un día seleccionado.
- La secuencia horaria debe ser coherente, contemplando explícitamente turnos nocturnos.
- La duración de almuerzo programada se deriva de salida y retorno.
- Un horario inactivo no puede asignarse a nuevos perfiles.
- Los registros históricos conservan el horario o su instantánea original.
- Los cambios de vigencia futura no modifican una jornada ya iniciada.

### Estados de interfaz

- Listado.
- Editor nuevo.
- Editor de horario existente.
- Sección expandida o contraída.
- Línea de tiempo actualizada.
- Errores de secuencia o vigencia.
- Guardando.
- Guardado.

### Salidas e integraciones

- Proporciona reglas a GAR.
- Proporciona opciones de asignación a REG.
- Afecta cálculos futuros de DASH, TRA, DET y REP.

## 9. Módulo TRA — Trabajadores

### Objetivo

Permitir una revisión comparativa del comportamiento de los trabajadores y localizar rápidamente casos relevantes.

### Actor

- Personal de RR.HH.

### Entradas

- Perfiles.
- Jornadas del periodo analizado.
- Filtros de texto, área y estado.

### Funcionalidades

| ID | Funcionalidad | Comportamiento esperado |
| --- | --- | --- |
| TRA-01 | Mostrar grid | Presentar resumen visual por trabajador |
| TRA-02 | Buscar | Buscar por nombre, DNI o ID |
| TRA-03 | Filtrar | Filtrar por área y estado |
| TRA-04 | Calcular resumen | Mostrar días/minutos de tardanza y exceso por persona |
| TRA-05 | Comparar | Presentar tabla consolidada de trabajadores |
| TRA-06 | Ordenar | Ordenar por nombre, área, tardanza, exceso y totales |
| TRA-07 | Desplegar detalle inline | Mostrar historial sin perder la lista ni los filtros |
| TRA-08 | Abrir detalle completo | Navegar a DET conservando contexto de retorno |
| TRA-09 | Editar perfil | Navegar a REG con el formulario del trabajador abierto |

### Reglas y validaciones

- Tabla y tarjetas deben usar el mismo conjunto filtrado.
- Los cálculos deben respetar el periodo seleccionado.
- La ordenación debe indicar columna y dirección.
- Al volver del detalle se deben conservar filtros y posición cuando sea posible.
- Editar debe abrir realmente el perfil seleccionado, no solo cambiar de módulo.

### Estados de interfaz

- Listado con tarjetas.
- Tabla comparativa.
- Detalle inline.
- Sin resultados.
- Cargando.
- Error.

### Salidas e integraciones

- Navega a DET y REG.
- Comparte cálculos con DASH y REP.

## 10. Módulo DET — Detalle de trabajador

### Objetivo

Concentrar identidad, estado, indicadores e historial de jornadas de una persona.

### Actor

- Personal de RR.HH.

### Entradas

- Perfil del trabajador.
- Jornadas y marcaciones del periodo.
- Horarios aplicados.

### Funcionalidades

| ID | Funcionalidad | Comportamiento esperado |
| --- | --- | --- |
| DET-01 | Mostrar identidad | Mostrar foto, nombre, DNI, área, cargo, horario y terminal |
| DET-02 | Mostrar estado | Indicar fotocheck activo/inactivo y participación en el flujo |
| DET-03 | Mostrar KPI | Registros, días/minutos de exceso, tardanzas y promedio |
| DET-04 | Graficar tendencia | Representar duración o exceso a lo largo del periodo |
| DET-05 | Mostrar jornadas | Listar fecha y los cuatro periodos de cada jornada |
| DET-06 | Mostrar clasificación | Indicar estado y origen de cada registro |
| DET-07 | Revocar fotocheck | Confirmar y cambiar el estado conservando historial |
| DET-08 | Volver | Regresar al origen sin perder el contexto disponible |

### Reglas y validaciones

- Los cuatro periodos son `ingreso`, `salidaAlmuerzo`, `retornoAlmuerzo` y `salidaDia`.
- Valores ausentes se muestran como no registrados, no como `00:00`.
- Los KPI deben derivarse de las mismas filas visibles o indicar su rango.
- Revocar requiere confirmación y auditoría.
- Si el trabajador no existe, se debe mostrar un estado seguro y permitir volver.

### Estados de interfaz

- Cargando.
- Con historial.
- Sin jornadas.
- Trabajador no encontrado.
- Confirmación de revocación.
- Error.

### Salidas e integraciones

- Puede actualizar el estado administrado por REG.
- Consume jornadas corregidas por EXC.

## 11. Módulo REP — Reportes

### Objetivo

Permitir a RR.HH. consultar, validar y exportar información de control.

### Actor

- Personal de RR.HH. con permiso de reportes.

### Entradas

- Tipo de reporte.
- Rango de fechas.
- Área y filtros adicionales.
- Jornadas, trabajadores y excepciones.

### Funcionalidades

| ID | Funcionalidad | Comportamiento esperado |
| --- | --- | --- |
| REP-01 | Elegir tipo | Seleccionar detalle, resumen mensual, exceso recurrente o sesiones incompletas |
| REP-02 | Filtrar fechas | Consultar un rango válido e inclusivo |
| REP-03 | Filtrar área | Restringir resultados y exportación |
| REP-04 | Filtrar excesos | Mostrar solo jornadas con `excesoAlmuerzo > 0` |
| REP-05 | Previsualizar | Mostrar exactamente el conjunto que será exportado |
| REP-06 | Paginar | Navegar resultados sin alterar filtros |
| REP-07 | Exportar CSV | Descargar datos filtrados con columnas documentadas |
| REP-08 | Exportar Excel | Descargar libro con tipos y formatos apropiados |
| REP-09 | Informar resultado | Mostrar nombre de archivo, cantidad de filas o error |

### Reglas y validaciones

- La fecha inicial no puede ser posterior a la final.
- Vista previa y archivo deben compartir filtros y orden.
- La exportación debe incluir zona horaria, origen y estado.
- Los valores nulos deben tener una representación consistente.
- Los formatos deben proteger DNI y otros datos personales según permisos.
- Un archivo vacío requiere confirmación o debe impedirse con explicación.

### Estados de interfaz

- Selección y filtros.
- Consultando.
- Vista previa con datos.
- Sin resultados.
- Generando archivo.
- Descarga lista.
- Error de generación.

### Salidas e integraciones

- Produce archivos CSV o XLSX.
- Comparte reglas de cálculo con DASH, TRA y DET.

## 12. Módulo NAV — Navegación y layout

### Objetivo

Ofrecer navegación consistente, responsiva y acorde al rol, manteniendo el contexto operativo.

### Actores

- Vigilante.
- Personal de RR.HH.

### Funcionalidades

| ID | Funcionalidad | Comportamiento esperado |
| --- | --- | --- |
| NAV-01 | Mostrar navegación por rol | Exponer solo módulos autorizados |
| NAV-02 | Indicar módulo activo | Marcar visual y semánticamente la ubicación actual |
| NAV-03 | Adaptar a móvil | Usar menú temporal sin ocultar acciones críticas |
| NAV-04 | Mostrar contadores | Mostrar cantidades reales, como excepciones pendientes |
| NAV-05 | Mantener contexto | Conservar filtros o selección al navegar cuando corresponda |
| NAV-06 | Proteger cambios | Advertir antes de abandonar formularios con cambios no guardados |
| NAV-07 | Mostrar sesión | Exponer usuario, rol y terminal relevantes |
| NAV-08 | Cerrar sesión | Ejecutar AUT-06 desde cualquier experiencia autenticada |

### Reglas y validaciones

- Navegación y permisos deben provenir del contexto de sesión.
- Un contador nunca debe estar codificado de forma fija.
- En móvil, el foco debe entrar al menú y volver al disparador al cerrarlo.
- El detalle de trabajador debe ofrecer una ruta de retorno clara.

## 13. Matriz de permisos funcionales

| Acción | Vigilante | RR.HH. consulta | RR.HH. administrador |
| --- | :---: | :---: | :---: |
| Registrar marcación | Sí | No | No |
| Búsqueda manual en garita | Sí | No | No |
| Ver Dashboard | No | Sí | Sí |
| Ver perfiles | No | Sí | Sí |
| Crear o editar perfiles | No | No | Sí |
| Ver excepciones | No | Sí | Sí |
| Resolver excepciones | No | No | Sí |
| Ver horarios | No | Sí | Sí |
| Modificar horarios | No | No | Sí |
| Analizar trabajadores | No | Sí | Sí |
| Ver reportes | No | Sí | Sí |
| Exportar datos personales | No | Según permiso | Sí |
| Capturar fotocheck o DNI | Sí | No | Sí |
| Confirmar identidad y marcar | Sí | No | No |
| Precargar perfil desde documento | No | No | Sí |
| Registrar ingreso, salida o servicio | Sí | No | No |
| Ver alerta de desvinculación o vacaciones | Sí | Sí | Sí |
| Marcar desvinculación o vacaciones | No | No | Sí |
| Solicitar autorización fuera de horario | No | No | No |
| Autorizar, modificar o rechazar solicitud | No | No | No |
| Ver autorización en garita | Sí | Sí | Sí |

El trabajador solicita la autorización y el jefe de área la autoriza, la modifica o la rechaza. Esos dos actores no usan el panel de RR.HH. para hacerlo. El jefe también puede crear la autorización sin una solicitud previa.

Esta matriz es una base funcional. Los nombres definitivos de roles y permisos deben confirmarse antes de implementar autorización.

## 14. Flujo transversal principal

1. AUT autentica al vigilante y fija la terminal.
2. GAR identifica al trabajador creado en REG. Si el QR no se lee, IDE envía la foto a VIS, coteja el DNI y espera confirmación humana.
3. GAR consulta el horario vigente de HOR.
4. GAR propone ingreso, salida, almuerzo o servicio. Dentro de los 10 minutos consulta antes de crear otro evento. Si la persona está desvinculada, se detiene. Si hay autorización vigente, la muestra.
5. Si existe una inconsistencia, o un servicio queda sin retorno, GAR crea un caso en EXC.
6. DASH, TRA y DET reflejan la jornada registrada.
7. EXC puede corregir la jornada dejando auditoría.
8. REP consulta y exporta el resultado actualizado.

Una modificación en perfiles, horarios, jornadas o excepciones debe propagarse a todos los módulos consumidores desde una única fuente de verdad.

## 15. Módulo IDE — Identidad documental

### Objetivo

Recibir la foto tomada en garita o en RR.HH., pedir la extracción al servicio de visión y cotejar el DNI con los perfiles, sin convertir esa respuesta en una marcación ni en un alta.

### Actores

- Vigilante.
- Personal de RR.HH. con permiso de mantenimiento.

### Entradas

- Imagen del fotocheck o del DNI.
- Tipo de documento.
- Terminal y usuario de la sesión, cuando existan.

### Funcionalidades

| ID | Funcionalidad | Comportamiento esperado |
| --- | --- | --- |
| IDE-01 | Recibir captura | Aceptar la imagen solo desde la aplicación autenticada |
| IDE-02 | Delegar extracción | Reenviar la imagen a VIS y esperar nombre, apellido, DNI, foto y confianza |
| IDE-03 | Cotejar DNI | Buscar un perfil con el mismo DNI |
| IDE-04 | Exigir confirmación | Devolver el resultado para revisión humana antes de marcar o guardar |
| IDE-05 | Bloquear baja confianza | No tratar como coincidencia automática un campo bajo el umbral |
| IDE-06 | Registrar intento | Guardar motor, estado, texto extraído y cotejo, sin la imagen cruda |

### Reglas y validaciones

- VIS no es accesible desde el navegador.
- Una captura no crea trabajador, jornada ni marcación.
- El DNI cotejado tiene 8 dígitos.
- Si VIS no está disponible, la garita sigue pudiendo usar QR o búsqueda manual.
- El registro de auditoría no incluye la imagen ni el DNI completo.

### Estados de interfaz

- Enviando foto.
- Datos extraídos con perfil.
- Datos extraídos sin perfil.
- Revisión obligatoria por baja confianza.
- Imagen rechazada o documento ilegible.
- Reconocimiento no disponible.

### Salidas e integraciones

- Consume VIS.
- Consulta perfiles de REG.
- UC-13 usa el perfil confirmado para que GAR registre con origen `documento`.
- UC-14 entrega los campos a REG para que una persona los corrija y guarde.

## 16. Módulo VIS — Reconocimiento de documentos

### Objetivo

Validar una imagen de fotocheck o DNI y devolver los datos impresos más el recorte de la fotografía.

### Actor

- La API de GaritaControl. No hay usuario humano con acceso directo.

### Entradas

- Imagen JPEG, PNG o WebP.
- Tipo de documento: `fotocheck` o `dni`.

### Funcionalidades

| ID | Funcionalidad | Comportamiento esperado |
| --- | --- | --- |
| VIS-01 | Recibir imagen | Aceptar la llamada interna autorizada |
| VIS-02 | Validar archivo | Rechazar formato no admitido, archivo vacío, imagen menor de 320×240 o mayor de 8 MB |
| VIS-03 | Extraer identidad | Devolver nombre, apellido y DNI |
| VIS-04 | Extraer foto | Devolver el recorte de la fotografía en JPEG base64 |
| VIS-05 | Informar confianza | Acompañar cada campo con un valor entre 0 y 1 |
| VIS-06 | Declarar el motor | Indicar si respondió el modelo, el resultado de prueba o la ausencia de motor |

### Reglas y validaciones

- No consulta PostgreSQL ni conoce horarios, jornadas o permisos.
- No inventa nombre ni DNI cuando el motor no está cargado.
- Una imagen ilegible vuelve con campos vacíos y un estado explícito.
- El contrato de respuesta permanece estable cuando se reemplace el motor.

### Salidas e integraciones

- Responde solo a IDE.
- El equipo de visión implementa el motor en el mismo contenedor, detrás de ese contrato.

## 17. Módulo AUTZ — Autorizaciones fuera de horario

### Objetivo

Dejar constancia, antes de que la persona llegue, de que su jefe autorizó el ingreso fuera del horario laboral, un domingo o de noche.

### Actores

- Trabajador de ZGroup.
- Jefe de área.
- Vigilante, que solo consulta el resultado.

### Entradas

- Acreditación por fotocheck o DNI.
- Día y horario solicitado.
- Decisión del jefe: autorizar, modificar o rechazar.

### Funcionalidades

| ID | Funcionalidad | Comportamiento esperado |
| --- | --- | --- |
| AUTZ-01 | Acreditar trabajador | Identificarlo con fotocheck o DNI antes de crear la solicitud |
| AUTZ-02 | Registrar tramo | Exigir día, hora de inicio y hora de fin |
| AUTZ-03 | Enviar al jefe | Dejar la solicitud pendiente para el jefe del trabajador |
| AUTZ-04 | Autorizar | Confirmar el tramo y volverlo visible en garita |
| AUTZ-05 | Modificar | Cambiar día u horario y conservar la solicitud original |
| AUTZ-06 | Rechazar | Cerrar la solicitud con un resultado visible para el trabajador |
| AUTZ-07 | Crear directa | Permitir que el jefe registre la autorización sin solicitud previa |
| AUTZ-08 | Consultar en garita | Mostrar la autorización vigente o indicar que no existe |

### Reglas y validaciones

- La hora de fin no puede ser anterior a la de inicio. Un tramo que cruza medianoche queda entre los casos de frontera todavía abiertos.
- Solo el jefe del trabajador resuelve su solicitud.
- Rechazar o modificar no borra lo que el trabajador envió.
- Sin autorización, la garita informa esa ausencia y no pide en silencio un permiso al trabajador.

### Estados de interfaz

- Solicitud vacía.
- Pendiente de jefe.
- Autorizada.
- Modificada.
- Rechazada.
- Visible en garita.
- Sin autorización para el momento de la llegada.

### Salidas e integraciones

- GAR consulta el resultado al identificar a la persona.
- REG aporta el jefe y el perfil del trabajador.

## 18. Criterio de aceptación por módulo

Una funcionalidad de este catálogo se considera completa cuando:

1. cumple su comportamiento y reglas;
2. respeta permisos;
3. contempla estados de carga, vacío, error y éxito aplicables;
4. actualiza la fuente de verdad y módulos dependientes;
5. conserva trazabilidad en acciones manuales;
6. funciona en el viewport objetivo;
7. tiene una verificación del flujo principal y sus errores críticos;
8. figura como implementada, simulada o pendiente en `IMPLEMENTATION_STATUS.md`.
