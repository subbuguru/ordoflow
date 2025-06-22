import * as SQLite from "expo-sqlite";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  date: string;
  priority: "p1" | "p2" | "p3" | "p4";
  orderIndex: number;
  description?: string;
}
interface TodosContextType {
  todos: Todo[];
  loading: boolean;
  addTodo: (
    input: string,
    description: string,
    priority: "p1" | "p2" | "p3" | "p4",
  ) => Promise<void>;
  updateTodo: (todo: Todo) => Promise<void>;
  updateTodoOrder: (reorderedTodos: Todo[]) => Promise<void>;
  toggleTodoCompleted: (id: string, completed: boolean) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  deleteAllCompleted: () => Promise<void>;
  reload: () => void;
}
const TodosContext = createContext<TodosContextType | undefined>(undefined);
const db = SQLite.openDatabaseSync("ordoflow.db");
db.execSync(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY NOT NULL,
    text TEXT NOT NULL,
    description TEXT,
    completed INTEGER DEFAULT 0 NOT NULL,
    date TEXT NOT NULL,
    priority TEXT NOT NULL,
    orderIndex INTEGER NOT NULL
  );
`);
export function TodosProvider({ children }: { children: React.ReactNode }) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const loadTodos = useCallback(async () => {
    setLoading(true);
    const result = await db.getAllAsync<any>(
      `SELECT * FROM todos ORDER BY orderIndex ASC;`,
    );
    const loadedTodos: Todo[] = result.map((t: any) => ({
      ...t,
      id: String(t.id),
      completed: !!t.completed,
    }));
    setTodos(loadedTodos);
    setLoading(false);
  }, []);
  useEffect(() => {
    loadTodos();
  }, [loadTodos]);
  const addTodo = async (
    input: string,
    description: string,
    priority: "p1" | "p2" | "p3" | "p4",
  ) => {
    const date = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const maxIndexResult = await db.getFirstAsync<{
      "MAX(orderIndex)": number | null;
    }>(`SELECT MAX(orderIndex) FROM todos`);
    const newIndex = (maxIndexResult?.["MAX(orderIndex)"] ?? -1) + 1;
    await db.runAsync(
      `INSERT INTO todos (text, description, completed, date, priority, orderIndex) VALUES (?, ?, ?, ?, ?, ?);`,
      [input, description, 0, date, priority, newIndex],
    );
    await loadTodos();
  };
  const updateTodo = async (todo: Todo) => {
    await db.runAsync(
      `UPDATE todos SET text = ?, description = ?, priority = ? WHERE id = ?`,
      [todo.text, todo.description ?? "", todo.priority, Number(todo.id)],
    );
    await loadTodos();
  };
  const updateTodoOrder = async (reorderedTodos: Todo[]) => {
    await db.withTransactionAsync(async () => {
      for (let i = 0; i < reorderedTodos.length; i++) {
        await db.runAsync(`UPDATE todos SET orderIndex = ? WHERE id = ?`, [
          i,
          Number(reorderedTodos[i].id),
        ]);
      }
    });
    await loadTodos();
  };
  const toggleTodoCompleted = async (id: string, completed: boolean) => {
    await db.runAsync(`UPDATE todos SET completed = ? WHERE id = ?`, [
      completed ? 1 : 0,
      Number(id),
    ]);
    await loadTodos();
  };
  const deleteTodo = async (id: string) => {
    await db.runAsync(`DELETE FROM todos WHERE id = ?`, [Number(id)]);
    await loadTodos();
  };
  const deleteAllCompleted = async () => {
    await db.runAsync(`DELETE FROM todos WHERE completed = 1`);
    await loadTodos();
  };
  return (
    <TodosContext.Provider
      value={{
        todos,
        loading,
        addTodo,
        updateTodo,
        updateTodoOrder,
        toggleTodoCompleted,
        deleteTodo,
        deleteAllCompleted,
        reload: loadTodos,
      }}
    >
      {children}
    </TodosContext.Provider>
  );
}
export function useTodosContext() {
  const ctx = useContext(TodosContext);
  if (!ctx)
    throw new Error("useTodosContext must be used within a TodosProvider");
  return ctx;
}
