import React from 'react';
import { FlatList, StyleSheet, Text } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Todo } from '../../hooks/TodosContext';
import { useTheme } from '../../hooks/useTheme';
import { TodoListItem } from './TodoListItem';

type ThemeColors = typeof Colors.light;

// ... (TodoListProps interface is unchanged) ...
interface TodoListProps {
    todos: Todo[];
    onToggleComplete: (id: string, completed: boolean) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    onStartEdit: (todo: Todo) => void;
    onReload: () => void;
    emptyMessage: string;
  }

export function TodoList({ todos, onToggleComplete, onDelete, onStartEdit, onReload, emptyMessage }: TodoListProps) {
  const colors = useTheme();
  const styles = getStyles(colors);

  return (
    <FlatList
      data={todos}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TodoListItem
          item={item}
          onToggleComplete={onToggleComplete}
          onDelete={onDelete}
          onStartEdit={onStartEdit}
          onReload={onReload}
        />
      )}
      ListEmptyComponent={<Text style={styles.empty}>{emptyMessage}</Text>}
      contentContainerStyle={todos.length === 0 ? styles.emptyContainer : null}
    />
  );
}

// Apply the explicit type to the 'colors' parameter here
const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    emptyContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    empty: {
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 40,
    },
  });