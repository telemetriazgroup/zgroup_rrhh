import { useState, useEffect, useRef } from "react";
import { capturarDocumento } from "../api/client";
import { WORKERS, RECENT_SCANS } from "../data/mockData";

type ScanResult =
  | { variant: "exit"; worker: typeof WORKERS[0]; time: string }
  | { variant: "return"; worker: typeof WORKERS[0]; time: string; duration: number; excess: number }
  | { variant: "error"; message: string };

interface Props {
  onLogout: () => void;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function formatTime(d: Date) {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export default function Scanner({ onLogout }: Props) {
  const [now, setNow] = useState(new Date());
  const [scans, setScans] = useState(RECENT_SCANS);
  const [overlay, setOverlay] = useState<ScanResult | null>(null);
  const [inside, setInside] = useState(42);
  const [outside, setOutside] = useState(18);
  const [showManual, setShowManual] = useState(false);
  const [manualId, setManualId] = useState("");
  const [documentType, setDocumentType] = useState<"fotocheck" | "dni">("dni");
  const [captureMessage, setCaptureMessage] = useState("");
  const overlayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  function triggerScan(workerId?: string) {
    const idx = workerId
      ? WORKERS.findIndex(w => w.id === workerId || w.dni === workerId)
      : Math.floor(Math.random() * WORKERS.length);
    if (idx === -1) {
      showOverlay({ variant: "error", message: "QR no válido" });
      return;
    }
    const worker = WORKERS[idx];
    const isExit = Math.random() > 0.5;
    const t = formatTime(now).slice(0, 5);
    let result: ScanResult;
    if (isExit) {
      result = { variant: "exit", worker, time: t };
      setOutside(x => x + 1);
      setInside(x => x - 1);
    } else {
      const dur = 55 + Math.floor(Math.random() * 30);
      const excess = Math.max(0, dur - 60);
      result = { variant: "return", worker, time: t, duration: dur, excess };
      setOutside(x => x - 1);
      setInside(x => x + 1);
    }
    setScans(prev => [
      { workerId: worker.id, type: isExit ? "exit" : "return", time: t, name: worker.shortName },
      ...prev.slice(0, 3),
    ]);
    showOverlay(result);
  }

  async function onDocumentPhoto(file: File | undefined) {
    if (!file) return;
    setCaptureMessage("Enviando la foto a la API...");
    try {
      const result = await capturarDocumento(file, documentType) as {
        estado?: string;
        siguientePaso?: string;
        extraccion?: { nombre?: string | null; apellido?: string | null; dni?: string | null };
      };
      const nombre = [result.extraccion?.nombre, result.extraccion?.apellido].filter(Boolean).join(" ");
      setCaptureMessage(
        nombre
          ? `${nombre}${result.extraccion?.dni ? ` · DNI ${result.extraccion.dni}` : ""} · ${result.estado ?? ""}`
          : result.siguientePaso ?? result.estado ?? "Captura registrada",
      );
    } catch (cause) {
      setCaptureMessage(cause instanceof Error ? cause.message : "No se pudo capturar el documento.");
    }
  }

  function showOverlay(r: ScanResult) {
    if (overlayTimer.current) clearTimeout(overlayTimer.current);
    setOverlay(r);
    overlayTimer.current = setTimeout(() => setOverlay(null), 2400);
  }

  const overlayBg =
    overlay?.variant === "exit"
      ? "#F5A524"
      : overlay?.variant === "return"
      ? "#17B26A"
      : overlay?.variant === "error"
      ? "#E5484D"
      : "transparent";

  return (
    <div className="flex flex-col min-h-full" style={{ background: "#0F1419", color: "white" }}>
      {/* Header */}
      <header
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: "rgba(255,255,255,0.07)", background: "#161C25" }}
      >
        <div>
          <p className="text-xs font-medium" style={{ color: "#8B8FA3" }}>R. Chávez · Garita Principal</p>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#17B26A" }} />
            <span className="text-xs" style={{ color: "#17B26A" }}>Online</span>
          </div>
        </div>

        <div className="font-mono text-2xl font-bold tabular tracking-tighter" style={{ color: "white" }}>
          {formatTime(now)}
        </div>

        <button
          onClick={onLogout}
          className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
          style={{ background: "rgba(255,255,255,0.06)", color: "#8B8FA3", minHeight: 32 }}
        >
          Salir
        </button>
      </header>

      <div className="mx-4 mt-3 flex items-center gap-2">
        <select
          value={documentType}
          onChange={(event) => setDocumentType(event.target.value as "fotocheck" | "dni")}
          className="rounded-lg px-3 text-xs"
          style={{ background: "#161C25", color: "white", minHeight: 48, border: "1px solid rgba(255,255,255,0.12)" }}
        >
          <option value="dni">DNI</option>
          <option value="fotocheck">Fotocheck</option>
        </select>
        <label className="rounded-lg px-3 text-xs font-medium flex items-center" style={{ background: "#1D6FD8", minHeight: 48, cursor: "pointer" }}>
          Foto del documento
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(event) => void onDocumentPhoto(event.target.files?.[0])}
          />
        </label>
      </div>
      {captureMessage ? (
        <p className="mx-4 mt-2 text-xs" style={{ color: "#C9CDD6" }}>{captureMessage}</p>
      ) : null}

      {/* Camera View */}
      <div
        className="relative mx-4 mt-4 rounded-xl overflow-hidden"
        style={{ aspectRatio: "1/1", maxHeight: "62vw", background: "#0A0E13" }}
      >
        {/* Simulated camera feed */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `radial-gradient(circle at 50% 40%, rgba(29,111,216,0.06) 0%, transparent 70%)`,
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg width="200" height="200" viewBox="0 0 200 200" fill="none" opacity="0.15">
              <rect x="10" y="10" width="180" height="180" rx="4" stroke="white" strokeWidth="0.5" strokeDasharray="4 4" />
              <line x1="100" y1="10" x2="100" y2="190" stroke="white" strokeWidth="0.5" />
              <line x1="10" y1="100" x2="190" y2="100" stroke="white" strokeWidth="0.5" />
            </svg>
          </div>
        </div>

        {/* Scan frame */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative" style={{ width: 200, height: 200 }}>
            {/* Corner marks */}
            {[
              { top: 0, left: 0, borderTop: true, borderLeft: true },
              { top: 0, right: 0, borderTop: true, borderRight: true },
              { bottom: 0, left: 0, borderBottom: true, borderLeft: true },
              { bottom: 0, right: 0, borderBottom: true, borderRight: true },
            ].map((c, i) => (
              <div
                key={i}
                className="absolute w-8 h-8"
                style={{
                  top: c.top !== undefined ? c.top : undefined,
                  bottom: (c as any).bottom !== undefined ? (c as any).bottom : undefined,
                  left: c.left !== undefined ? c.left : undefined,
                  right: (c as any).right !== undefined ? (c as any).right : undefined,
                  borderTop: c.borderTop ? "3px solid #1D6FD8" : undefined,
                  borderBottom: (c as any).borderBottom ? "3px solid #1D6FD8" : undefined,
                  borderLeft: c.borderLeft ? "3px solid #1D6FD8" : undefined,
                  borderRight: (c as any).borderRight ? "3px solid #1D6FD8" : undefined,
                }}
              />
            ))}
            {/* Scan line */}
            <div className="absolute left-2 right-2 scan-line" style={{ top: 4 }}>
              <div
                className="h-0.5 rounded-full"
                style={{ background: "linear-gradient(90deg, transparent, #1D6FD8, transparent)" }}
              />
            </div>
          </div>
        </div>

        {/* Tap to scan button */}
        <button
          className="absolute inset-0 w-full h-full flex items-center justify-center"
          onClick={() => triggerScan()}
          style={{ WebkitTapHighlightColor: "transparent" }}
        >
          <div className="relative flex items-center justify-center">
            <div
              className="pulse-ring absolute rounded-full"
              style={{ width: 64, height: 64, background: "rgba(29,111,216,0.2)" }}
            />
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: "rgba(29,111,216,0.25)", border: "1.5px solid rgba(29,111,216,0.5)" }}
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M2 7V4a2 2 0 012-2h3M2 15v3a2 2 0 002 2h3M15 2h3a2 2 0 012 2v3M15 20h3a2 2 0 002-2v-3" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                <rect x="6" y="6" width="4" height="4" rx="1" stroke="white" strokeWidth="1.5" />
                <rect x="12" y="6" width="4" height="4" rx="1" stroke="white" strokeWidth="1.5" />
                <rect x="6" y="12" width="4" height="4" rx="1" stroke="white" strokeWidth="1.5" />
                <rect x="13" y="13" width="2" height="2" rx="0.5" fill="white" />
              </svg>
            </div>
          </div>
        </button>
      </div>

      {/* Counter */}
      <div className="flex items-center justify-center gap-6 mt-3 px-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: "#F5A524" }} />
          <span className="font-mono text-xl font-bold tabular" style={{ color: "#F5A524" }}>
            {String(outside).padStart(2, "0")}
          </span>
          <span className="text-xs" style={{ color: "#8B8FA3" }}>fuera</span>
        </div>
        <div className="w-px h-6" style={{ background: "rgba(255,255,255,0.1)" }} />
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: "#17B26A" }} />
          <span className="font-mono text-xl font-bold tabular" style={{ color: "#17B26A" }}>
            {String(inside).padStart(2, "0")}
          </span>
          <span className="text-xs" style={{ color: "#8B8FA3" }}>dentro</span>
        </div>
      </div>

      {/* Recent scans strip */}
      <div className="mt-3 px-4">
        <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "#8B8FA3" }}>
          Recientes
        </p>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
          {scans.map((s, i) => {
            const w = WORKERS.find(x => x.id === s.workerId);
            return (
              <div
                key={i}
                className="flex-shrink-0 flex items-center gap-2.5 rounded-xl px-3 py-2.5"
                style={{
                  background: "#161C25",
                  border: "1px solid rgba(255,255,255,0.07)",
                  minWidth: 140,
                }}
              >
                <img
                  src={w?.photo}
                  alt={s.name}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  style={{ border: `2px solid ${s.type === "exit" ? "#F5A524" : "#17B26A"}` }}
                />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-white truncate">{s.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="font-mono text-xs tabular" style={{ color: "#8B8FA3" }}>
                      {s.time}
                    </span>
                    <svg
                      width="10" height="10" viewBox="0 0 10 10" fill="none"
                      style={{ transform: s.type === "exit" ? "none" : "scaleX(-1)" }}
                    >
                      <path d="M2 5h6M6 3l2 2-2 2" stroke={s.type === "exit" ? "#F5A524" : "#17B26A"} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Manual search */}
      <div className="px-4 mt-3 mb-4">
        <button
          className="w-full rounded-xl py-3 text-sm font-medium transition-colors"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#C9CDD6",
            minHeight: 48,
          }}
          onClick={() => setShowManual(!showManual)}
        >
          {showManual ? "Cerrar búsqueda" : "🔍 Búsqueda manual"}
        </button>
        {showManual && (
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              placeholder="DNI o ID de trabajador"
              value={manualId}
              onChange={e => setManualId(e.target.value)}
              className="flex-1 rounded-xl px-4 py-3 text-sm text-white outline-none"
              style={{
                background: "#161C25",
                border: "1px solid rgba(255,255,255,0.1)",
                minHeight: 48,
              }}
            />
            <button
              onClick={() => { triggerScan(manualId); setManualId(""); setShowManual(false); }}
              className="px-5 rounded-xl font-medium text-sm text-white"
              style={{ background: "#1D6FD8", minHeight: 48 }}
            >
              OK
            </button>
          </div>
        )}
      </div>

      {/* Overlay */}
      {overlay && (
        <div
          className="fixed inset-0 flex items-center justify-center fade-in z-50"
          style={{ background: overlayBg }}
        >
          {overlay.variant === "exit" && (
            <ExitOverlay worker={overlay.worker} time={overlay.time} />
          )}
          {overlay.variant === "return" && (
            <ReturnOverlay worker={overlay.worker} time={overlay.time} duration={overlay.duration} excess={overlay.excess} />
          )}
          {overlay.variant === "error" && (
            <ErrorOverlay message={overlay.message} />
          )}
        </div>
      )}
    </div>
  );
}

function ExitOverlay({ worker, time }: { worker: typeof WORKERS[0]; time: string }) {
  return (
    <div className="flex flex-col items-center gap-4 px-8 text-white text-center">
      <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.2)" }}>
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path d="M8 16h16M20 10l6 6-6 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <img src={worker.photo} alt={worker.name} className="w-24 h-24 rounded-full object-cover border-4 border-white border-opacity-40" />
      <div>
        <p className="text-3xl font-bold tracking-tight">{worker.name}</p>
        <p className="text-lg opacity-80 mt-1">{worker.area}</p>
      </div>
      <div className="rounded-xl px-6 py-3" style={{ background: "rgba(0,0,0,0.2)" }}>
        <p className="text-sm opacity-70 uppercase tracking-wider">Salida</p>
        <p className="font-mono text-3xl font-bold tabular mt-0.5">{time}</p>
      </div>
    </div>
  );
}

function ReturnOverlay({ worker, time, duration, excess }: { worker: typeof WORKERS[0]; time: string; duration: number; excess: number }) {
  return (
    <div className="flex flex-col items-center gap-4 px-8 text-white text-center">
      <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.2)" }}>
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path d="M24 16H8M12 10L6 16l6 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <img src={worker.photo} alt={worker.name} className="w-24 h-24 rounded-full object-cover border-4 border-white border-opacity-40" />
      <div>
        <p className="text-3xl font-bold tracking-tight">{worker.name}</p>
        <p className="text-lg opacity-80 mt-1">{worker.area}</p>
      </div>
      <div className="rounded-xl px-6 py-3" style={{ background: "rgba(0,0,0,0.2)" }}>
        <p className="text-sm opacity-70 uppercase tracking-wider">Retorno</p>
        <p className="font-mono text-3xl font-bold tabular mt-0.5">{time}</p>
      </div>
      <div
        className="rounded-xl px-6 py-2.5 text-sm font-medium"
        style={{ background: excess > 0 ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.2)" }}
      >
        {duration} min ·{" "}
        {excess > 0 ? (
          <span className="font-semibold">{excess} min de exceso</span>
        ) : (
          <span>dentro de tolerancia</span>
        )}
      </div>
    </div>
  );
}

function ErrorOverlay({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-4 px-8 text-white text-center">
      <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.25)" }}>
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <path d="M18 12v8M18 24h.01" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="18" cy="18" r="15" stroke="white" strokeWidth="2.5" />
        </svg>
      </div>
      <p className="text-4xl font-bold">Error</p>
      <p className="text-xl opacity-80">{message}</p>
    </div>
  );
}
