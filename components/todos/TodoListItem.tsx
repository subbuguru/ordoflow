import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '../../constants/Colors';
import { Todo } from '../../hooks/TodosContext';
import { useTheme } from '../../hooks/useTheme';
type ThemeColors = typeof Colors.light;
interface TodoListItemProps {
  item: Todo;
  onToggleComplete: (id: string, completed: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onStartEdit: (todo: Todo) => void;
  onReload: () => void;
  onDrag?: () => void;
  isActive?: boolean;
}
const SWIPE_THRESHOLD = -100;
export function TodoListItem({
  item,
  onToggleComplete,
  onDelete,
  onStartEdit,
  onReload,
  onDrag,
  isActive,
}: TodoListItemProps) {
  const colors = useTheme();
  const styles = getStyles(colors);
  const [isVisuallyCompleting, setIsVisuallyCompleting] = useState(false);
  const translateX = useSharedValue(0);
  const itemOpacity = useSharedValue(1);
  const itemScale = useSharedValue(1);
  React.useEffect(() => {
    itemOpacity.value = withTiming(1);
    itemScale.value = withTiming(1);
    translateX.value = withTiming(0);
    setIsVisuallyCompleting(false);
  }, [item, itemOpacity, itemScale, translateX]);
  const panGesture = Gesture.Pan()
    .onUpdate(event => {
      if (event.translationX < 0) {
        translateX.value = event.translationX;
      }
    })
    .onEnd(() => {
      'worklet';

      if (translateX.value < SWIPE_THRESHOLD) {
        translateX.value = withTiming(-500);
        itemOpacity.value = withTiming(0, undefined, isFinished => {
          if (isFinished) {
            runOnJS(onDelete)(item.id);
          }
        });
      } else {
        translateX.value = withTiming(0);
      }
    })
    .activeOffsetX([-5, 5]);
  const rSwipeStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: translateX.value,
      },
    ],
  }));
  const rCompleteStyle = useAnimatedStyle(() => ({
    opacity: itemOpacity.value,
    transform: [
      {
        scale: itemScale.value,
      },
    ],
  }));
  const handleToggleComplete = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (item.completed) {
      await onToggleComplete(item.id, false);
      onReload();
    } else {
      setIsVisuallyCompleting(true);
      setTimeout(() => {
        itemOpacity.value = withTiming(0);
        itemScale.value = withTiming(0.85);
      }, 50);
      setTimeout(async () => {
        await onToggleComplete(item.id, true);
        onReload();
      }, 350);
    }
  };
  const isComplete = item.completed || isVisuallyCompleting;
  const handleDragPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onDrag?.();
  };
  return (
    <Animated.View style={rCompleteStyle}>
      <View style={styles.swipeContainer}>
        <View style={styles.deleteBackground}>
          <Ionicons name="trash-outline" size={24} color="#fff" />
        </View>

        <GestureDetector gesture={panGesture}>
          <Animated.View style={rSwipeStyle}>
            <Pressable style={styles.todoRow} onPress={() => onStartEdit(item)}>
              <TouchableOpacity
                onPress={handleToggleComplete}
                hitSlop={{
                  top: 10,
                  bottom: 10,
                  left: 10,
                  right: 10,
                }}
              >
                <View
                  style={[
                    styles.circle,
                    !isComplete && item.priority === 'p1' && styles.circleP1,
                    !isComplete && item.priority === 'p2' && styles.circleP2,
                    !isComplete && item.priority === 'p3' && styles.circleP3,
                    !isComplete && item.priority === 'p4' && styles.circleP4,
                    isComplete &&
                      item.priority === 'p1' &&
                      styles.circleCompletedP1,
                    isComplete &&
                      item.priority === 'p2' &&
                      styles.circleCompletedP2,
                    isComplete &&
                      item.priority === 'p3' &&
                      styles.circleCompletedP3,
                    isComplete &&
                      item.priority === 'p4' &&
                      styles.circleCompletedP4,
                  ]}
                >
                  {isComplete && (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  )}
                </View>
              </TouchableOpacity>
              <View style={styles.todoTextContainer}>
                <Text
                  style={[
                    styles.todoText,
                    isComplete && styles.todoTextCompleted,
                  ]}
                >
                  {item.text}
                </Text>
                {!!item.description && (
                  <Text style={styles.todoDescription}>{item.description}</Text>
                )}
              </View>
              {onDrag && (
                <TouchableOpacity
                  onPressIn={handleDragPress}
                  style={[
                    styles.dragHandle,
                    isActive && styles.dragHandleActive,
                  ]}
                  hitSlop={{
                    top: 20,
                    bottom: 20,
                    left: 30,
                    right: 30,
                  }}
                >
                  <Ionicons
                    name="reorder-three-outline"
                    size={28}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              )}
            </Pressable>
          </Animated.View>
        </GestureDetector>
      </View>
    </Animated.View>
  );
}
const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    swipeContainer: {
      justifyContent: 'center',
    },
    deleteBackground: {
      backgroundColor: colors.p1,
      position: 'absolute',
      right: 0,
      left: 0,
      top: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'flex-end',
      paddingRight: 40,
    },
    todoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.background,
    },
    circle: {
      width: 26,
      height: 26,
      borderRadius: 13,
      borderWidth: 2,
      marginRight: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    circleP1: {
      borderColor: colors.p1,
      backgroundColor: colors.p1_bg,
    },
    circleP2: {
      borderColor: colors.p2,
      backgroundColor: colors.p2_bg,
    },
    circleP3: {
      borderColor: colors.p3,
      backgroundColor: colors.p3_bg,
    },
    circleP4: {
      borderColor: colors.p4,
      backgroundColor: colors.p4_bg,
    },
    circleCompletedP1: {
      backgroundColor: colors.p1,
      borderColor: colors.p1,
    },
    circleCompletedP2: {
      backgroundColor: colors.p2,
      borderColor: colors.p2,
    },
    circleCompletedP3: {
      backgroundColor: colors.p3,
      borderColor: colors.p3,
    },
    circleCompletedP4: {
      backgroundColor: colors.p4,
      borderColor: colors.p4,
    },
    todoTextContainer: {
      flex: 1,
    },
    todoText: {
      color: colors.text,
      fontSize: 16,
    },
    todoTextCompleted: {
      textDecorationLine: 'line-through',
      color: colors.textSecondary,
    },
    todoDescription: {
      color: colors.textSecondary,
      fontSize: 13,
      marginTop: 2,
    },
    dragHandle: {
      paddingLeft: 16,
    },
    dragHandleActive: {
      backgroundColor: colors.border,
      borderRadius: 8,
    },
  });
