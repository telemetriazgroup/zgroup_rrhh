export type ApiRole = "vigilante" | "rrhh_consulta" | "rrhh_admin" | "jefe";

export type ApiUser = {
  id: string;
  username: string;
  nombre: string;
  rol: ApiRole;
  terminalId: string | null;
  terminalNombre: string | null;
};

export type ApiSession = {
  token: string;
  expiraEn: string;
  usuario: ApiUser;
};

const STORAGE_KEY = "garita.sesion";

export function apiBaseUrl(): string {
  const configured = import.meta.env.VITE_API_URL?.replace(/\/$/, "");
  if (import.meta.env.DEV) return "";
  return configured || "http://localhost:18182";
}

export function loadSession(): ApiSession | null {
  const raw = localStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ApiSession;
  } catch {
    return null;
  }
}

export function saveSession(session: ApiSession, persist: boolean): void {
  const raw = JSON.stringify(session);
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
  (persist ? localStorage : sessionStorage).setItem(STORAGE_KEY, raw);
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
}

export async function login(
  username: string,
  password: string,
  mantenerSesion: boolean,
): Promise<ApiSession> {
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl()}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, mantenerSesion }),
    });
  } catch {
    throw new Error("No se pudo conectar con la API.");
  }
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(body?.message ?? "No se pudo iniciar sesión.");
  }
  const session = (await response.json()) as ApiSession;
  saveSession(session, mantenerSesion);
  return session;
}

export async function logout(): Promise<void> {
  const session = loadSession();
  if (session) {
    await fetch(`${apiBaseUrl()}/api/v1/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${session.token}` },
    }).catch(() => undefined);
  }
  clearSession();
}

export async function capturarDocumento(file: File, tipoDocumento: "fotocheck" | "dni"): Promise<unknown> {
  const session = loadSession();
  if (!session) {
    throw new Error("Sesión requerida.");
  }
  const form = new FormData();
  form.append("tipoDocumento", tipoDocumento);
  form.append("imagen", file);
  const response = await fetch(`${apiBaseUrl()}/api/v1/identidad/capturas`, {
    method: "POST",
    headers: { Authorization: `Bearer ${session.token}` },
    body: form,
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message = body && typeof body === "object" && "message" in body ? String(body.message) : "No se pudo capturar el documento.";
    throw new Error(message);
  }
  return body;
}
