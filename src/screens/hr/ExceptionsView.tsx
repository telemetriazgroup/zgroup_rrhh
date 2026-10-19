import { useState } from "react";
import { EXCEPTIONS, EXCEPTION_LABELS, WORKERS } from "../../data/mockData";

const MOTIVES = [
  "Permiso autorizado",
  "Emergencia médica",
  "Trámite externo",
  "Error de escaneo",
  "Capacitación",
  "Otro",
];

export default function ExceptionsView() {
  const [filter, setFilter] = useState<string>("all");
  const [modal, setModal] = useState<string | null>(null);
  const [form, setForm] = useState({ time: "", motive: "", note: "" });

  const filtered =
    filter === "all" ? EXCEPTIONS : EXCEPTIONS.filter(e => e.type === filter);

  const currentException = EXCEPTIONS.find(e => e.id === modal);
  const currentWorker = currentException
    ? WORKERS.find(w => w.id === currentException.workerId)
    : null;

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "#111827" }}>Excepciones</h1>
          <p className="text-sm mt-0.5" style={{ color: "#8B8FA3" }}>
            <span className="font-mono tabular font-semibold" style={{ color: "#E5484D" }}>5</span>
            {" "}pendientes de resolver
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { id: "all", label: "Todas" },
            { id: "no_return", label: "Sin retorno" },
            { id: "auto_closed", label: "Automáticas" },
            { id: "return_no_exit", label: "Sin salida" },
            { id: "duplicate", label: "Duplicadas" },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={{
                background: filter === f.id ? "#1D6FD8" : "#FFFFFF",
                color: filter === f.id ? "white" : "#374151",
                border: `1px solid ${filter === f.id ? "#1D6FD8" : "#EAECF0"}`,
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" style={{ background: "#FFFFFF", borderColor: "#EAECF0" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "#F7F8FA" }}>
                {["Tipo", "Trabajador", "Área", "Fecha", "Hora", "Terminal", "Vigilante", ""].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap" style={{ color: "#8B8FA3" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(ex => {
                const worker = WORKERS.find(w => w.id === ex.workerId);
                const label = EXCEPTION_LABELS[ex.type];
                return (
                  <tr key={ex.id} className="border-t" style={{ borderColor: "#EAECF0" }}>
                    <td className="px-5 py-3.5">
                      <span
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                        style={{ background: label.bg, color: label.color }}
                      >
                        {label.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <img src={worker?.photo} alt={worker?.name} className="w-7 h-7 rounded-full object-cover" />
                        <span className="font-medium whitespace-nowrap" style={{ color: "#111827" }}>{worker?.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap" style={{ color: "#374151" }}>{worker?.area}</td>
                    <td className="px-5 py-3.5 font-mono tabular whitespace-nowrap" style={{ color: "#374151" }}>{ex.date}</td>
                    <td className="px-5 py-3.5 font-mono tabular whitespace-nowrap" style={{ color: "#374151" }}>{ex.time}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap" style={{ color: "#374151" }}>{ex.terminal}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap" style={{ color: "#374151" }}>{ex.guard}</td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => { setModal(ex.id); setForm({ time: ex.time, motive: "", note: "" }); }}
                        className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap"
                        style={{ background: "rgba(29,111,216,0.08)", color: "#1D6FD8" }}
                      >
                        Resolver
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal && currentWorker && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div
            className="w-full lg:max-w-lg rounded-t-2xl lg:rounded-2xl p-6 border"
            style={{ background: "#FFFFFF", borderColor: "#EAECF0", maxHeight: "90vh", overflowY: "auto" }}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="font-semibold text-lg" style={{ color: "#111827" }}>Resolver excepción</p>
                <p className="text-sm mt-0.5" style={{ color: "#8B8FA3" }}>{currentWorker.name} · {currentException?.date}</p>
              </div>
              <button onClick={() => setModal(null)} className="p-2 rounded-lg" style={{ background: "#F7F8FA" }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 4l8 8M12 4l-8 8" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl mb-5" style={{ background: "#F7F8FA" }}>
              <img src={currentWorker.photo} alt={currentWorker.name} className="w-12 h-12 rounded-full object-cover" />
              <div>
                <p className="font-semibold" style={{ color: "#111827" }}>{currentWorker.name}</p>
                <p className="text-sm" style={{ color: "#8B8FA3" }}>{currentWorker.area} · {currentWorker.dni}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: "#8B8FA3" }}>
                  Hora corregida
                </label>
                <input
                  type="time"
                  value={form.time}
                  onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                  className="w-full rounded-xl px-4 py-3 text-sm border outline-none font-mono"
                  style={{ background: "#F7F8FA", borderColor: "#EAECF0", color: "#111827", minHeight: 48 }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: "#8B8FA3" }}>
                  Motivo
                </label>
                <select
                  value={form.motive}
                  onChange={e => setForm(f => ({ ...f, motive: e.target.value }))}
                  className="w-full rounded-xl px-4 py-3 text-sm border outline-none"
                  style={{ background: "#F7F8FA", borderColor: "#EAECF0", color: "#111827", minHeight: 48 }}
                >
                  <option value="">Seleccionar motivo...</option>
                  {MOTIVES.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: "#8B8FA3" }}>
                  Nota
                </label>
                <textarea
                  value={form.note}
                  onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                  placeholder="Descripción adicional..."
                  rows={3}
                  className="w-full rounded-xl px-4 py-3 text-sm border outline-none resize-none"
                  style={{ background: "#F7F8FA", borderColor: "#EAECF0", color: "#111827" }}
                />
              </div>

              <div className="flex items-start gap-2.5 rounded-xl p-3.5" style={{ background: "rgba(245,165,36,0.08)", border: "1px solid rgba(245,165,36,0.2)" }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0 mt-0.5">
                  <path d="M8 2L14 13H2L8 2z" stroke="#F5A524" strokeWidth="1.3" strokeLinejoin="round" />
                  <path d="M8 7v3M8 11.5h.01" stroke="#F5A524" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
                <p className="text-xs" style={{ color: "#92400E" }}>
                  Esta corrección quedará registrada a tu nombre y será auditable.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModal(null)}
                className="flex-1 py-3 rounded-xl text-sm font-medium border transition-colors"
                style={{ borderColor: "#EAECF0", color: "#374151", minHeight: 48 }}
              >
                Cancelar
              </button>
              <button
                onClick={() => setModal(null)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-colors"
                style={{ background: "#1D6FD8", minHeight: 48 }}
              >
                Guardar corrección
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
