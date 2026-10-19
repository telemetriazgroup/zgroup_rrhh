import { useState } from "react";
import { login, type ApiUser } from "../api/client";

interface Props {
  onLogin: (usuario: ApiUser) => void;
  onShowConcept: () => void;
}

export default function Login({ onLogin, onShowConcept }: Props) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const session = await login(user, pass, remember);
      onLogin(session.usuario);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo iniciar sesión.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-full flex flex-col items-center justify-center px-6 py-12"
      style={{ background: "#0F1419" }}
    >
      {/* Logo */}
      <div className="mb-10 flex flex-col items-center gap-3">
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center"
          style={{ background: "#1D6FD8" }}
        >
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect x="2" y="2" width="10" height="10" rx="2" fill="white" fillOpacity="0.9" />
            <rect x="16" y="2" width="10" height="10" rx="2" fill="white" fillOpacity="0.9" />
            <rect x="2" y="16" width="10" height="10" rx="2" fill="white" fillOpacity="0.9" />
            <rect x="18" y="18" width="6" height="6" rx="1" fill="white" />
            <rect x="16" y="16" width="4" height="4" rx="1" fill="white" fillOpacity="0.5" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-white font-semibold text-lg tracking-tight">GaritaControl</p>
          <p className="text-sm mt-0.5" style={{ color: "#8B8FA3" }}>Sistema de control de almuerzo</p>
        </div>
      </div>

      {/* Card */}
      <div
        className="w-full max-w-sm rounded-xl p-6 border"
        style={{ background: "#161C25", borderColor: "rgba(255,255,255,0.08)" }}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wider" style={{ color: "#8B8FA3" }}>
              Usuario
            </label>
            <input
              type="text"
              value={user}
              onChange={e => setUser(e.target.value)}
              placeholder="usuario"
              className="w-full rounded-lg px-4 py-3 text-sm text-white outline-none transition-all"
              style={{
                background: "#0F1419",
                border: "1.5px solid rgba(255,255,255,0.1)",
                minHeight: 48,
              }}
              onFocus={e => (e.target.style.borderColor = "#1D6FD8")}
              onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wider" style={{ color: "#8B8FA3" }}>
              Contraseña
            </label>
            <input
              type="password"
              value={pass}
              onChange={e => setPass(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg px-4 py-3 text-sm text-white outline-none transition-all"
              style={{
                background: "#0F1419",
                border: "1.5px solid rgba(255,255,255,0.1)",
                minHeight: 48,
              }}
              onFocus={e => (e.target.style.borderColor = "#1D6FD8")}
              onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
              required
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer select-none" style={{ minHeight: 48 }}>
            <div
              className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors"
              style={{
                border: `1.5px solid ${remember ? "#1D6FD8" : "rgba(255,255,255,0.2)"}`,
                background: remember ? "#1D6FD8" : "transparent",
              }}
              onClick={() => setRemember(!remember)}
            >
              {remember && (
                <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
                  <path d="M1 4L4 7L10 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span className="text-sm" style={{ color: "#C9CDD6" }}>
              Mantener sesión en este dispositivo
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl font-semibold text-white text-base transition-all"
            style={{
              background: loading ? "#1558AF" : "#1D6FD8",
              minHeight: 52,
              cursor: loading ? "wait" : "pointer",
            }}
          >
            {loading ? "Verificando..." : "Ingresar"}
          </button>
          {error ? (
            <p className="text-sm" style={{ color: "#E5484D" }} role="alert">
              {error}
            </p>
          ) : null}
        </form>
      </div>

      {/* Terminal tag */}
      <button
        type="button"
        onClick={onShowConcept}
        className="mt-6 rounded-xl px-4 text-sm font-semibold"
        style={{ color: "#C9CDD6", background: "#161C25", minHeight: 48, border: "1px solid rgba(255,255,255,0.12)" }}
      >
        Ver funcionamiento conceptual
      </button>
      <p className="mt-4 text-xs" style={{ color: "#8B8FA3" }}>
        La terminal del vigilante se asigna al iniciar sesión.
      </p>
    </div>
  );
}
