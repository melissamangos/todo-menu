import { TodoFilters, EnergyCost, Timeslot } from "@todo-menu/shared";

interface Props {
  filters: TodoFilters;
  isFiltered: boolean;
  totalCount: number;
  filteredCount: number;
  onSetFilters: (f: Partial<TodoFilters>) => void;
  onClear: () => void;
}

const ENERGY_PILLS: { value: EnergyCost | "all"; label: string; color?: string }[] = [
  { value: "all",    label: "All energy" },
  { value: "low",    label: "Low",    color: "var(--energy-low)"  },
  { value: "medium", label: "Medium", color: "var(--energy-med)"  },
  { value: "high",   label: "High",   color: "var(--energy-high)" },
];

const SLOT_PILLS: { value: Timeslot | "all"; label: string }[] = [
  { value: "all", label: "All slots" },
  { value: "am",  label: "☀️ Morning" },
  { value: "pm",  label: "🌤️ Afternoon" },
  { value: "eve", label: "🌙 Evening" },
];

export function FilterBar({ filters, isFiltered, totalCount, filteredCount, onSetFilters, onClear }: Props) {
  return (
    <div className="mb-5">
      <p className="section-label mb-3">Filter</p>

      {/* Energy row */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
        {ENERGY_PILLS.map((p) => {
          const isActive = filters.energyCost === p.value;
          return (
            <button
              key={p.value}
              onClick={() => onSetFilters({ energyCost: p.value })}
              className={`filter-pill${isActive ? " active" : ""}`}
              style={isActive && p.color ? {
                borderColor: p.color,
                color: p.color,
                background: `color-mix(in srgb, ${p.color} 12%, transparent)`,
                boxShadow: `0 0 10px color-mix(in srgb, ${p.color} 18%, transparent)`,
              } : {}}
            >
              {p.color && (
                <span style={{
                  display: "inline-block",
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: p.color,
                  marginRight: 5,
                  verticalAlign: "middle",
                }} />
              )}
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Timeslot row */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {SLOT_PILLS.map((p) => (
          <button
            key={p.value}
            onClick={() => onSetFilters({ timeslot: p.value })}
            className={`filter-pill${filters.timeslot === p.value ? " active" : ""}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Active filter banner */}
      {isFiltered && (
        <div className="filter-banner mt-3 animate-in">
          <span>
            Showing <strong style={{ color: "white" }}>{filteredCount}</strong> of{" "}
            <strong style={{ color: "white" }}>{totalCount}</strong> items
          </span>
          <button
            onClick={onClear}
            style={{
              background: "none",
              border: "none",
              color: "var(--violet-light)",
              cursor: "pointer",
              fontFamily: "var(--font-body)",
              fontSize: 12,
              fontWeight: 500,
              padding: "2px 6px",
              borderRadius: 6,
              textDecoration: "underline",
              textUnderlineOffset: 2,
            }}
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
