import type { Todo } from "@todo-menu/shared";

export const makeTodo = (overrides: Partial<Todo> = {}): Todo => ({
  id:         overrides.id         ?? "todo-1",
  name:       overrides.name       ?? "Morning walk",
  energyCost: overrides.energyCost ?? "low",
  timeslot:   overrides.timeslot   ?? "am",
  boons:      overrides.boons      ?? ["nature", "physical activity"],
  createdAt:  overrides.createdAt  ?? new Date().toISOString(),
  updatedAt:  overrides.updatedAt  ?? new Date().toISOString(),
});

// A stable set covering all three energy levels and all three timeslots
export const TODO_LOW_AM    = makeTodo({ id: "1", name: "Stretch",       energyCost: "low",    timeslot: "am",  boons: ["routine"]      });
export const TODO_LOW_PM    = makeTodo({ id: "2", name: "Read",          energyCost: "low",    timeslot: "pm",  boons: ["mindfulness"]  });
export const TODO_MED_AM    = makeTodo({ id: "3", name: "Cook lunch",    energyCost: "medium", timeslot: "am",  boons: ["nutrition"]    });
export const TODO_MED_EVE   = makeTodo({ id: "4", name: "Call friend",   energyCost: "medium", timeslot: "eve", boons: ["connection"]   });
export const TODO_HIGH_PM   = makeTodo({ id: "5", name: "Run 5k",        energyCost: "high",   timeslot: "pm",  boons: ["physical activity"] });
export const TODO_HIGH_EVE  = makeTodo({ id: "6", name: "Therapy notes", energyCost: "high",   timeslot: "eve", boons: ["therapy"]      });

export const ALL_TODOS = [TODO_LOW_AM, TODO_LOW_PM, TODO_MED_AM, TODO_MED_EVE, TODO_HIGH_PM, TODO_HIGH_EVE];
