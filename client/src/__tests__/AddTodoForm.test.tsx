/**
 * AddTodoForm — unit tests
 *
 * Business requirements covered:
 *  ✓ Form is collapsed by default (fields not visible)
 *  ✓ Clicking the name input expands the full form
 *  ✓ Name is required — submit is disabled when blank
 *  ✓ Name is required — submit is disabled when whitespace-only
 *  ✓ Energy cost defaults to "low"
 *  ✓ Timeslot defaults to "am"
 *  ✓ User can change energy cost to medium or high
 *  ✓ User can change timeslot to pm or eve
 *  ✓ User can select multiple boons
 *  ✓ Selecting a boon twice deselects it (toggle)
 *  ✓ All 10 boons are rendered
 *  ✓ Submitting calls onAdd with correct shape
 *  ✓ Form resets after successful submission
 *  ✓ Cancel collapses the form without calling onAdd
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { AddTodoForm } from "../components/AddTodoForm";
import { ALL_BOONS } from "@todo-menu/shared";

const noop = vi.fn();

function setup(onAdd = noop) {
  return render(<AddTodoForm onAdd={onAdd} />);
}

function expandForm() {
  fireEvent.focus(screen.getByPlaceholderText(/what do you want to do/i));
}

describe("AddTodoForm — initial state", () => {
  it("renders the name input", () => {
    setup();
    expect(screen.getByPlaceholderText(/what do you want to do/i)).toBeInTheDocument();
  });

  it("does not show energy / timeslot controls before the input is focused", () => {
    setup();
    expect(screen.queryByText(/energy cost/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/timeslot/i)).not.toBeInTheDocument();
  });

  it("does not show the boon grid before the input is focused", () => {
    setup();
    expect(screen.queryByText("mindfulness")).not.toBeInTheDocument();
  });
});

describe("AddTodoForm — form expansion", () => {
  it("reveals energy, timeslot and boon controls on focus", () => {
    setup();
    expandForm();

    expect(screen.getByText(/energy cost/i)).toBeInTheDocument();
    expect(screen.getByText(/timeslot/i)).toBeInTheDocument();
    expect(screen.getByText(/boons/i)).toBeInTheDocument();
  });

  it("renders all 10 boons", () => {
    setup();
    expandForm();

    for (const boon of ALL_BOONS) {
      expect(screen.getByText(boon)).toBeInTheDocument();
    }
  });
});

describe("AddTodoForm — default values", () => {
  beforeEach(() => { setup(); expandForm(); });

  it("defaults energy cost to Low", () => {
    // The Low button should have the active border style
    const lowBtn = screen.getByRole("button", { name: /^low$/i });
    expect(lowBtn).toHaveStyle({ borderColor: "var(--energy-low)" });
  });

  it("defaults timeslot to Morning", () => {
    const morningBtn = screen.getByRole("button", { name: /morning/i });
    expect(morningBtn).toHaveStyle({ borderColor: "var(--violet)" });
  });
});

describe("AddTodoForm — field interactions", () => {
  it("user can select Medium energy cost", async () => {
    setup();
    expandForm();

    await userEvent.click(screen.getByRole("button", { name: /^medium$/i }));

    expect(screen.getByRole("button", { name: /^medium$/i }))
      .toHaveStyle({ borderColor: "var(--energy-med)" });
  });

  it("user can select High energy cost", async () => {
    setup();
    expandForm();

    await userEvent.click(screen.getByRole("button", { name: /^high$/i }));

    expect(screen.getByRole("button", { name: /^high$/i }))
      .toHaveStyle({ borderColor: "var(--energy-high)" });
  });

  it("user can change timeslot to Afternoon", async () => {
    setup();
    expandForm();

    await userEvent.click(screen.getByRole("button", { name: /afternoon/i }));

    expect(screen.getByRole("button", { name: /afternoon/i }))
      .toHaveStyle({ borderColor: "var(--violet)" });
  });

  it("user can change timeslot to Evening", async () => {
    setup();
    expandForm();

    await userEvent.click(screen.getByRole("button", { name: /evening/i }));

    expect(screen.getByRole("button", { name: /evening/i }))
      .toHaveStyle({ borderColor: "var(--violet)" });
  });
});

describe("AddTodoForm — boon selection", () => {
  beforeEach(() => { setup(); expandForm(); });

  it("selecting a boon marks it as selected", async () => {
    await userEvent.click(screen.getByText("mindfulness"));
    expect(screen.getByText("mindfulness")).toHaveClass("selected");
  });

  it("user can select multiple boons simultaneously", async () => {
    await userEvent.click(screen.getByText("mindfulness"));
    await userEvent.click(screen.getByText("nature"));

    expect(screen.getByText("mindfulness")).toHaveClass("selected");
    expect(screen.getByText("nature")).toHaveClass("selected");
  });

  it("clicking a selected boon deselects it (toggle)", async () => {
    await userEvent.click(screen.getByText("routine"));
    expect(screen.getByText("routine")).toHaveClass("selected");

    await userEvent.click(screen.getByText("routine"));
    expect(screen.getByText("routine")).not.toHaveClass("selected");
  });

  it("boon count label updates when boons are selected", async () => {
    await userEvent.click(screen.getByText("connection"));
    await userEvent.click(screen.getByText("creativity"));

    expect(screen.getByText("(2)")).toBeInTheDocument();
  });
});

describe("AddTodoForm — validation", () => {
  it("Add to menu button is disabled when name is empty", () => {
    setup();
    expandForm();
    expect(screen.getByRole("button", { name: /add to menu/i })).toBeDisabled();
  });

  it("Add to menu button is disabled when name is whitespace only", async () => {
    setup();
    expandForm();
    await userEvent.type(screen.getByPlaceholderText(/what do you want to do/i), "   ");
    expect(screen.getByRole("button", { name: /add to menu/i })).toBeDisabled();
  });

  it("Add to menu button is enabled once a valid name is typed", async () => {
    setup();
    expandForm();
    await userEvent.type(screen.getByPlaceholderText(/what do you want to do/i), "Morning run");
    expect(screen.getByRole("button", { name: /add to menu/i })).toBeEnabled();
  });
});

describe("AddTodoForm — submission", () => {
  it("calls onAdd with the correct DTO on submit", async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined);
    setup(onAdd);
    expandForm();

    await userEvent.type(screen.getByPlaceholderText(/what do you want to do/i), "Evening yoga");
    await userEvent.click(screen.getByRole("button", { name: /^high$/i }));
    await userEvent.click(screen.getByRole("button", { name: /evening/i }));
    await userEvent.click(screen.getByText("mindfulness"));
    await userEvent.click(screen.getByText("routine"));

    await userEvent.click(screen.getByRole("button", { name: /add to menu/i }));

    expect(onAdd).toHaveBeenCalledOnce();
    expect(onAdd).toHaveBeenCalledWith({
      name:       "Evening yoga",
      energyCost: "high",
      timeslot:   "eve",
      boons:      ["mindfulness", "routine"],
    });
  });

  it("trims leading/trailing whitespace from the name", async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined);
    setup(onAdd);
    expandForm();

    await userEvent.type(
      screen.getByPlaceholderText(/what do you want to do/i),
      "  Walk the dog  "
    );
    await userEvent.click(screen.getByRole("button", { name: /add to menu/i }));

    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Walk the dog" })
    );
  });

  it("resets all fields after successful submission", async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined);
    setup(onAdd);
    expandForm();

    await userEvent.type(screen.getByPlaceholderText(/what do you want to do/i), "Stretch");
    await userEvent.click(screen.getByText("nature"));
    await userEvent.click(screen.getByRole("button", { name: /add to menu/i }));

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/what do you want to do/i)).toHaveValue("");
    });
    // Form collapses — extended fields no longer visible
    expect(screen.queryByText(/energy cost/i)).not.toBeInTheDocument();
  });

  it("does not call onAdd when submitting with no name (keyboard enter)", async () => {
    const onAdd = vi.fn();
    setup(onAdd);
    expandForm();

    fireEvent.submit(screen.getByPlaceholderText(/what do you want to do/i));

    expect(onAdd).not.toHaveBeenCalled();
  });
});

describe("AddTodoForm — cancel", () => {
  it("Cancel collapses the form without calling onAdd", async () => {
    const onAdd = vi.fn();
    setup(onAdd);
    expandForm();

    await userEvent.type(screen.getByPlaceholderText(/what do you want to do/i), "Some task");
    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onAdd).not.toHaveBeenCalled();
    expect(screen.queryByText(/energy cost/i)).not.toBeInTheDocument();
  });

  it("Cancel clears the name input", async () => {
    setup();
    expandForm();

    await userEvent.type(screen.getByPlaceholderText(/what do you want to do/i), "Some task");
    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(screen.getByPlaceholderText(/what do you want to do/i)).toHaveValue("");
  });
});
