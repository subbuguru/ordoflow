import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
}

const SWIPE_THRESHOLD = -100;

export function TodoListItem({ item, onToggleComplete, onDelete, onStartEdit, onReload }: TodoListItemProps) {
  const colors = useTheme();
  const styles = getStyles(colors);

  // ADDED: New state to control the "visual" completion before the animation
  const [isVisuallyCompleting, setIsVisuallyCompleting] = useState(false);

  const translateX = useSharedValue(0);
  const itemOpacity = useSharedValue(1);
  const itemScale = useSharedValue(1);

  React.useEffect(() => {
    // When the component re-renders (e.g., from un-completing), reset all visual states
    if (item.completed === false) {
      translateX.value = withTiming(0);
      itemOpacity.value = withTiming(1);
      itemScale.value = withTiming(1);
      setIsVisuallyCompleting(false);
    }
  }, [item.completed]);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationX < 0) {
        translateX.value = event.translationX;
      }
    })
    .onEnd(() => {
      'worklet';
      if (translateX.value < SWIPE_THRESHOLD) {
        translateX.value = withTiming(-500);
        itemOpacity.value = withTiming(0, undefined, (isFinished) => {
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
    transform: [{ translateX: translateX.value }],
  }));

  const rCompleteStyle = useAnimatedStyle(() => ({
    opacity: itemOpacity.value,
    transform: [{ scale: itemScale.value }],
  }));

  const handleToggleComplete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // 1. Immediately set the visual state to "completing"
    setIsVisuallyCompleting(true);

    // 2. Start the fade-out animation a moment later
    setTimeout(() => {
      itemOpacity.value = withTiming(0);
      itemScale.value = withTiming(0.85);
    }, 50); // A tiny delay to ensure the UI updates before fading

    // 3. After the animation is done, update the actual data
    setTimeout(async () => {
      await onToggleComplete(item.id, !item.completed);
      runOnJS(onReload)();
    }, 350);
  };
  
  // The item is visually "complete" if the data says it's complete OR if we are in the process of animating it.
  const isComplete = item.completed || isVisuallyCompleting;

  return (
    <Animated.View style={rCompleteStyle}>
      <View style={styles.swipeContainer}>
        <View style={styles.deleteBackground}>
          <Ionicons name="trash-outline" size={24} color="#fff" />
        </View>

        <GestureDetector gesture={panGesture}>
          <Animated.View style={rSwipeStyle}>
            <Pressable
              style={styles.todoRow}
              onPress={() => onStartEdit(item)}
            >
              <TouchableOpacity onPress={handleToggleComplete}>
                <View
                  style={[
                    styles.circle,
                    item.priority === 'p1' && styles.circleP1,
                    item.priority === 'p2' && styles.circleP2,
                    item.priority === 'p3' && styles.circleP3,
                    item.priority === 'p4' && styles.circleP4,
                    // UPDATED: Use the combined `isComplete` state
                    isComplete && [
                      styles.circleCompletedP1,
                      styles.circleCompletedP2,
                      styles.circleCompletedP3,
                      styles.circleCompletedP4,
                    ],
                  ]}
                >
                  {/* UPDATED: Use the combined `isComplete` state */}
                  {isComplete && (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  )}
                </View>
              </TouchableOpacity>
              <View style={styles.todoTextContainer}>
                {/* UPDATED: Use the combined `isComplete` state */}
                <Text style={[styles.todoText, isComplete && styles.todoTextCompleted]}>
                  {item.text}
                </Text>
                {!!item.description && (
                  <Text style={styles.todoDescription}>{item.description}</Text>
                )}
              </View>
            </Pressable>
          </Animated.View>
        </GestureDetector>
      </View>
    </Animated.View>
  );
}

// Styles are unchanged from the previous version
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
      paddingHorizontal: 20,
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