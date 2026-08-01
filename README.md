# Todo Menu

A full-stack wellness-focused to-do application built with TypeScript, React, Tailwind CSS, SCSS Modules, and Node.js/Express. Structured as an npm workspace monorepo with clean separation between client, server, and shared types.

---

## Tech Stack

| Layer    | Technology                                    |
| -------- | --------------------------------------------- |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, SCSS Modules |
| Backend  | Node.js, Express, TypeScript                  |
| Shared   | TypeScript types shared across client/server  |
| Testing  | Vitest (client), Jest + Supertest (server)    |

---

## Features

- **Add items** with name, energy cost (low / medium / high), timeslot (AM / PM / Evening), and one or more Boons (boundaries, connection, creativity, limit media, mindfulness, nature, nutrition, physical activity, routine, therapy)
- **Client-side filtering** by energy cost and/or timeslot — instant, no round-trip
- **Default sort** by energy cost: low → medium → high, grouped visually
- **Filter banner** shows item count and a clear-filters shortcut when filters are active
- **Dark wellness aesthetic** — deep indigo/slate background, violet accents, cool teal highlights, DM Serif Display headings

---

## Folder Structure

```
todo-menu/
├── package.json              # Root workspace config + concurrently dev script
│
├── shared/                   # @todo-menu/shared — domain types used by both sides
│   ├── types/index.ts        # Todo, CreateTodoDto, UpdateTodoDto, TodoFilters, Boon, etc.
│   └── package.json
│
├── server/                   # @todo-menu/server — Express REST API
│   ├── src/
│   │   ├── index.ts          # Entrypoint
│   │   ├── app.ts            # Express setup (middleware, routes)
│   │   ├── routes/todo.routes.ts
│   │   ├── controllers/todo.controller.ts   # HTTP layer
│   │   ├── services/todo.service.ts         # Business logic
│   │   ├── repositories/todo.repository.ts  # ITodoRepository + in-memory impl
│   │   ├── middleware/error.middleware.ts
│   │   └── __tests__/todo.service.test.ts
│   └── package.json
│
└── client/                   # @todo-menu/client — React SPA
    ├── src/
    │   ├── App.tsx
    │   ├── components/
    │   │   ├── AddTodoForm.tsx          # Expandable form: energy / timeslot / boons
    │   │   ├── AddTodoForm.module.scss  # Component-scoped styles for the segmented option buttons
    │   │   ├── FilterBar.tsx            # Filter pills with active state banner
    │   │   └── TodoList.tsx             # Grouped by energy cost, animated cards
    │   ├── hooks/useTodos.ts    # Fetch + client-side filter (useMemo) + state
    │   ├── services/todo.api.ts # Typed fetch wrapper
    │   └── styles/
    │       ├── index.css            # Global styles, animations, and shared classes (.card, .btn-primary, etc.)
    │       └── tokens/
    │           ├── primitives.css   # Raw palette values (colors, font stacks)
    │           └── semantic.css     # Intent-based aliases over primitives — the public token API
    └── package.json
```

---

## Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x (workspaces support)

---

## Setup & Installation

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd todo-menu

# 2. Install all dependencies (root + all workspaces)
npm install
```

---

## Running the Project

### Development (client + server together)

```bash
npm run dev
```

Starts:
- **Server** → `http://localhost:3001` (hot-reload via `ts-node-dev`)
- **Client** → `http://localhost:5173` (Vite; `/api` proxied to server)

### Individually

```bash
npm run dev --workspace=server
npm run dev --workspace=client
```

---

## Building for Production

```bash
npm run build        # shared → server → client
node server/dist/index.js
```

---

## Testing

```bash
npm run test                           # All workspaces
npm run test --workspace=server        # Jest
npm run test --workspace=client        # Vitest
```

---

## Architecture Notes

### Filtering is client-side

Filtering by energy cost and timeslot is performed entirely in the browser via `useMemo` inside `useTodos.ts`. The server returns the full list sorted by energy cost; the client applies incremental filters on top — keeping the UX instant with no API round-trips.

### Layered server architecture

```
Routes → Controller → Service → Repository
```

- **Repository** (`ITodoRepository`) owns data access — swap `InMemoryTodoRepository` for a DB-backed implementation without touching services or controllers.
- **Service** owns business logic and throws typed domain errors (`NotFoundError`).
- **Controller** owns HTTP concerns only.
- **Error middleware** maps domain errors to HTTP status codes in one place.

### Shared types

`@todo-menu/shared` is the single source of truth for `Todo`, `CreateTodoDto`, `UpdateTodoDto`, `TodoFilters`, `Boon`, `EnergyCost`, and `Timeslot`. Both workspaces import from it for end-to-end type safety on the API contract.

### Design tokens: primitive → semantic → component

Styling tokens live in three layers, all expressed as CSS custom properties:

- **Primitive** (`styles/tokens/primitives.css`) — raw palette values only (e.g. `--color-violet-500`, `--color-teal-400`), no meaning attached.
- **Semantic** (`styles/tokens/semantic.css`) — intent-based aliases over primitives (e.g. `--accent: var(--color-violet-500)`, `--energy-low: var(--color-teal-400)`). These names are the public API — `tailwind.config.js` points its theme colors at them, and existing global classes (`.card`, `.filter-pill`, `.btn-primary`, `.boon-tag`) consume them by name.
- **Component** — CSS custom properties scoped to an individual component's SCSS Module, used only where a value is genuinely local (see `AddTodoForm.module.scss`'s `--accent` override, set per-option in JSX for the energy/timeslot segmented buttons).

Tailwind utility classes handle most day-to-day styling (layout, spacing, colors via the token-backed theme); SCSS Modules are reserved for styling that doesn't fit cleanly into utility classes, such as the dynamic per-option active state on `AddTodoForm`'s segmented buttons.

---

## Next Steps

- Replace `InMemoryTodoRepository` with SQLite/Postgres
- Add Zod validation on incoming DTOs
- Add authentication (JWT + refresh tokens)
- Persist filter preferences to `localStorage`
- Add drag-and-drop reordering within energy groups
- Set up CI/CD with GitHub Actions
