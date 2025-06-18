import * as SQLite from 'expo-sqlite';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  date: string;
  priority: 'p1' | 'p2' | 'p3' | 'p4';
  description?: string;
}

interface TodosContextType {
  todos: Todo[];
  loading: boolean;
  addTodo: (input: string, description: string, priority: 'p1' | 'p2' | 'p3' | 'p4') => Promise<void>;
  updateTodo: (todo: Todo) => Promise<void>;
  toggleTodoCompleted: (id: string, completed: boolean) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  deleteAllCompleted: () => Promise<void>;
  reload: () => void;
}

const TodosContext = createContext<TodosContextType | undefined>(undefined);

const db = SQLite.openDatabaseSync('todoit.db');

export function TodosProvider({ children }: { children: React.ReactNode }) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTodos = useCallback(() => {
    setLoading(true);
    db.withTransactionAsync(async () => {
      const todosRaw = await db.getAllAsync<any>(`SELECT * FROM todos ORDER BY id DESC;`);
      const todos: Todo[] = todosRaw.map((t: any) => ({
        ...t,
        id: String(t.id),
        completed: !!t.completed,
      }));
      setTodos(todos);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  const addTodo = async (input: string, description: string, priority: 'p1' | 'p2' | 'p3' | 'p4') => {
    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `INSERT INTO todos (text, description, completed, date, priority) VALUES (?, ?, ?, ?, ?);`,
        [input, description, 0, new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), priority]
      );
    });
    loadTodos();
  };

  const updateTodo = async (todo: Todo) => {
    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `UPDATE todos SET text = ?, description = ?, priority = ? WHERE id = ?`,
        [todo.text, todo.description ?? '', todo.priority, Number(todo.id)]
      );
    });
    loadTodos();
  };

  const toggleTodoCompleted = async (id: string, completed: boolean) => {
    await db.withTransactionAsync(async () => {
      await db.runAsync(`UPDATE todos SET completed = ? WHERE id = ?`, [completed ? 1 : 0, Number(id)]);
    });
    loadTodos();
  };

  const deleteTodo = async (id: string) => {
    await db.withTransactionAsync(async () => {
      await db.runAsync(`DELETE FROM todos WHERE id = ?`, [Number(id)]);
    });
    loadTodos();
  };

  const deleteAllCompleted = async () => {
    await db.withTransactionAsync(async () => {
      await db.runAsync(`DELETE FROM todos WHERE completed = 1`);
    });
    loadTodos();
  };

  return (
    <TodosContext.Provider value={{ todos, loading, addTodo, updateTodo, toggleTodoCompleted, deleteTodo, deleteAllCompleted, reload: loadTodos }}>
      {children}
    </TodosContext.Provider>
  );
}

export function useTodosContext() {
  const ctx = useContext(TodosContext);
  if (!ctx) throw new Error('useTodosContext must be used within a TodosProvider');
  return ctx;
}
