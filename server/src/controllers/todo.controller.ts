import { Request, Response, NextFunction } from "express";
import { TodoService } from "../services/todo.service";
import { CreateTodoDto, UpdateTodoDto } from "@todo-menu/shared";

export class TodoController {
  constructor(private readonly service: TodoService) {}

  getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.getAll();
      res.json({ data });
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.getById(req.params.id);
      res.json({ data });
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto: CreateTodoDto = req.body;
      const data = await this.service.create(dto);
      res.status(201).json({ data });
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto: UpdateTodoDto = req.body;
      const data = await this.service.update(req.params.id, dto);
      res.json({ data });
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.delete(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}
