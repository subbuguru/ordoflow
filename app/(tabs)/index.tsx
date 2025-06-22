import { AddTodoButton } from '@/components/todos/AddTodoButton';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { EditTodoModal } from '../../components/todos/EditTodoModal';
import { TodoList } from '../../components/todos/TodoList';
import { Colors } from '../../constants/Colors';
import { Todo, useTodosContext } from '../../hooks/TodosContext';
import { useTheme } from '../../hooks/useTheme';
const { height } = Dimensions.get('window');
type ThemeColors = typeof Colors.light;
export default function Index() {
  const colors = useTheme();
  const styles = getStyles(colors);
  const {
    todos,
    addTodo,
    updateTodo,
    updateTodoOrder,
    toggleTodoCompleted,
    deleteTodo,
    reload,
  } = useTodosContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const activeTodos = todos.filter((t: Todo) => !t.completed);
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
    } else {
      await addTodo(todoData.text, todoData.description, todoData.priority);
    }
    setModalVisible(false);
    setEditingTodo(null);
    reload();
  };
  const handleStartEdit = (todo: Todo) => {
    setEditingTodo(todo);
    setModalVisible(true);
  };
  const handleOpenAddModal = () => {
    setEditingTodo(null);
    setModalVisible(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );
  return (
    <View style={styles.container}>
      <Text style={styles.today}>Tasks</Text>

      <TodoList
        todos={activeTodos}
        onToggleComplete={toggleTodoCompleted}
        onDelete={deleteTodo}
        onStartEdit={handleStartEdit}
        onReload={reload}
        onReorder={updateTodoOrder}
        emptyMessage="No tasks yet. Add one!"
      />

      <AddTodoButton onPress={handleOpenAddModal} />

      <EditTodoModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveTodo}
        todoToEdit={editingTodo}
      />
    </View>
  );
}
const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: height * 0.12,
      paddingHorizontal: 20,
    },
    today: {
      color: colors.text,
      fontSize: 36,
      fontWeight: 'bold',
      marginBottom: 16,
    },
  });
