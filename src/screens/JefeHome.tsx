interface Props {
  nombre: string;
  onLogout: () => void;
}

export default function JefeHome({ nombre, onLogout }: Props) {
  return (
    <div className="min-h-full flex flex-col items-center justify-center px-6" style={{ background: "#F7F8FA" }}>
      <div className="w-full max-w-md rounded-xl bg-white p-6 border" style={{ borderColor: "#EAECF0" }}>
        <p className="text-sm" style={{ color: "#8B8FA3" }}>Jefe de área</p>
        <h1 className="text-xl font-semibold mt-1" style={{ color: "#0F1419" }}>{nombre}</h1>
        <p className="text-sm mt-4" style={{ color: "#0F1419" }}>
          La bandeja de autorizaciones usa la misma API que la web y el celular. Esta sesión ya está activa.
        </p>
        <button
          type="button"
          onClick={onLogout}
          className="mt-6 rounded-xl px-4 text-white font-semibold"
          style={{ background: "#1D6FD8", minHeight: 48 }}
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
