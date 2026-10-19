export interface Worker {
  id: string;
  nombre: string;
  apellido: string;
  shortName: string;
  area: string;
  cargo: string;
  dni: string;
  telefono: string;
  email: string;
  fechaIngreso: string;
  photo: string;
  status: "active" | "inactive";
  schedule: string;
  terminal: string;
  inControlFlow: boolean;
}

export const WORKERS_INITIAL: Worker[] = [
  { id: "W001", nombre: "Carlos", apellido: "Mendoza", shortName: "C. Mendoza", area: "Producción", cargo: "Operario de línea", dni: "47382910", telefono: "987654321", email: "c.mendoza@empresa.pe", fechaIngreso: "2021-03-15", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format", status: "active", schedule: "Planta turno mañana", terminal: "Garita Principal", inControlFlow: true },
  { id: "W002", nombre: "Ana", apellido: "Torres", shortName: "A. Torres", area: "Logística", cargo: "Coordinadora de almacén", dni: "52819374", telefono: "912345678", email: "a.torres@empresa.pe", fechaIngreso: "2020-07-01", photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&auto=format", status: "active", schedule: "Administrativo", terminal: "Garita Principal", inControlFlow: true },
  { id: "W003", nombre: "Luis", apellido: "Paredes", shortName: "L. Paredes", area: "Administración", cargo: "Analista contable", dni: "61029384", telefono: "956789012", email: "l.paredes@empresa.pe", fechaIngreso: "2019-11-20", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&auto=format", status: "active", schedule: "Administrativo", terminal: "Garita Norte", inControlFlow: true },
  { id: "W004", nombre: "María", apellido: "Quispe", shortName: "M. Quispe", area: "Calidad", cargo: "Inspector de calidad", dni: "73849201", telefono: "934567890", email: "m.quispe@empresa.pe", fechaIngreso: "2022-01-10", photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&auto=format", status: "active", schedule: "Administrativo", terminal: "Garita Principal", inControlFlow: true },
  { id: "W005", nombre: "José", apellido: "Flores", shortName: "J. Flores", area: "Producción", cargo: "Técnico de mantenimiento", dni: "39201847", telefono: "978901234", email: "j.flores@empresa.pe", fechaIngreso: "2020-04-05", photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&auto=format", status: "active", schedule: "Planta turno mañana", terminal: "Garita Principal", inControlFlow: true },
  { id: "W006", nombre: "Rosa", apellido: "Huanca", shortName: "R. Huanca", area: "RR.HH.", cargo: "Asistente de RR.HH.", dni: "82910374", telefono: "945678901", email: "r.huanca@empresa.pe", fechaIngreso: "2023-02-14", photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&auto=format", status: "active", schedule: "Administrativo", terminal: "Garita Norte", inControlFlow: true },
  { id: "W007", nombre: "Pedro", apellido: "Sánchez", shortName: "P. Sánchez", area: "Mantenimiento", cargo: "Electricista industrial", dni: "45671829", telefono: "901234567", email: "p.sanchez@empresa.pe", fechaIngreso: "2018-09-30", photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&auto=format", status: "active", schedule: "Planta turno mañana", terminal: "Garita Principal", inControlFlow: true },
  { id: "W008", nombre: "Carmen", apellido: "López", shortName: "C. López", area: "Logística", cargo: "Despachadora", dni: "19283746", telefono: "967890123", email: "c.lopez@empresa.pe", fechaIngreso: "2021-08-22", photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop&auto=format", status: "inactive", schedule: "Administrativo", terminal: "Garita Norte", inControlFlow: false },
];

// Keep WORKERS as alias for compatibility
export const WORKERS = WORKERS_INITIAL;

export const RECENT_SCANS = [
  { workerId: "W001", type: "exit" as const, time: "13:02", name: "C. Mendoza" },
  { workerId: "W002", type: "exit" as const, time: "13:03", name: "A. Torres" },
  { workerId: "W003", type: "return" as const, time: "14:01", name: "L. Paredes" },
  { workerId: "W005", type: "exit" as const, time: "13:04", name: "J. Flores" },
];

export const EXCEPTIONS = [
  { id: "EX001", type: "no_return" as const, workerId: "W001", date: "2026-09-05", time: "13:02", terminal: "Garita Principal", guard: "R. Chávez" },
  { id: "EX002", type: "auto_closed" as const, workerId: "W002", date: "2026-09-05", time: "13:03", terminal: "Garita Principal", guard: "R. Chávez" },
  { id: "EX003", type: "return_no_exit" as const, workerId: "W004", date: "2026-09-04", time: "14:15", terminal: "Garita Norte", guard: "M. Vargas" },
  { id: "EX004", type: "duplicate" as const, workerId: "W007", date: "2026-09-04", time: "13:08", terminal: "Garita Principal", guard: "R. Chávez" },
  { id: "EX005", type: "no_return" as const, workerId: "W005", date: "2026-09-03", time: "13:05", terminal: "Garita Norte", guard: "M. Vargas" },
];

export const EXCEPTION_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  no_return: { label: "Sin retorno", color: "#F5A524", bg: "rgba(245,165,36,0.12)" },
  auto_closed: { label: "Cerrada automáticamente", color: "#8B8FA3", bg: "rgba(139,143,163,0.12)" },
  return_no_exit: { label: "Retorno sin salida", color: "#E5484D", bg: "rgba(229,72,77,0.12)" },
  duplicate: { label: "Duplicado descartado", color: "#1D6FD8", bg: "rgba(29,111,216,0.12)" },
};

export const FLOW_DATA = [
  { time: "12:45", exits: 2, returns: 0 },
  { time: "13:00", exits: 12, returns: 1 },
  { time: "13:15", exits: 18, returns: 3 },
  { time: "13:30", exits: 8, returns: 6 },
  { time: "13:45", exits: 4, returns: 11 },
  { time: "14:00", exits: 1, returns: 22 },
  { time: "14:15", exits: 0, returns: 14 },
  { time: "14:30", exits: 0, returns: 4 },
];

export const AREA_EXCESS = [
  { area: "Producción", minutes: 18 },
  { area: "Logística", minutes: 14 },
  { area: "Mantenimiento", minutes: 11 },
  { area: "Calidad", minutes: 7 },
  { area: "Administración", minutes: 4 },
  { area: "RR.HH.", minutes: 2 },
];

export interface Record {
  id: string;
  workerId: string;
  date: string;
  // Periodo 1: Ingreso
  ingreso: string | null;
  tardanzaIngreso: number; // minutos de tardanza al ingreso
  // Periodo 2: Salida a almuerzo
  salidaAlmuerzo: string | null;
  // Periodo 3: Retorno almuerzo
  retornoAlmuerzo: string | null;
  duracionAlmuerzo: number | null;
  excesoAlmuerzo: number | null; // minutos sobre el almuerzo asignado
  // Periodo 4: Salida
  salidaDia: string | null;
  origin: "scan" | "manual";
  status: "ok" | "excess" | "incomplete" | "tardanza";
}

export const RECORDS_TABLE: Record[] = [
  { id: "R001", workerId: "W001", date: "2026-09-05", ingreso: "08:07", tardanzaIngreso: 2, salidaAlmuerzo: "13:02", retornoAlmuerzo: "14:10", duracionAlmuerzo: 68, excesoAlmuerzo: 8, salidaDia: "18:01", origin: "scan", status: "excess" },
  { id: "R002", workerId: "W002", date: "2026-09-05", ingreso: "08:03", tardanzaIngreso: 0, salidaAlmuerzo: "13:03", retornoAlmuerzo: "14:05", duracionAlmuerzo: 62, excesoAlmuerzo: 2, salidaDia: "18:00", origin: "scan", status: "ok" },
  { id: "R003", workerId: "W003", date: "2026-09-05", ingreso: "08:00", tardanzaIngreso: 0, salidaAlmuerzo: "13:05", retornoAlmuerzo: "14:03", duracionAlmuerzo: 58, excesoAlmuerzo: 0, salidaDia: "18:02", origin: "scan", status: "ok" },
  { id: "R004", workerId: "W004", date: "2026-09-05", ingreso: "08:12", tardanzaIngreso: 7, salidaAlmuerzo: "13:01", retornoAlmuerzo: null, duracionAlmuerzo: null, excesoAlmuerzo: null, salidaDia: null, origin: "scan", status: "incomplete" },
  { id: "R005", workerId: "W005", date: "2026-09-05", ingreso: "06:08", tardanzaIngreso: 8, salidaAlmuerzo: "11:34", retornoAlmuerzo: "12:52", duracionAlmuerzo: 78, excesoAlmuerzo: 18, salidaDia: "15:05", origin: "scan", status: "excess" },
  { id: "R006", workerId: "W001", date: "2026-09-04", ingreso: "08:00", tardanzaIngreso: 0, salidaAlmuerzo: "13:03", retornoAlmuerzo: "14:18", duracionAlmuerzo: 75, excesoAlmuerzo: 15, salidaDia: "17:59", origin: "scan", status: "excess" },
  { id: "R007", workerId: "W001", date: "2026-09-03", ingreso: "08:06", tardanzaIngreso: 1, salidaAlmuerzo: "13:02", retornoAlmuerzo: "14:08", duracionAlmuerzo: 66, excesoAlmuerzo: 6, salidaDia: "18:00", origin: "manual", status: "excess" },
  { id: "R008", workerId: "W001", date: "2026-09-02", ingreso: "08:00", tardanzaIngreso: 0, salidaAlmuerzo: "13:01", retornoAlmuerzo: "14:04", duracionAlmuerzo: 63, excesoAlmuerzo: 3, salidaDia: "18:01", origin: "scan", status: "ok" },
  { id: "R009", workerId: "W002", date: "2026-09-04", ingreso: "08:09", tardanzaIngreso: 4, salidaAlmuerzo: "13:00", retornoAlmuerzo: "14:12", duracionAlmuerzo: 72, excesoAlmuerzo: 12, salidaDia: "18:00", origin: "scan", status: "excess" },
  { id: "R010", workerId: "W003", date: "2026-09-04", ingreso: "08:15", tardanzaIngreso: 10, salidaAlmuerzo: "13:02", retornoAlmuerzo: "14:05", duracionAlmuerzo: 63, excesoAlmuerzo: 3, salidaDia: "18:03", origin: "scan", status: "tardanza" },
  { id: "R011", workerId: "W005", date: "2026-09-04", ingreso: "06:02", tardanzaIngreso: 2, salidaAlmuerzo: "11:32", retornoAlmuerzo: "12:45", duracionAlmuerzo: 73, excesoAlmuerzo: 13, salidaDia: "15:00", origin: "scan", status: "excess" },
  { id: "R012", workerId: "W006", date: "2026-09-05", ingreso: "08:00", tardanzaIngreso: 0, salidaAlmuerzo: "13:00", retornoAlmuerzo: "14:02", duracionAlmuerzo: 62, excesoAlmuerzo: 2, salidaDia: "18:00", origin: "scan", status: "ok" },
  { id: "R013", workerId: "W007", date: "2026-09-05", ingreso: "06:00", tardanzaIngreso: 0, salidaAlmuerzo: "11:30", retornoAlmuerzo: "12:28", duracionAlmuerzo: 58, excesoAlmuerzo: 0, salidaDia: "15:00", origin: "scan", status: "ok" },
  { id: "R014", workerId: "W007", date: "2026-09-04", ingreso: "06:11", tardanzaIngreso: 11, salidaAlmuerzo: "11:31", retornoAlmuerzo: "12:40", duracionAlmuerzo: 69, excesoAlmuerzo: 9, salidaDia: "15:02", origin: "scan", status: "tardanza" },
];

export const DAILY_DURATION = [
  { day: 1, duration: 58 }, { day: 2, duration: 63 }, { day: 3, duration: 66 },
  { day: 4, duration: 75 }, { day: 5, duration: 68 }, { day: 8, duration: 55 },
  { day: 9, duration: 71 }, { day: 10, duration: 82 }, { day: 11, duration: 60 },
  { day: 12, duration: 69 }, { day: 15, duration: 73 }, { day: 16, duration: 58 },
  { day: 17, duration: 77 }, { day: 18, duration: 65 }, { day: 19, duration: 61 },
];

export const SCHEDULES = [
  {
    id: "SCH001",
    name: "Administrativo",
    days: ["L", "M", "X", "J", "V"],
    summary: "08:00 · 13:00–14:00 · 18:00",
    workers: 34,
    since: "2026-01-01",
    active: true,
    entryTime: "08:00",
    exitLunch: "13:00",
    returnLunch: "14:00",
    exitTime: "18:00",
    tolerances: { entry: 5, return: 5, earlyExit: 0, incomplete: 180 },
    saturday: "no",
    saturdayExit: "13:00",
  },
  {
    id: "SCH002",
    name: "Planta turno mañana",
    days: ["L", "M", "X", "J", "V", "S"],
    summary: "06:00 · 11:30–12:30 · 15:00",
    workers: 67,
    since: "2026-01-01",
    active: true,
    entryTime: "06:00",
    exitLunch: "11:30",
    returnLunch: "12:30",
    exitTime: "15:00",
    tolerances: { entry: 5, return: 5, earlyExit: 0, incomplete: 180 },
    saturday: "half",
    saturdayExit: "11:00",
  },
  {
    id: "SCH003",
    name: "Planta turno tarde",
    days: ["L", "M", "X", "J", "V", "S"],
    summary: "14:00 · 19:00–20:00 · 23:00",
    workers: 45,
    since: "2026-03-15",
    active: true,
    entryTime: "14:00",
    exitLunch: "19:00",
    returnLunch: "20:00",
    exitTime: "23:00",
    tolerances: { entry: 5, return: 5, earlyExit: 0, incomplete: 180 },
    saturday: "half",
    saturdayExit: "18:00",
  },
  {
    id: "SCH004",
    name: "Seguridad 24h",
    days: ["L", "M", "X", "J", "V", "S", "D"],
    summary: "07:00 · 12:00–13:00 · 19:00",
    workers: 12,
    since: "2025-06-01",
    active: false,
    entryTime: "07:00",
    exitLunch: "12:00",
    returnLunch: "13:00",
    exitTime: "19:00",
    tolerances: { entry: 10, return: 10, earlyExit: 0, incomplete: 240 },
    saturday: "full",
    saturdayExit: "19:00",
  },
];

export const ALL_DAYS = ["L", "M", "X", "J", "V", "S", "D"];

export const AREAS = [
  "Producción", "Logística", "Administración", "Calidad",
  "RR.HH.", "Mantenimiento", "Sistemas", "Finanzas", "Operaciones",
];

export const TERMINALS = ["Garita Principal", "Garita Norte", "Garita Sur"];
