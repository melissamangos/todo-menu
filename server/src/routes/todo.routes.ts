import { Router } from "express";
import { TodoController } from "../controllers/todo.controller";
import { TodoService } from "../services/todo.service";
import { InMemoryTodoRepository } from "../repositories/todo.repository";

const router = Router();

// Dependency injection — swap InMemoryTodoRepository for a DB repo as needed
const repo = new InMemoryTodoRepository();
const service = new TodoService(repo);
const controller = new TodoController(service);

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/", controller.create);
router.patch("/:id", controller.update);
router.delete("/:id", controller.delete);

export default router;
