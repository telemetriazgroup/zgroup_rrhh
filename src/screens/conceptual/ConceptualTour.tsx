import { useState, type ReactNode } from "react";

interface Props {
  onClose: () => void;
}

type SceneId =
  | "mapa"
  | "ingreso"
  | "relectura"
  | "servicio"
  | "alertas"
  | "foto"
  | "offline"
  | "autorizacion"
  | "jefes"
  | "rrhh"
  | "vision";

const SCENES: { id: SceneId; titulo: string; actor: string }[] = [
  { id: "mapa", titulo: "Cómo se conecta", actor: "Sistema" },
  { id: "ingreso", titulo: "Ingreso en garita", actor: "Vigilante" },
  { id: "relectura", titulo: "Relectura de 10 minutos", actor: "Vigilante" },
  { id: "servicio", titulo: "Almuerzo y servicio", actor: "Vigilante" },
  { id: "alertas", titulo: "Desvinculado y vacaciones", actor: "Vigilante" },
  { id: "foto", titulo: "Foto del documento", actor: "Vigilante" },
  { id: "offline", titulo: "Sin conexión", actor: "Vigilante" },
  { id: "autorizacion", titulo: "Autorización del jefe", actor: "Trabajador y jefe" },
  { id: "jefes", titulo: "Jefes y directivos", actor: "RR.HH." },
  { id: "rrhh", titulo: "Panel de RR.HH.", actor: "RR.HH." },
  { id: "vision", titulo: "Reconocimiento aparte", actor: "Otras aplicaciones" },
];

export default function ConceptualTour({ onClose }: Props) {
  const [sceneId, setSceneId] = useState<SceneId>("mapa");
  const index = SCENES.findIndex((scene) => scene.id === sceneId);
  const scene = SCENES[index] ?? SCENES[0];

  function go(offset: number) {
    const next = SCENES[index + offset];
    if (next) setSceneId(next.id);
  }

  return (
    <div className="min-h-full flex flex-col" style={{ background: "#F7F8FA", color: "#0F1419" }}>
      <header className="flex items-center justify-between gap-3 px-4 py-3 border-b bg-white" style={{ borderColor: "#EAECF0" }}>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "#8B8FA3" }}>
            Maqueta conceptual
          </p>
          <h1 className="text-base font-semibold">Funcionamiento previsto de GaritaControl</h1>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl px-4 text-sm font-semibold text-white"
          style={{ background: "#1D6FD8", minHeight: 48 }}
        >
          Volver al ingreso
        </button>
      </header>

      <div className="flex flex-1 flex-col lg:flex-row min-h-0">
        <nav className="lg:w-72 border-b lg:border-b-0 lg:border-r bg-white overflow-auto" style={{ borderColor: "#EAECF0" }} aria-label="Procesos">
          {SCENES.map((item, itemIndex) => {
            const active = item.id === scene.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSceneId(item.id)}
                className="w-full text-left px-4 py-3 border-b"
                style={{
                  borderColor: "#EAECF0",
                  background: active ? "#F7F8FA" : "#FFFFFF",
                  minHeight: 48,
                }}
              >
                <span className="font-mono text-xs" style={{ color: "#8B8FA3" }}>{String(itemIndex + 1).padStart(2, "0")}</span>
                <span className="block text-sm font-semibold">{item.titulo}</span>
                <span className="block text-xs" style={{ color: "#8B8FA3" }}>{item.actor}</span>
              </button>
            );
          })}
        </nav>

        <main className="flex-1 overflow-auto p-4 lg:p-8">
          <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "#8B8FA3" }}>
            {scene.actor} · datos de ilustración
          </p>
          <SceneBody id={scene.id} />
          <div className="mt-6 flex gap-3">
            <button type="button" onClick={() => go(-1)} disabled={index === 0} className="rounded-xl px-4 text-sm font-semibold border" style={{ minHeight: 48, borderColor: "#EAECF0", background: "#FFFFFF", opacity: index === 0 ? 0.4 : 1 }}>
              Anterior
            </button>
            <button type="button" onClick={() => go(1)} disabled={index === SCENES.length - 1} className="rounded-xl px-4 text-sm font-semibold text-white" style={{ minHeight: 48, background: "#1D6FD8", opacity: index === SCENES.length - 1 ? 0.4 : 1 }}>
              Siguiente proceso
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

function SceneBody({ id }: { id: SceneId }) {
  if (id === "mapa") return <Mapa />;
  if (id === "ingreso") return <Ingreso />;
  if (id === "relectura") return <Relectura />;
  if (id === "servicio") return <Servicio />;
  if (id === "alertas") return <Alertas />;
  if (id === "foto") return <Foto />;
  if (id === "offline") return <Offline />;
  if (id === "autorizacion") return <Autorizacion />;
  if (id === "jefes") return <Jefes />;
  if (id === "rrhh") return <Rrhh />;
  return <Vision />;
}

function Mapa() {
  const piezas = [
    ["Celular", "Vigilante y trabajador. QR, foto, cola sin red."],
    ["Web", "RR.HH. y jefe. Las mismas rutas de garita también están aquí."],
    ["API", "Decide jornada, relectura, alertas y autorizaciones. Entrega el token."],
    ["Reconocimiento", "Contenedor aparte. Extrae nombre, apellido, DNI y foto para cualquier aplicación."],
  ];
  return (
    <article>
      <h2 className="text-2xl font-semibold mt-1">Cuatro piezas, una sola regla de negocio</h2>
      <p className="mt-3 max-w-2xl text-sm" style={{ color: "#3D4454" }}>
        El celular y la web no se hablan entre sí. Los dos consultan la API. La foto no va al reconocimiento desde la pantalla: la API la reenvía y recibe nombre, apellido, DNI y el recorte.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 max-w-3xl">
        {piezas.map(([titulo, texto]) => (
          <div key={titulo} className="rounded-xl bg-white p-4 border" style={{ borderColor: "#EAECF0" }}>
            <p className="font-semibold">{titulo}</p>
            <p className="mt-1 text-sm" style={{ color: "#3D4454" }}>{texto}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

function Ingreso() {
  return (
    <article>
      <h2 className="text-2xl font-semibold mt-1">Carlos Mendoza entra a las 08:01</h2>
      <p className="mt-3 max-w-2xl text-sm" style={{ color: "#3D4454" }}>
        El vigilante escanea el QR. La API reconoce el perfil, ve que no hay jornada hoy y propone Ingreso. El horario administrativo empieza a las 08:00 con 5 minutos de tolerancia, así que 08:01 queda a tiempo.
      </p>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Phone title="Garita Principal · R. Chávez">
          <Persona nombre="Carlos Mendoza" detalle="Producción · DNI 47382910" />
          <p className="text-xs mt-3" style={{ color: "#8B8FA3" }}>Evento propuesto</p>
          <p className="font-semibold">Ingreso · 08:01</p>
          <p className="text-sm mt-1" style={{ color: "#17B26A" }}>A tiempo. Tardanza 0 min.</p>
          <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
            <Tag label="Ingreso" active />
            <Tag label="Salida" />
            <Tag label="Servicio" />
          </div>
        </Phone>
        <Dato
          filas={[
            ["Perfil", "W001 · horario rígido"],
            ["Jornada", "Se crea la del día"],
            ["Marcación", "ingreso · origen scan"],
            ["Tardanza", "0 minutos"],
          ]}
        />
      </div>
    </article>
  );
}

function Relectura() {
  const [eleccion, setEleccion] = useState<"pendiente" | "actualizar" | "salida" | "cancelar">("pendiente");
  const resultado = {
    pendiente: "Aún no hay una segunda marcación. La de las 08:01 sigue vigente.",
    actualizar: "La marcación de ingreso pasa a 08:06. La hora 08:01 queda en la auditoría. No se calcula tardanza nueva.",
    salida: "Se registra una salida. El ingreso de las 08:01 no se toca.",
    cancelar: "No cambia nada. Sigue el ingreso de las 08:01.",
  }[eleccion];

  return (
    <article>
      <h2 className="text-2xl font-semibold mt-1">A las 08:06 el vigilante vuelve a escanear</h2>
      <p className="mt-3 max-w-2xl text-sm" style={{ color: "#3D4454" }}>
        El límite de tolerancia era 08:05, pero todavía no pasaron 10 minutos. El sistema no abre otro ingreso tardío. Muestra el registro de las 08:01 y pregunta.
      </p>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Phone title="Relectura · menos de 10 min">
          <Persona nombre="Carlos Mendoza" detalle="Ya tiene ingreso a las 08:01" />
          <p className="text-sm mt-3">¿Actualizar esa hora o registrar el movimiento contrario?</p>
          <div className="mt-3 flex flex-col gap-2">
            <Choice onClick={() => setEleccion("actualizar")}>Actualizar la hora a 08:06</Choice>
            <Choice onClick={() => setEleccion("salida")}>Registrar una salida</Choice>
            <Choice onClick={() => setEleccion("cancelar")}>Cancelar</Choice>
          </div>
        </Phone>
        <Dato filas={[["Reloj de la API", "08:06"], ["Ventana", "Hasta las 08:11"], ["Resultado", resultado]]} />
      </div>
    </article>
  );
}

function Servicio() {
  const [paso, setPaso] = useState(0);
  const pasos = [
    { hora: "13:02", texto: "Salida dentro del almuerzo. Se guarda salida a almorzar, no servicio.", dato: "salidaAlmuerzo 13:02" },
    { hora: "14:08", texto: "Retorno. Duración 66 min. Exceso 6 min sobre el almuerzo de 60.", dato: "retornoAlmuerzo · exceso 6" },
    { hora: "15:10", texto: "Sale a una comisión. Esto sí es servicio. Puede haber otro más tarde.", dato: "servicio abierto 15:10" },
    { hora: "16:40", texto: "Vuelve durante el horario. Un ingreso cierra ese servicio.", dato: "servicio cerrado por ingreso" },
    { hora: "18:20", texto: "Si volviera después de las 18:00, el evento sería regreso de servicio.", dato: "regresoServicio" },
  ];
  const actual = pasos[paso] ?? pasos[0];

  return (
    <article>
      <h2 className="text-2xl font-semibold mt-1">El almuerzo no es un servicio</h2>
      <p className="mt-3 max-w-2xl text-sm" style={{ color: "#3D4454" }}>
        Ana Torres tiene horario administrativo: almuerzo de 13:00 a 14:00. Una salida en ese tramo va a almorzar. Una salida después es servicio y puede repetirse.
      </p>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Phone title="Ana Torres · Logística">
          <p className="font-mono text-2xl font-semibold">{actual.hora}</p>
          <p className="text-sm mt-2">{actual.texto}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {pasos.map((item, itemIndex) => (
              <button key={item.hora} type="button" onClick={() => setPaso(itemIndex)} className="rounded-lg px-3 text-xs font-semibold" style={{ minHeight: 48, background: itemIndex === paso ? "#1D6FD8" : "#161C25", color: "white" }}>
                {item.hora}
              </button>
            ))}
          </div>
        </Phone>
        <Dato filas={[["Persona", "Ana Torres · DNI 52819374"], ["Horario", "Administrativo"], ["Dato guardado", actual.dato], ["Si no vuelve", "El servicio queda como no retornó"]]} />
      </div>
    </article>
  );
}

function Alertas() {
  const [caso, setCaso] = useState<"desvinculado" | "vacaciones">("desvinculado");
  const desvinculado = caso === "desvinculado";
  return (
    <article>
      <h2 className="text-2xl font-semibold mt-1">La alerta lleva texto, no solo color</h2>
      <p className="mt-3 max-w-2xl text-sm" style={{ color: "#3D4454" }}>
        RR.HH. marca la situación en el perfil. Al identificar a la persona, la garita lo muestra antes de marcar.
      </p>
      <div className="mt-4 flex gap-2">
        <Choice onClick={() => setCaso("desvinculado")}>Carmen López</Choice>
        <Choice onClick={() => setCaso("vacaciones")}>Rosa Huanca</Choice>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Phone title="Identificación">
          <Persona
            nombre={desvinculado ? "Carmen López" : "Rosa Huanca"}
            detalle={desvinculado ? "Logística · DNI 19283746" : "RR.HH. · DNI 82910374"}
          />
          <div className="mt-4 rounded-xl p-3" style={{ background: desvinculado ? "rgba(229,72,77,0.12)" : "rgba(245,165,36,0.12)" }}>
            <p className="font-semibold" style={{ color: desvinculado ? "#E5484D" : "#F5A524" }}>
              {desvinculado ? "Desvinculado" : "De vacaciones"}
            </p>
            <p className="text-sm mt-1">
              {desvinculado ? "No se permite el pase y no se crea marcación." : "El vigilante puede continuar si el resto de reglas lo permite."}
            </p>
          </div>
        </Phone>
        <Dato
          filas={[
            ["Situación", desvinculado ? "desvinculado" : "vacaciones"],
            ["Marcación", desvinculado ? "No se crea" : "Puede crearse"],
            ["Historial", "Se conserva"],
          ]}
        />
      </div>
    </article>
  );
}

function Foto() {
  return (
    <article>
      <h2 className="text-2xl font-semibold mt-1">La foto valida datos, no marca sola</h2>
      <p className="mt-3 max-w-2xl text-sm" style={{ color: "#3D4454" }}>
        Si el QR no se lee, el vigilante fotografía el DNI o el fotocheck. La imagen va a la API. El reconocimiento devuelve nombre, apellido, DNI y el recorte de la foto. El vigilante confirma antes de marcar.
      </p>
      <div className="mt-6 grid gap-3 max-w-3xl">
        {[
          ["1. Celular o web", "Elige DNI y toma la foto."],
          ["2. API", "Registra la captura y coteja el DNI 47382910."],
          ["3. Reconocimiento", "Responde Carlos Mendoza, confianza por campo."],
          ["4. Vigilante", "Confirma. Recién ahí se usa la misma regla del ingreso."],
        ].map(([titulo, texto]) => (
          <div key={titulo} className="rounded-xl bg-white border p-4" style={{ borderColor: "#EAECF0" }}>
            <p className="font-semibold">{titulo}</p>
            <p className="text-sm mt-1" style={{ color: "#3D4454" }}>{texto}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

function Offline() {
  const [enLinea, setEnLinea] = useState(false);
  return (
    <article>
      <h2 className="text-2xl font-semibold mt-1">Sin red se anota y después se sube</h2>
      <p className="mt-3 max-w-2xl text-sm" style={{ color: "#3D4454" }}>
        Solo el celular sigue operando. Consulta la tabla local del personal autorizado. La foto de quien no es de la empresa queda en el teléfono hasta que vuelva la conexión.
      </p>
      <div className="mt-4">
        <Choice onClick={() => setEnLinea((value) => !value)}>{enLinea ? "Cortar la red" : "Recuperar la red"}</Choice>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Phone title={enLinea ? "En línea" : "Sin conexión"}>
          <p className="text-sm">Tabla local: Carlos Mendoza, Ana Torres, Rosa Huanca.</p>
          <p className="text-sm mt-3">{enLinea ? "La marcación en cola se sube una vez. La API aplica las reglas." : "Ingreso de Ana Torres queda en el teléfono. No llama a la API ni al reconocimiento."}</p>
          <p className="text-sm mt-3">Visitante con DNI: la foto espera en el dispositivo.</p>
        </Phone>
        <Dato
          filas={[
            ["Estado", enLinea ? "Sincronizada" : "En cola"],
            ["Si hay conflicto", "Se crea una excepción. No se pisa la jornada."],
            ["Panel web", "No tiene este modo. Trabaja en línea."],
          ]}
        />
      </div>
    </article>
  );
}

function Autorizacion() {
  const [estado, setEstado] = useState<"pendiente" | "autorizada" | "modificada" | "rechazada">("pendiente");
  const textos = {
    pendiente: "José Flores pide entrar el domingo 18, de 09:00 a 13:00. Su jefe todavía no responde.",
    autorizada: "El jefe autoriza ese tramo. En garita se muestra el permiso y no se le pide que lo consiga.",
    modificada: "El jefe cambia el fin a 12:00. La garita muestra el tramo nuevo. La solicitud original sigue consultable.",
    rechazada: "No hay autorización para ese momento. La pantalla lo indica.",
  };
  return (
    <article>
      <h2 className="text-2xl font-semibold mt-1">El permiso queda antes de que la persona llegue</h2>
      <p className="mt-3 max-w-2xl text-sm" style={{ color: "#3D4454" }}>
        José Flores se acredita con su fotocheck, indica día y horario, y envía la solicitud a su jefe. El jefe autoriza, modifica o rechaza. También puede crear el permiso sin esperar la solicitud.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Choice onClick={() => setEstado("autorizada")}>Autorizar</Choice>
        <Choice onClick={() => setEstado("modificada")}>Modificar a 12:00</Choice>
        <Choice onClick={() => setEstado("rechazada")}>Rechazar</Choice>
      </div>
      <div className="mt-4 rounded-xl bg-white border p-4 max-w-xl" style={{ borderColor: "#EAECF0" }}>
        <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "#8B8FA3" }}>{estado}</p>
        <p className="mt-2 text-sm">{textos[estado]}</p>
      </div>
    </article>
  );
}

function Jefes() {
  return (
    <article>
      <h2 className="text-2xl font-semibold mt-1">Se registran, sin calcular tardanza</h2>
      <p className="mt-3 max-w-2xl text-sm" style={{ color: "#3D4454" }}>
        Un jefe o directivo no tiene horario rígido. Igual se anotan su ingreso, su salida y su servicio. La tardanza y el exceso de almuerzo quedan vacíos.
      </p>
      <div className="mt-6 max-w-xl">
        <Dato
          filas={[
            ["Persona", "Jefe de Producción"],
            ["horarioRigido", "falso"],
            ["Ingreso 09:40", "Se guarda"],
            ["Tardanza", "vacío, no cero"],
            ["Servicio 11:00", "Se guarda como los demás"],
          ]}
        />
      </div>
    </article>
  );
}

function Rrhh() {
  return (
    <article>
      <h2 className="text-2xl font-semibold mt-1">El escritorio lee la misma jornada</h2>
      <p className="mt-3 max-w-2xl text-sm" style={{ color: "#3D4454" }}>
        RR.HH. crea el perfil, marca vacaciones o desvinculación, resuelve excepciones y exporta. Cambiar un horario no reescribe lo ya marcado.
      </p>
      <div className="mt-6 overflow-hidden rounded-xl border bg-white" style={{ borderColor: "#EAECF0" }}>
        <table className="w-full text-sm">
          <thead style={{ background: "#F7F8FA" }}>
            <tr>
              {["Persona", "Ingreso", "Almuerzo", "Servicio", "Estado"].map((col) => (
                <th key={col} className="text-left font-medium px-3 py-3" style={{ color: "#8B8FA3" }}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-t" style={{ borderColor: "#EAECF0" }}>
              <td className="px-3 py-3">Carlos Mendoza</td>
              <td className="px-3 py-3 font-mono">08:01</td>
              <td className="px-3 py-3 font-mono">13:02–14:08</td>
              <td className="px-3 py-3">No retornó</td>
              <td className="px-3 py-3">Excepción pendiente</td>
            </tr>
            <tr className="border-t" style={{ borderColor: "#EAECF0" }}>
              <td className="px-3 py-3">Carmen López</td>
              <td className="px-3 py-3 font-mono">—</td>
              <td className="px-3 py-3 font-mono">—</td>
              <td className="px-3 py-3">—</td>
              <td className="px-3 py-3">Desvinculado</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-sm max-w-2xl" style={{ color: "#3D4454" }}>
        Resolver el servicio sin retorno pide motivo y hora. La hora anterior permanece en la auditoría. El reporte exporta exactamente estas filas.
      </p>
    </article>
  );
}

function Vision() {
  return (
    <article>
      <h2 className="text-2xl font-semibold mt-1">Otra aplicación puede leer el documento</h2>
      <p className="mt-3 max-w-2xl text-sm" style={{ color: "#3D4454" }}>
        El reconocimiento no conoce trabajadores ni marcaciones. Quien tenga la clave envía la foto y recibe los campos. GaritaControl es un consumidor más. El modelo se entrena con fotos etiquetadas y se mide aparte.
      </p>
      <div className="mt-6 max-w-xl">
        <Dato
          filas={[
            ["Entrada", "Foto de DNI o fotocheck"],
            ["Salida", "Carlos · Mendoza · 47382910 · recorte"],
            ["Confianza", "Un valor por campo, de 0 a 1"],
            ["Si no hay motor", "No inventa el nombre ni el DNI"],
          ]}
        />
      </div>
    </article>
  );
}

function Phone({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl p-4 max-w-sm" style={{ background: "#0F1419", color: "white" }}>
      <p className="text-xs" style={{ color: "#8B8FA3" }}>{title}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function Persona({ nombre, detalle }: { nombre: string; detalle: string }) {
  return (
    <div>
      <p className="font-semibold">{nombre}</p>
      <p className="text-sm" style={{ color: "#C9CDD6" }}>{detalle}</p>
    </div>
  );
}

function Tag({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <div className="rounded-lg px-2 py-3 text-center" style={{ background: active ? "#1D6FD8" : "#161C25", minHeight: 48 }}>
      {label}
    </div>
  );
}

function Choice({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="rounded-xl px-4 text-sm font-semibold text-white" style={{ background: "#1D6FD8", minHeight: 48 }}>
      {children}
    </button>
  );
}

function Dato({ filas }: { filas: string[][] }) {
  return (
    <div className="rounded-xl bg-white border p-4" style={{ borderColor: "#EAECF0" }}>
      <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "#8B8FA3" }}>Qué queda registrado</p>
      <dl className="mt-3 flex flex-col gap-3">
        {filas.map(([campo, valor]) => (
          <div key={campo}>
            <dt className="text-xs" style={{ color: "#8B8FA3" }}>{campo}</dt>
            <dd className="text-sm font-medium">{valor}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
