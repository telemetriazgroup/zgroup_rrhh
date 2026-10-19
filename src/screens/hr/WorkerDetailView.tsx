import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer, Cell } from "recharts";
import { WORKERS, RECORDS_TABLE, DAILY_DURATION } from "../../data/mockData";

interface Props {
  workerId: string;
  onBack: () => void;
}

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  ok:         { label: "OK",         color: "#17B26A", bg: "rgba(23,178,106,0.1)" },
  excess:     { label: "Exceso",     color: "#F5A524", bg: "rgba(245,165,36,0.12)" },
  incomplete: { label: "Incompleto", color: "#8B8FA3", bg: "rgba(139,143,163,0.1)" },
  tardanza:   { label: "Tardanza",   color: "#E5484D", bg: "rgba(229,72,77,0.1)" },
};

const ChartTip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg p-2.5 border text-xs" style={{ background: "#FFF", borderColor: "#EAECF0", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
      <p className="font-medium" style={{ color: "#374151" }}>Día {label}</p>
      <p style={{ color: "#1D6FD8" }}>{payload[0]?.value} min</p>
    </div>
  );
};

export default function WorkerDetailView({ workerId, onBack }: Props) {
  const [showRevoke, setShowRevoke] = useState(false);
  const worker = WORKERS.find(w => w.id === workerId) ?? WORKERS[0];
  const records = RECORDS_TABLE.filter(r => r.workerId === workerId);

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
    <div className="p-4 lg:p-8">
      {/* Back */}
      <button onClick={onBack} className="flex items-center gap-2 text-sm mb-5" style={{ color: "#8B8FA3" }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Volver
      </button>

      {/* Header card */}
      <div className="rounded-xl border p-5 mb-6 flex flex-wrap items-start gap-5" style={{ background: "#FFF", borderColor: "#EAECF0" }}>
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
          <div className="flex flex-wrap gap-x-5 gap-y-2 mt-3">
            {[worker.area, worker.schedule, worker.terminal].map((v, i) => (
              <span key={i} className="text-sm" style={{ color: "#374151" }}>{v}</span>
            ))}
            <span className="flex items-center gap-1.5 text-sm">
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: worker.status === "active" ? "#17B26A" : "#8B8FA3" }} />
              <span style={{ color: worker.status === "active" ? "#17B26A" : "#8B8FA3" }}>
                Fotocheck {worker.status === "active" ? "activo" : "inactivo"}
              </span>
            </span>
          </div>
          <div className="flex flex-wrap gap-x-5 mt-2 text-xs" style={{ color: "#8B8FA3" }}>
            <span>{worker.email}</span><span>Tel. {worker.telefono}</span><span>Desde {worker.fechaIngreso}</span>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <KPI label="Días exceso almuerzo"  value={String(totalExcessDays)}  sub="este mes"       color={totalExcessDays > 2 ? "#E5484D" : "#111827"} />
        <KPI label="Min. exceso almuerzo"  value={String(totalExcessMin)}   sub="acumulado"      color="#F5A524" />
        <KPI label="Días tardanza ingreso" value={String(totalTardanzaDays)} sub="este mes"      color={totalTardanzaDays > 2 ? "#E5484D" : "#111827"} />
        <KPI label="Min. tardanza acum."   value={String(totalTardanzaMin)} sub="en ingreso"    color={totalTardanzaMin > 20 ? "#E5484D" : "#111827"} />
      </div>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <KPI label="Duración prom. almuerzo" value={`${avgDuration} min`} sub="vs 60 min asignados" color="#111827" />
        <KPI label="Registros del mes" value={String(records.length)} sub="sesiones" color="#111827" />
      </div>

      {/* Chart */}
      <div className="rounded-xl border p-5 mb-6" style={{ background: "#FFF", borderColor: "#EAECF0" }}>
        <p className="text-sm font-semibold mb-0.5" style={{ color: "#111827" }}>Duración de almuerzo — septiembre 2026</p>
        <p className="text-xs mb-4" style={{ color: "#8B8FA3" }}>Barras ámbar = exceso · línea punteada = límite {LIMIT} min</p>
        <ResponsiveContainer width="100%" height={160}>
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
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm" style={{ background: "#1D6FD8" }} /><span className="text-xs" style={{ color: "#8B8FA3" }}>Dentro del límite</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm" style={{ background: "#F5A524" }} /><span className="text-xs" style={{ color: "#8B8FA3" }}>Con exceso</span></div>
        </div>
      </div>

      {/* 4-period table */}
      <div className="rounded-xl border overflow-hidden" style={{ background: "#FFF", borderColor: "#EAECF0" }}>
        <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: "#EAECF0" }}>
          <p className="text-sm font-semibold" style={{ color: "#111827" }}>Registros por jornada</p>
          <span className="text-xs font-mono tabular px-2 py-0.5 rounded-full" style={{ background: "#F7F8FA", color: "#8B8FA3" }}>{records.length}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: "#F7F8FA" }}>
                <Th>Fecha</Th>
                <Th border>① Ingreso</Th>
                <Th>Tardanza</Th>
                <Th border>② Sal. almuerzo</Th>
                <Th border>③ Ret. almuerzo</Th>
                <Th>Duración</Th>
                <Th>Exceso</Th>
                <Th border>④ Salida</Th>
                <Th>Origen</Th>
                <Th>Estado</Th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 && (
                <tr><td colSpan={10} className="px-5 py-8 text-center" style={{ color: "#8B8FA3" }}>Sin registros para este trabajador.</td></tr>
              )}
              {records.map(r => {
                const st = STATUS_LABELS[r.status] ?? STATUS_LABELS.ok;
                return (
                  <tr key={r.id} className="border-t" style={{ borderColor: "#EAECF0" }}>
                    <td className="px-4 py-3 font-mono tabular whitespace-nowrap" style={{ color: "#374151" }}>{r.date}</td>

                    <td className="px-4 py-3 font-mono tabular whitespace-nowrap" style={{ color: "#374151", borderLeft: "2px solid #EAECF0" }}>
                      {r.ingreso ?? <Em />}
                    </td>
                    <td className="px-4 py-3 font-mono tabular whitespace-nowrap">
                      {r.tardanzaIngreso > 0
                        ? <span style={{ color: "#E5484D" }}>+{r.tardanzaIngreso}m</span>
                        : <span style={{ color: "#17B26A" }}>—</span>}
                    </td>

                    <td className="px-4 py-3 font-mono tabular whitespace-nowrap" style={{ color: "#374151", borderLeft: "2px solid #EAECF0" }}>
                      {r.salidaAlmuerzo ?? <Em />}
                    </td>

                    <td className="px-4 py-3 font-mono tabular whitespace-nowrap" style={{ color: "#374151", borderLeft: "2px solid #EAECF0" }}>
                      {r.retornoAlmuerzo ?? <Em />}
                    </td>
                    <td className="px-4 py-3 font-mono tabular whitespace-nowrap" style={{ color: "#374151" }}>
                      {r.duracionAlmuerzo ? `${r.duracionAlmuerzo}m` : <Em />}
                    </td>
                    <td className="px-4 py-3 font-mono tabular whitespace-nowrap">
                      {(r.excesoAlmuerzo ?? 0) > 0
                        ? <span style={{ color: "#F5A524" }}>+{r.excesoAlmuerzo}m</span>
                        : <span style={{ color: "#17B26A" }}>—</span>}
                    </td>

                    <td className="px-4 py-3 font-mono tabular whitespace-nowrap" style={{ color: "#374151", borderLeft: "2px solid #EAECF0" }}>
                      {r.salidaDia ?? <Em />}
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

      {/* Revoke modal */}
      {showRevoke && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="rounded-2xl border p-6 w-full max-w-sm mx-4" style={{ background: "#FFF", borderColor: "#EAECF0" }}>
            <h3 className="text-lg font-bold mb-2" style={{ color: "#111827" }}>Revocar fotocheck</h3>
            <p className="text-sm mb-4" style={{ color: "#8B8FA3" }}>
              El fotocheck de <strong>{worker.nombre} {worker.apellido}</strong> quedará desactivado.
            </p>
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

function Th({ children, border }: { children: React.ReactNode; border?: boolean }) {
  return (
    <th
      className="px-4 py-2.5 text-left font-medium uppercase tracking-wider whitespace-nowrap"
      style={{ color: "#8B8FA3", fontSize: 10, borderLeft: border ? "2px solid #EAECF0" : undefined }}
    >
      {children}
    </th>
  );
}

function Em() {
  return <span style={{ color: "#C9CDD6" }}>—</span>;
}
