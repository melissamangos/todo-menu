import { Todo } from "@todo-menu/shared";

interface Props {
  todos: Todo[];
  onDelete: (id: string) => Promise<void>;
}

const ENERGY_META: Record<
  Todo["energyCost"],
  { label: string; textClass: string; bgClass: string; color: string }
> = {
  low: {
    label: "Low energy",
    textClass: "text-energy-low",
    bgClass: "bg-energy-low",
    color: "var(--energy-low)",
  },
  medium: {
    label: "Medium energy",
    textClass: "text-energy-medium",
    bgClass: "bg-energy-medium",
    color: "var(--energy-med)",
  },
  high: {
    label: "High energy",
    textClass: "text-energy-high",
    bgClass: "bg-energy-high",
    color: "var(--energy-high)",
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
        className="text-ink-faint"
        style={{
          textAlign: "center",
          padding: "48px 0",
        }}
      >
        <div className="text-icon-lg" style={{ marginBottom: 12 }}>
          ✦
        </div>
        <p
          className="text-ink-muted text-heading"
          style={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            marginBottom: 4,
          }}
        >
          Your menu is empty
        </p>
        <p className="text-body">Add your first item above to get started.</p>
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
                className={meta.bgClass}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
              <span
                className={`${meta.textClass} text-label`}
                style={{
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                {meta.label}
              </span>
              <span
                className="text-ink-faint text-caption"
                style={{
                  marginLeft: "auto",
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
      // Feeds .card's --card-accent(-width) custom properties (see
      // index.css) — lets this specific card tint its left edge without a
      // specificity fight against that shared rule.
      style={
        {
          animationDelay: `${index * 40}ms`,
          padding: "14px 16px",
          borderRadius: "0 12px 12px 0",
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
          "--card-accent": energy.color,
          "--card-accent-width": "2px",
        } as React.CSSProperties
      }
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            className="text-ink text-title"
            style={{
              fontFamily: "var(--font-display)",
              marginBottom: 8,
              lineHeight: 1.3,
            }}
          >
            {todo.name}
          </p>

          {/* Chips row */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {/* Timeslot */}
            <span className="chip bg-elevated text-ink-muted border border-line">
              {slot.icon} {slot.label}
            </span>

            {/* Boons */}
            {todo.boons.map((b) => (
              <span
                key={b}
                className="chip bg-accent-dim text-accent-light"
                style={{
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
          className="text-ink-faint hover:text-energy-high transition-colors text-icon"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            lineHeight: 1,
            padding: "2px 4px",
            borderRadius: 6,
            flexShrink: 0,
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}
