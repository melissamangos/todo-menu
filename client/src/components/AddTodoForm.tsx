import { useState } from "react";
import { CreateTodoDto, EnergyCost, Timeslot, Boon, ALL_BOONS } from "@todo-menu/shared";
import styles from "./AddTodoForm.module.scss";

interface Props {
  onAdd: (dto: CreateTodoDto) => Promise<void>;
}

const ENERGY_OPTIONS: { value: EnergyCost; label: string; color: string }[] = [
  { value: "low", label: "Low", color: "var(--energy-low)" },
  { value: "medium", label: "Medium", color: "var(--energy-med)" },
  { value: "high", label: "High", color: "var(--energy-high)" },
];

const SLOT_OPTIONS: { value: Timeslot; label: string; icon: string }[] = [
  { value: "am", label: "Morning", icon: "☀️" },
  { value: "pm", label: "Afternoon", icon: "🌤️" },
  { value: "eve", label: "Evening", icon: "🌙" },
];

function optionClass(isActive: boolean): string {
  return [styles.option, isActive && styles.active].filter(Boolean).join(" ");
}

export function AddTodoForm({ onAdd }: Props) {
  const [name, setName] = useState("");
  const [energyCost, setEnergyCost] = useState<EnergyCost>("low");
  const [timeslot, setTimeslot] = useState<Timeslot>("am");
  const [boons, setBoons] = useState<Boon[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleBoon = (b: Boon) =>
    setBoons((prev) => (prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]));

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
          className="field w-full px-4 py-3 mb-4 text-[15px]"
        />

        {isExpanded && (
          <div className="animate-in">
            {/* Energy Cost */}
            <div className="mb-4">
              <p className="section-label mb-2">Energy cost</p>
              <div className="flex gap-2">
                {ENERGY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setEnergyCost(opt.value)}
                    className={optionClass(energyCost === opt.value)}
                    style={{ "--accent": opt.color } as React.CSSProperties}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Timeslot */}
            <div className="mb-4">
              <p className="section-label mb-2">Timeslot</p>
              <div className="flex gap-2">
                {SLOT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTimeslot(opt.value)}
                    className={optionClass(timeslot === opt.value)}
                  >
                    <span className="mr-1">{opt.icon}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Boons */}
            <div className="mb-5">
              <p className="section-label mb-2">
                Boons{" "}
                {boons.length > 0 && (
                  <span className="text-accent-light ml-1.5">({boons.length})</span>
                )}
              </p>
              <div className="flex flex-wrap gap-1.5">
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

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsExpanded(false);
                  setName("");
                  setBoons([]);
                }}
                className="rounded-[10px] border border-line px-4 py-2.5 bg-transparent text-ink-faint font-body text-[13px] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !name.trim()}
                className="btn-primary flex-1 py-2.5 px-0"
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
