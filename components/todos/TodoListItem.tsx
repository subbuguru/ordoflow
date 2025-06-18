// No changes to imports or the component body, only getStyles
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import {
  ActionSheetIOS,
  Alert,
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { Todo } from '../../hooks/TodosContext';
import { useTheme } from '../../hooks/useTheme';

type ThemeColors = typeof Colors.light;

// ... (TodoListItemProps interface is unchanged) ...
interface TodoListItemProps {
    item: Todo;
    onToggleComplete: (id: string, completed: boolean) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    onStartEdit: (todo: Todo) => void;
    onReload: () => void;
  }
// ... (The TodoListItem component code is unchanged) ...
export function TodoListItem({ item, onToggleComplete, onDelete, onStartEdit, onReload }: TodoListItemProps) {
    const colors = useTheme();
    const styles = getStyles(colors);
  
    const [animValue] = useState(new Animated.Value(1));
    const [isCompleting, setIsCompleting] = useState(false);
  
    // Reset animation if item appears again (e.g., un-completing)
    useEffect(() => {
      if ((animValue as any)._value === 0) {
        animValue.setValue(1);
      }
    }, [item, animValue]);
  
    const handleToggleComplete = () => {
      if (isCompleting) return;
  
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setIsCompleting(true);
  
      Animated.timing(animValue, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }).start(async () => {
        await onToggleComplete(item.id, !item.completed);
        // A small delay to allow state to propagate before reloading
        setTimeout(() => {
          setIsCompleting(false);
          onReload();
          // The animation value will be reset by the useEffect if the item re-appears
        }, 50);
      });
    };
    
    const handleDelete = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      if (Platform.OS === 'ios') {
        ActionSheetIOS.showActionSheetWithOptions(
          {
            options: ['Cancel', 'Delete Task'],
            destructiveButtonIndex: 1,
            cancelButtonIndex: 0,
          },
          buttonIndex => {
            if (buttonIndex === 1) onDelete(item.id);
          }
        );
      } else {
        Alert.alert(
          'Delete Task',
          'Are you sure you want to delete this task?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => onDelete(item.id) },
          ]
        );
      }
    };
  
    const animatedStyle = {
      opacity: animValue,
      transform: [
        {
          scale: animValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0.85, 1],
          }),
        },
      ],
    };
  
    const isCompletedOrAnimating = item.completed || isCompleting;
  
    return (
      <Animated.View style={animatedStyle}>
        <TouchableOpacity
          style={styles.todoRow}
          onPress={() => onStartEdit(item)}
          onLongPress={handleDelete}
        >
          <TouchableOpacity
            onPress={handleToggleComplete}
            style={[
              styles.circle,
              item.priority === 'p1' && styles.circleP1,
              item.priority === 'p2' && styles.circleP2,
              item.priority === 'p3' && styles.circleP3,
              item.priority === 'p4' && styles.circleP4,
              isCompletedOrAnimating && [
                styles.circleCompletedP1,
                styles.circleCompletedP2,
                styles.circleCompletedP3,
                styles.circleCompletedP4,
              ]
            ]}
          >
            {isCompletedOrAnimating && (
              <Ionicons
                name="checkmark"
                size={16}
                color="#fff"
                style={{ backgroundColor: 'transparent' }}
              />
            )}
          </TouchableOpacity>
          <View style={styles.todoTextContainer}>
            <Text style={[styles.todoText, isCompletedOrAnimating && styles.todoTextCompleted]}>
              {item.text}
            </Text>
            {!!item.description && (
              <Text style={styles.todoDescription}>{item.description}</Text>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

// Apply the explicit type to the 'colors' parameter here
const getStyles = (colors: ThemeColors) => StyleSheet.create({
    // ... (All the styles from before are unchanged) ...
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