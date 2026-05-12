import { useState } from "react";
import { CreateTodoDto, EnergyCost, Timeslot, Boon, ALL_BOONS } from "@todo-menu/shared";

interface Props {
  onAdd: (dto: CreateTodoDto) => Promise<void>;
}

const ENERGY_OPTIONS: { value: EnergyCost; label: string; color: string }[] = [
  { value: "low",    label: "Low",    color: "var(--energy-low)"  },
  { value: "medium", label: "Medium", color: "var(--energy-med)"  },
  { value: "high",   label: "High",   color: "var(--energy-high)" },
];

const SLOT_OPTIONS: { value: Timeslot; label: string; icon: string }[] = [
  { value: "am",  label: "Morning", icon: "☀️" },
  { value: "pm",  label: "Afternoon", icon: "🌤️" },
  { value: "eve", label: "Evening", icon: "🌙" },
];

export function AddTodoForm({ onAdd }: Props) {
  const [name, setName] = useState("");
  const [energyCost, setEnergyCost] = useState<EnergyCost>("low");
  const [timeslot, setTimeslot] = useState<Timeslot>("am");
  const [boons, setBoons] = useState<Boon[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleBoon = (b: Boon) =>
    setBoons((prev) => prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await onAdd({ name: name.trim(), energyCost, timeslot, boons });
      setName("");
      setEnergyCost("low");
      setTimeslot("am");
      setBoons([]);
      setIsExpanded(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card mb-6">
      <div className="p-5">
        <p className="section-label mb-3">New item</p>

        {/* Name input */}
        <input
          type="text"
          value={name}
          onFocus={() => setIsExpanded(true)}
          onChange={(e) => setName(e.target.value)}
          placeholder="What do you want to do?"
          className="field w-full px-4 py-3 mb-4"
          style={{ fontSize: 15 }}
        />

        {isExpanded && (
          <div className="animate-in">
            {/* Energy Cost */}
            <div className="mb-4">
              <p className="section-label mb-2">Energy cost</p>
              <div style={{ display: "flex", gap: 8 }}>
                {ENERGY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setEnergyCost(opt.value)}
                    style={{
                      flex: 1,
                      padding: "8px 0",
                      borderRadius: 10,
                      border: `1px solid ${energyCost === opt.value ? opt.color : "var(--border-subtle)"}`,
                      background: energyCost === opt.value ? `color-mix(in srgb, ${opt.color} 12%, transparent)` : "var(--bg-elevated)",
                      color: energyCost === opt.value ? opt.color : "var(--slate-light)",
                      fontFamily: "var(--font-body)",
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      boxShadow: energyCost === opt.value ? `0 0 12px color-mix(in srgb, ${opt.color} 20%, transparent)` : "none",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Timeslot */}
            <div className="mb-4">
              <p className="section-label mb-2">Timeslot</p>
              <div style={{ display: "flex", gap: 8 }}>
                {SLOT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTimeslot(opt.value)}
                    style={{
                      flex: 1,
                      padding: "8px 0",
                      borderRadius: 10,
                      border: `1px solid ${timeslot === opt.value ? "var(--violet)" : "var(--border-subtle)"}`,
                      background: timeslot === opt.value ? "var(--violet-dim)" : "var(--bg-elevated)",
                      color: timeslot === opt.value ? "var(--violet-light)" : "var(--slate-light)",
                      fontFamily: "var(--font-body)",
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <span style={{ marginRight: 4 }}>{opt.icon}</span>{opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Boons */}
            <div className="mb-5">
              <p className="section-label mb-2">Boons {boons.length > 0 && <span style={{ color: "var(--violet-light)", marginLeft: 6 }}>({boons.length})</span>}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {ALL_BOONS.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => toggleBoon(b)}
                    className={`boon-tag${boons.includes(b) ? " selected" : ""}`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                onClick={() => { setIsExpanded(false); setName(""); setBoons([]); }}
                style={{
                  padding: "10px 16px",
                  borderRadius: 10,
                  border: "1px solid var(--border-subtle)",
                  background: "transparent",
                  color: "var(--slate-muted)",
                  fontFamily: "var(--font-body)",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !name.trim()}
                className="btn-primary"
                style={{ flex: 1, padding: "10px 0" }}
              >
                {isSubmitting ? "Adding…" : "Add to menu"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
