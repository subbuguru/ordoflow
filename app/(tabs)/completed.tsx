import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import React, { useCallback } from 'react';
import {
  ActionSheetIOS,
  Alert,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { TodoList } from '../../components/todos/TodoList';
import { Colors } from '../../constants/Colors';
import { useTodosContext } from '../../hooks/TodosContext';
import { useTheme } from '../../hooks/useTheme';

const { height } = Dimensions.get('window');

type ThemeColors = typeof Colors.light;

export default function Completed() {
  const colors = useTheme();
  const styles = getStyles(colors);

  const { todos, toggleTodoCompleted, deleteTodo, deleteAllCompleted, reload } = useTodosContext();

  const completedTodos = todos.filter((t) => t.completed);

  const confirmDeleteAll = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Delete All Completed?',
      'Are you sure you want to delete all completed tasks? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete All', style: 'destructive', onPress: async () => { await deleteAllCompleted(); reload(); } },
      ]
    );
  };

  const showHeaderMenu = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Delete All Completed'],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 0,
        },
        buttonIndex => {
          if (buttonIndex === 1) confirmDeleteAll();
        }
      );
    } else {
      Alert.alert(
        'Options',
        '',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete All Completed', style: 'destructive', onPress: confirmDeleteAll },
        ]
      );
    }
  };

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.today}>Completed</Text>
        {completedTodos.length > 0 && (
          <TouchableOpacity onPress={showHeaderMenu} style={styles.menuBtn}>
            <Ionicons name="ellipsis-horizontal-outline" size={26} color={colors.tint} />
          </TouchableOpacity>
        )}
      </View>

      <TodoList
        todos={completedTodos}
        onToggleComplete={toggleTodoCompleted}
        onDelete={deleteTodo}
        onStartEdit={() => {}}
        onReload={reload}
        // FIX 3: By not passing the `onReorder` prop, the drag handle will not be rendered.
        emptyMessage="No completed tasks yet."
      />
    </View>
  );
}

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: height * 0.12,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  today: {
    color: colors.text,
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  menuBtn: {
    padding: 8,
  },
});