/**
 * App — UI integration tests
 *
 * These drive the real App tree (useTodos + AddTodoForm + FilterBar + TodoList)
 * the way a user would: clicking filter pills, typing into the form, clicking
 * submit/delete. Only the API layer is mocked.
 *
 * Business requirements covered:
 *  ✓ Items render sorted low → medium → high energy cost
 *  ✓ Clicking an energy filter pill shows only matching items (incl. empty result)
 *  ✓ Clicking a timeslot filter pill shows only matching items
 *  ✓ Energy and timeslot filters compose (AND logic)
 *  ✓ Clear filters restores the full list and hides the filter banner
 *  ✓ Submitting the add form inserts the new item into the list
 *  ✓ Clicking delete removes the item from the list
 *  ✓ A failed initial load surfaces an error and shows no items
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import App from "../App";
import { todoApi } from "../services/todo.api";
import {
  ALL_TODOS,
  TODO_LOW_AM,
  TODO_LOW_PM,
  TODO_MED_AM,
  TODO_MED_EVE,
  TODO_HIGH_PM,
  TODO_HIGH_EVE,
  makeTodo,
} from "./fixtures";

vi.mock("../services/todo.api");

beforeEach(() => {
  vi.mocked(todoApi.getAll).mockReset();
  vi.mocked(todoApi.create).mockReset();
  vi.mocked(todoApi.update).mockReset();
  vi.mocked(todoApi.delete).mockReset();
  vi.mocked(todoApi.getById).mockReset();
});

// Reads the order items appear in the page, based on where their names show up in the text.
function orderOf(names: string[]): number[] {
  const text = document.body.textContent ?? "";
  return names.map((name) => text.indexOf(name));
}

describe("App — sort order", () => {
  it("renders items sorted low → medium → high regardless of API order", async () => {
    vi.mocked(todoApi.getAll).mockResolvedValue([TODO_HIGH_PM, TODO_LOW_AM, TODO_MED_AM]);
    render(<App />);

    await screen.findByText(TODO_HIGH_PM.name);

    const [lowIdx, medIdx, highIdx] = orderOf([
      TODO_LOW_AM.name,
      TODO_MED_AM.name,
      TODO_HIGH_PM.name,
    ]);
    expect(lowIdx).toBeLessThan(medIdx);
    expect(medIdx).toBeLessThan(highIdx);
  });
});

describe("App — energy filter", () => {
  beforeEach(() => {
    vi.mocked(todoApi.getAll).mockResolvedValue(ALL_TODOS);
  });

  it("shows only low-energy items after clicking the Low pill", async () => {
    render(<App />);
    await screen.findByText(TODO_LOW_AM.name);

    await userEvent.click(screen.getByRole("button", { name: /^low$/i }));

    expect(screen.getByText(TODO_LOW_AM.name)).toBeInTheDocument();
    expect(screen.getByText(TODO_LOW_PM.name)).toBeInTheDocument();
    expect(screen.queryByText(TODO_MED_AM.name)).not.toBeInTheDocument();
    expect(screen.queryByText(TODO_HIGH_PM.name)).not.toBeInTheDocument();
  });

  it("shows only high-energy items after clicking the High pill", async () => {
    render(<App />);
    await screen.findByText(TODO_LOW_AM.name);

    await userEvent.click(screen.getByRole("button", { name: /^high$/i }));

    expect(screen.getByText(TODO_HIGH_PM.name)).toBeInTheDocument();
    expect(screen.getByText(TODO_HIGH_EVE.name)).toBeInTheDocument();
    expect(screen.queryByText(TODO_LOW_AM.name)).not.toBeInTheDocument();
  });

  it("shows no items when the energy filter matches nothing", async () => {
    vi.mocked(todoApi.getAll).mockResolvedValue([TODO_LOW_AM]);
    render(<App />);
    await screen.findByText(TODO_LOW_AM.name);

    await userEvent.click(screen.getByRole("button", { name: /^high$/i }));

    expect(screen.queryByText(TODO_LOW_AM.name)).not.toBeInTheDocument();
  });
});

describe("App — timeslot filter", () => {
  beforeEach(() => {
    vi.mocked(todoApi.getAll).mockResolvedValue(ALL_TODOS);
  });

  it("shows only morning items after clicking the Morning pill", async () => {
    render(<App />);
    await screen.findByText(TODO_LOW_AM.name);

    await userEvent.click(screen.getByRole("button", { name: /morning/i }));

    expect(screen.getByText(TODO_LOW_AM.name)).toBeInTheDocument();
    expect(screen.getByText(TODO_MED_AM.name)).toBeInTheDocument();
    expect(screen.queryByText(TODO_LOW_PM.name)).not.toBeInTheDocument();
    expect(screen.queryByText(TODO_HIGH_EVE.name)).not.toBeInTheDocument();
  });

  it("shows only evening items after clicking the Evening pill", async () => {
    render(<App />);
    await screen.findByText(TODO_LOW_AM.name);

    await userEvent.click(screen.getByRole("button", { name: /evening/i }));

    expect(screen.getByText(TODO_MED_EVE.name)).toBeInTheDocument();
    expect(screen.getByText(TODO_HIGH_EVE.name)).toBeInTheDocument();
    expect(screen.queryByText(TODO_LOW_AM.name)).not.toBeInTheDocument();
  });
});

describe("App — composed filters", () => {
  beforeEach(() => {
    vi.mocked(todoApi.getAll).mockResolvedValue(ALL_TODOS);
  });

  it("applies energy AND timeslot filters together", async () => {
    render(<App />);
    await screen.findByText(TODO_LOW_AM.name);

    await userEvent.click(screen.getByRole("button", { name: /^low$/i }));
    await userEvent.click(screen.getByRole("button", { name: /morning/i }));

    expect(screen.getByText(TODO_LOW_AM.name)).toBeInTheDocument();
    expect(screen.queryByText(TODO_LOW_PM.name)).not.toBeInTheDocument();
  });

  it("shows no items when combined filters match nothing", async () => {
    render(<App />);
    await screen.findByText(TODO_LOW_AM.name);

    await userEvent.click(screen.getByRole("button", { name: /^high$/i }));
    await userEvent.click(screen.getByRole("button", { name: /morning/i }));

    for (const todo of ALL_TODOS) {
      expect(screen.queryByText(todo.name)).not.toBeInTheDocument();
    }
  });
});

describe("App — clear filters", () => {
  beforeEach(() => {
    vi.mocked(todoApi.getAll).mockResolvedValue(ALL_TODOS);
  });

  it("does not show a clear-filters control until a filter is applied", async () => {
    render(<App />);
    await screen.findByText(TODO_LOW_AM.name);

    expect(screen.queryByRole("button", { name: /clear filters/i })).not.toBeInTheDocument();
  });

  it("restores the full list and hides the clear-filters control after clearing", async () => {
    render(<App />);
    await screen.findByText(TODO_LOW_AM.name);

    await userEvent.click(screen.getByRole("button", { name: /^high$/i }));
    await userEvent.click(screen.getByRole("button", { name: /evening/i }));
    expect(screen.queryByText(TODO_LOW_AM.name)).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /clear filters/i }));

    for (const todo of ALL_TODOS) {
      expect(screen.getByText(todo.name)).toBeInTheDocument();
    }
    expect(screen.queryByRole("button", { name: /clear filters/i })).not.toBeInTheDocument();
  });
});

describe("App — create flow", () => {
  it("adds a new item to the list after submitting the form", async () => {
    vi.mocked(todoApi.getAll).mockResolvedValue([]);
    const created = makeTodo({
      id: "99",
      name: "Yoga",
      energyCost: "low",
      timeslot: "am",
      boons: [],
    });
    vi.mocked(todoApi.create).mockResolvedValue(created);
    render(<App />);
    await waitFor(() => expect(todoApi.getAll).toHaveBeenCalled());

    const nameInput = screen.getByPlaceholderText(/what do you want to do/i);
    await userEvent.click(nameInput);
    await userEvent.type(nameInput, "Yoga");
    await userEvent.click(screen.getByRole("button", { name: /add to menu/i }));

    expect(await screen.findByText("Yoga")).toBeInTheDocument();
  });
});

describe("App — delete flow", () => {
  it("removes an item from the list after clicking delete", async () => {
    vi.mocked(todoApi.getAll).mockResolvedValue([TODO_LOW_AM]);
    vi.mocked(todoApi.delete).mockResolvedValue(undefined);
    render(<App />);
    await screen.findByText(TODO_LOW_AM.name);

    await userEvent.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(screen.queryByText(TODO_LOW_AM.name)).not.toBeInTheDocument();
    });
  });
});

describe("App — error handling", () => {
  it("surfaces the error and shows no items when the initial load fails", async () => {
    vi.mocked(todoApi.getAll).mockRejectedValue(new Error("Network error"));
    render(<App />);

    expect(await screen.findByText("Network error")).toBeInTheDocument();
    for (const todo of ALL_TODOS) {
      expect(screen.queryByText(todo.name)).not.toBeInTheDocument();
    }
  });
});
