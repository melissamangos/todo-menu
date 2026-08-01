# Todo Menu — Project Summary for Claude Code

## What this project is

Todo Menu is a full-stack wellness-focused to-do application. It is structured as an **npm workspace monorepo** with three packages: a React frontend (`client`), a Node.js/Express REST API (`server`), and a shared TypeScript types package (`shared`). The project was built with clean architecture, separation of concerns, and testability as explicit priorities.

---

## Tech stack

| Layer   | Technology                                              |
|---------|---------------------------------------------------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS              |
| Backend  | Node.js, Express, TypeScript                          |
| Shared   | TypeScript types package consumed by both client and server |
| Testing  | Vitest + Testing Library (client), Jest + ts-jest (server) |
| Dev tooling | concurrently, ts-node-dev, ESLint                  |

---

## Monorepo structure

```
todo-menu/
├── package.json              # Workspace root; npm run dev starts both sides
├── shared/                   # @todo-menu/shared
│   └── types/index.ts        # Single source of truth for all domain types
├── server/                   # @todo-menu/server
│   └── src/
│       ├── app.ts            # Express setup
│       ├── routes/           # Route definitions
│       ├── controllers/      # HTTP layer (parse request, call service, shape response)
│       ├── services/         # Business logic; throws typed domain errors
│       ├── repositories/     # Data access behind ITodoRepository interface
│       ├── middleware/        # Centralised error handler
│       └── __tests__/        # Jest unit tests
└── client/                   # @todo-menu/client
    └── src/
        ├── App.tsx
        ├── components/       # AddTodoForm, FilterBar, TodoList
        ├── hooks/            # useTodos — data fetching + client-side filtering
        ├── services/         # todo.api.ts — typed fetch wrapper
        ├── styles/           # index.css — full CSS design system
        └── __tests__/        # Vitest unit tests + fixtures
```

---

## Domain model

Every todo item has the following fields:

| Field        | Type                                                                 |
|--------------|----------------------------------------------------------------------|
| `id`         | `string` (UUID)                                                      |
| `name`       | `string`                                                             |
| `energyCost` | `"low" \| "medium" \| "high"`                                        |
| `timeslot`   | `"am" \| "pm" \| "eve"`                                              |
| `boons`      | Array of zero or more: `boundaries`, `connection`, `creativity`, `limit media`, `mindfulness`, `nature`, `nutrition`, `physical activity`, `routine`, `therapy` |
| `createdAt`  | ISO 8601 string                                                      |
| `updatedAt`  | ISO 8601 string                                                      |

---

## Features

### Adding items
The form is collapsed by default and expands on focus. Users configure:
- **Name** (required; whitespace-only is rejected)
- **Energy cost** — segmented button group: Low / Medium / High
- **Timeslot** — segmented button group: Morning (am) / Afternoon (pm) / Evening (eve)
- **Boons** — a toggleable chip grid; multiple selections allowed; count badge updates live

The form resets and collapses after a successful submission.

### Default sort
The item list is always sorted **low → medium → high** energy cost. This sort is applied both on initial load and after any filter change.

### Client-side filtering
Filtering is performed entirely in the browser via `useMemo` in the `useTodos` hook — no additional API calls are made when filters change.

- **Filter by energy cost**: All / Low / Medium / High
- **Filter by timeslot**: All Slots / Morning / Afternoon / Evening
- Both filters compose with AND logic
- Changing one filter dimension does not reset the other

### Filter UX indicators
When any filter is active:
- The active pill is highlighted with a colour-coded glow matching the energy level (teal for low, violet for medium, pink for high)
- A banner appears below the filter bar showing "Showing X of Y items" with a one-click **Clear filters** shortcut
- `isFiltered` is a boolean exposed by `useTodos` for components to react to

### Deleting items
Each card has a delete button. Deletion is optimistic — the item is removed from local state immediately without a re-fetch.

---

## Architecture decisions

### Server: layered architecture
```
Routes → Controller → Service → Repository
```
- `ITodoRepository` is an interface. The current implementation (`InMemoryTodoRepository`) holds data in a `Map`. Swapping in a database-backed implementation requires no changes to the service or controller layers.
- `TodoService` throws typed domain errors (`NotFoundError`). The error middleware translates these to HTTP status codes in one place.
- Controllers are thin: they parse requests, delegate to the service, and shape responses.

### Shared types
`@todo-menu/shared` is the single source of truth for `Todo`, `CreateTodoDto`, `UpdateTodoDto`, `TodoFilters`, `Boon`, `EnergyCost`, `Timeslot`, `ENERGY_ORDER`, and `ALL_BOONS`. Both the client and server import from it, giving end-to-end type safety on the API contract.

### Client data layer
`todo.api.ts` owns all fetch concerns. `useTodos.ts` owns React state and client-side filtering. Components only interact with the hook. This separation makes each layer independently unit-testable.

---

## Running the project

```bash
npm install          # installs all workspaces
npm run dev          # starts server (port 3001) + client (port 5173) concurrently
npm run test         # runs all tests across workspaces
npm run build        # builds shared → server → client
```

The Vite dev server proxies `/api` requests to `http://localhost:3001`, so no CORS configuration is needed in development.

---

## Test coverage

### Client (Vitest + Testing Library)
- **`useTodos.test.ts`** — 30 tests covering sort order, energy filter (all values + empty result), timeslot filter (all values + empty result), composed filters, `isFiltered` flag, `clearFilters`, CRUD state updates, and API error handling
- **`AddTodoForm.test.tsx`** — 22 tests covering collapsed/expanded state, all 10 boons rendered, default values, field interactions, boon toggle/multi-select, validation (blank/whitespace), submission DTO shape, form reset, and cancel behaviour
- **`fixtures.ts`** — shared stable todo objects covering all energy levels and timeslots for use across test files

### Server (Jest + ts-jest)
- **`todo.service.test.ts`** — covers create, getById (found + not found), sort order assertion (low → medium → high), and delete

---

## Known state & suggested next steps

The data layer is currently in-memory and resets on server restart. Suggested next steps in rough priority order:

1. Replace `InMemoryTodoRepository` with a SQLite or Postgres implementation (the interface is already defined)
2. Add DTO validation with Zod on incoming API requests
3. Add authentication (JWT + refresh token flow)
4. Persist filter preferences to `localStorage`
5. Add drag-and-drop reordering within energy groups
6. Set up CI/CD with GitHub Actions
