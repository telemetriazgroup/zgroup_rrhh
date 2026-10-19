import { useState, useRef } from "react";
import type { Worker } from "../../data/mockData";
import { SCHEDULES, AREAS, TERMINALS } from "../../data/mockData";

interface Props {
  workers: Worker[];
  onSave: (w: Worker) => void;
  onDelete: (id: string) => void;
  onSendToException: (id: string) => void;
  onToggleFlow: (id: string) => void;
  onNavigateToExceptions: () => void;
}

const BLANK: Omit<Worker, "id"> = {
  nombre: "",
  apellido: "",
  shortName: "",
  area: AREAS[0],
  cargo: "",
  dni: "",
  telefono: "",
  email: "",
  fechaIngreso: new Date().toISOString().slice(0, 10),
  photo: "",
  status: "active",
  schedule: "Administrativo",
  terminal: "Garita Principal",
  inControlFlow: true,
};

function WorkerFormPanel({
  worker,
  onClose,
  onSave,
}: {
  worker: Worker | null;
  onClose: () => void;
  onSave: (w: Worker) => void;
}) {
  const isNew = !worker;
  const [form, setForm] = useState<Omit<Worker, "id">>(
    worker ? { ...worker } : { ...BLANK }
  );
  const [photoPreview, setPhotoPreview] = useState(worker?.photo ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof typeof form>(key: K, val: (typeof form)[K]) {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => { const n = { ...e }; delete n[key as string]; return n; });
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.nombre.trim()) e.nombre = "Requerido";
    if (!form.apellido.trim()) e.apellido = "Requerido";
    if (!/^\d{8}$/.test(form.dni)) e.dni = "DNI debe tener 8 dígitos";
    if (!form.cargo.trim()) e.cargo = "Requerido";
    return e;
  }

  function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    const fullName = `${form.nombre} ${form.apellido}`;
    onSave({
      ...form,
      id: worker?.id ?? `W${Date.now()}`,
      name: fullName,
      shortName: `${form.nombre[0]}. ${form.apellido}`,
      photo: photoPreview || `https://ui-avatars.com/api/?name=${form.nombre}+${form.apellido}&background=1D6FD8&color=fff&size=80`,
    } as Worker);
    onClose();
  }

  function handlePhotoUrl(url: string) {
    setPhotoPreview(url);
    set("photo", url);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const url = ev.target?.result as string;
      setPhotoPreview(url);
      set("photo", url);
    };
    reader.readAsDataURL(file);
  }

  const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;

  return (
    <>
      <div className="fixed inset-0 z-40" style={{ background: "rgba(0,0,0,0.45)" }} onClick={onClose} />
      <div
        className={`fixed z-50 flex flex-col ${isMobile ? "inset-0" : "top-0 right-0 bottom-0"}`}
        style={{ width: isMobile ? "100%" : 500, background: "#FFFFFF", boxShadow: "-8px 0 32px rgba(0,0,0,0.12)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ borderColor: "#EAECF0" }}>
          <p className="text-lg font-bold" style={{ color: "#111827" }}>
            {isNew ? "Nuevo trabajador" : "Editar perfil"}
          </p>
          <button onClick={onClose} className="p-2 rounded-lg" style={{ background: "#F7F8FA" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-6">
          {/* Photo */}
          <div>
            <label className="text-xs font-medium uppercase tracking-wider block mb-3" style={{ color: "#8B8FA3" }}>Foto</label>
            <div className="flex items-center gap-4">
              <div
                className="w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
                style={{ background: "#F7F8FA", border: "2px dashed #EAECF0" }}
              >
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <circle cx="14" cy="11" r="5" stroke="#C9CDD6" strokeWidth="1.5" />
                    <path d="M4 24c0-5.523 4.477-8 10-8s10 2.477 10 8" stroke="#C9CDD6" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full py-2 rounded-xl text-sm font-medium border transition-colors"
                  style={{ borderColor: "#EAECF0", color: "#374151" }}
                >
                  Subir imagen
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                <input
                  type="url"
                  placeholder="o pegar URL de foto..."
                  value={form.photo.startsWith("data:") ? "" : form.photo}
                  onChange={e => handlePhotoUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs border outline-none"
                  style={{ background: "#F7F8FA", borderColor: "#EAECF0", color: "#374151" }}
                />
              </div>
            </div>
          </div>

          {/* Nombre / Apellido */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nombre *" error={errors.nombre}>
              <input
                value={form.nombre}
                onChange={e => set("nombre", e.target.value)}
                placeholder="Carlos"
                className={inputCls(!!errors.nombre)}
                style={inputStyle}
              />
            </Field>
            <Field label="Apellido *" error={errors.apellido}>
              <input
                value={form.apellido}
                onChange={e => set("apellido", e.target.value)}
                placeholder="Mendoza"
                className={inputCls(!!errors.apellido)}
                style={inputStyle}
              />
            </Field>
          </div>

          {/* DNI */}
          <Field label="DNI *" error={errors.dni}>
            <input
              value={form.dni}
              onChange={e => set("dni", e.target.value.replace(/\D/g, "").slice(0, 8))}
              placeholder="12345678"
              className={inputCls(!!errors.dni) + " font-mono tabular"}
              style={inputStyle}
              maxLength={8}
            />
          </Field>

          {/* Cargo */}
          <Field label="Cargo *" error={errors.cargo}>
            <input
              value={form.cargo}
              onChange={e => set("cargo", e.target.value)}
              placeholder="Operario de línea"
              className={inputCls(!!errors.cargo)}
              style={inputStyle}
            />
          </Field>

          {/* Área */}
          <Field label="Área de trabajo">
            <select
              value={form.area}
              onChange={e => set("area", e.target.value)}
              className={inputCls(false)}
              style={inputStyle}
            >
              {AREAS.map(a => <option key={a}>{a}</option>)}
            </select>
          </Field>

          {/* Teléfono / Email */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Teléfono">
              <input
                value={form.telefono}
                onChange={e => set("telefono", e.target.value)}
                placeholder="987 654 321"
                className={inputCls(false) + " font-mono tabular"}
                style={inputStyle}
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                value={form.email}
                onChange={e => set("email", e.target.value)}
                placeholder="nombre@empresa.pe"
                className={inputCls(false)}
                style={inputStyle}
              />
            </Field>
          </div>

          {/* Fecha ingreso */}
          <Field label="Fecha de ingreso">
            <input
              type="date"
              value={form.fechaIngreso}
              onChange={e => set("fechaIngreso", e.target.value)}
              className={inputCls(false) + " font-mono tabular"}
              style={inputStyle}
            />
          </Field>

          {/* Esquema / Terminal */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Esquema de horario">
              <select
                value={form.schedule}
                onChange={e => set("schedule", e.target.value)}
                className={inputCls(false)}
                style={inputStyle}
              >
                {SCHEDULES.filter(s => s.active).map(s => (
                  <option key={s.id}>{s.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Terminal asignado">
              <select
                value={form.terminal}
                onChange={e => set("terminal", e.target.value)}
                className={inputCls(false)}
                style={inputStyle}
              >
                {TERMINALS.map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
          </div>

          {/* Estado fotocheck */}
          <div className="flex items-center justify-between p-4 rounded-xl border" style={{ borderColor: "#EAECF0", background: "#F7F8FA" }}>
            <div>
              <p className="text-sm font-medium" style={{ color: "#111827" }}>Fotocheck activo</p>
              <p className="text-xs mt-0.5" style={{ color: "#8B8FA3" }}>Permite escanear en garita</p>
            </div>
            <ToggleSwitch checked={form.status === "active"} onChange={v => set("status", v ? "active" : "inactive")} />
          </div>

          {/* Flujo de control */}
          <div className="flex items-center justify-between p-4 rounded-xl border" style={{ borderColor: "#EAECF0", background: "#F7F8FA" }}>
            <div>
              <p className="text-sm font-medium" style={{ color: "#111827" }}>Incluir en flujo de control</p>
              <p className="text-xs mt-0.5" style={{ color: "#8B8FA3" }}>Aparece en el contador de garita</p>
            </div>
            <ToggleSwitch checked={form.inControlFlow} onChange={v => set("inControlFlow", v)} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t flex-shrink-0" style={{ borderColor: "#EAECF0" }}>
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl text-sm font-medium border"
            style={{ borderColor: "#EAECF0", color: "#374151", minHeight: 48 }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-white"
            style={{ background: "#1D6FD8", minHeight: 48 }}
          >
            {isNew ? "Crear trabajador" : "Guardar cambios"}
          </button>
        </div>
      </div>
    </>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium uppercase tracking-wider block mb-1.5" style={{ color: "#8B8FA3" }}>
        {label}
      </label>
      {children}
      {error && <p className="text-xs mt-1" style={{ color: "#E5484D" }}>{error}</p>}
    </div>
  );
}

function inputCls(hasError: boolean) {
  return `w-full rounded-xl px-4 py-2.5 text-sm border outline-none transition-colors ${hasError ? "border-red-400" : ""}`;
}
const inputStyle = { background: "#F7F8FA", borderColor: "#EAECF0", color: "#111827", minHeight: 44 };

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="relative flex-shrink-0"
      style={{ width: 44, height: 24 }}
    >
      <div
        className="absolute inset-0 rounded-full transition-colors"
        style={{ background: checked ? "#1D6FD8" : "#D1D5DB" }}
      />
      <div
        className="absolute top-1 rounded-full transition-all"
        style={{ width: 16, height: 16, background: "white", left: checked ? 24 : 4, boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }}
      />
    </button>
  );
}

export default function RecordsView({ workers, onSave, onDelete, onSendToException, onToggleFlow, onNavigateToExceptions }: Props) {
  const [search, setSearch] = useState("");
  const [areaFilter, setAreaFilter] = useState("Todas");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [editing, setEditing] = useState<Worker | null | "new">(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  }

  const filtered = workers.filter(w => {
    const fullName = `${w.nombre} ${w.apellido}`.toLowerCase();
    const matchSearch = !search || fullName.includes(search.toLowerCase()) || w.dni.includes(search);
    const matchArea = areaFilter === "Todas" || w.area === areaFilter;
    const matchStatus = statusFilter === "Todos" || (statusFilter === "Activos" ? w.status === "active" : w.status === "inactive");
    return matchSearch && matchArea && matchStatus;
  });

  const uniqueAreas = ["Todas", ...Array.from(new Set(workers.map(w => w.area)))];

  return (
    <div className="p-4 lg:p-8">
      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl text-sm font-medium text-white shadow-lg fade-in"
          style={{ background: "#111827" }}
        >
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "#111827" }}>Registros de trabajadores</h1>
          <p className="text-sm mt-0.5" style={{ color: "#8B8FA3" }}>
            <span className="font-mono tabular font-semibold" style={{ color: "#111827" }}>{workers.length}</span> perfiles ·{" "}
            <span className="font-mono tabular font-semibold" style={{ color: "#17B26A" }}>
              {workers.filter(w => w.status === "active").length}
            </span> activos
          </p>
        </div>
        <button
          onClick={() => setEditing("new")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: "#1D6FD8" }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 2v10M2 7h10" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Nuevo trabajador
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-48">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <circle cx="7" cy="7" r="4.5" stroke="#8B8FA3" strokeWidth="1.3" />
            <path d="M10.5 10.5L13 13" stroke="#8B8FA3" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por nombre o DNI..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm border outline-none"
            style={{ background: "#FFFFFF", borderColor: "#EAECF0", color: "#111827" }}
          />
        </div>
        <select
          value={areaFilter}
          onChange={e => setAreaFilter(e.target.value)}
          className="rounded-xl px-3 py-2.5 text-sm border outline-none"
          style={{ background: "#FFFFFF", borderColor: "#EAECF0", color: "#374151" }}
        >
          {uniqueAreas.map(a => <option key={a}>{a}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="rounded-xl px-3 py-2.5 text-sm border outline-none"
          style={{ background: "#FFFFFF", borderColor: "#EAECF0", color: "#374151" }}
        >
          {["Todos", "Activos", "Inactivos"].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" style={{ background: "#FFFFFF", borderColor: "#EAECF0" }}>
        {/* Desktop */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "#F7F8FA" }}>
                {["Trabajador", "DNI", "Área / Cargo", "Esquema", "Terminal", "Estado", "Flujo", "Acciones"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap" style={{ color: "#8B8FA3" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-sm" style={{ color: "#8B8FA3" }}>
                    No hay trabajadores que coincidan con los filtros.
                  </td>
                </tr>
              )}
              {filtered.map(w => (
                <tr key={w.id} className="border-t transition-colors hover:bg-gray-50" style={{ borderColor: "#EAECF0" }}>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <img src={w.photo} alt={`${w.nombre} ${w.apellido}`} className="w-9 h-9 rounded-xl object-cover flex-shrink-0" />
                      <div>
                        <p className="font-semibold" style={{ color: "#111827" }}>{w.nombre} {w.apellido}</p>
                        <p className="text-xs" style={{ color: "#8B8FA3" }}>{w.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-mono tabular text-xs whitespace-nowrap" style={{ color: "#374151" }}>
                    {w.dni}
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-sm" style={{ color: "#374151" }}>{w.area}</p>
                    <p className="text-xs" style={{ color: "#8B8FA3" }}>{w.cargo}</p>
                  </td>
                  <td className="px-4 py-3.5 text-xs whitespace-nowrap" style={{ color: "#374151" }}>{w.schedule}</td>
                  <td className="px-4 py-3.5 text-xs whitespace-nowrap" style={{ color: "#374151" }}>{w.terminal}</td>
                  <td className="px-4 py-3.5">
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                      style={{
                        background: w.status === "active" ? "rgba(23,178,106,0.1)" : "rgba(139,143,163,0.1)",
                        color: w.status === "active" ? "#17B26A" : "#8B8FA3",
                      }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: "currentColor" }} />
                      {w.status === "active" ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <button onClick={() => onToggleFlow(w.id)}>
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                        style={{
                          background: w.inControlFlow ? "rgba(29,111,216,0.1)" : "rgba(139,143,163,0.08)",
                          color: w.inControlFlow ? "#1D6FD8" : "#8B8FA3",
                        }}
                      >
                        {w.inControlFlow ? "✓ En flujo" : "Fuera"}
                      </span>
                    </button>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setEditing(w)}
                        title="Editar perfil"
                        className="p-1.5 rounded-lg transition-colors hover:bg-blue-50"
                        style={{ color: "#1D6FD8" }}
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M9.5 2.5l2 2-7 7H2.5v-2l7-7z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          onSendToException(w.id);
                          showToast(`${w.nombre} ${w.apellido} enviado a Excepciones`);
                          onNavigateToExceptions();
                        }}
                        title="Enviar a Excepciones"
                        className="p-1.5 rounded-lg transition-colors hover:bg-amber-50"
                        style={{ color: "#F5A524" }}
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M7 2L13 12H1L7 2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                          <path d="M7 6v3M7 10.5h.01" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setConfirmDelete(w.id)}
                        title="Eliminar"
                        className="p-1.5 rounded-lg transition-colors hover:bg-red-50"
                        style={{ color: "#E5484D" }}
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M2 3.5h10M5.5 3.5V2h3v1.5M5.5 6v4M8.5 6v4M3 3.5l.7 8h6.6l.7-8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="lg:hidden divide-y" style={{ borderColor: "#EAECF0" }}>
          {filtered.length === 0 && (
            <p className="px-5 py-10 text-center text-sm" style={{ color: "#8B8FA3" }}>Sin resultados</p>
          )}
          {filtered.map(w => (
            <div key={w.id} className="p-4">
              <div className="flex items-start gap-3">
                <img src={w.photo} alt={`${w.nombre} ${w.apellido}`} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold" style={{ color: "#111827" }}>{w.nombre} {w.apellido}</p>
                      <p className="text-xs mt-0.5" style={{ color: "#8B8FA3" }}>{w.cargo} · {w.area}</p>
                    </div>
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0"
                      style={{ background: w.status === "active" ? "rgba(23,178,106,0.1)" : "rgba(139,143,163,0.1)", color: w.status === "active" ? "#17B26A" : "#8B8FA3" }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: "currentColor" }} />
                      {w.status === "active" ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                  <p className="font-mono tabular text-xs mt-1" style={{ color: "#8B8FA3" }}>DNI: {w.dni}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setEditing(w)}
                  className="flex-1 py-2 rounded-lg text-xs font-medium border"
                  style={{ borderColor: "#EAECF0", color: "#374151" }}
                >
                  Editar
                </button>
                <button
                  onClick={() => { onSendToException(w.id); showToast(`${w.nombre} ${w.apellido} enviado a Excepciones`); onNavigateToExceptions(); }}
                  className="flex-1 py-2 rounded-lg text-xs font-medium"
                  style={{ background: "rgba(245,165,36,0.1)", color: "#F5A524" }}
                >
                  → Excepciones
                </button>
                <button
                  onClick={() => onToggleFlow(w.id)}
                  className="flex-1 py-2 rounded-lg text-xs font-medium"
                  style={{ background: w.inControlFlow ? "rgba(29,111,216,0.08)" : "rgba(139,143,163,0.08)", color: w.inControlFlow ? "#1D6FD8" : "#8B8FA3" }}
                >
                  {w.inControlFlow ? "En flujo" : "Fuera"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Worker form panel */}
      {editing !== null && (
        <WorkerFormPanel
          worker={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSave={onSave}
        />
      )}

      {/* Delete confirm */}
      {confirmDelete && (() => {
        const w = workers.find(x => x.id === confirmDelete);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }}>
            <div className="rounded-2xl border p-6 w-full max-w-sm mx-4" style={{ background: "#FFFFFF", borderColor: "#EAECF0" }}>
              <h3 className="font-bold text-lg mb-2" style={{ color: "#111827" }}>Eliminar trabajador</h3>
              <p className="text-sm mb-5" style={{ color: "#8B8FA3" }}>
                ¿Eliminar el perfil de <strong>{w?.nombre} {w?.apellido}</strong>? Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium border"
                  style={{ borderColor: "#EAECF0", color: "#374151" }}
                >
                  Cancelar
                </button>
                <button
                  onClick={() => { onDelete(confirmDelete); setConfirmDelete(null); showToast("Perfil eliminado"); }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
                  style={{ background: "#E5484D" }}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
