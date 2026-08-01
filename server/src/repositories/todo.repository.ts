import { v4 as uuidv4 } from "uuid";
import { Todo, CreateTodoDto, UpdateTodoDto, ENERGY_ORDER } from "@todo-menu/shared";

/**
 * ITodoRepository defines the persistence contract.
 * Swap this implementation for a database-backed one without touching services.
 */
export interface ITodoRepository {
  findAll(): Promise<Todo[]>;
  findById(id: string): Promise<Todo | null>;
  create(dto: CreateTodoDto): Promise<Todo>;
  update(id: string, dto: UpdateTodoDto): Promise<Todo | null>;
  delete(id: string): Promise<boolean>;
}

export class InMemoryTodoRepository implements ITodoRepository {
  private store: Map<string, Todo> = new Map();

  async findAll(): Promise<Todo[]> {
    return Array.from(this.store.values()).sort(
      (a, b) => ENERGY_ORDER[a.energyCost] - ENERGY_ORDER[b.energyCost],
    );
  }

  async findById(id: string): Promise<Todo | null> {
    return this.store.get(id) ?? null;
  }

  async create(dto: CreateTodoDto): Promise<Todo> {
    const now = new Date().toISOString();
    const todo: Todo = {
      id: uuidv4(),
      name: dto.name,
      energyCost: dto.energyCost,
      timeslot: dto.timeslot,
      boons: dto.boons,
      createdAt: now,
      updatedAt: now,
    };
    this.store.set(todo.id, todo);
    return todo;
  }

  async update(id: string, dto: UpdateTodoDto): Promise<Todo | null> {
    const existing = this.store.get(id);
    if (!existing) return null;

    const updated: Todo = {
      ...existing,
      ...dto,
      id,
      updatedAt: new Date().toISOString(),
    };
    this.store.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }
}
