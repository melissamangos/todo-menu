import { Request, Response, NextFunction } from "express";
import { NotFoundError } from "../services/todo.service";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error(`[error] ${err.name}: ${err.message}`);

  if (err instanceof NotFoundError) {
    res.status(404).json({ error: err.message });
    return;
  }

  res.status(500).json({ error: "Internal server error" });
}
