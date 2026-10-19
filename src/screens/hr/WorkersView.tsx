import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer, Cell } from "recharts";
import type { Worker } from "../../data/mockData";
import { RECORDS_TABLE, DAILY_DURATION } from "../../data/mockData";

interface Props {
  workers: Worker[];
  onEditWorker: (w: Worker) => void;
}

const AREAS_FILTER = ["Todas las áreas", "Producción", "Logística", "Administración", "Calidad", "RR.HH.", "Mantenimiento"];

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  ok:         { label: "OK",          color: "#17B26A", bg: "rgba(23,178,106,0.1)" },
  excess:     { label: "Exceso",      color: "#F5A524", bg: "rgba(245,165,36,0.12)" },
  incomplete: { label: "Incompleto",  color: "#8B8FA3", bg: "rgba(139,143,163,0.1)" },
  tardanza:   { label: "Tardanza",    color: "#E5484D", bg: "rgba(229,72,77,0.1)" },
};

const ChartTip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg p-2.5 border text-xs" style={{ background: "#FFF", borderColor: "#EAECF0", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
      <p className="font-medium mb-0.5" style={{ color: "#374151" }}>Día {label}</p>
      <p style={{ color: "#1D6FD8" }}>{payload[0]?.value} min almuerzo</p>
    </div>
  );
};

function WorkerDetail({ worker, onBack }: { worker: Worker; onBack: () => void }) {
  const [showRevoke, setShowRevoke] = useState(false);
  const records = RECORDS_TABLE.filter(r => r.workerId === worker.id);

  const totalExcessDays   = records.filter(r => (r.excesoAlmuerzo ?? 0) > 0).length;
  const totalExcessMin    = records.reduce((s, r) => s + (r.excesoAlmuerzo ?? 0), 0);
  const totalTardanzaDays = records.filter(r => r.tardanzaIngreso > 0).length;
  const totalTardanzaMin  = records.reduce((s, r) => s + r.tardanzaIngreso, 0);
  const avgDuration = Math.round(
    records.filter(r => r.duracionAlmuerzo).reduce((s, r) => s + (r.duracionAlmuerzo ?? 0), 0) /
    (records.filter(r => r.duracionAlmuerzo).length || 1)
  );
  const LIMIT = 65;

  return (
    <div className="mt-6 border-t pt-6" style={{ borderColor: "#EAECF0" }}>
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm mb-6" style={{ color: "#8B8FA3" }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Volver a la lista
      </button>

      {/* Header */}
      <div className="rounded-xl border p-5 mb-5 flex flex-wrap items-start gap-4" style={{ background: "#FFF", borderColor: "#EAECF0" }}>
        <img src={worker.photo} alt={`${worker.nombre} ${worker.apellido}`} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" style={{ border: "2px solid #EAECF0" }} />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold" style={{ color: "#111827" }}>{worker.nombre} {worker.apellido}</h2>
              <p className="text-sm mt-0.5" style={{ color: "#8B8FA3" }}>DNI: <span className="font-mono tabular">{worker.dni}</span> · {worker.cargo}</p>
            </div>
            <button onClick={() => setShowRevoke(true)} className="px-4 py-2 rounded-xl text-sm font-medium" style={{ background: "rgba(229,72,77,0.08)", color: "#E5484D", border: "1px solid rgba(229,72,77,0.2)" }}>
              Revocar fotocheck
            </button>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 mt-3 text-sm" style={{ color: "#374151" }}>
            <span>{worker.area}</span><span style={{ color: "#D1D5DB" }}>·</span>
            <span>{worker.schedule}</span><span style={{ color: "#D1D5DB" }}>·</span>
            <span>{worker.terminal}</span><span style={{ color: "#D1D5DB" }}>·</span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: worker.status === "active" ? "#17B26A" : "#8B8FA3" }} />
              <span style={{ color: worker.status === "active" ? "#17B26A" : "#8B8FA3" }}>
                Fotocheck {worker.status === "active" ? "activo" : "inactivo"}
              </span>
            </span>
          </div>
          <div className="flex flex-wrap gap-x-5 mt-1 text-xs" style={{ color: "#8B8FA3" }}>
            <span>{worker.email}</span><span>Tel. {worker.telefono}</span><span>Desde {worker.fechaIngreso}</span>
          </div>
        </div>
      </div>

      {/* KPIs — 5 cards: 4 period events + avg duration */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <KPI label="Días con exceso almuerzo" value={String(totalExcessDays)} sub="este mes" color={totalExcessDays > 2 ? "#E5484D" : "#111827"} />
        <KPI label="Minutos exceso almuerzo" value={`${totalExcessMin}`} sub="acumulado" color="#F5A524" />
        <KPI label="Días con tardanza ingreso" value={String(totalTardanzaDays)} sub="este mes" color={totalTardanzaDays > 2 ? "#E5484D" : "#111827"} />
        <KPI label="Min. tardanza acumulada" value={`${totalTardanzaMin}`} sub="en ingreso" color={totalTardanzaMin > 20 ? "#E5484D" : "#111827"} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-5">
        <KPI label="Duración promedio almuerzo" value={`${avgDuration} min`} sub={`vs 60 min asignados`} color="#111827" />
        <KPI label="Registros del mes" value={String(records.length)} sub="sesiones registradas" color="#111827" />
      </div>

      {/* Chart */}
      <div className="rounded-xl border p-5 mb-5" style={{ background: "#FFF", borderColor: "#EAECF0" }}>
        <p className="text-sm font-semibold mb-0.5" style={{ color: "#111827" }}>Duración de almuerzo — septiembre 2026</p>
        <p className="text-xs mb-4" style={{ color: "#8B8FA3" }}>Barras ámbar = exceso · línea roja = límite {LIMIT} min</p>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={DAILY_DURATION} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#8B8FA3", fontFamily: "JetBrains Mono" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#8B8FA3" }} tickLine={false} axisLine={false} domain={[0, 100]} />
            <Tooltip content={<ChartTip />} cursor={{ fill: "#F7F8FA" }} />
            <ReferenceLine y={LIMIT} stroke="#E5484D" strokeDasharray="4 4" strokeWidth={1.5} />
            <Bar dataKey="duration" radius={[4, 4, 0, 0]}>
              {DAILY_DURATION.map((entry, i) => (
                <Cell key={i} fill={entry.duration > LIMIT ? "#F5A524" : "#1D6FD8"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Full 4-period records table */}
      <RecordsTable records={records} />

      {showRevoke && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="rounded-2xl border p-6 w-full max-w-sm mx-4" style={{ background: "#FFF", borderColor: "#EAECF0" }}>
            <h3 className="text-lg font-bold mb-2" style={{ color: "#111827" }}>Revocar fotocheck</h3>
            <p className="text-sm mb-4" style={{ color: "#8B8FA3" }}>El fotocheck de <strong>{worker.nombre} {worker.apellido}</strong> quedará desactivado.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowRevoke(false)} className="flex-1 py-2.5 rounded-xl text-sm font-medium border" style={{ borderColor: "#EAECF0", color: "#374151" }}>Cancelar</button>
              <button onClick={() => setShowRevoke(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: "#E5484D" }}>Revocar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function KPI({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="rounded-xl border p-4" style={{ background: "#FFF", borderColor: "#EAECF0" }}>
      <p className="text-xs uppercase tracking-wider" style={{ color: "#8B8FA3" }}>{label}</p>
      <p className="font-mono text-2xl font-bold mt-1 tabular" style={{ color }}>{value}</p>
      <p className="text-xs mt-0.5" style={{ color: "#8B8FA3" }}>{sub}</p>
    </div>
  );
}

function RecordsTable({ records }: { records: typeof RECORDS_TABLE }) {
  return (
    <div className="rounded-xl border overflow-hidden" style={{ background: "#FFF", borderColor: "#EAECF0" }}>
      <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: "#EAECF0" }}>
        <p className="text-sm font-semibold" style={{ color: "#111827" }}>Registros por jornada</p>
        <span className="text-xs font-mono tabular px-2 py-0.5 rounded-full" style={{ background: "#F7F8FA", color: "#8B8FA3" }}>{records.length}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr style={{ background: "#F7F8FA" }}>
              <th className="px-4 py-2.5 text-left font-medium uppercase tracking-wider whitespace-nowrap" style={{ color: "#8B8FA3" }}>Fecha</th>
              <th className="px-4 py-2.5 text-left font-medium uppercase tracking-wider whitespace-nowrap" style={{ color: "#8B8FA3", borderLeft: "2px solid #EAECF0" }}>① Ingreso</th>
              <th className="px-4 py-2.5 text-left font-medium uppercase tracking-wider whitespace-nowrap" style={{ color: "#8B8FA3" }}>Tardanza</th>
              <th className="px-4 py-2.5 text-left font-medium uppercase tracking-wider whitespace-nowrap" style={{ color: "#8B8FA3", borderLeft: "2px solid #EAECF0" }}>② Sal. almuerzo</th>
              <th className="px-4 py-2.5 text-left font-medium uppercase tracking-wider whitespace-nowrap" style={{ color: "#8B8FA3", borderLeft: "2px solid #EAECF0" }}>③ Ret. almuerzo</th>
              <th className="px-4 py-2.5 text-left font-medium uppercase tracking-wider whitespace-nowrap" style={{ color: "#8B8FA3" }}>Duración</th>
              <th className="px-4 py-2.5 text-left font-medium uppercase tracking-wider whitespace-nowrap" style={{ color: "#8B8FA3" }}>Exceso</th>
              <th className="px-4 py-2.5 text-left font-medium uppercase tracking-wider whitespace-nowrap" style={{ color: "#8B8FA3", borderLeft: "2px solid #EAECF0" }}>④ Salida</th>
              <th className="px-4 py-2.5 text-left font-medium uppercase tracking-wider whitespace-nowrap" style={{ color: "#8B8FA3" }}>Origen</th>
              <th className="px-4 py-2.5 text-left font-medium uppercase tracking-wider whitespace-nowrap" style={{ color: "#8B8FA3" }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 && (
              <tr><td colSpan={10} className="px-5 py-8 text-center text-sm" style={{ color: "#8B8FA3" }}>Sin registros.</td></tr>
            )}
            {records.map(r => {
              const st = STATUS_LABELS[r.status] ?? STATUS_LABELS.ok;
              return (
                <tr key={r.id} className="border-t" style={{ borderColor: "#EAECF0" }}>
                  <td className="px-4 py-3 font-mono tabular whitespace-nowrap" style={{ color: "#374151" }}>{r.date}</td>

                  {/* Ingreso */}
                  <td className="px-4 py-3 font-mono tabular whitespace-nowrap" style={{ color: "#374151", borderLeft: "2px solid #EAECF0" }}>
                    {r.ingreso ?? <span style={{ color: "#C9CDD6" }}>—</span>}
                  </td>
                  <td className="px-4 py-3 font-mono tabular whitespace-nowrap">
                    {r.tardanzaIngreso > 0
                      ? <span style={{ color: "#E5484D" }}>+{r.tardanzaIngreso}m</span>
                      : <span style={{ color: "#17B26A" }}>—</span>}
                  </td>

                  {/* Salida almuerzo */}
                  <td className="px-4 py-3 font-mono tabular whitespace-nowrap" style={{ color: "#374151", borderLeft: "2px solid #EAECF0" }}>
                    {r.salidaAlmuerzo ?? <span style={{ color: "#C9CDD6" }}>—</span>}
                  </td>

                  {/* Retorno almuerzo */}
                  <td className="px-4 py-3 font-mono tabular whitespace-nowrap" style={{ color: "#374151", borderLeft: "2px solid #EAECF0" }}>
                    {r.retornoAlmuerzo ?? <span style={{ color: "#C9CDD6" }}>—</span>}
                  </td>
                  <td className="px-4 py-3 font-mono tabular whitespace-nowrap" style={{ color: "#374151" }}>
                    {r.duracionAlmuerzo ? `${r.duracionAlmuerzo}m` : <span style={{ color: "#C9CDD6" }}>—</span>}
                  </td>
                  <td className="px-4 py-3 font-mono tabular whitespace-nowrap">
                    {(r.excesoAlmuerzo ?? 0) > 0
                      ? <span style={{ color: "#F5A524" }}>+{r.excesoAlmuerzo}m</span>
                      : <span style={{ color: "#17B26A" }}>—</span>}
                  </td>

                  {/* Salida */}
                  <td className="px-4 py-3 font-mono tabular whitespace-nowrap" style={{ color: "#374151", borderLeft: "2px solid #EAECF0" }}>
                    {r.salidaDia ?? <span style={{ color: "#C9CDD6" }}>—</span>}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-full" style={{ background: r.origin === "scan" ? "rgba(29,111,216,0.08)" : "rgba(139,143,163,0.1)", color: r.origin === "scan" ? "#1D6FD8" : "#8B8FA3" }}>
                      {r.origin === "scan" ? "Escaneo" : "Manual"}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-full font-medium" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Aggregate stats per worker for the summary table
function useWorkerStats(workers: Worker[]) {
  return useMemo(() => workers.map(w => {
    const recs = RECORDS_TABLE.filter(r => r.workerId === w.id);
    const diasExceso     = recs.filter(r => (r.excesoAlmuerzo ?? 0) > 0).length;
    const minExceso      = recs.reduce((s, r) => s + (r.excesoAlmuerzo ?? 0), 0);
    const diasTardanza   = recs.filter(r => r.tardanzaIngreso > 0).length;
    const minTardanza    = recs.reduce((s, r) => s + r.tardanzaIngreso, 0);
    const totalRegistros = recs.length;
    return { worker: w, diasExceso, minExceso, diasTardanza, minTardanza, totalRegistros };
  }), [workers]);
}

type SortKey = "nombre" | "area" | "diasTardanza" | "minTardanza" | "diasExceso" | "minExceso";

function SummaryTable({ workers, onSelect }: { workers: Worker[]; onSelect: (w: Worker) => void }) {
  const [sortKey, setSortKey] = useState<SortKey>("diasExceso");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const stats = useWorkerStats(workers);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  }
  function setDir(fn: (d: "asc" | "desc") => "asc" | "desc") {
    setSortDir(prev => fn(prev));
  }

  const sorted = [...stats].sort((a, b) => {
    let av: string | number = sortKey === "nombre" ? a.worker.nombre : sortKey === "area" ? a.worker.area : (a as any)[sortKey];
    let bv: string | number = sortKey === "nombre" ? b.worker.nombre : sortKey === "area" ? b.worker.area : (b as any)[sortKey];
    if (typeof av === "string") return sortDir === "asc" ? av.localeCompare(bv as string) : (bv as string).localeCompare(av);
    return sortDir === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number);
  });

  function SortTh({ label, k }: { label: string; k: SortKey }) {
    const active = sortKey === k;
    return (
      <th
        className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap cursor-pointer select-none"
        style={{ color: active ? "#1D6FD8" : "#8B8FA3" }}
        onClick={() => toggleSort(k)}
      >
        <span className="flex items-center gap-1">
          {label}
          <span style={{ opacity: active ? 1 : 0.3, fontSize: 9 }}>
            {active ? (sortDir === "desc" ? "▼" : "▲") : "⇕"}
          </span>
        </span>
      </th>
    );
  }

  return (
    <div className="rounded-xl border overflow-hidden mt-6" style={{ background: "#FFF", borderColor: "#EAECF0" }}>
      <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "#EAECF0" }}>
        <div>
          <p className="text-sm font-semibold" style={{ color: "#111827" }}>Resumen comparativo</p>
          <p className="text-xs mt-0.5" style={{ color: "#8B8FA3" }}>Doble clic en una fila para ver el detalle completo del trabajador</p>
        </div>
        <span className="font-mono tabular text-xs px-2.5 py-1 rounded-full" style={{ background: "#F7F8FA", color: "#8B8FA3" }}>
          {sorted.length} trabajadores
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "#F7F8FA" }}>
              <SortTh label="Trabajador" k="nombre" />
              <SortTh label="Área" k="area" />
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap" style={{ color: "#8B8FA3" }}>Registros</th>
              <SortTh label="Días tardanza" k="diasTardanza" />
              <SortTh label="Min. tardanza" k="minTardanza" />
              <SortTh label="Días exceso alm." k="diasExceso" />
              <SortTh label="Min. exceso alm." k="minExceso" />
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: "#8B8FA3" }}>Tendencia</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(({ worker: w, diasExceso, minExceso, diasTardanza, minTardanza, totalRegistros }) => (
              <tr
                key={w.id}
                className="border-t transition-colors hover:bg-blue-50 cursor-pointer"
                style={{ borderColor: "#EAECF0" }}
                onDoubleClick={() => onSelect(w)}
              >
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <img src={w.photo} alt={`${w.nombre} ${w.apellido}`} className="w-8 h-8 rounded-xl object-cover flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-sm" style={{ color: "#111827" }}>{w.nombre} {w.apellido}</p>
                      <p className="text-xs" style={{ color: "#8B8FA3" }}>{w.cargo}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <span className="text-xs px-2.5 py-1 rounded-lg" style={{ background: "#F7F8FA", color: "#374151" }}>{w.area}</span>
                </td>
                <td className="px-4 py-3.5 font-mono tabular" style={{ color: "#374151" }}>{totalRegistros}</td>
                <td className="px-4 py-3.5">
                  <span className="font-mono tabular font-semibold" style={{ color: diasTardanza >= 3 ? "#E5484D" : diasTardanza >= 1 ? "#F5A524" : "#17B26A" }}>
                    {diasTardanza}
                  </span>
                </td>
                <td className="px-4 py-3.5 font-mono tabular" style={{ color: minTardanza > 0 ? "#E5484D" : "#8B8FA3" }}>
                  {minTardanza > 0 ? `${minTardanza}m` : "—"}
                </td>
                <td className="px-4 py-3.5">
                  <span className="font-mono tabular font-semibold" style={{ color: diasExceso >= 3 ? "#E5484D" : diasExceso >= 1 ? "#F5A524" : "#17B26A" }}>
                    {diasExceso}
                  </span>
                </td>
                <td className="px-4 py-3.5 font-mono tabular" style={{ color: minExceso > 0 ? "#F5A524" : "#8B8FA3" }}>
                  {minExceso > 0 ? `${minExceso}m` : "—"}
                </td>
                <td className="px-4 py-3.5">
                  <MiniBar diasExceso={diasExceso} diasTardanza={diasTardanza} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MiniBar({ diasExceso, diasTardanza }: { diasExceso: number; diasTardanza: number }) {
  const bars = [
    { v: diasTardanza, color: "#E5484D", label: "tard" },
    { v: diasExceso,   color: "#F5A524", label: "exc" },
  ];
  const max = Math.max(...bars.map(b => b.v), 1);
  return (
    <div className="flex items-end gap-2">
      {bars.map((b, i) => (
        <div key={i} className="flex flex-col items-center gap-0.5">
          <div className="w-4 rounded-sm" style={{ height: Math.max(4, (b.v / max) * 24), background: b.v > 0 ? b.color : "#EAECF0" }} />
          <span className="text-xs" style={{ color: "#C9CDD6", fontSize: 9 }}>{b.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function WorkersView({ workers, onEditWorker }: Props) {
  const [search, setSearch]           = useState("");
  const [areaFilter, setAreaFilter]   = useState("Todas las áreas");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [selected, setSelected]       = useState<Worker | null>(null);

  const showSummaryTable = !search && areaFilter === "Todas las áreas" && statusFilter === "Todos";

  const filtered = workers.filter(w => {
    const fullName = `${w.nombre} ${w.apellido}`.toLowerCase();
    const matchSearch  = !search || fullName.includes(search.toLowerCase()) || w.dni.includes(search) || w.cargo.toLowerCase().includes(search.toLowerCase());
    const matchArea    = areaFilter === "Todas las áreas" || w.area === areaFilter;
    const matchStatus  = statusFilter === "Todos" || (statusFilter === "Activos" ? w.status === "active" : w.status === "inactive");
    return matchSearch && matchArea && matchStatus;
  });

  return (
    <div className="p-4 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "#111827" }}>Trabajadores</h1>
          <p className="text-sm mt-0.5" style={{ color: "#8B8FA3" }}>
            <span className="font-mono tabular font-semibold" style={{ color: "#111827" }}>{filtered.length}</span> resultados ·{" "}
            doble clic o <strong>Ver detalle</strong> para analizar
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <circle cx="7" cy="7" r="4.5" stroke="#8B8FA3" strokeWidth="1.3"/>
            <path d="M10.5 10.5L13 13" stroke="#8B8FA3" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            placeholder="Buscar por nombre, cargo o DNI..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm border outline-none"
            style={{ background: "#FFF", borderColor: "#EAECF0", color: "#111827" }}
          />
        </div>
        <select
          value={areaFilter}
          onChange={e => setAreaFilter(e.target.value)}
          className="rounded-xl px-3 py-2.5 text-sm border outline-none"
          style={{ background: "#FFF", borderColor: "#EAECF0", color: "#374151" }}
        >
          {AREAS_FILTER.map(a => <option key={a}>{a}</option>)}
        </select>
        <div className="flex rounded-xl border overflow-hidden" style={{ borderColor: "#EAECF0" }}>
          {["Todos", "Activos", "Inactivos"].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="px-4 py-2 text-sm font-medium transition-colors"
              style={{ background: statusFilter === s ? "#1D6FD8" : "#FFF", color: statusFilter === s ? "white" : "#374151" }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center text-sm" style={{ color: "#8B8FA3" }}>
            No se encontraron trabajadores con esos filtros.
          </div>
        )}
        {filtered.map(w => {
          const isSelected = selected?.id === w.id;
          const recs = RECORDS_TABLE.filter(r => r.workerId === w.id);
          const excessDays   = recs.filter(r => (r.excesoAlmuerzo ?? 0) > 0).length;
          const tardanzaDays = recs.filter(r => r.tardanzaIngreso > 0).length;

          return (
            <div
              key={w.id}
              className="rounded-xl border transition-all cursor-pointer"
              style={{
                background: "#FFF",
                borderColor: isSelected ? "#1D6FD8" : "#EAECF0",
                boxShadow: isSelected ? "0 0 0 2px rgba(29,111,216,0.18)" : "none",
              }}
              onDoubleClick={() => setSelected(isSelected ? null : w)}
            >
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <img
                    src={w.photo}
                    alt={`${w.nombre} ${w.apellido}`}
                    className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                    style={{ border: `2px solid ${w.status === "active" ? "#17B26A" : "#EAECF0"}` }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm leading-tight" style={{ color: "#111827" }}>{w.nombre} {w.apellido}</p>
                    <p className="text-xs mt-0.5 truncate" style={{ color: "#8B8FA3" }}>{w.cargo}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#8B8FA3" }}>{w.area}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <span className="font-mono tabular text-xs" style={{ color: "#8B8FA3" }}>{w.dni}</span>
                  {tardanzaDays > 0 && (
                    <span className="text-xs px-1.5 py-0.5 rounded font-mono tabular" style={{ background: "rgba(229,72,77,0.1)", color: "#E5484D" }}>
                      {tardanzaDays}d tard.
                    </span>
                  )}
                  {excessDays > 0 && (
                    <span className="text-xs px-1.5 py-0.5 rounded font-mono tabular" style={{ background: "rgba(245,165,36,0.12)", color: "#F5A524" }}>
                      {excessDays}d exceso
                    </span>
                  )}
                </div>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={e => { e.stopPropagation(); setSelected(isSelected ? null : w); }}
                    className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors"
                    style={{
                      background: isSelected ? "rgba(29,111,216,0.1)" : "#F7F8FA",
                      color: isSelected ? "#1D6FD8" : "#374151",
                      border: `1px solid ${isSelected ? "#1D6FD8" : "#EAECF0"}`,
                    }}
                  >
                    {isSelected ? "Cerrar" : "Ver detalle"}
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); onEditWorker(w); }}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors"
                    style={{ borderColor: "#EAECF0", color: "#374151" }}
                    title="Editar perfil"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M8 2l2 2-6 6H2V8l6-6z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Worker detail inline */}
      {selected && (
        <WorkerDetail worker={selected} onBack={() => setSelected(null)} />
      )}

      {/* Summary table — shown only when no filters active and no detail open */}
      {showSummaryTable && !selected && (
        <SummaryTable workers={workers} onSelect={w => setSelected(w)} />
      )}
    </div>
  );
}
