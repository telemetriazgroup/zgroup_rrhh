# figma-make-app

React + Vite + Tailwind CSS project running inside Figma Make.

## Product Context

This repository implements **GaritaControl**, a responsive QR-based attendance and lunch-control application. Before changing product behavior, domain data, or UI, read:

- `docs/PRODUCT_SPEC.md` for canonical product requirements, use cases, domain rules, and UX constraints.
- `docs/MODULES.md` for detailed functionality, validations, UI states, permissions, and integrations by system module.
- `docs/IMPLEMENTATION_STATUS.md` for the current architecture, mocked behavior, known gaps, and source-of-truth boundaries.
- `docs/ARCHITECTURE.md` for containers, technology choices, and the document-recognition boundary.
- `docs/ROADMAP.md` for phases and sprints.

The product specification and module catalog describe expected behavior; the implementation-status document describes what the current prototype actually does. Do not present mocked interactions as production-ready functionality. Keep all three documents synchronized when scope or implementation status changes.

## Development Server

A Vite development server is **already running** on `$PORT` (default 8443). You don't need to start it manually.

- Preview URL: The user can access the running app through the preview panel
- Hot reload: Changes to source files are reflected immediately

## Project Structure

This is the canonical project structure. Start with task-relevant files below. Only follow imports or inspect other files when required, when a documented path is missing, or when the repository contradicts this guide.

- `src/main.tsx` - React entrypoint; imports `src/index.css` and mounts `src/App.tsx` into the `#root` element
- `src/App.tsx` - Primary application component and the usual starting point for UI work
- `src/index.css` - Global CSS entrypoint and Tailwind CSS v4 import
- `index.html` - Vite HTML shell containing the `#root` element and loading `src/main.tsx`
- `package.json` - Project dependencies and the Vite build, development, preview, and formatting scripts
- `vite.config.ts` - Vite configuration with React, Tailwind CSS v4, and Figma Make plugins plus the `@` alias for `src`
- `.mise.toml` - Toolchain versions for Node.js and pnpm
- `services/api/` - GaritaControl API. The browser calls this service
- `services/vision/` - Separate document-recognition API. Only `services/api` calls it
- `db/init/` - PostgreSQL schema and development seed, applied on an empty volume
- `docker-compose.yml` - `web`, `api`, `vision`, and `db`
- `docs/ARCHITECTURE.md` - Technology, containers, and development rules
- `docs/ROADMAP.md` - Phases and sprints

The Vite preview on port 8443 stays outside Compose. The containerized UI is published on port 18180. The vision service validates images and does not extract identity until `ModelExtractor` is implemented. Do not describe `VISION_ENGINE=fixture` as real recognition.

## Dependencies

- Runtime: React 19 and React DOM 19
- Styling: Tailwind CSS v4 with the `@tailwindcss/vite` plugin
- Build tooling: Vite 8, TypeScript 5.7, and `@vitejs/plugin-react`
- Formatting: oxfmt

## Styling

This project uses **Tailwind CSS v4** through the `@tailwindcss/vite` plugin configured in `vite.config.ts`. `src/index.css` imports Tailwind with `@import 'tailwindcss';`. Use Tailwind utility classes directly in JSX and put global CSS or Tailwind v4 theme customization in `src/index.css`. This scaffold does not need a Tailwind config file or PostCSS config.

`src/main.tsx` imports `src/index.css`, so global font wiring belongs in `src/index.css`. Keep CSS `@import` statements first, then add any `@font-face` rules and font-family defaults there.

## Code quality

- Use double quotes for strings containing apostrophes (`"We're here to help"`), or escape them in single-quoted strings. An unescaped apostrophe in a single-quoted string breaks the build.
- Ensure JSX tags are closed and braces are balanced.
- Export components as default exports.
