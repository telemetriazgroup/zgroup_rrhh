import { useState } from "react";
import { logout, type ApiUser } from "./api/client";
import ConceptualTour from "./screens/conceptual/ConceptualTour";
import Login from "./screens/Login";
import Scanner from "./screens/Scanner";
import JefeHome from "./screens/JefeHome";
import HRLayout from "./screens/hr/Layout";

type Screen = "login" | "guard" | "hr" | "jefe" | "conceptual";

function screenFor(rol: ApiUser["rol"]): Screen {
  if (rol === "vigilante") return "guard";
  if (rol === "jefe") return "jefe";
  return "hr";
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("login");
  const [usuario, setUsuario] = useState<ApiUser | null>(null);

  function handleLogin(next: ApiUser) {
    setUsuario(next);
    setScreen(screenFor(next.rol));
  }

  function handleLogout() {
    void logout().finally(() => {
      setUsuario(null);
      setScreen("login");
    });
  }

  return (
    <div className="size-full">
      {screen === "login" && <Login onLogin={handleLogin} onShowConcept={() => setScreen("conceptual")} />}
      {screen === "conceptual" && <ConceptualTour onClose={() => setScreen("login")} />}
      {screen === "guard" && <Scanner onLogout={handleLogout} />}
      {screen === "hr" && <HRLayout onLogout={handleLogout} />}
      {screen === "jefe" && <JefeHome nombre={usuario?.nombre ?? "Jefe"} onLogout={handleLogout} />}
    </div>
  );
}
