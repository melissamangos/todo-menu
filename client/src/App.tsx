import { useTodos } from "./hooks/useTodos";
import { TodoList } from "./components/TodoList";
import { AddTodoForm } from "./components/AddTodoForm";
import { FilterBar } from "./components/FilterBar";

export default function App() {
  const {
    todos,
    filteredTodos,
    filters,
    isLoading,
    error,
    isFiltered,
    createTodo,
    deleteTodo,
    setFilters,
    clearFilters,
  } = useTodos();

  return (
    <>
      <div className="glow-orb" />

      <div style={{
        minHeight: "100vh",
        padding: "48px 16px 80px",
        maxWidth: 600,
        margin: "0 auto",
        position: "relative",
        zIndex: 1,
      }}>
        {/* Header */}
        <header style={{ marginBottom: 36 }}>
          <p style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--violet-light)",
            marginBottom: 8,
          }}>
            ✦ Your wellness menu
          </p>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(32px, 6vw, 44px)",
            fontWeight: 400,
            color: "#f1f5f9",
            lineHeight: 1.1,
            marginBottom: 6,
          }}>
            Today's Menu
          </h1>
          <p style={{ fontSize: 14, color: "var(--slate-muted)" }}>
            {todos.length} {todos.length === 1 ? "item" : "items"} in your practice
          </p>
        </header>

        {/* Add form */}
        <AddTodoForm onAdd={createTodo} />

        {/* Divider */}
        <div className="divider" style={{ marginBottom: 24 }} />

        {/* Filters */}
        <FilterBar
          filters={filters}
          isFiltered={isFiltered}
          totalCount={todos.length}
          filteredCount={filteredTodos.length}
          onSetFilters={setFilters}
          onClear={clearFilters}
        />

        {/* List */}
        {isLoading && (
          <p style={{ textAlign: "center", color: "var(--slate-muted)", padding: "40px 0", fontSize: 14 }}>
            Loading your menu…
          </p>
        )}
        {error && (
          <p style={{ textAlign: "center", color: "#f472b6", fontSize: 13, padding: "16px 0" }}>
            {error}
          </p>
        )}
        {!isLoading && !error && (
          <TodoList todos={filteredTodos} onDelete={deleteTodo} />
        )}
      </div>
    </>
  );
}
