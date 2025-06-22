import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  Dimensions,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
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
  const { todos, updateTodo, toggleTodoCompleted, deleteTodo, reload } =
    useTodosContext();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const filteredTodos = todos.filter(todo => {
    if (!searchQuery) return false;
    const query = searchQuery.toLowerCase();
    const text = todo.text.toLowerCase();
    const description = todo.description?.toLowerCase() || '';
    return text.includes(query) || description.includes(query);
  });
  const handleSaveTodo = async (todoData: {
    text: string;
    description: string;
    priority: 'p1' | 'p2' | 'p3' | 'p4';
  }) => {
    if (editingTodo) {
      await updateTodo({
        ...editingTodo,
        ...todoData,
      });
    }
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
    }, [reload]),
  );
  return (
    <Pressable style={styles.container} onPress={Keyboard.dismiss}>
      <Text style={styles.today}>Search</Text>

      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color={colors.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search all tasks..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.listContainer}>
        <TodoList
          todos={filteredTodos}
          onToggleComplete={toggleTodoCompleted}
          onDelete={deleteTodo}
          onStartEdit={handleStartEdit}
          onReload={reload}
          emptyMessage={
            searchQuery
              ? 'No tasks match your search.'
              : 'Type above to begin searching.'
          }
        />
      </View>

      <EditTodoModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveTodo}
        todoToEdit={editingTodo}
      />
    </Pressable>
  );
}
const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
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
      marginBottom: 16,
      marginHorizontal: 20,
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
    listContainer: {
      flex: 1,
      paddingHorizontal: 20,
    },
  });
