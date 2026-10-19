import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine, CartesianGrid,
} from "recharts";
import { WORKERS, FLOW_DATA, AREA_EXCESS, RECORDS_TABLE } from "../../data/mockData";

interface Props {
  onWorkerClick: (id: string) => void;
}

function KPICard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="rounded-xl p-5 border" style={{ background: "#FFFFFF", borderColor: "#EAECF0" }}>
      <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "#8B8FA3" }}>{label}</p>
      <p className="font-mono text-3xl font-bold mt-2 tabular" style={{ color: color || "#111827" }}>{value}</p>
      {sub && <p className="text-xs mt-1" style={{ color: "#8B8FA3" }}>{sub}</p>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg p-3 border text-xs" style={{ background: "#FFF", borderColor: "#EAECF0", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
      <p className="font-medium mb-1" style={{ color: "#374151" }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export default function DashboardView({ onWorkerClick }: Props) {
  const topExcess = WORKERS.slice(0, 5).map((w, i) => ({
    ...w,
    days: 3 + i,
    total: 18 + i * 11,
    trend: [8, 12, 6, 18, 15],
  }));

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "#111827" }}>Dashboard</h1>
          <p className="text-sm mt-0.5" style={{ color: "#8B8FA3" }}>Semana actual · 1–7 sep 2026</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            className="rounded-lg px-3 py-2 text-sm border outline-none"
            style={{ background: "#FFF", borderColor: "#EAECF0", color: "#374151" }}
          >
            <option>Sep 1 – Sep 7, 2026</option>
            <option>Ago 25 – Ago 31, 2026</option>
          </select>
          <select
            className="rounded-lg px-3 py-2 text-sm border outline-none"
            style={{ background: "#FFF", borderColor: "#EAECF0", color: "#374151" }}
          >
            <option>Todas las áreas</option>
            <option>Producción</option>
            <option>Logística</option>
          </select>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard label="Minutos exceso" value="342" sub="esta semana" color="#F5A524" />
        <KPICard label="Duración promedio" value="64m" sub="vs 60m asignados" />
        <KPICard label="Con exceso recurrente" value="12" sub="trabajadores" color="#E5484D" />
        <KPICard label="Sesiones incompletas" value="4.2%" sub="del total" color="#8B8FA3" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Flow chart */}
        <div className="rounded-xl p-5 border" style={{ background: "#FFFFFF", borderColor: "#EAECF0" }}>
          <p className="text-sm font-semibold mb-1" style={{ color: "#111827" }}>Flujo por franja de 15 min</p>
          <p className="text-xs mb-4" style={{ color: "#8B8FA3" }}>Salidas y retornos · hoy</p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={FLOW_DATA} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F5" />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#8B8FA3", fontFamily: "JetBrains Mono" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#8B8FA3" }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="exits" name="Salidas" stroke="#F5A524" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="returns" name="Retornos" stroke="#17B26A" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 rounded" style={{ background: "#F5A524" }} /><span className="text-xs" style={{ color: "#8B8FA3" }}>Salidas</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 rounded" style={{ background: "#17B26A" }} /><span className="text-xs" style={{ color: "#8B8FA3" }}>Retornos</span></div>
          </div>
        </div>

        {/* Area excess */}
        <div className="rounded-xl p-5 border" style={{ background: "#FFFFFF", borderColor: "#EAECF0" }}>
          <p className="text-sm font-semibold mb-1" style={{ color: "#111827" }}>Exceso promedio por área</p>
          <p className="text-xs mb-4" style={{ color: "#8B8FA3" }}>Minutos sobre el tiempo asignado</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={AREA_EXCESS} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
              <XAxis type="number" tick={{ fontSize: 10, fill: "#8B8FA3" }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="area" tick={{ fontSize: 11, fill: "#374151" }} width={90} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#F7F8FA" }} />
              <Bar dataKey="minutes" name="Min exceso" radius={[0, 4, 4, 0]} fill="#1D6FD8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Excess table */}
      <div className="rounded-xl border overflow-hidden" style={{ background: "#FFFFFF", borderColor: "#EAECF0" }}>
        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "#EAECF0" }}>
          <div>
            <p className="text-sm font-semibold" style={{ color: "#111827" }}>Exceso recurrente</p>
            <p className="text-xs mt-0.5" style={{ color: "#8B8FA3" }}>Trabajadores con más de 2 días con exceso esta semana</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "#F7F8FA" }}>
                {["Trabajador", "Área", "Días con exceso", "Min. totales", "Tendencia"].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: "#8B8FA3" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topExcess.map((w, i) => (
                <tr
                  key={w.id}
                  className="border-t cursor-pointer transition-colors hover:bg-blue-50"
                  style={{ borderColor: "#EAECF0" }}
                  onClick={() => onWorkerClick(w.id)}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <img src={w.photo} alt={w.name} className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <p className="font-medium" style={{ color: "#111827" }}>{w.name}</p>
                        <p className="text-xs" style={{ color: "#8B8FA3" }}>{w.dni}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5" style={{ color: "#374151" }}>{w.area}</td>
                  <td className="px-5 py-3.5">
                    <span className="font-mono tabular font-semibold" style={{ color: w.days >= 4 ? "#E5484D" : "#F5A524" }}>
                      {w.days}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-mono tabular" style={{ color: "#374151" }}>{w.total} min</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <MiniBar values={w.trend} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MiniBar({ values }: { values: number[] }) {
  const max = Math.max(...values, 60);
  return (
    <div className="flex items-end gap-0.5" style={{ height: 24, width: 60 }}>
      {values.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm"
          style={{
            height: `${(v / max) * 100}%`,
            background: v > 60 ? "#F5A524" : "#EAECF0",
          }}
        />
      ))}
    </div>
  );
}
