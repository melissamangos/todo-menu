import { Todo, CreateTodoDto, UpdateTodoDto, ApiResponse } from "@todo-menu/shared";

const BASE_URL = "/api/todos";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  const json: ApiResponse<T> = await res.json();
  return json.data;
}

export const todoApi = {
  getAll: (): Promise<Todo[]> => request<Todo[]>(BASE_URL),

  getById: (id: string): Promise<Todo> => request<Todo>(`${BASE_URL}/${id}`),

  create: (dto: CreateTodoDto): Promise<Todo> =>
    request<Todo>(BASE_URL, { method: "POST", body: JSON.stringify(dto) }),

  update: (id: string, dto: UpdateTodoDto): Promise<Todo> =>
    request<Todo>(`${BASE_URL}/${id}`, { method: "PATCH", body: JSON.stringify(dto) }),

  delete: (id: string): Promise<void> =>
    request<void>(`${BASE_URL}/${id}`, { method: "DELETE" }),
};
