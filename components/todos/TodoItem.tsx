// src/components/features/todos/TodoItem.tsx
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import {
    ActionSheetIOS,
    Alert,
    Animated,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import { Colors } from '@/constants/Colors';
import { Todo } from '@/hooks/TodosContext';
import { useTheme } from '@/hooks/useTheme';

type ThemeColors = typeof Colors.light;

// Define the props our component will accept
interface TodoItemProps {
  item: Todo;
  isCompleting: boolean;
  animValue: Animated.Value;
  onToggleComplete: (item: Todo) => void;
  onEdit: (item: Todo) => void;
  onDelete: (id: string) => void;
}

const TodoItemComponent = ({
  item,
  isCompleting,
  animValue,
  onToggleComplete,
  onEdit,
  onDelete,
}: TodoItemProps) => {
  const colors = useTheme();
  const styles = getStyles(colors);

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Delete Task'],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) onDelete(item.id);
        }
      );
    } else {
      Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDelete(item.id) },
      ]);
    }
  };

  const animStyle = {
    opacity: animValue,
    transform: [
      {
        scale: animValue
          ? animValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0.85, 1],
            })
          : 1,
      },
    ],
  };

  return (
    <Animated.View style={animStyle}>
      <TouchableOpacity style={styles.todoRow} onPress={() => onEdit(item)} onLongPress={handleDelete}>
        <TouchableOpacity
          onPress={() => onToggleComplete(item)}
          style={[
            styles.circle,
            item.priority === 'p1' && styles.circleP1,
            item.priority === 'p2' && styles.circleP2,
            item.priority === 'p3' && styles.circleP3,
            item.priority === 'p4' && styles.circleP4,
            (item.completed || isCompleting) && [
              styles.circleCompletedP1,
              styles.circleCompletedP2,
              styles.circleCompletedP3,
              styles.circleCompletedP4,
            ],
          ]}
        >
          {(item.completed || isCompleting) && (
            <Ionicons name="checkmark" size={16} color="#fff" style={{ backgroundColor: 'transparent' }} />
          )}
        </TouchableOpacity>
        <View style={styles.todoTextContainer}>
          <Text style={[styles.todoText, (item.completed || isCompleting) && styles.todoTextCompleted]}>
            {item.text}
          </Text>
          {!!item.description && <Text style={styles.todoDescription}>{item.description}</Text>}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Memoize the component to prevent unnecessary re-renders in the FlatList
export const TodoItem = React.memo(TodoItemComponent);

// Styles can be co-located with the component
const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    todoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    circle: {
      width: 26,
      height: 26,
      borderRadius: 13,
      borderWidth: 2,
      marginRight: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
    },
    circleP1: { borderColor: colors.p1, backgroundColor: colors.p1_bg },
    circleP2: { borderColor: colors.p2, backgroundColor: colors.p2_bg },
    circleP3: { borderColor: colors.p3, backgroundColor: colors.p3_bg },
    circleP4: { borderColor: colors.p4, backgroundColor: colors.p4_bg },
    circleCompletedP1: { backgroundColor: colors.p1, borderColor: colors.p1 },
    circleCompletedP2: { backgroundColor: colors.p2, borderColor: colors.p2 },
    circleCompletedP3: { backgroundColor: colors.p3, borderColor: colors.p3 },
    circleCompletedP4: { backgroundColor: colors.p4, borderColor: colors.p4 },
    todoTextContainer: { flex: 1 },
    todoText: { color: colors.text, fontSize: 16 },
    todoTextCompleted: { textDecorationLine: 'line-through', color: colors.textSecondary },
    todoDescription: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  });