# GaritaControl

Aplicación web responsiva para controlar los cuatro hitos de la jornada laboral mediante el escaneo del código QR de un fotocheck:

1. Ingreso
2. Salida a almuerzo
3. Retorno de almuerzo
4. Salida

La aplicación tiene dos experiencias:

- **Garita:** interfaz mobile-first y oscura para que un vigilante registre marcaciones con rapidez.
- **RR.HH.:** panel claro orientado a laptop para supervisión, mantenimiento de trabajadores, horarios, excepciones y reportes.

## Documentación del producto

Antes de modificar comportamiento o interfaz, leer:

- [`docs/PRODUCT_SPEC.md`](docs/PRODUCT_SPEC.md): propósito, lenguaje de dominio, casos de uso, reglas funcionales, pantallas y criterios de UX.
- [`docs/MODULES.md`](docs/MODULES.md): funcionalidades detalladas por módulo, validaciones, estados, integraciones y permisos.
- [`docs/IMPLEMENTATION_STATUS.md`](docs/IMPLEMENTATION_STATUS.md): arquitectura actual, mapa del código, funcionalidades simuladas, limitaciones y prioridades.
- [`AGENTS.md`](AGENTS.md): instrucciones operativas y convenciones para agentes de IA.

La especificación describe el **comportamiento esperado**. El estado de implementación distingue qué partes ya funcionan en el prototipo y cuáles todavía son simuladas o están pendientes.

## Stack

- React 19
- TypeScript 5.7
- Vite 8
- Tailwind CSS 4
- Recharts

Los datos actuales son mock y viven en `src/data/mockData.ts`. No existe todavía backend, persistencia, autenticación real ni integración real con cámara/lector QR.

## Desarrollo

En Figma Make el servidor de Vite ya está en ejecución y dispone de hot reload; no se debe iniciar un segundo servidor.

Scripts disponibles fuera de ese entorno:

```bash
pnpm build
pnpm format
```

## Acceso de prueba

El rol sale de la cuenta, no del texto escrito en el usuario. Usuarios, contraseña y funciones están en [`docs/cuentas_rrhh.md`](docs/cuentas_rrhh.md). Esas cuentas son solo del entorno local.
# zgroup_rrhh
