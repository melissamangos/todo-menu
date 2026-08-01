# Todo Menu

A full-stack wellness-focused to-do application built with TypeScript, React, Tailwind CSS, SCSS Modules, and Node.js/Express. Structured as an npm workspace monorepo with clean separation between client, server, and shared types.

---

## Tech Stack

| Layer    | Technology                                             |
| -------- | ------------------------------------------------------ |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, SCSS Modules |
| Backend  | Node.js, Express, TypeScript                           |
| Shared   | TypeScript types shared across client/server           |
| Testing  | Vitest (client), Jest + Supertest (server)             |

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

## Linting & Formatting

A single root-level [ESLint](eslint.config.mjs) flat config and [Prettier](.prettierrc.json) config cover `shared`, `server`, and `client` — there's no per-workspace lint setup.

```bash
npm run lint            # ESLint across the whole repo
npm run lint:fix        # ESLint, auto-fixing what it can
npm run format          # Prettier, writes formatting changes
npm run format:check    # Prettier, fails if anything is unformatted
```

A pre-commit hook (Husky + lint-staged) runs ESLint and Prettier on staged files automatically before each commit.

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

Styling tokens live in three layers, all expressed as CSS custom properties, covering both color and the type scale:

- **Primitive** (`styles/tokens/primitives.css`) — raw values only, no meaning attached: palette hues (e.g. `--color-violet-500`, `--color-teal-400`) and a rem-based font-size scale (e.g. `--font-size-xs`, `--font-size-base`).
- **Semantic** (`styles/tokens/semantic.css`) — intent-based aliases over primitives (e.g. `--accent: var(--color-violet-500)`, `--energy-low: var(--color-teal-400)`, `--font-size-title: var(--font-size-base)`). These names are the public API — `tailwind.config.js` points its theme colors and font sizes at them, and existing global classes (`.card`, `.filter-pill`, `.btn-primary`, `.boon-tag`) consume them by name. Two semantic names can share one primitive without sharing meaning — e.g. `--font-size-heading` and `--font-size-icon` are both `--font-size-lg`, but rename independently since they describe different things.
- **Component** — CSS custom properties scoped to a single use site, added only where a value is genuinely local. Two variants exist: scoped to a component's SCSS Module (`AddTodoForm.module.scss`'s `--accent`, set per-option in JSX for the energy/timeslot segmented buttons), and scoped to one instance of a _shared global class_ (`.filter-pill.active`'s `--pill-accent`/`-tint`/`-glow` and `.card`'s `--card-accent(-width)` in `index.css`, set inline by `FilterBar`'s energy pills and `TodoList`'s `TodoCard`). The latter exists specifically to let one instance override a shared rule's color without a CSS specificity fight — no `!important`, no new files.

Tailwind utility classes handle most day-to-day styling (layout, spacing, colors and font sizes via the token-backed theme); SCSS Modules are reserved for styling that doesn't reduce cleanly to utility classes — dynamic per-instance state being the main case. `FilterBar.tsx`, `TodoList.tsx`, and `App.tsx` use token-backed Tailwind classes for color/type but still keep their structural/layout styling as inline `style` props; a future pass should finish migrating that structural styling into SCSS Modules following the `AddTodoForm` pattern.

---

## Next Steps

- Replace `InMemoryTodoRepository` with SQLite/Postgres
- Add Zod validation on incoming DTOs
- Add authentication (JWT + refresh tokens)
- Persist filter preferences to `localStorage`
- Add drag-and-drop reordering within energy groups
- Set up CI/CD with GitHub Actions
