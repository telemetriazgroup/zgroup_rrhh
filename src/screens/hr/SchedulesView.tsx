import { useState } from "react";
import { SCHEDULES, WORKERS, ALL_DAYS } from "../../data/mockData";

type Schedule = typeof SCHEDULES[0];

const DAY_LABELS: Record<string, string> = { L: "Lun", M: "Mar", X: "Mié", J: "Jue", V: "Vie", S: "Sáb", D: "Dom" };

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(m: number): string {
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

function formatDuration(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h 00m` : `${h}h ${m}m`;
}

function TimelineBar({ entry, exitLunch, returnLunch, exitTime, tolerances }: {
  entry: string; exitLunch: string; returnLunch: string; exitTime: string;
  tolerances: { entry: number; return: number; earlyExit: number };
}) {
  const START = 7 * 60; // 07:00
  const END = 19 * 60;  // 19:00
  const RANGE = END - START;

  function pct(t: string) {
    return ((timeToMinutes(t) - START) / RANGE) * 100;
  }
  function tolPct(mins: number) {
    return (mins / RANGE) * 100;
  }

  const blocks = [
    { from: pct(entry), to: pct(exitLunch), color: "#1D6FD8", type: "work" },
    { from: pct(returnLunch), to: pct(exitTime), color: "#1D6FD8", type: "work" },
  ];
  const lunch = { from: pct(exitLunch), to: pct(returnLunch), color: "#F5A524" };
  const toleranceBands = [
    { pos: pct(entry), width: tolPct(tolerances.entry), side: "right" },
    { pos: pct(returnLunch), width: tolPct(tolerances.return), side: "right" },
  ];

  const milestones = [entry, exitLunch, returnLunch, exitTime];

  return (
    <div className="py-4">
      <div className="relative h-8" style={{ marginLeft: 4, marginRight: 4 }}>
        {/* Track */}
        <div className="absolute top-2 left-0 right-0 h-4 rounded-full" style={{ background: "#EAECF0" }} />

        {/* Work blocks */}
        {blocks.map((b, i) => (
          <div
            key={i}
            className="absolute top-2 h-4 rounded"
            style={{ left: `${b.from}%`, width: `${b.to - b.from}%`, background: b.color }}
          />
        ))}

        {/* Lunch block */}
        <div
          className="absolute top-2 h-4"
          style={{ left: `${lunch.from}%`, width: `${lunch.to - lunch.from}%`, background: lunch.color }}
        />

        {/* Tolerance bands */}
        {toleranceBands.map((tb, i) => (
          <div
            key={i}
            className="absolute top-2 h-4"
            style={{
              left: `${tb.pos}%`,
              width: `${tb.width}%`,
              background: "repeating-linear-gradient(45deg, rgba(255,255,255,0.3) 0px, rgba(255,255,255,0.3) 2px, transparent 2px, transparent 6px)",
              backgroundColor: "rgba(255,165,0,0.25)",
            }}
          />
        ))}

        {/* Milestone ticks */}
        {milestones.map((t, i) => (
          <div
            key={i}
            className="absolute top-0 flex flex-col items-center"
            style={{ left: `${pct(t)}%`, transform: "translateX(-50%)" }}
          >
            <div className="w-0.5 h-8 rounded-full" style={{ background: "#374151" }} />
          </div>
        ))}
      </div>

      {/* Labels */}
      <div className="relative mt-1" style={{ height: 16 }}>
        {milestones.map((t, i) => (
          <span
            key={i}
            className="absolute font-mono text-xs tabular"
            style={{ left: `${pct(t)}%`, transform: "translateX(-50%)", color: "#374151", fontSize: 10 }}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function Stepper({ value, onChange, min = 0, max = 999 }: { value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-lg font-medium border transition-colors"
        style={{ background: "#F7F8FA", borderColor: "#EAECF0", color: "#374151" }}
      >
        −
      </button>
      <span className="font-mono tabular text-sm font-semibold w-8 text-center" style={{ color: "#111827" }}>
        {value}
      </span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-lg font-medium border transition-colors"
        style={{ background: "#F7F8FA", borderColor: "#EAECF0", color: "#374151" }}
      >
        +
      </button>
    </div>
  );
}

function Switch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="switch cursor-pointer" onClick={() => onChange(!checked)}>
      <input type="checkbox" checked={checked} onChange={() => {}} />
      <span className="switch-thumb" />
    </label>
  );
}

function SchemeEditorPanel({ scheme, onClose, onSave }: {
  scheme: Schedule | null;
  onClose: () => void;
  onSave: (s: Schedule) => void;
}) {
  const defaultScheme: Schedule = {
    id: `SCH${Date.now()}`,
    name: "Nuevo esquema",
    days: ["L", "M", "X", "J", "V"],
    summary: "",
    workers: 0,
    since: new Date().toISOString().slice(0, 10),
    active: true,
    entryTime: "08:00",
    exitLunch: "13:00",
    returnLunch: "14:00",
    exitTime: "18:00",
    tolerances: { entry: 5, return: 5, earlyExit: 0, incomplete: 180 },
    saturday: "no",
    saturdayExit: "13:00",
  };

  const [form, setForm] = useState<Schedule>(scheme ?? defaultScheme);
  const [workerSearch, setWorkerSearch] = useState("");
  const [assignedWorkers, setAssignedWorkers] = useState<string[]>(
    scheme ? WORKERS.filter(w => w.schedule === scheme.name).map(w => w.id) : []
  );
  const [openSections, setOpenSections] = useState({ jornada: true, tolerances: true, days: true, vigencia: true, workers: false });

  const lunchMin = timeToMinutes(form.returnLunch) - timeToMinutes(form.exitLunch);
  const workMin = timeToMinutes(form.exitLunch) - timeToMinutes(form.entryTime)
    + timeToMinutes(form.exitTime) - timeToMinutes(form.returnLunch);

  function toggleDay(d: string) {
    setForm(f => ({
      ...f,
      days: f.days.includes(d) ? f.days.filter(x => x !== d) : [...f.days, d],
    }));
  }

  const searchResults = workerSearch.length > 1
    ? WORKERS.filter(w =>
        w.name.toLowerCase().includes(workerSearch.toLowerCase()) && !assignedWorkers.includes(w.id)
      ).slice(0, 4)
    : [];

  const isMobile = window.innerWidth < 1024;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-40" style={{ background: "rgba(0,0,0,0.4)" }} onClick={onClose} />

      {/* Panel */}
      <div
        className={`fixed z-50 flex flex-col ${isMobile ? "inset-0" : "top-0 right-0 bottom-0"}`}
        style={{
          width: isMobile ? "100%" : 480,
          background: "#FFFFFF",
          boxShadow: "-8px 0 32px rgba(0,0,0,0.12)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ borderColor: "#EAECF0" }}>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="flex-1 text-lg font-bold bg-transparent outline-none min-w-0"
              style={{ color: "#111827" }}
            />
          </div>
          <div className="flex items-center gap-3 flex-shrink-0 ml-3">
            <Switch checked={form.active} onChange={v => setForm(f => ({ ...f, active: v }))} />
            <button onClick={onClose} className="p-2 rounded-lg" style={{ background: "#F7F8FA" }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 4l8 8M12 4l-8 8" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-6">
          {/* Jornada */}
          <Section
            title="Jornada"
            open={openSections.jornada}
            onToggle={() => setOpenSections(s => ({ ...s, jornada: !s.jornada }))}
          >
            <div className="grid grid-cols-2 gap-3 mt-3">
              {[
                { label: "Ingreso", icon: "→", key: "entryTime" as const },
                { label: "Salida almuerzo", icon: "↑", key: "exitLunch" as const },
                { label: "Retorno almuerzo", icon: "↓", key: "returnLunch" as const },
                { label: "Salida", icon: "←", key: "exitTime" as const },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs font-medium block mb-1" style={{ color: "#8B8FA3" }}>
                    <span className="mr-1">{f.icon}</span>{f.label}
                  </label>
                  <input
                    type="time"
                    value={(form as any)[f.key]}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    className="w-full rounded-xl px-3 py-2.5 text-sm border outline-none font-mono tabular"
                    style={{ background: "#F7F8FA", borderColor: "#EAECF0", color: "#111827" }}
                  />
                </div>
              ))}
            </div>

            {/* Timeline */}
            <div className="mt-4 rounded-xl p-3" style={{ background: "#F7F8FA" }}>
              <TimelineBar
                entry={form.entryTime}
                exitLunch={form.exitLunch}
                returnLunch={form.returnLunch}
                exitTime={form.exitTime}
                tolerances={form.tolerances}
              />
            </div>

            {/* Calculated */}
            <div className="grid grid-cols-2 gap-3 mt-3">
              {[
                { label: "Almuerzo asignado", value: `${lunchMin} min` },
                { label: "Jornada efectiva", value: formatDuration(workMin) },
              ].map(c => (
                <div key={c.label} className="rounded-xl px-4 py-3" style={{ background: "#F7F8FA" }}>
                  <p className="text-xs" style={{ color: "#8B8FA3" }}>{c.label}</p>
                  <p className="font-mono font-semibold text-sm tabular mt-0.5" style={{ color: "#111827" }}>{c.value}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* Tolerances */}
          <Section
            title="Tolerancias"
            open={openSections.tolerances}
            onToggle={() => setOpenSections(s => ({ ...s, tolerances: !s.tolerances }))}
          >
            <div className="space-y-4 mt-3">
              {[
                { key: "entry" as const, label: "Tolerancia de ingreso", help: "Después de este margen se cuenta tardanza" },
                { key: "return" as const, label: "Tolerancia de retorno", help: "Margen adicional sobre el almuerzo asignado" },
                { key: "earlyExit" as const, label: "Tolerancia de salida anticipada", help: "" },
                { key: "incomplete" as const, label: "Umbral de sesión incompleta", help: "Si no marca retorno en este tiempo, la sesión se cierra automáticamente" },
              ].map(t => (
                <div key={t.key} className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium" style={{ color: "#111827" }}>{t.label}</p>
                    {t.help && <p className="text-xs mt-0.5" style={{ color: "#8B8FA3" }}>{t.help}</p>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Stepper
                      value={form.tolerances[t.key]}
                      onChange={v => setForm(f => ({ ...f, tolerances: { ...f.tolerances, [t.key]: v } }))}
                    />
                    <span className="text-xs" style={{ color: "#8B8FA3" }}>min</span>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Days */}
          <Section
            title="Días aplicables"
            open={openSections.days}
            onToggle={() => setOpenSections(s => ({ ...s, days: !s.days }))}
          >
            <div className="flex gap-2 mt-3 flex-wrap">
              {ALL_DAYS.map(d => (
                <button
                  key={d}
                  onClick={() => toggleDay(d)}
                  className="w-10 h-10 rounded-lg text-sm font-semibold transition-colors"
                  style={{
                    background: form.days.includes(d) ? "#1D6FD8" : "#F7F8FA",
                    color: form.days.includes(d) ? "white" : "#374151",
                    border: `1px solid ${form.days.includes(d) ? "#1D6FD8" : "#EAECF0"}`,
                  }}
                >
                  {d}
                </button>
              ))}
            </div>

            {form.days.includes("S") && (
              <div className="mt-4">
                <label className="text-xs font-medium block mb-2" style={{ color: "#8B8FA3" }}>Sábado</label>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { v: "full", label: "Jornada completa" },
                    { v: "half", label: "Media jornada" },
                    { v: "no", label: "No labora" },
                  ].map(opt => (
                    <button
                      key={opt.v}
                      onClick={() => setForm(f => ({ ...f, saturday: opt.v as any }))}
                      className="px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                      style={{
                        background: form.saturday === opt.v ? "#1D6FD8" : "#F7F8FA",
                        color: form.saturday === opt.v ? "white" : "#374151",
                        border: `1px solid ${form.saturday === opt.v ? "#1D6FD8" : "#EAECF0"}`,
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {form.saturday === "half" && (
                  <div className="mt-3">
                    <label className="text-xs font-medium block mb-1" style={{ color: "#8B8FA3" }}>Hora de salida (sábado)</label>
                    <input
                      type="time"
                      value={form.saturdayExit}
                      onChange={e => setForm(f => ({ ...f, saturdayExit: e.target.value }))}
                      className="rounded-xl px-3 py-2.5 text-sm border outline-none font-mono tabular"
                      style={{ background: "#F7F8FA", borderColor: "#EAECF0", color: "#111827" }}
                    />
                  </div>
                )}
              </div>
            )}
          </Section>

          {/* Vigencia */}
          <Section
            title="Vigencia"
            open={openSections.vigencia}
            onToggle={() => setOpenSections(s => ({ ...s, vigencia: !s.vigencia }))}
          >
            <div className="mt-3">
              <label className="text-xs font-medium block mb-1.5" style={{ color: "#8B8FA3" }}>Aplica desde</label>
              <input
                type="date"
                value={form.since}
                onChange={e => setForm(f => ({ ...f, since: e.target.value }))}
                className="rounded-xl px-4 py-3 text-sm border outline-none font-mono"
                style={{ background: "#F7F8FA", borderColor: "#EAECF0", color: "#111827", minHeight: 48 }}
              />
              <div className="flex items-start gap-2 mt-3 p-3 rounded-xl" style={{ background: "rgba(245,165,36,0.08)", border: "1px solid rgba(245,165,36,0.2)" }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="mt-0.5 flex-shrink-0">
                  <path d="M7 2L13 12H1L7 2z" stroke="#F5A524" strokeWidth="1.2" strokeLinejoin="round" />
                  <path d="M7 6v3M7 10.5h.01" stroke="#F5A524" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                <p className="text-xs" style={{ color: "#92400E" }}>
                  Los cálculos anteriores a esta fecha no se modificarán.
                </p>
              </div>
            </div>
          </Section>

          {/* Workers */}
          <Section
            title={`Trabajadores asignados (${assignedWorkers.length})`}
            open={openSections.workers}
            onToggle={() => setOpenSections(s => ({ ...s, workers: !s.workers }))}
          >
            <div className="mt-3 relative">
              <input
                type="text"
                placeholder="Buscar trabajador..."
                value={workerSearch}
                onChange={e => setWorkerSearch(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm border outline-none"
                style={{ background: "#F7F8FA", borderColor: "#EAECF0", color: "#111827", minHeight: 48 }}
              />
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border z-10 overflow-hidden" style={{ background: "#FFF", borderColor: "#EAECF0", boxShadow: "0 8px 24px rgba(0,0,0,0.1)" }}>
                  {searchResults.map(w => (
                    <button
                      key={w.id}
                      onClick={() => { setAssignedWorkers(a => [...a, w.id]); setWorkerSearch(""); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b last:border-0"
                      style={{ borderColor: "#EAECF0" }}
                    >
                      <img src={w.photo} alt={w.name} className="w-7 h-7 rounded-full object-cover" />
                      <div>
                        <p className="text-sm font-medium" style={{ color: "#111827" }}>{w.name}</p>
                        <p className="text-xs" style={{ color: "#8B8FA3" }}>{w.area}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              {assignedWorkers.map(id => {
                const w = WORKERS.find(x => x.id === id);
                if (!w) return null;
                return (
                  <div key={id} className="flex items-center gap-2 rounded-full pl-1 pr-2 py-1" style={{ background: "#F7F8FA", border: "1px solid #EAECF0" }}>
                    <img src={w.photo} alt={w.name} className="w-6 h-6 rounded-full object-cover" />
                    <span className="text-xs font-medium" style={{ color: "#374151" }}>{w.shortName}</span>
                    <button onClick={() => setAssignedWorkers(a => a.filter(x => x !== id))} className="text-gray-400 hover:text-gray-600">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 2l6 6M8 2L2 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>

            <button
              className="mt-3 text-xs font-medium"
              style={{ color: "#1D6FD8" }}
            >
              + Asignar por área
            </button>
          </Section>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t flex-shrink-0" style={{ borderColor: "#EAECF0", background: "#FFFFFF" }}>
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl text-sm font-medium border transition-colors"
            style={{ borderColor: "#EAECF0", color: "#374151", minHeight: 48 }}
          >
            Cancelar
          </button>
          <button
            onClick={() => { onSave(form); onClose(); }}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-colors"
            style={{ background: "#1D6FD8", minHeight: 48 }}
          >
            Guardar esquema
          </button>
        </div>
      </div>
    </>
  );
}

function Section({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div className="border rounded-xl overflow-hidden" style={{ borderColor: "#EAECF0" }}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3.5 transition-colors"
        style={{ background: open ? "#F7F8FA" : "#FFFFFF" }}
      >
        <p className="text-sm font-semibold" style={{ color: "#111827" }}>{title}</p>
        <svg
          width="16" height="16" viewBox="0 0 16 16" fill="none"
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s", color: "#8B8FA3" }}
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

export default function SchedulesView() {
  const [schedules, setSchedules] = useState(SCHEDULES);
  const [editing, setEditing] = useState<Schedule | null | "new">(null);

  function handleSave(s: Schedule) {
    setSchedules(prev => {
      const idx = prev.findIndex(x => x.id === s.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = s;
        return next;
      }
      return [...prev, s];
    });
  }

  return (
    <div className="p-4 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "#111827" }}>Horarios</h1>
          <p className="text-sm mt-0.5" style={{ color: "#8B8FA3" }}>Esquemas de jornada y tolerancias</p>
        </div>
        <button
          onClick={() => setEditing("new")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: "#1D6FD8" }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 2v10M2 7h10" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Nuevo esquema
        </button>
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block rounded-xl border overflow-hidden" style={{ background: "#FFFFFF", borderColor: "#EAECF0" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "#F7F8FA" }}>
              {["Nombre", "Días", "Horario", "Trabajadores", "Vigente desde", "Estado", ""].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: "#8B8FA3" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {schedules.map(s => (
              <tr key={s.id} className="border-t" style={{ borderColor: "#EAECF0" }}>
                <td className="px-5 py-4">
                  <p className="font-semibold" style={{ color: "#111827" }}>{s.name}</p>
                </td>
                <td className="px-5 py-4">
                  <div className="flex gap-1">
                    {ALL_DAYS.map(d => (
                      <span
                        key={d}
                        className="w-6 h-6 rounded flex items-center justify-center text-xs font-medium"
                        style={{
                          background: s.days.includes(d) ? "#1D6FD8" : "#F7F8FA",
                          color: s.days.includes(d) ? "white" : "#C9CDD6",
                        }}
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-4 font-mono tabular text-xs" style={{ color: "#374151" }}>
                  {s.summary}
                </td>
                <td className="px-5 py-4">
                  <span className="font-mono tabular font-semibold" style={{ color: "#374151" }}>{s.workers}</span>
                </td>
                <td className="px-5 py-4 font-mono tabular text-xs" style={{ color: "#374151" }}>
                  {s.since}
                </td>
                <td className="px-5 py-4">
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{
                      background: s.active ? "rgba(23,178,106,0.1)" : "rgba(139,143,163,0.1)",
                      color: s.active ? "#17B26A" : "#8B8FA3",
                    }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: "currentColor" }} />
                    {s.active ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <button
                    onClick={() => setEditing(s)}
                    className="px-4 py-1.5 rounded-lg text-xs font-medium"
                    style={{ background: "#F7F8FA", color: "#374151", border: "1px solid #EAECF0" }}
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="lg:hidden space-y-3">
        {schedules.map(s => (
          <div key={s.id} className="rounded-xl border p-4" style={{ background: "#FFFFFF", borderColor: "#EAECF0" }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold" style={{ color: "#111827" }}>{s.name}</p>
                <p className="font-mono tabular text-xs mt-0.5" style={{ color: "#8B8FA3" }}>{s.summary}</p>
              </div>
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                style={{
                  background: s.active ? "rgba(23,178,106,0.1)" : "rgba(139,143,163,0.1)",
                  color: s.active ? "#17B26A" : "#8B8FA3",
                }}
              >
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: "currentColor" }} />
                {s.active ? "Activo" : "Inactivo"}
              </span>
            </div>
            <div className="flex gap-1 mt-3">
              {ALL_DAYS.map(d => (
                <span
                  key={d}
                  className="w-7 h-7 rounded flex items-center justify-center text-xs font-medium"
                  style={{
                    background: s.days.includes(d) ? "#1D6FD8" : "#F7F8FA",
                    color: s.days.includes(d) ? "white" : "#C9CDD6",
                  }}
                >
                  {d}
                </span>
              ))}
            </div>
            <div className="flex items-center justify-between mt-3">
              <p className="text-xs" style={{ color: "#8B8FA3" }}>
                <span className="font-mono tabular font-semibold" style={{ color: "#374151" }}>{s.workers}</span> trabajadores · desde {s.since}
              </p>
              <button onClick={() => setEditing(s)} className="text-xs font-medium" style={{ color: "#1D6FD8" }}>
                Editar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Editor panel */}
      {editing !== null && (
        <SchemeEditorPanel
          scheme={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
