import { useState, useEffect, useCallback, useMemo } from "react";
import { Todo, CreateTodoDto, UpdateTodoDto, TodoFilters, ENERGY_ORDER } from "@todo-menu/shared";
import { todoApi } from "../services/todo.api";

interface UseTodosReturn {
  todos: Todo[];
  filteredTodos: Todo[];
  filters: TodoFilters;
  isLoading: boolean;
  error: string | null;
  isFiltered: boolean;
  createTodo: (dto: CreateTodoDto) => Promise<void>;
  updateTodo: (id: string, dto: UpdateTodoDto) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  setFilters: (filters: Partial<TodoFilters>) => void;
  clearFilters: () => void;
}

const DEFAULT_FILTERS: TodoFilters = { energyCost: "all", timeslot: "all" };

export function useTodos(): UseTodosReturn {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filters, setFiltersState] = useState<TodoFilters>(DEFAULT_FILTERS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTodos = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await todoApi.getAll();
      setTodos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load todos");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // Client-side filtering + sort by energy cost (low → medium → high)
  const filteredTodos = useMemo(() => {
    return todos
      .filter((t) => filters.energyCost === "all" || t.energyCost === filters.energyCost)
      .filter((t) => filters.timeslot === "all" || t.timeslot === filters.timeslot)
      .sort((a, b) => ENERGY_ORDER[a.energyCost] - ENERGY_ORDER[b.energyCost]);
  }, [todos, filters]);

  const isFiltered = filters.energyCost !== "all" || filters.timeslot !== "all";

  const createTodo = useCallback(async (dto: CreateTodoDto) => {
    const todo = await todoApi.create(dto);
    setTodos((prev) => [...prev, todo]);
  }, []);

  const updateTodo = useCallback(async (id: string, dto: UpdateTodoDto) => {
    const updated = await todoApi.update(id, dto);
    setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
  }, []);

  const deleteTodo = useCallback(async (id: string) => {
    await todoApi.delete(id);
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const setFilters = useCallback((partial: Partial<TodoFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...partial }));
  }, []);

  const clearFilters = useCallback(() => setFiltersState(DEFAULT_FILTERS), []);

  return {
    todos,
    filteredTodos,
    filters,
    isLoading,
    error,
    isFiltered,
    createTodo,
    updateTodo,
    deleteTodo,
    setFilters,
    clearFilters,
  };
}
