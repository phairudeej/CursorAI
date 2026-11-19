# AGENTS.md

Truck2Hand is an AI Academy training repo for a used commercial-truck marketplace (home, product detail, admin CRUD). It is a Vue 3 + Vite + vue-router frontend and a Node.js + Express + Drizzle ORM + SQLite (`better-sqlite3`) backend, with Multer uploads and Swagger UI.

## Commands

No root Makefile or `.csproj`. Install/run from each package directory (`npm install` in that folder). Node `24.20.0` is pinned (`engines`, `frontend/.nvmrc`).

| | Backend (`backend/`) | Frontend (`frontend/`) |
| --- | --- | --- |
| Install | `npm install` | `npm install` |
| Build | none yet | `npm run build` |
| Run | `npm run dev` or `npm start` (port `3001`); seed: `npm run seed` / `npm run seed:reset` | `npm run dev` (Vite `127.0.0.1:5173`) |
| Test | `npm test` (`vitest run`; `npm run test:watch` available) | none yet |

## Conventions

- Backend is ESM (`"type": "module"`); local imports use `.js` suffixes (e.g. `./errors.js`).
- API lives under `/api` (catalog + `/api/products`); uploads served at `/uploads`; docs at `/docs`. Errors return `{ error, fields[] }` via `HttpError`.
- Frontend layout: `views/*View.vue`, PascalCase components in `components/`, clients in `api/`, helpers in `lib/`. Form errors use `.form-error` / `.field-error`.
- Vite proxies `/api` and `/uploads` to `http://127.0.0.1:3001`. `VITE_USE_MOCK` switches mock vs real API (`frontend/.env.example`).
- Design tokens (Prompt font, อู่น้ำเงิน palette) live in `frontend/src/styles.css` `:root`.

## Gotchas

- 
