import { Todo, CreateTodoDto, UpdateTodoDto } from "@todo-menu/shared";
import { ITodoRepository } from "../repositories/todo.repository";

export class TodoService {
  constructor(private readonly repo: ITodoRepository) {}

  async getAll(): Promise<Todo[]> {
    return this.repo.findAll();
  }

  async getById(id: string): Promise<Todo> {
    const todo = await this.repo.findById(id);
    if (!todo) throw new NotFoundError(`Todo with id "${id}" not found`);
    return todo;
  }

  async create(dto: CreateTodoDto): Promise<Todo> {
    return this.repo.create(dto);
  }

  async update(id: string, dto: UpdateTodoDto): Promise<Todo> {
    const todo = await this.repo.update(id, dto);
    if (!todo) throw new NotFoundError(`Todo with id "${id}" not found`);
    return todo;
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.repo.delete(id);
    if (!deleted) throw new NotFoundError(`Todo with id "${id}" not found`);
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}
