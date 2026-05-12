import express from "express";
import cors from "cors";
import morgan from "morgan";
import todoRoutes from "./routes/todo.routes";
import { errorHandler } from "./middleware/error.middleware";

const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173" }));
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/api/todos", todoRoutes);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Error handler — must be last
app.use(errorHandler);

export default app;
