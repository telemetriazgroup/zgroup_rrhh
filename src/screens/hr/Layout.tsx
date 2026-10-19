import { useState } from "react";
import { WORKERS_INITIAL, EXCEPTIONS } from "../../data/mockData";
import type { Worker } from "../../data/mockData";
import DashboardView from "./DashboardView";
import ExceptionsView from "./ExceptionsView";
import SchedulesView from "./SchedulesView";
import ReportsView from "./ReportsView";
import WorkerDetailView from "./WorkerDetailView";
import RecordsView from "./RecordsView";
import WorkersView from "./WorkersView";

type NavItem = "dashboard" | "records" | "exceptions" | "schedules" | "workers" | "reports";

interface Props {
  onLogout: () => void;
}

const NAV: { id: NavItem; label: string; icon: React.ReactNode }[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/></svg>,
  },
  {
    id: "records",
    label: "Registros",
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 4h10M3 8h10M3 12h6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  },
  {
    id: "exceptions",
    label: "Excepciones",
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2L14 13H2L8 2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M8 7v3M8 11.5h.01" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  },
  {
    id: "schedules",
    label: "Horarios",
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="3.5" width="13" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M5 2v3M11 2v3M1.5 7.5h13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  },
  {
    id: "workers",
    label: "Trabajadores",
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.3"/><path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  },
  {
    id: "reports",
    label: "Reportes",
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="1.5" width="12" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M5 5h6M5 8h6M5 11h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  },
];

export default function HRLayout({ onLogout }: Props) {
  const [active, setActive] = useState<NavItem>("dashboard");
  const [selectedWorker, setSelectedWorker] = useState<string | null>(null);
  const [mobileNav, setMobileNav] = useState(false);

  // Shared worker state — lifted here so Records and Workers see the same list
  const [workers, setWorkers] = useState<Worker[]>(WORKERS_INITIAL);
  const [exceptions, setExceptions] = useState(EXCEPTIONS);

  // Pending exception badge count
  const pendingExceptions = exceptions.length;

  function saveWorker(w: Worker) {
    setWorkers(prev => {
      const idx = prev.findIndex(x => x.id === w.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = w; return next; }
      return [...prev, w];
    });
  }

  function deleteWorker(id: string) {
    setWorkers(prev => prev.filter(w => w.id !== id));
  }

  function sendToException(workerId: string) {
    const w = workers.find(x => x.id === workerId);
    if (!w) return;
    setExceptions(prev => [
      {
        id: `EX${Date.now()}`,
        type: "no_return" as const,
        workerId,
        date: new Date().toISOString().slice(0, 10),
        time: new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" }),
        terminal: w.terminal,
        guard: "Manual RR.HH.",
      },
      ...prev,
    ]);
  }

  function toggleFlow(id: string) {
    setWorkers(prev =>
      prev.map(w => w.id === id ? { ...w, inControlFlow: !w.inControlFlow } : w)
    );
  }

  function navigate(to: NavItem) {
    setActive(to);
    setSelectedWorker(null);
    setMobileNav(false);
  }

  function renderContent() {
    if (selectedWorker) {
      return <WorkerDetailView workerId={selectedWorker} onBack={() => setSelectedWorker(null)} />;
    }
    switch (active) {
      case "dashboard":
        return <DashboardView onWorkerClick={id => setSelectedWorker(id)} />;
      case "records":
        return (
          <RecordsView
            workers={workers}
            onSave={saveWorker}
            onDelete={deleteWorker}
            onSendToException={sendToException}
            onToggleFlow={toggleFlow}
            onNavigateToExceptions={() => navigate("exceptions")}
          />
        );
      case "exceptions":
        return <ExceptionsView />;
      case "schedules":
        return <SchedulesView />;
      case "workers":
        return (
          <WorkersView
            workers={workers}
            onEditWorker={w => {
              // Navigate to Records and open the edit panel for this worker
              setActive("records");
              // Small delay to let Records mount, then we can't easily open panel from here,
              // so we just navigate to records — user can click Edit from there
            }}
          />
        );
      case "reports":
        return <ReportsView />;
    }
  }

  return (
    <div className="flex min-h-full" style={{ background: "#F7F8FA" }}>
      {/* Mobile overlay */}
      {mobileNav && (
        <div className="fixed inset-0 z-40 lg:hidden" style={{ background: "rgba(0,0,0,0.4)" }} onClick={() => setMobileNav(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col lg:static lg:flex-shrink-0 transition-transform lg:translate-x-0 ${mobileNav ? "translate-x-0" : "-translate-x-full"}`}
        style={{ width: 220, background: "#0F1419", borderRight: "1px solid rgba(255,255,255,0.07)" }}
      >
        {/* Logo */}
        <div className="px-5 py-5 flex items-center gap-3 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#1D6FD8" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="6" height="6" rx="1" fill="white" fillOpacity="0.9" />
              <rect x="9" y="1" width="6" height="6" rx="1" fill="white" fillOpacity="0.9" />
              <rect x="1" y="9" width="6" height="6" rx="1" fill="white" fillOpacity="0.9" />
              <rect x="10" y="10" width="4" height="4" rx="0.5" fill="white" />
            </svg>
          </div>
          <div>
            <p className="text-white text-sm font-semibold">GaritaControl</p>
            <p className="text-xs" style={{ color: "#8B8FA3" }}>RR.HH.</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 flex flex-col gap-0.5 overflow-y-auto scrollbar-hide">
          {NAV.map(item => {
            const isActive = active === item.id && !selectedWorker;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors w-full"
                style={{
                  background: isActive ? "rgba(29,111,216,0.15)" : "transparent",
                  color: isActive ? "#1D6FD8" : "#8B8FA3",
                }}
              >
                {item.icon}
                <span className="text-sm font-medium">{item.label}</span>
                {item.id === "exceptions" && pendingExceptions > 0 && (
                  <span
                    className="ml-auto text-xs font-mono rounded-full px-1.5 py-0.5 tabular"
                    style={{ background: "rgba(229,72,77,0.2)", color: "#E5484D", fontSize: 10 }}
                  >
                    {pendingExceptions}
                  </span>
                )}
                {item.id === "records" && (
                  <span
                    className="ml-auto text-xs font-mono rounded-full px-1.5 py-0.5 tabular"
                    style={{ background: "rgba(255,255,255,0.06)", color: "#8B8FA3", fontSize: 10 }}
                  >
                    {workers.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-3 mb-3">
            <img
              src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&auto=format"
              alt="User"
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="min-w-0">
              <p className="text-white text-xs font-medium truncate">María Torres</p>
              <p className="text-xs truncate" style={{ color: "#8B8FA3" }}>Jefa de RR.HH.</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full text-xs py-2 rounded-lg transition-colors"
            style={{ background: "rgba(255,255,255,0.05)", color: "#8B8FA3" }}
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header
          className="lg:hidden flex items-center justify-between px-4 py-3 border-b sticky top-0 z-30"
          style={{ background: "#FFFFFF", borderColor: "#EAECF0" }}
        >
          <button onClick={() => setMobileNav(true)} className="p-2 rounded-lg" style={{ background: "#F7F8FA" }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M2 4h14M2 9h14M2 14h14" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          <p className="font-semibold text-sm" style={{ color: "#111827" }}>
            {selectedWorker ? "Detalle trabajador" : NAV.find(n => n.id === active)?.label}
          </p>
          <div className="w-9" />
        </header>

        <main className="flex-1 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
