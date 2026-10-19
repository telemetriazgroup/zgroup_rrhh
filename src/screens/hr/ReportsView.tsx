import { useState } from "react";
import { WORKERS, RECORDS_TABLE } from "../../data/mockData";

const REPORT_TYPES = [
  {
    id: "detail",
    label: "Detalle de registros",
    description: "Todas las marcaciones del período con estado y origen",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="3" stroke="#1D6FD8" strokeWidth="1.5"/>
        <path d="M7 8h10M7 12h10M7 16h6" stroke="#1D6FD8" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: "monthly",
    label: "Resumen mensual",
    description: "Consolidado por trabajador con totales de exceso",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="16" rx="2" stroke="#17B26A" strokeWidth="1.5"/>
        <path d="M8 2v4M16 2v4M3 10h18" stroke="#17B26A" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: "excess",
    label: "Exceso recurrente",
    description: "Trabajadores con excesos repetidos en el período",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 4L21 19H3L12 4z" stroke="#F5A524" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M12 10v5M12 17h.01" stroke="#F5A524" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: "incomplete",
    label: "Sesiones incompletas",
    description: "Marcaciones de salida sin retorno registrado",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="#8B8FA3" strokeWidth="1.5"/>
        <path d="M12 7v5l3 3" stroke="#8B8FA3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

export default function ReportsView() {
  const [reportType, setReportType] = useState("detail");
  const [dateFrom, setDateFrom] = useState("2026-09-01");
  const [dateTo, setDateTo] = useState("2026-09-07");
  const [areaFilter, setAreaFilter] = useState("all");
  const [onlyExcess, setOnlyExcess] = useState(false);
  const [page, setPage] = useState(1);
  const [showExport, setShowExport] = useState(false);

  const tableRows = RECORDS_TABLE.filter(r => onlyExcess ? (r.excess ?? 0) > 0 : true);

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold" style={{ color: "#111827" }}>Reportes</h1>
        <p className="text-sm mt-0.5" style={{ color: "#8B8FA3" }}>Exporta y analiza los datos de control de almuerzo</p>
      </div>

      {/* Report type cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {REPORT_TYPES.map(rt => (
          <button
            key={rt.id}
            onClick={() => setReportType(rt.id)}
            className="text-left rounded-xl p-4 border transition-all"
            style={{
              background: reportType === rt.id ? "rgba(29,111,216,0.06)" : "#FFFFFF",
              borderColor: reportType === rt.id ? "#1D6FD8" : "#EAECF0",
              boxShadow: reportType === rt.id ? "0 0 0 1px #1D6FD8" : "none",
            }}
          >
            <div className="mb-3">{rt.icon}</div>
            <p className="text-sm font-semibold" style={{ color: "#111827" }}>{rt.label}</p>
            <p className="text-xs mt-1" style={{ color: "#8B8FA3" }}>{rt.description}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="rounded-xl border p-4 mb-4 flex flex-wrap items-end gap-4" style={{ background: "#FFFFFF", borderColor: "#EAECF0" }}>
        <div>
          <label className="text-xs font-medium block mb-1.5 uppercase tracking-wider" style={{ color: "#8B8FA3" }}>Desde</label>
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="rounded-lg px-3 py-2 text-sm border outline-none font-mono"
            style={{ background: "#F7F8FA", borderColor: "#EAECF0", color: "#111827" }}
          />
        </div>
        <div>
          <label className="text-xs font-medium block mb-1.5 uppercase tracking-wider" style={{ color: "#8B8FA3" }}>Hasta</label>
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="rounded-lg px-3 py-2 text-sm border outline-none font-mono"
            style={{ background: "#F7F8FA", borderColor: "#EAECF0", color: "#111827" }}
          />
        </div>
        <div>
          <label className="text-xs font-medium block mb-1.5 uppercase tracking-wider" style={{ color: "#8B8FA3" }}>Área</label>
          <select
            value={areaFilter}
            onChange={e => setAreaFilter(e.target.value)}
            className="rounded-lg px-3 py-2 text-sm border outline-none"
            style={{ background: "#F7F8FA", borderColor: "#EAECF0", color: "#111827" }}
          >
            <option value="all">Todas las áreas</option>
            <option value="Producción">Producción</option>
            <option value="Logística">Logística</option>
            <option value="Calidad">Calidad</option>
          </select>
        </div>
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <div
            className="w-10 h-5 rounded-full relative transition-colors"
            style={{ background: onlyExcess ? "#1D6FD8" : "#EAECF0" }}
            onClick={() => setOnlyExcess(!onlyExcess)}
          >
            <div
              className="absolute w-4 h-4 rounded-full top-0.5 transition-all"
              style={{ background: "white", left: onlyExcess ? "calc(100% - 18px)" : "2px", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }}
            />
          </div>
          <span className="text-sm" style={{ color: "#374151" }}>Solo con exceso</span>
        </label>

        <div className="ml-auto relative">
          <button
            onClick={() => setShowExport(!showExport)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: "#1D6FD8", color: "white" }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2v7M4 6l3 3 3-3M2 10v1a1 1 0 001 1h8a1 1 0 001-1v-1" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Exportar
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 4l3 3 3-3" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {showExport && (
            <div className="absolute right-0 top-full mt-1 rounded-xl border overflow-hidden z-10" style={{ background: "#FFF", borderColor: "#EAECF0", boxShadow: "0 8px 24px rgba(0,0,0,0.1)", minWidth: 140 }}>
              {["Excel (.xlsx)", "CSV (.csv)"].map(opt => (
                <button
                  key={opt}
                  onClick={() => setShowExport(false)}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors border-b last:border-0"
                  style={{ borderColor: "#EAECF0", color: "#374151" }}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Preview table */}
      <div className="rounded-xl border overflow-hidden" style={{ background: "#FFFFFF", borderColor: "#EAECF0" }}>
        <div className="px-5 py-3.5 border-b flex items-center justify-between" style={{ borderColor: "#EAECF0" }}>
          <p className="text-sm font-medium" style={{ color: "#374151" }}>
            Vista previa — <span className="font-mono tabular">{tableRows.length}</span> registros
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="w-8 h-8 rounded-lg flex items-center justify-center border transition-colors"
              style={{ borderColor: "#EAECF0", color: page === 1 ? "#C9CDD6" : "#374151" }}
              disabled={page === 1}
            >
              ‹
            </button>
            <span className="text-xs font-mono tabular" style={{ color: "#8B8FA3" }}>Pág. {page}/2</span>
            <button
              onClick={() => setPage(p => Math.min(2, p + 1))}
              className="w-8 h-8 rounded-lg flex items-center justify-center border transition-colors"
              style={{ borderColor: "#EAECF0", color: page === 2 ? "#C9CDD6" : "#374151" }}
              disabled={page === 2}
            >
              ›
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "#F7F8FA" }}>
                {["Trabajador", "Área", "Fecha", "Salida", "Retorno", "Duración", "Exceso", "Origen", "Estado"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap" style={{ color: "#8B8FA3" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.slice((page - 1) * 5, page * 5).map(r => {
                const w = WORKERS.find(x => x.id === r.workerId);
                return (
                  <tr key={r.id} className="border-t" style={{ borderColor: "#EAECF0" }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <img src={w?.photo} alt={w?.name} className="w-6 h-6 rounded-full object-cover" />
                        <span className="whitespace-nowrap" style={{ color: "#111827" }}>{w?.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: "#374151" }}>{w?.area}</td>
                    <td className="px-4 py-3 font-mono tabular whitespace-nowrap" style={{ color: "#374151" }}>{r.date}</td>
                    <td className="px-4 py-3 font-mono tabular whitespace-nowrap" style={{ color: "#374151" }}>{r.salidaAlmuerzo ?? "—"}</td>
                    <td className="px-4 py-3 font-mono tabular whitespace-nowrap" style={{ color: "#374151" }}>{r.retornoAlmuerzo ?? "—"}</td>
                    <td className="px-4 py-3 font-mono tabular whitespace-nowrap" style={{ color: "#374151" }}>{r.duracionAlmuerzo ? `${r.duracionAlmuerzo} min` : "—"}</td>
                    <td className="px-4 py-3 font-mono tabular whitespace-nowrap">
                      {(r.excesoAlmuerzo ?? 0) > 0
                        ? <span style={{ color: "#F5A524" }}>{r.excesoAlmuerzo} min</span>
                        : <span style={{ color: "#8B8FA3" }}>—</span>}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          background: r.origin === "scan" ? "rgba(29,111,216,0.08)" : "rgba(139,143,163,0.1)",
                          color: r.origin === "scan" ? "#1D6FD8" : "#8B8FA3",
                        }}
                      >
                        {r.origin === "scan" ? "Escaneo" : "Manual"}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          background: r.status === "ok"
                            ? "rgba(23,178,106,0.1)"
                            : r.status === "excess"
                            ? "rgba(245,165,36,0.12)"
                            : "rgba(139,143,163,0.1)",
                          color: r.status === "ok" ? "#17B26A" : r.status === "excess" ? "#F5A524" : "#8B8FA3",
                        }}
                      >
                        {r.status === "ok" ? "OK" : r.status === "excess" ? "Exceso" : "Incompleto"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
