// src/__mocks__/services/todo.api.ts
// Vitest auto-mock replacement for the real fetch-based API service.
// Each test file can override individual methods via vi.mocked(...).mockResolvedValue(...)

import { vi } from "vitest";
import type { Todo } from "@todo-menu/shared";

export const todoApi = {
  getAll: vi.fn<[], Promise<Todo[]>>(),
  getById: vi.fn<[string], Promise<Todo>>(),
  create: vi.fn<[unknown], Promise<Todo>>(),
  update: vi.fn<[string, unknown], Promise<Todo>>(),
  delete: vi.fn<[string], Promise<void>>(),
};
