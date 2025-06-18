import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import {
  ActionSheetIOS,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Todo, useTodosContext } from '../../hooks/TodosContext';

const { height } = Dimensions.get('window');

export default function Completed() {
  const { todos, toggleTodoCompleted, deleteTodo, deleteAllCompleted, reload } = useTodosContext();
  const [rowAnimValues, setRowAnimValues] = useState<{ [id: string]: Animated.Value }>({});
  const [completingId, setCompletingId] = useState<string | null>(null);

  // Only show completed todos
  const completedTodos = todos.filter((t: Todo) => t.completed);

  useEffect(() => {
    const newAnimValues: { [id: string]: Animated.Value } = {};
    completedTodos.forEach(todo => {
      if (!rowAnimValues[todo.id]) {
        newAnimValues[todo.id] = new Animated.Value(1);
      }
    });
    if (Object.keys(newAnimValues).length > 0) {
      setRowAnimValues(prev => ({ ...prev, ...newAnimValues }));
    }
  }, [completedTodos, rowAnimValues]);

  const handleUncomplete = (item: Todo) => {
    if (completingId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCompletingId(item.id);
    const animValue = rowAnimValues[item.id];
    Animated.timing(animValue, {
      toValue: 0,
      duration: 350,
      useNativeDriver: true,
    }).start(async () => {
      await toggleTodoCompleted(item.id, false);
      setCompletingId(null);
      reload();
    });
  };

  const deleteTodoHandler = async (id: string) => {
    await deleteTodo(id);
    reload();
  };

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
    React.useCallback(() => {
      reload();
    }, [reload])
  );


  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.today}>Completed</Text>
        {completedTodos.length > 0 && (
          <TouchableOpacity onPress={showHeaderMenu} style={styles.menuBtn}>
            <Ionicons name="ellipsis-horizontal-outline" size={26} color="#e44332" style={styles.menuIconOutline} />
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={completedTodos}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.todoRow}
            onLongPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              if (Platform.OS === 'ios') {
                ActionSheetIOS.showActionSheetWithOptions(
                  {
                    options: ['Cancel', 'Delete Task'],
                    destructiveButtonIndex: 1,
                    cancelButtonIndex: 0,
                  },
                  buttonIndex => {
                    if (buttonIndex === 1) deleteTodoHandler(item.id);
                  }
                );
              } else {
                Alert.alert(
                  'Delete Task',
                  'Are you sure you want to delete this task?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: () => deleteTodoHandler(item.id) },
                  ]
                );
              }
            }}
          >
            <TouchableOpacity
              style={[styles.circle,
                item.priority === 'p1' && styles.circleP1,
                item.priority === 'p2' && styles.circleP2,
                item.priority === 'p3' && styles.circleP3,
                item.priority === 'p4' && styles.circleP4,
                item.completed && [
                  item.priority === 'p1' && styles.circleCompletedP1,
                  item.priority === 'p2' && styles.circleCompletedP2,
                  item.priority === 'p3' && styles.circleCompletedP3,
                  item.priority === 'p4' && styles.circleCompletedP4,
                ]
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                handleUncomplete(item);
              }}
            >
              <Animated.View style={{ transform: [{ scale: rowAnimValues[item.id] || 1 }] }}>
                {item.completed && (
                  <Ionicons
                    name="checkmark"
                    size={16}
                    color="#fff"
                    style={{ backgroundColor: 'transparent' }}
                  />
                )}
              </Animated.View>
            </TouchableOpacity>
            <View style={styles.todoTextContainer}>
              <Text style={[styles.todoText, styles.todoTextCompleted]}>{item.text}</Text>
              {!!item.description && (
                <Text style={styles.todoDescription}>{item.description}</Text>
              )}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No completed tasks yet</Text>}
        contentContainerStyle={{ flexGrow: 1 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181818',
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
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  menuBtn: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconOutline: {
    // No fill, just color
  },
  todoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  circle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#fff',
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    opacity: 1,
  },
  circleP1: {
    borderColor: '#e44332',
    backgroundColor: 'rgba(228,67,50,0.15)',
    opacity: 1,
  },
  circleP2: {
    borderColor: '#ff9800',
    backgroundColor: 'rgba(255,152,0,0.15)',
    opacity: 1,
  },
  circleP3: {
    borderColor: '#2196f3',
    backgroundColor: 'rgba(33,150,243,0.15)',
    opacity: 1,
  },
  circleP4: {
    borderColor: '#bbb',
    backgroundColor: 'transparent',
    opacity: 1,
  },
  circleCompletedP1: {
    backgroundColor: '#e44332',
    borderColor: '#e44332',
  },
  circleCompletedP2: {
    backgroundColor: '#ff9800',
    borderColor: '#ff9800',
  },
  circleCompletedP3: {
    backgroundColor: '#2196f3',
    borderColor: '#2196f3',
  },
  circleCompletedP4: {
    backgroundColor: '#bbb',
    borderColor: '#bbb',
  },
  todoTextContainer: {
    flex: 1,
  },
  todoText: {
    color: '#fff',
    fontSize: 16,
  },
  todoTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  todoDescription: {
    color: '#888',
    fontSize: 13,
    marginTop: 2,
  },
  empty: {
    color: '#888',
    textAlign: 'center',
    marginTop: 40,
  },
});
