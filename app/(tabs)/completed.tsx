import { Ionicons } from '@expo/vector-icons';
import * as SQLite from 'expo-sqlite';
import React, { useEffect, useState } from 'react';
import {
  ActionSheetIOS,
  Alert,
  Dimensions,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  date: string;
  priority: 'p1' | 'p2' | 'p3' | 'p4';
  description?: string;
}

const db = SQLite.openDatabaseSync('todoit.db');
const { height } = Dimensions.get('window');

export default function Completed() {
  const [todos, setTodos] = useState<Todo[]>([]);

  // Load only completed todos
  const loadTodos = React.useCallback(() => {
    db.withTransactionAsync(async () => {
      const todosRaw = await db.getAllAsync<any>(`SELECT * FROM todos WHERE completed = 1 ORDER BY id DESC;`);
      const todos: Todo[] = todosRaw.map((t: any) => ({
        ...t,
        id: String(t.id),
        completed: !!t.completed,
      }));
      setTodos(todos);
    });
  }, []);

  // Toggle completion in SQLite
  const toggleTodo = async (id: string, completed: boolean) => {
    await db.withTransactionAsync(async () => {
      await db.runAsync(`UPDATE todos SET completed = ? WHERE id = ?`, [completed ? 0 : 1, Number(id)]);
    });
    await loadTodos();
  };

  // Delete todo
  const deleteTodo = async (id: string) => {
    await db.withTransactionAsync(async () => {
      await db.runAsync(`DELETE FROM todos WHERE id = ?`, [Number(id)]);
    });
    await loadTodos();
  };

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  return (
    <View style={styles.container}>
      <Text style={styles.today}>Completed</Text>
      <FlatList
        data={todos}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.todoRow}
            onPress={() => toggleTodo(item.id, item.completed)}
            onLongPress={() => {
              if (Platform.OS === 'ios') {
                ActionSheetIOS.showActionSheetWithOptions(
                  {
                    options: ['Cancel', 'Delete Task'],
                    destructiveButtonIndex: 1,
                    cancelButtonIndex: 0,
                  },
                  buttonIndex => {
                    if (buttonIndex === 1) deleteTodo(item.id);
                  }
                );
              } else {
                Alert.alert(
                  'Delete Task',
                  'Are you sure you want to delete this task?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: () => deleteTodo(item.id) },
                  ]
                );
              }
            }}
          >
            <View style={[styles.circle,
              item.priority === 'p1' && styles.circleP1,
              item.priority === 'p2' && styles.circleP2,
              item.priority === 'p3' && styles.circleP3,
              item.priority === 'p4' && styles.circleP4,
              item.completed && [
                item.priority === 'p1' && styles.circleCompletedP1,
                item.priority === 'p2' && styles.circleCompletedP2,
                item.priority === 'p3' && styles.circleCompletedP3,
                item.priority === 'p4' && styles.circleCompletedP4,
              ]
            ]}>
              {item.completed && (
                <Ionicons
                  name="checkmark"
                  size={16}
                  color="#fff"
                  style={{ backgroundColor: 'transparent' }}
                />
              )}
            </View>
            <View style={styles.todoTextContainer}>
              <Text style={[styles.todoText, styles.todoTextCompleted]}>{item.text}</Text>
              {!!item.description && (
                <Text style={styles.todoDescription}>{item.description}</Text>
              )}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No completed tasks yet</Text>}
        contentContainerStyle={{ flexGrow: 1 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181818',
    paddingTop: height * 0.12,
    paddingHorizontal: 20,
  },
  today: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  todoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  circle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#fff',
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    opacity: 1,
  },
  circleP1: {
    borderColor: '#e44332',
    backgroundColor: 'rgba(228,67,50,0.15)',
    opacity: 1,
  },
  circleP2: {
    borderColor: '#ff9800',
    backgroundColor: 'rgba(255,152,0,0.15)',
    opacity: 1,
  },
  circleP3: {
    borderColor: '#2196f3',
    backgroundColor: 'rgba(33,150,243,0.15)',
    opacity: 1,
  },
  circleP4: {
    borderColor: '#bbb',
    backgroundColor: 'transparent',
    opacity: 1,
  },
  circleCompletedP1: {
    backgroundColor: '#e44332',
    borderColor: '#e44332',
  },
  circleCompletedP2: {
    backgroundColor: '#ff9800',
    borderColor: '#ff9800',
  },
  circleCompletedP3: {
    backgroundColor: '#2196f3',
    borderColor: '#2196f3',
  },
  circleCompletedP4: {
    backgroundColor: '#bbb',
    borderColor: '#bbb',
  },
  todoTextContainer: {
    flex: 1,
  },
  todoText: {
    color: '#fff',
    fontSize: 16,
  },
  todoTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  todoDescription: {
    color: '#888',
    fontSize: 13,
    marginTop: 2,
  },
  empty: {
    color: '#888',
    textAlign: 'center',
    marginTop: 40,
  },
});
