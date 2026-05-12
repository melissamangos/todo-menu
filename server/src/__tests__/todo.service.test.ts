import { TodoService, NotFoundError } from "../services/todo.service";
import { InMemoryTodoRepository } from "../repositories/todo.repository";

describe("TodoService", () => {
  let service: TodoService;

  beforeEach(() => {
    service = new TodoService(new InMemoryTodoRepository());
  });

  it("returns an empty list initially", async () => {
    const todos = await service.getAll();
    expect(todos).toHaveLength(0);
  });

  it("creates a todo with correct values", async () => {
    const todo = await service.create({
      name: "Morning walk",
      energyCost: "low",
      timeslot: "am",
      boons: ["nature", "physical activity"],
    });
    expect(todo.id).toBeDefined();
    expect(todo.name).toBe("Morning walk");
    expect(todo.energyCost).toBe("low");
    expect(todo.timeslot).toBe("am");
    expect(todo.boons).toEqual(["nature", "physical activity"]);
  });

  it("retrieves a todo by id", async () => {
    const created = await service.create({
      name: "Journal",
      energyCost: "low",
      timeslot: "am",
      boons: ["mindfulness"],
    });
    const found = await service.getById(created.id);
    expect(found.id).toBe(created.id);
  });

  it("throws NotFoundError for unknown id", async () => {
    await expect(service.getById("non-existent")).rejects.toThrow(NotFoundError);
  });

  it("sorts todos by energy cost (low → medium → high)", async () => {
    await service.create({ name: "Hard task", energyCost: "high", timeslot: "pm", boons: [] });
    await service.create({ name: "Easy task", energyCost: "low", timeslot: "am", boons: [] });
    await service.create({ name: "Mid task", energyCost: "medium", timeslot: "eve", boons: [] });

    const todos = await service.getAll();
    expect(todos.map((t) => t.energyCost)).toEqual(["low", "medium", "high"]);
  });

  it("deletes a todo", async () => {
    const created = await service.create({
      name: "Delete me",
      energyCost: "low",
      timeslot: "am",
      boons: [],
    });
    await service.delete(created.id);
    const todos = await service.getAll();
    expect(todos).toHaveLength(0);
  });
});
