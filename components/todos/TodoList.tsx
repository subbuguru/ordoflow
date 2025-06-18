import React from 'react';
import { StyleSheet, Text } from 'react-native';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { Colors } from '../../constants/Colors';
import { Todo } from '../../hooks/TodosContext';
import { useTheme } from '../../hooks/useTheme';
import { TodoListItem } from './TodoListItem';

type ThemeColors = typeof Colors.light;

interface TodoListProps {
  todos: Todo[];
  onToggleComplete: (id: string, completed: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onStartEdit: (todo: Todo) => void;
  onReload: () => void;
  onReorder?: (reorderedTodos: Todo[]) => Promise<void>;
  emptyMessage: string;
}

export function TodoList({ todos, onToggleComplete, onDelete, onStartEdit, onReload, onReorder, emptyMessage }: TodoListProps) {
  const colors = useTheme();
  const styles = getStyles(colors);

  const renderItem = ({ item, drag, isActive }: RenderItemParams<Todo>) => (
    <TodoListItem
      item={item}
      onToggleComplete={onToggleComplete}
      onDelete={onDelete}
      onStartEdit={onStartEdit}
      onReload={onReload}
      onDrag={drag}
      isActive={isActive}
    />
  );

  return (
    <DraggableFlatList
      data={todos}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      onDragEnd={({ data }) => {
        if (onReorder) {
          onReorder(data);
        }
      }}
      ListEmptyComponent={<Text style={styles.empty}>{emptyMessage}</Text>}
      contentContainerStyle={todos.length === 0 ? styles.emptyContainer : undefined}
    />
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    emptyContainer: {
      flexGrow: 1,
      // We removed `justifyContent: 'center'` which was pushing it to the middle.
      // Now we'll just push it down from the top.
      paddingTop: '25%', // Pushes the text down from the top of the list area
    },
    empty: {
      color: colors.textSecondary,
      textAlign: 'center',
      // We removed the extra margin from the text itself.
    },
  });