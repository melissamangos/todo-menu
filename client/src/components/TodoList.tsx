import { Todo } from "@todo-menu/shared";

interface Props {
  todos: Todo[];
  onDelete: (id: string) => Promise<void>;
}

const ENERGY_META: Record<
  Todo["energyCost"],
  { color: string; bg: string; label: string; dot: string }
> = {
  low: {
    color: "var(--energy-low)",
    bg: "var(--energy-low-bg)",
    label: "Low energy",
    dot: "#2dd4bf",
  },
  medium: {
    color: "var(--energy-med)",
    bg: "var(--energy-med-bg)",
    label: "Medium energy",
    dot: "#a78bfa",
  },
  high: {
    color: "var(--energy-high)",
    bg: "var(--energy-high-bg)",
    label: "High energy",
    dot: "#f472b6",
  },
};

const SLOT_META: Record<Todo["timeslot"], { icon: string; label: string }> = {
  am: { icon: "☀️", label: "Morning" },
  pm: { icon: "🌤️", label: "Afternoon" },
  eve: { icon: "🌙", label: "Evening" },
};

// Group todos by energy cost for visual grouping
function groupByEnergy(todos: Todo[]): { key: Todo["energyCost"]; items: Todo[] }[] {
  const groups: Record<string, Todo[]> = { low: [], medium: [], high: [] };
  for (const t of todos) groups[t.energyCost].push(t);
  return (["low", "medium", "high"] as Todo["energyCost"][])
    .filter((k) => groups[k].length > 0)
    .map((k) => ({ key: k, items: groups[k] }));
}

export function TodoList({ todos, onDelete }: Props) {
  if (todos.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "48px 0",
          color: "var(--slate-muted)",
        }}
      >
        <div style={{ fontSize: 36, marginBottom: 12 }}>✦</div>
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontSize: 18,
            color: "var(--slate-light)",
            marginBottom: 4,
          }}
        >
          Your menu is empty
        </p>
        <p style={{ fontSize: 13 }}>Add your first item above to get started.</p>
      </div>
    );
  }

  const groups = groupByEnergy(todos);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {groups.map(({ key, items }) => {
        const meta = ENERGY_META[key];
        return (
          <div key={key}>
            {/* Group header */}
            <div className="energy-group-header">
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: meta.dot,
                  display: "inline-block",
                  flexShrink: 0,
                  boxShadow: `0 0 6px ${meta.dot}`,
                }}
              />
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: meta.color,
                }}
              >
                {meta.label}
              </span>
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: 11,
                  color: "var(--slate-muted)",
                }}
              >
                {items.length} {items.length === 1 ? "item" : "items"}
              </span>
            </div>

            {/* Cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {items.map((todo, i) => (
                <TodoCard key={todo.id} todo={todo} index={i} onDelete={onDelete} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TodoCard({
  todo,
  index,
  onDelete,
}: {
  todo: Todo;
  index: number;
  onDelete: (id: string) => Promise<void>;
}) {
  const energy = ENERGY_META[todo.energyCost];
  const slot = SLOT_META[todo.timeslot];

  return (
    <div
      className="card animate-in"
      style={{
        animationDelay: `${index * 40}ms`,
        padding: "14px 16px",
        borderLeft: `2px solid ${energy.color}`,
        borderRadius: "0 12px 12px 0",
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 16,
              color: "#e2e8f0",
              marginBottom: 8,
              lineHeight: 1.3,
            }}
          >
            {todo.name}
          </p>

          {/* Chips row */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {/* Timeslot */}
            <span
              className="chip"
              style={{
                background: "var(--bg-elevated)",
                color: "var(--slate-light)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              {slot.icon} {slot.label}
            </span>

            {/* Boons */}
            {todo.boons.map((b) => (
              <span
                key={b}
                className="chip"
                style={{
                  background: "var(--violet-dim)",
                  color: "var(--violet-light)",
                  border: "1px solid rgba(139,92,246,0.2)",
                }}
              >
                {b}
              </span>
            ))}
          </div>
        </div>

        {/* Delete */}
        <button
          onClick={() => onDelete(todo.id)}
          aria-label="Delete"
          style={{
            background: "none",
            border: "none",
            color: "var(--slate-muted)",
            cursor: "pointer",
            fontSize: 18,
            lineHeight: 1,
            padding: "2px 4px",
            borderRadius: 6,
            transition: "color 0.15s ease",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#f472b6")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--slate-muted)")}
        >
          ×
        </button>
      </div>
    </div>
  );
}
