# Todo Menu — Project Summary for Claude Code

For setup, installation, and the command reference (`dev`, `build`, `test`, `lint`, `format`), see [README.md](README.md). This file covers architecture, domain model, design decisions, and current state.

## What this project is

Todo Menu is a full-stack wellness-focused to-do application. It is structured as an **npm workspace monorepo** with three packages: a React frontend (`client`), a Node.js/Express REST API (`server`), and a shared TypeScript types package (`shared`). The project was built with clean architecture, separation of concerns, and testability as explicit priorities.

---

## Tech stack

| Layer       | Technology                                                       |
| ----------- | ---------------------------------------------------------------- |
| Frontend    | React 18, TypeScript, Vite, Tailwind CSS, SCSS Modules           |
| Backend     | Node.js, Express, TypeScript                                     |
| Shared      | TypeScript types package consumed by both client and server      |
| Testing     | Vitest + Testing Library (client), Jest + ts-jest (server)       |
| Dev tooling | concurrently, ts-node-dev, ESLint, Prettier, Husky + lint-staged |

---

## Monorepo structure

```
todo-menu/
├── package.json              # Workspace root; npm run dev starts both sides
├── shared/                   # @todo-menu/shared — domain types used by both sides
│   ├── types/index.ts        # Todo, CreateTodoDto, UpdateTodoDto, TodoFilters, Boon, etc.
│   └── package.json
├── server/                   # @todo-menu/server — Express REST API
│   └── src/
│       ├── index.ts          # Entrypoint
│       ├── app.ts            # Express setup (middleware, routes)
│       ├── routes/todo.routes.ts
│       ├── controllers/todo.controller.ts   # HTTP layer
│       ├── services/todo.service.ts         # Business logic; throws typed domain errors
│       ├── repositories/todo.repository.ts  # ITodoRepository + in-memory impl
│       ├── middleware/error.middleware.ts
│       └── __tests__/todo.service.test.ts
└── client/                   # @todo-menu/client — React SPA
    └── src/
        ├── App.tsx
        ├── components/
        │   ├── AddTodoForm.tsx          # Expandable form: energy / timeslot / boons
        │   ├── AddTodoForm.module.scss  # Component-scoped styles for the segmented option buttons
        │   ├── FilterBar.tsx            # Filter pills with active state banner
        │   └── TodoList.tsx             # Grouped by energy cost, animated cards
        ├── hooks/useTodos.ts    # Fetch + client-side filter (useMemo) + state
        ├── services/todo.api.ts # Typed fetch wrapper
        ├── styles/
        │   ├── index.css            # Global styles + shared classes (.card, .btn-primary, etc.)
        │   └── tokens/
        │       ├── primitives.css   # Raw values: palette hues, font stacks, type scale
        │       └── semantic.css     # Intent-based aliases over primitives — the public token API
        └── __tests__/        # Vitest unit tests + fixtures
```

---

## Domain model

Every todo item has the following fields:

| Field        | Type                                                                                                                                                            |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`         | `string` (UUID)                                                                                                                                                 |
| `name`       | `string`                                                                                                                                                        |
| `energyCost` | `"low" \| "medium" \| "high"`                                                                                                                                   |
| `timeslot`   | `"am" \| "pm" \| "eve"`                                                                                                                                         |
| `boons`      | Array of zero or more: `boundaries`, `connection`, `creativity`, `limit media`, `mindfulness`, `nature`, `nutrition`, `physical activity`, `routine`, `therapy` |
| `createdAt`  | ISO 8601 string                                                                                                                                                 |
| `updatedAt`  | ISO 8601 string                                                                                                                                                 |

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

### Client-side filtering

Filtering by energy cost and timeslot is performed entirely in the browser via `useMemo` inside `useTodos.ts`. The server returns the full list sorted by energy cost; the client applies incremental filters on top — keeping the UX instant with no API round-trips.

### Client data layer

`todo.api.ts` owns all fetch concerns. `useTodos.ts` owns React state and client-side filtering. Components only interact with the hook. This separation makes each layer independently unit-testable.

### Design tokens: primitive → semantic → component

Styling tokens are CSS custom properties in three layers, covering both color and the type scale:

- **Primitive** (`styles/tokens/primitives.css`) — raw values, no meaning attached: palette hues (`--color-violet-500`, `--color-teal-400`, etc.) and a rem-based font-size scale (`--font-size-2xs` through `--font-size-3xl`).
- **Semantic** (`styles/tokens/semantic.css`) — intent-based aliases over primitives (`--accent`, `--energy-low`, `--bg-card`, `--font-size-title`, etc.). These names are the stable public API: `tailwind.config.js` maps its theme colors and font sizes to them, and shared global classes (`.card`, `.filter-pill`, `.btn-primary`, `.boon-tag`) consume them by name — renaming a semantic token means updating every consumer. Two semantic names can point at the same primitive without meaning the same thing (`--font-size-heading` and `--font-size-icon` are both `--font-size-lg`) — they rename independently since they describe different roles.
- **Component** — CSS custom properties scoped to a single use site, added only when a value is genuinely local. Two variants: scoped to a component's SCSS Module (`AddTodoForm.module.scss`'s `--accent`, set inline per-option in JSX — energy buttons pass their own hue, timeslot buttons omit it and fall back to the semantic `--violet`), and scoped to one instance of a _shared global class_ (`.filter-pill.active`'s `--pill-accent`/`-tint`/`-glow` and `.card`'s `--card-accent(-width)` in `index.css`). The latter exists so `FilterBar`'s energy pills and `TodoList`'s `TodoCard` can tint themselves without a CSS specificity fight against the shared rule — no `!important` needed, since it's the same rule reading a parameterized value rather than two rules competing.

Tailwind utility classes (wired to the token-backed theme) handle layout, spacing, and most color/type. SCSS Modules are reserved for styling that doesn't reduce cleanly to utility classes — dynamic per-instance state being the main case. `FilterBar.tsx`, `TodoList.tsx`, and `App.tsx` now use token-backed Tailwind classes for color and font size, but their structural/layout styling (flex, gap, padding, per-item `animationDelay`) is still inline `style` props, not SCSS Modules — a future pass should finish that following the `AddTodoForm` pattern.

### Linting & formatting

One root-level `eslint.config.mjs` (flat config) and `.prettierrc.json` cover all three workspaces — there's no per-workspace ESLint config. Rules are intentionally basic: `eslint:recommended` + `typescript-eslint` recommended + `react-hooks` rules scoped to `client/src/**`, with `eslint-config-prettier` disabling any ESLint rule that would conflict with Prettier's formatting. `no-undef` is off for TS files since TypeScript's own compiler already covers that more accurately. A Husky pre-commit hook runs `lint-staged` (ESLint --fix + Prettier --write on staged files).

---

## Dev server notes

The Vite dev server proxies `/api` requests to `http://localhost:3001`, so no CORS configuration is needed in development.

---

## Test coverage

### Client (Vitest + Testing Library)

- **`App.test.tsx`** — 13 UI integration tests that render the real `App` tree and drive it via `userEvent` (clicks/typing), mocking only the API layer: sort order, energy/timeslot filters (incl. empty result and composed filters), clear filters, create flow, delete flow, and error handling
- **`AddTodoForm.test.tsx`** — 20 tests covering collapsed/expanded state, all 10 boons rendered, default submission values, field interactions, boon toggle/multi-select, validation (blank/whitespace), submission DTO shape, form reset, and cancel behaviour — assertions go through user actions and outcomes (submitted DTOs, role-based presence), not inline styles or copy
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
7. Finish migrating `FilterBar.tsx`/`TodoList.tsx`/`App.tsx` structural styling into SCSS Modules (see Design tokens above)
