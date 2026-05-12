/**
 * useTodos — unit tests
 *
 * Business requirements covered:
 *  ✓ Default view is sorted low → medium → high energy cost
 *  ✓ Filtering by energy cost returns only matching items
 *  ✓ Filtering by timeslot returns only matching items
 *  ✓ Energy cost and timeslot filters compose (AND logic)
 *  ✓ "all" filter value disables that dimension
 *  ✓ clearFilters resets both dimensions
 *  ✓ isFiltered is true when any filter is active, false otherwise
 *  ✓ Creating a todo optimistically adds it to the list
 *  ✓ Deleting a todo removes it from the list
 *  ✓ API errors surface in the error field
 */

import { renderHook, act, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useTodos } from "../hooks/useTodos";
import { todoApi } from "../services/todo.api";
import { ALL_TODOS, TODO_LOW_AM, TODO_MED_AM, TODO_HIGH_PM, makeTodo } from "./fixtures";

vi.mock("../services/todo.api");

describe("useTodos — sort order", () => {
  beforeEach(() => {
    // Server returns items in arbitrary order; hook must sort them
    vi.mocked(todoApi.getAll).mockResolvedValue([TODO_HIGH_PM, TODO_LOW_AM, TODO_MED_AM]);
  });

  it("default view is sorted low → medium → high energy cost", async () => {
    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const energies = result.current.filteredTodos.map((t) => t.energyCost);
    expect(energies).toEqual(["low", "medium", "high"]);
  });
});

describe("useTodos — energy cost filter", () => {
  beforeEach(() => {
    vi.mocked(todoApi.getAll).mockResolvedValue(ALL_TODOS);
  });

  it("shows all items when energyCost filter is 'all' (default)", async () => {
    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.filteredTodos).toHaveLength(6);
  });

  it("shows only low-energy items when filter is 'low'", async () => {
    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => { result.current.setFilters({ energyCost: "low" }); });

    expect(result.current.filteredTodos).toHaveLength(2);
    expect(result.current.filteredTodos.every((t) => t.energyCost === "low")).toBe(true);
  });

  it("shows only medium-energy items when filter is 'medium'", async () => {
    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => { result.current.setFilters({ energyCost: "medium" }); });

    expect(result.current.filteredTodos.every((t) => t.energyCost === "medium")).toBe(true);
  });

  it("shows only high-energy items when filter is 'high'", async () => {
    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => { result.current.setFilters({ energyCost: "high" }); });

    expect(result.current.filteredTodos.every((t) => t.energyCost === "high")).toBe(true);
  });

  it("returns empty list when no items match the energy filter", async () => {
    vi.mocked(todoApi.getAll).mockResolvedValue([TODO_LOW_AM]);
    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => { result.current.setFilters({ energyCost: "high" }); });

    expect(result.current.filteredTodos).toHaveLength(0);
  });
});

describe("useTodos — timeslot filter", () => {
  beforeEach(() => {
    vi.mocked(todoApi.getAll).mockResolvedValue(ALL_TODOS);
  });

  it("shows all items when timeslot filter is 'all' (default)", async () => {
    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.filteredTodos).toHaveLength(6);
  });

  it("shows only AM items when filter is 'am'", async () => {
    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => { result.current.setFilters({ timeslot: "am" }); });

    expect(result.current.filteredTodos.every((t) => t.timeslot === "am")).toBe(true);
  });

  it("shows only PM items when filter is 'pm'", async () => {
    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => { result.current.setFilters({ timeslot: "pm" }); });

    expect(result.current.filteredTodos.every((t) => t.timeslot === "pm")).toBe(true);
  });

  it("shows only evening items when filter is 'eve'", async () => {
    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => { result.current.setFilters({ timeslot: "eve" }); });

    expect(result.current.filteredTodos.every((t) => t.timeslot === "eve")).toBe(true);
  });
});

describe("useTodos — composed filters", () => {
  beforeEach(() => {
    vi.mocked(todoApi.getAll).mockResolvedValue(ALL_TODOS);
  });

  it("applies energy AND timeslot filters simultaneously", async () => {
    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.setFilters({ energyCost: "low", timeslot: "am" });
    });

    // Only TODO_LOW_AM should match
    expect(result.current.filteredTodos).toHaveLength(1);
    expect(result.current.filteredTodos[0].id).toBe("1");
  });

  it("returns empty list when combined filters match nothing", async () => {
    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.setFilters({ energyCost: "high", timeslot: "am" });
    });

    expect(result.current.filteredTodos).toHaveLength(0);
  });
});

describe("useTodos — filter state flags", () => {
  beforeEach(() => {
    vi.mocked(todoApi.getAll).mockResolvedValue(ALL_TODOS);
  });

  it("isFiltered is false by default", async () => {
    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isFiltered).toBe(false);
  });

  it("isFiltered is true when energy filter is active", async () => {
    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => { result.current.setFilters({ energyCost: "low" }); });

    expect(result.current.isFiltered).toBe(true);
  });

  it("isFiltered is true when timeslot filter is active", async () => {
    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => { result.current.setFilters({ timeslot: "pm" }); });

    expect(result.current.isFiltered).toBe(true);
  });

  it("clearFilters resets both dimensions and sets isFiltered to false", async () => {
    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => { result.current.setFilters({ energyCost: "high", timeslot: "eve" }); });
    expect(result.current.isFiltered).toBe(true);

    act(() => { result.current.clearFilters(); });

    expect(result.current.isFiltered).toBe(false);
    expect(result.current.filters.energyCost).toBe("all");
    expect(result.current.filters.timeslot).toBe("all");
    expect(result.current.filteredTodos).toHaveLength(6);
  });
});

describe("useTodos — CRUD state", () => {
  beforeEach(() => {
    vi.mocked(todoApi.getAll).mockResolvedValue([TODO_LOW_AM]);
  });

  it("adds a created todo to the list without re-fetching", async () => {
    const newTodo = makeTodo({ id: "99", name: "Yoga", energyCost: "low", timeslot: "am", boons: ["mindfulness"] });
    vi.mocked(todoApi.create).mockResolvedValue(newTodo);

    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.todos).toHaveLength(1);

    await act(async () => {
      await result.current.createTodo({ name: "Yoga", energyCost: "low", timeslot: "am", boons: ["mindfulness"] });
    });

    expect(result.current.todos).toHaveLength(2);
    expect(result.current.todos.find((t) => t.id === "99")).toBeDefined();
  });

  it("removes a deleted todo from the list without re-fetching", async () => {
    vi.mocked(todoApi.delete).mockResolvedValue(undefined);

    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.todos).toHaveLength(1);

    await act(async () => {
      await result.current.deleteTodo(TODO_LOW_AM.id);
    });

    expect(result.current.todos).toHaveLength(0);
  });
});

describe("useTodos — error handling", () => {
  it("surfaces an error message when getAll rejects", async () => {
    vi.mocked(todoApi.getAll).mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe("Network error");
    expect(result.current.todos).toHaveLength(0);
  });

  it("falls back to a generic message for non-Error rejections", async () => {
    vi.mocked(todoApi.getAll).mockRejectedValue("oops");

    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe("Failed to load todos");
  });
});
