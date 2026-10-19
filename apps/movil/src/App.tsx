import { useState, type FormEvent } from "react";
import { capturar, loadSession, login, logout, type Usuario } from "./api";

export default function App() {
  const [usuario, setUsuario] = useState<Usuario | null>(loadSession()?.usuario ?? null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [tipo, setTipo] = useState<"fotocheck" | "dni">("dni");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function onLogin(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const session = await login(username, password);
      setUsuario(session.usuario);
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "No se pudo iniciar sesión.");
    } finally {
      setBusy(false);
    }
  }

  async function onCapture(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setMessage("");
    try {
      const result = await capturar(file, tipo);
      setMessage(JSON.stringify(result, null, 2));
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "No se pudo capturar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ fontFamily: "Inter, system-ui, sans-serif", maxWidth: 420, margin: "0 auto", padding: 24 }}>
      <p style={{ margin: 0, color: "#8B8FA3" }}>GaritaControl móvil</p>
      <h1 style={{ fontSize: 22 }}>Misma API que la web</h1>
      {usuario ? (
        <section>
          <p>{usuario.nombre} · {usuario.rol}{usuario.terminalNombre ? ` · ${usuario.terminalNombre}` : ""}</p>
          <label>
            Documento
            <select value={tipo} onChange={(event) => setTipo(event.target.value as "fotocheck" | "dni")} style={{ marginLeft: 8, minHeight: 48 }}>
              <option value="dni">DNI</option>
              <option value="fotocheck">Fotocheck</option>
            </select>
          </label>
          <div style={{ marginTop: 16 }}>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={busy}
              onChange={(event) => void onCapture(event.target.files?.[0])}
            />
          </div>
          <button type="button" onClick={() => void logout().then(() => setUsuario(null))} style={{ marginTop: 16, minHeight: 48 }}>
            Cerrar sesión
          </button>
        </section>
      ) : (
        <form onSubmit={(event) => void onLogin(event)}>
          <label style={{ display: "block", marginBottom: 12 }}>
            Usuario
            <input value={username} onChange={(event) => setUsername(event.target.value)} required style={{ display: "block", width: "100%", minHeight: 48 }} />
          </label>
          <label style={{ display: "block", marginBottom: 12 }}>
            Contraseña
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required style={{ display: "block", width: "100%", minHeight: 48 }} />
          </label>
          <button type="submit" disabled={busy} style={{ minHeight: 48 }}>Ingresar</button>
        </form>
      )}
      {message ? <pre style={{ whiteSpace: "pre-wrap", fontSize: 12 }}>{message}</pre> : null}
    </main>
  );
}
