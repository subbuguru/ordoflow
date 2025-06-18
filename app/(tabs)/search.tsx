import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { Dimensions, StyleSheet, Text, TextInput, View } from 'react-native';
import { EditTodoModal } from '../../components/todos/EditTodoModal';
import { TodoList } from '../../components/todos/TodoList';
import { Colors } from '../../constants/Colors';
import { Todo, useTodosContext } from '../../hooks/TodosContext';
import { useTheme } from '../../hooks/useTheme';

const { height } = Dimensions.get('window');
type ThemeColors = typeof Colors.light;

export default function SearchScreen() {
  const colors = useTheme();
  const styles = getStyles(colors);

  // Note: We get `updateTodo` for editing, but not `updateTodoOrder`
  const { todos, updateTodo, toggleTodoCompleted, deleteTodo, reload } = useTodosContext();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filtering happens on the entire `todos` array
  const filteredTodos = todos.filter(todo => {
    if (!searchQuery) return false; // Don't show any results until user types
    const query = searchQuery.toLowerCase();
    const text = todo.text.toLowerCase();
    const description = todo.description?.toLowerCase() || '';
    return text.includes(query) || description.includes(query);
  });

  const handleSaveTodo = async (todoData: { text: string; description: string; priority: 'p1' | 'p2' | 'p3' | 'p4' }) => {
    if (editingTodo) {
      // Use a spread to ensure we keep all original properties of the todo
      await updateTodo({ ...editingTodo, ...todoData });
    }
    // "Add" functionality is removed from this screen, only editing is possible.
    setModalVisible(false);
    setEditingTodo(null);
    reload();
  };

  const handleStartEdit = (todo: Todo) => {
    setEditingTodo(todo);
    setModalVisible(true);
  };
  
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.today}>Search</Text>
      
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search all tasks..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus
        />
      </View>

      <TodoList
        todos={filteredTodos}
        onToggleComplete={toggleTodoCompleted}
        onDelete={deleteTodo}
        onStartEdit={handleStartEdit}
        onReload={reload}
        // By NOT passing `onReorder`, dragging is automatically disabled
        emptyMessage={searchQuery ? 'No tasks match your search.' : 'Type above to begin searching.'}
      />
      
      {/* We still include the modal so users can edit tasks from the search results */}
      <EditTodoModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveTodo}
        todoToEdit={editingTodo}
      />
    </View>
  );
}

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: height * 0.12,
  },
  today: {
    color: colors.text,
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: colors.text,
    fontSize: 16,
  },
});