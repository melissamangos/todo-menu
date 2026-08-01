/**
 * AddTodoForm — unit tests
 *
 * Business requirements covered:
 *  ✓ Form is collapsed by default (option controls not interactable)
 *  ✓ Clicking the name input expands the full form
 *  ✓ Name is required — submit is disabled when blank
 *  ✓ Name is required — submit is disabled when whitespace-only
 *  ✓ Submitting without touching energy/timeslot defaults to low / morning
 *  ✓ User can change energy cost to medium or high
 *  ✓ User can change timeslot to pm or eve
 *  ✓ User can select multiple boons
 *  ✓ Selecting a boon twice deselects it (toggle)
 *  ✓ All 10 boons are rendered as clickable options
 *  ✓ Submitting calls onAdd with correct shape
 *  ✓ Form resets after successful submission
 *  ✓ Cancel collapses the form without calling onAdd
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect } from "vitest";
import { AddTodoForm } from "../components/AddTodoForm";
import { ALL_BOONS } from "@todo-menu/shared";

const noop = vi.fn();

function setup(onAdd = noop) {
  return render(<AddTodoForm onAdd={onAdd} />);
}

function expandForm() {
  fireEvent.focus(screen.getByPlaceholderText(/what do you want to do/i));
}

async function fillNameAndSubmit(name: string) {
  await userEvent.type(screen.getByPlaceholderText(/what do you want to do/i), name);
  await userEvent.click(screen.getByRole("button", { name: /add to menu/i }));
}

describe("AddTodoForm — initial state", () => {
  it("renders the name input", () => {
    setup();
    expect(screen.getByPlaceholderText(/what do you want to do/i)).toBeInTheDocument();
  });

  it("does not expose energy/timeslot/boon controls before the input is focused", () => {
    setup();
    expect(screen.queryByRole("button", { name: /cancel/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^low$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "mindfulness" })).not.toBeInTheDocument();
  });
});

describe("AddTodoForm — form expansion", () => {
  it("reveals energy, timeslot, boon and cancel controls on focus", () => {
    setup();
    expandForm();

    expect(screen.getByRole("button", { name: /^low$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /morning/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("renders all 10 boons as clickable options", () => {
    setup();
    expandForm();

    for (const boon of ALL_BOONS) {
      expect(screen.getByRole("button", { name: boon })).toBeInTheDocument();
    }
  });
});

describe("AddTodoForm — defaults", () => {
  it("submits with low energy and morning timeslot when left untouched", async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined);
    setup(onAdd);
    expandForm();

    await fillNameAndSubmit("Morning walk");

    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({ energyCost: "low", timeslot: "am" })
    );
  });
});

describe("AddTodoForm — field interactions", () => {
  it("submits with medium energy after selecting Medium", async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined);
    setup(onAdd);
    expandForm();

    await userEvent.click(screen.getByRole("button", { name: /^medium$/i }));
    await fillNameAndSubmit("Tidy up");

    expect(onAdd).toHaveBeenCalledWith(expect.objectContaining({ energyCost: "medium" }));
  });

  it("submits with high energy after selecting High", async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined);
    setup(onAdd);
    expandForm();

    await userEvent.click(screen.getByRole("button", { name: /^high$/i }));
    await fillNameAndSubmit("Run 5k");

    expect(onAdd).toHaveBeenCalledWith(expect.objectContaining({ energyCost: "high" }));
  });

  it("submits with pm timeslot after selecting Afternoon", async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined);
    setup(onAdd);
    expandForm();

    await userEvent.click(screen.getByRole("button", { name: /afternoon/i }));
    await fillNameAndSubmit("Read a book");

    expect(onAdd).toHaveBeenCalledWith(expect.objectContaining({ timeslot: "pm" }));
  });

  it("submits with eve timeslot after selecting Evening", async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined);
    setup(onAdd);
    expandForm();

    await userEvent.click(screen.getByRole("button", { name: /evening/i }));
    await fillNameAndSubmit("Wind down");

    expect(onAdd).toHaveBeenCalledWith(expect.objectContaining({ timeslot: "eve" }));
  });
});

describe("AddTodoForm — boon selection", () => {
  it("includes every selected boon in the submitted DTO", async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined);
    setup(onAdd);
    expandForm();

    await userEvent.click(screen.getByRole("button", { name: "mindfulness" }));
    await userEvent.click(screen.getByRole("button", { name: "nature" }));
    await fillNameAndSubmit("Evening walk");

    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({ boons: ["mindfulness", "nature"] })
    );
  });

  it("clicking a boon twice removes it from the submitted DTO", async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined);
    setup(onAdd);
    expandForm();

    await userEvent.click(screen.getByRole("button", { name: "routine" }));
    await userEvent.click(screen.getByRole("button", { name: "routine" }));
    await fillNameAndSubmit("Stretch");

    expect(onAdd).toHaveBeenCalledWith(expect.objectContaining({ boons: [] }));
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
    await userEvent.click(screen.getByRole("button", { name: "mindfulness" }));
    await userEvent.click(screen.getByRole("button", { name: "routine" }));

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

  it("resets and collapses the form after successful submission", async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined);
    setup(onAdd);
    expandForm();

    await userEvent.type(screen.getByPlaceholderText(/what do you want to do/i), "Stretch");
    await userEvent.click(screen.getByRole("button", { name: "nature" }));
    await userEvent.click(screen.getByRole("button", { name: /add to menu/i }));

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/what do you want to do/i)).toHaveValue("");
    });
    // Form collapses — extended controls are no longer interactable
    expect(screen.queryByRole("button", { name: /cancel/i })).not.toBeInTheDocument();
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
    expect(screen.queryByRole("button", { name: /^low$/i })).not.toBeInTheDocument();
  });

  it("Cancel clears the name input", async () => {
    setup();
    expandForm();

    await userEvent.type(screen.getByPlaceholderText(/what do you want to do/i), "Some task");
    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(screen.getByPlaceholderText(/what do you want to do/i)).toHaveValue("");
  });
});
