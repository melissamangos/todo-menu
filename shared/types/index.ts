// Shared domain types used by both client and server

export type EnergyCost = "low" | "medium" | "high";

export type Timeslot = "am" | "pm" | "eve";

export type Boon =
  | "boundaries"
  | "connection"
  | "creativity"
  | "limit media"
  | "mindfulness"
  | "nature"
  | "nutrition"
  | "physical activity"
  | "routine"
  | "therapy";

export const ALL_BOONS: Boon[] = [
  "boundaries",
  "connection",
  "creativity",
  "limit media",
  "mindfulness",
  "nature",
  "nutrition",
  "physical activity",
  "routine",
  "therapy",
];

export const ENERGY_ORDER: Record<EnergyCost, number> = {
  low: 0,
  medium: 1,
  high: 2,
};

export interface Todo {
  id: string;
  name: string;
  energyCost: EnergyCost;
  timeslot: Timeslot;
  boons: Boon[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTodoDto {
  name: string;
  energyCost: EnergyCost;
  timeslot: Timeslot;
  boons: Boon[];
}

export interface UpdateTodoDto {
  name?: string;
  energyCost?: EnergyCost;
  timeslot?: Timeslot;
  boons?: Boon[];
}

export interface TodoFilters {
  energyCost: EnergyCost | "all";
  timeslot: Timeslot | "all";
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
  details?: string;
}
