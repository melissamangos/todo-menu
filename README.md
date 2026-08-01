# Todo Menu

A full-stack wellness-focused to-do application built with TypeScript, React, Tailwind CSS, SCSS Modules, and Node.js/Express. Structured as an npm workspace monorepo with clean separation between client, server, and shared types.

For architecture decisions, the design token system, the domain model, and test coverage, see [agents.md](agents.md).

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

## Prerequisites

- **Node.js** ≥ 18.x (this repo is pinned to 24.18.1 via `.nvmrc`)
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

```bash
npm run lint            # ESLint across the whole repo
npm run lint:fix        # ESLint, auto-fixing what it can
npm run format          # Prettier, writes formatting changes
npm run format:check    # Prettier, fails if anything is unformatted
```

A pre-commit hook (Husky + lint-staged) runs ESLint and Prettier on staged files automatically before each commit. See [agents.md](agents.md) for the rule set and rationale.
