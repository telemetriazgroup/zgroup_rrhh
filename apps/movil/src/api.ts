const base = import.meta.env.VITE_API_URL ?? "http://localhost:18182";
const key = "garita.movil.sesion";

export type Usuario = {
  nombre: string;
  rol: string;
  terminalNombre: string | null;
};

type Session = { token: string; usuario: Usuario };

export function loadSession(): Session | null {
  const raw = sessionStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export async function login(username: string, password: string): Promise<Session> {
  const response = await fetch(`${base}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, mantenerSesion: false }),
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.message ?? "No se pudo iniciar sesión.");
  }
  sessionStorage.setItem(key, JSON.stringify(body));
  return body as Session;
}

export async function logout(): Promise<void> {
  const session = loadSession();
  if (session) {
    await fetch(`${base}/api/v1/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${session.token}` },
    }).catch(() => undefined);
  }
  sessionStorage.removeItem(key);
}

export async function capturar(file: File, tipoDocumento: "fotocheck" | "dni"): Promise<unknown> {
  const session = loadSession();
  if (!session) throw new Error("Sesión requerida.");
  const form = new FormData();
  form.append("tipoDocumento", tipoDocumento);
  form.append("imagen", file);
  const response = await fetch(`${base}/api/v1/identidad/capturas`, {
    method: "POST",
    headers: { Authorization: `Bearer ${session.token}` },
    body: form,
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.message ?? "No se pudo capturar el documento.");
  }
  return body;
}
