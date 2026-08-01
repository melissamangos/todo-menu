import { Todo } from "@todo-menu/shared";
import styles from "./TodoList.module.scss";

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
      <div className="text-ink-faint text-center py-12">
        <div className="text-icon-lg mb-3">✦</div>
        <p className="text-ink-muted text-heading font-display italic mb-1">Your menu is empty</p>
        <p className="text-body">Add your first item above to get started.</p>
      </div>
    );
  }

  const groups = groupByEnergy(todos);

  return (
    <div className="flex flex-col gap-5">
      {groups.map(({ key, items }) => {
        const meta = ENERGY_META[key];
        return (
          <div key={key}>
            {/* Group header */}
            <div className="energy-group-header">
              <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${meta.bgClass}`} />
              <span
                className={`${meta.textClass} text-label font-semibold uppercase tracking-widest`}
              >
                {meta.label}
              </span>
              <span className="text-ink-faint text-caption ml-auto">
                {items.length} {items.length === 1 ? "item" : "items"}
              </span>
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-2">
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
      className="card animate-in px-4 py-3.5 rounded-l-none rounded-r-xl"
      // Feeds .card's --card-accent(-width) custom properties (see
      // index.css) — lets this specific card tint its left edge without a
      // specificity fight against that shared rule. animationDelay is
      // genuinely per-instance and has no Tailwind equivalent.
      style={
        {
          animationDelay: `${index * 40}ms`,
          "--card-accent": energy.color,
          "--card-accent-width": "2px",
        } as React.CSSProperties
      }
    >
      <div className="flex items-start gap-3">
        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`text-ink text-title font-display mb-2 ${styles.cardName}`}>{todo.name}</p>

          {/* Chips row */}
          <div className="flex flex-wrap gap-1.5">
            {/* Timeslot */}
            <span className="chip bg-elevated text-ink-muted border border-line">
              {slot.icon} {slot.label}
            </span>

            {/* Boons */}
            {todo.boons.map((b) => (
              <span
                key={b}
                className="chip bg-accent-dim text-accent-light border border-line-muted"
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
          className="text-ink-faint hover:text-energy-high transition-colors text-icon bg-transparent border-0 cursor-pointer leading-none px-1 py-0.5 rounded-md shrink-0"
        >
          ×
        </button>
      </div>
    </div>
  );
}
