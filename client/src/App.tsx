import { useTodos } from "./hooks/useTodos";
import { TodoList } from "./components/TodoList";
import { AddTodoForm } from "./components/AddTodoForm";
import { FilterBar } from "./components/FilterBar";
import styles from "./App.module.scss";

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

      <div className={`min-h-screen pt-12 px-4 pb-20 mx-auto relative z-10 ${styles.page}`}>
        {/* Header */}
        <header className="mb-9">
          <p
            className={`text-accent-light text-caption font-semibold uppercase mb-2 ${styles.eyebrow}`}
          >
            ✦ Your wellness menu
          </p>
          <h1 className={`text-display font-display font-normal mb-1.5 ${styles.heading}`}>
            Today's Menu
          </h1>
          <p className="text-ink-faint text-body">
            {todos.length} {todos.length === 1 ? "item" : "items"} in your practice
          </p>
        </header>

        {/* Add form */}
        <AddTodoForm onAdd={createTodo} />

        {/* Divider */}
        <div className="divider mb-6" />

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
          <p className="text-ink-faint text-body text-center py-10">Loading your menu…</p>
        )}
        {error && <p className="text-energy-high text-body text-center py-4">{error}</p>}
        {!isLoading && !error && <TodoList todos={filteredTodos} onDelete={deleteTodo} />}
      </div>
    </>
  );
}
