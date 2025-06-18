import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import * as SQLite from 'expo-sqlite';
import React, { useEffect, useState } from 'react';
import {
  ActionSheetIOS,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  date: string;
  priority: 'p1' | 'p2' | 'p3' | 'p4';
  description?: string;
}

const db = SQLite.openDatabaseSync('todoit.db');
const { height } = Dimensions.get('window');

export default function Tabs() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [input, setInput] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'p1' | 'p2' | 'p3' | 'p4'>('p4');
  const [showPrioritySelector, setShowPrioritySelector] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  // NEW: State to hold animation values for each row (opacity, scale)
  const [rowAnimValues, setRowAnimValues] = useState<{ [id: string]: Animated.Value }>({});
  // NEW: State to track the ID of the item currently being animated for completion
  const [completingId, setCompletingId] = useState<string | null>(null);


  useEffect(() => {
    db.withTransactionAsync(async () => {
      await db.execAsync(
        `CREATE TABLE IF NOT EXISTS todos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          text TEXT,
          description TEXT,
          completed INTEGER,
          date TEXT,
          priority TEXT
        );`
      );
    }).then(loadTodos);
  }, []);

  // UPDATED: When todos are loaded, initialize their animation values.
  useEffect(() => {
    const newAnimValues: { [id: string]: Animated.Value } = {};
    todos.forEach(todo => {
      // If an animation value doesn't exist for a todo, create one.
      if (!rowAnimValues[todo.id]) {
        newAnimValues[todo.id] = new Animated.Value(1);
      }
    });
    // Combine new values with existing ones
    if (Object.keys(newAnimValues).length > 0) {
      setRowAnimValues(prev => ({ ...prev, ...newAnimValues }));
    }
  }, [todos]);

  const saveTodo = async () => {
    if (!input.trim()) return;
    if (editingTodo) {
      await db.withTransactionAsync(async () => {
        await db.runAsync(
          `UPDATE todos SET text = ?, description = ?, priority = ? WHERE id = ?`,
          [input, description, priority, Number(editingTodo.id)]
        );
      });
    } else {
      await db.withTransactionAsync(async () => {
        await db.runAsync(
          `INSERT INTO todos (text, description, completed, date, priority) VALUES (?, ?, ?, ?, ?);`,
          [input, description, 0, new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), priority]
        );
      });
    }
    setInput('');
    setDescription('');
    setPriority('p4');
    setEditingTodo(null);
    setModalVisible(false);
    loadTodos();
  };

  const loadTodos = React.useCallback(() => {
    db.withTransactionAsync(async () => {
      const todosRaw = await db.getAllAsync<any>(`SELECT * FROM todos WHERE completed = 0 ORDER BY id DESC;`);
      const todos: Todo[] = todosRaw.map((t: any) => ({
        ...t,
        id: String(t.id),
        completed: !!t.completed,
      }));
      setTodos(todos);
    });
  }, []);

  const toggleTodo = async (id: string) => {
    // We only toggle to 'completed' here, so we set it to 1.
    await db.withTransactionAsync(async () => {
      await db.runAsync(`UPDATE todos SET completed = 1 WHERE id = ?`, [Number(id)]);
    });
    // Reset completing ID and reload the list from the database
    setCompletingId(null);
    await loadTodos();
  };

  const deleteTodo = async (id: string) => {
    await db.withTransactionAsync(async () => {
      await db.runAsync(`DELETE FROM todos WHERE id = ?`, [Number(id)]);
    });
    await loadTodos();
  };

  const startEditTodo = (todo: Todo) => {
    setEditingTodo(todo);
    setInput(todo.text);
    setDescription(todo.description || '');
    setPriority(todo.priority);
    setModalVisible(true);
  };
  
  // NEW: The main function to handle the completion animation and logic
  const handleComplete = (item: Todo) => {
    // Don't allow another completion while one is in progress
    if (completingId) return;

    // Trigger haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Set the completing ID to immediately apply completed styles
    setCompletingId(item.id);

    // Get the specific animation value for this row
    const animValue = rowAnimValues[item.id];

    // Animate the row: fade out and shrink
    Animated.timing(animValue, {
      toValue: 0,
      duration: 350, // A bit longer to appreciate the fade
      useNativeDriver: true, // Use native driver for smoother animation
    }).start(() => {
      // After the animation is complete, update the database
      toggleTodo(item.id);
      // We don't need to reset the animValue to 1 here, because the item
      // will be removed from the `todos` state entirely. If it's ever
      // un-completed, it will be a new item in the list and get a new animValue.
    });
  };


  useFocusEffect(
    React.useCallback(() => {
      loadTodos();
    }, [loadTodos])
  );


  return (
    <View style={styles.container}>
      <Text style={styles.today}>Tasks</Text>
      <FlatList
        data={todos}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => {
          // UPDATED: Check if the current item is the one being completed
          const isCompleting = completingId === item.id;
          const animStyle = {
            opacity: rowAnimValues[item.id],
            transform: [
              {
                scale: rowAnimValues[item.id] ? rowAnimValues[item.id].interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.85, 1],
                }) : 1,
              },
            ],
          };

          return (
            // UPDATED: Wrap the row in an Animated.View to apply the animation styles
            <Animated.View style={animStyle}>
              <TouchableOpacity
                style={styles.todoRow}
                onPress={() => startEditTodo(item)}
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
                        if (buttonIndex === 1) deleteTodo(item.id);
                      }
                    );
                  } else {
                    Alert.alert(
                      'Delete Task',
                      'Are you sure you want to delete this task?',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Delete', style: 'destructive', onPress: () => deleteTodo(item.id) },
                      ]
                    );
                  }
                }}
              >
                <TouchableOpacity
                  // UPDATED: The circle press now triggers our new animation handler
                  onPress={() => handleComplete(item)}
                  style={[styles.circle,
                    item.priority === 'p1' && styles.circleP1,
                    item.priority === 'p2' && styles.circleP2,
                    item.priority === 'p3' && styles.circleP3,
                    item.priority === 'p4' && styles.circleP4,
                    // UPDATED: Apply completed styles if the item is marked completed OR is currently animating
                    (item.completed || isCompleting) && [
                      item.priority === 'p1' && styles.circleCompletedP1,
                      item.priority === 'p2' && styles.circleCompletedP2,
                      item.priority === 'p3' && styles.circleCompletedP3,
                      item.priority === 'p4' && styles.circleCompletedP4,
                    ]
                  ]}
                >
                  {/* UPDATED: Show the checkmark if the item is completed OR is animating */ }
                  {(item.completed || isCompleting) && (
                    <Ionicons
                      name="checkmark"
                      size={16}
                      color="#fff"
                      style={{ backgroundColor: 'transparent' }}
                    />
                  )}
                </TouchableOpacity>
                <View style={styles.todoTextContainer}>
                  {/* UPDATED: Apply strikethrough style if item is completed OR is animating */ }
                  <Text style={[styles.todoText, (item.completed || isCompleting) && styles.todoTextCompleted]}>
                    {item.text}
                  </Text>
                  {!!item.description && (
                    <Text style={styles.todoDescription}>{item.description}</Text>
                  )}
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        }}
        ListEmptyComponent={<Text style={styles.empty}>No tasks yet</Text>}
        contentContainerStyle={{ flexGrow: 1 }}
      />
      <TouchableOpacity style={styles.addButton} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setEditingTodo(null); setInput(''); setDescription(''); setPriority('p4'); setModalVisible(true); }}>
        <Ionicons name="add" size={36} color="#fff" />
      </TouchableOpacity>

      {/* --- MODAL (No Changes Needed) --- */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
        onDismiss={() => setShowPrioritySelector(false)}
      >
        <View style={styles.modalContainer}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setModalVisible(false)}
          />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ width: '100%' }}
          >
            <View style={styles.modalContent}>
              <TextInput
                style={styles.inputTitle}
                placeholder="e.g., Finish sales report by Thu at 3pm"
                value={input}
                onChangeText={setInput}
                autoFocus
                placeholderTextColor="#888"
              />
              <TextInput
                style={styles.inputDescription}
                placeholder="Description"
                value={description}
                onChangeText={setDescription}
                placeholderTextColor="#888"
                multiline
              />
              <View style={styles.divider} />
              <View style={styles.modalActionsRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TouchableOpacity
                    style={[styles.priorityButton, styles[`priorityButton_${priority}`]]}
                    onPress={() => setShowPrioritySelector(true)}
                  >
                    <Ionicons name="flag" size={16} color={priority === 'p4' ? '#bbb' : priority === 'p1' ? '#e44332' : priority === 'p2' ? '#ff9800' : '#2196f3'} style={{ marginRight: 6 }} />
                    <Text style={{ color: '#fff', fontSize: 13 }}>
                      {priority === 'p1' ? 'Priority 1' : priority === 'p2' ? 'Priority 2' : priority === 'p3' ? 'Priority 3' : 'No Priority'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={saveTodo} style={styles.modalAddBtn}>
                  <Ionicons name={editingTodo ? "checkmark" : "arrow-up"} size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
          <Modal
            visible={showPrioritySelector}
            animationType="slide"
            transparent
            onRequestClose={() => setShowPrioritySelector(false)}
          >
            <Pressable style={styles.bottomSheetOverlay} onPress={() => setShowPrioritySelector(false)} />
            <View style={styles.bottomSheet}>
              <View style={styles.bottomSheetList}>
                {[['p1', 'Priority 1', '#e44332'], ['p2', 'Priority 2', '#ff9800'], ['p3', 'Priority 3', '#2196f3'], ['p4', 'No Priority', '#bbb']].map(([val, label, color], idx, arr) => (
                  <React.Fragment key={val}>
                    <TouchableOpacity
                      style={styles.bottomSheetOption}
                      onPress={() => { setPriority(val as any); setShowPrioritySelector(false); }}
                    >
                      <Ionicons name="flag" size={20} color={color as string} style={{ marginRight: 12 }} />
                      <Text style={{ color: '#fff', fontSize: 18 }}>{label}</Text>
                    </TouchableOpacity>
                    {idx < arr.length - 1 && <View style={styles.bottomSheetDivider} />}
                  </React.Fragment>
                ))}
              </View>
              <TouchableOpacity style={styles.bottomSheetCancel} onPress={() => setShowPrioritySelector(false)}>
                <Text style={styles.bottomSheetCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </View>
      </Modal>
    </View>
  );
}

// Styles remain the same
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181818',
    paddingTop: height * 0.12, // 10vh equivalent
    paddingHorizontal: 20,
  },
  today: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
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
  todoDate: {
    color: '#e44332',
    fontSize: 13,
    marginTop: 2,
  },
  empty: {
    color: '#888',
    textAlign: 'center',
    marginTop: 40,
  },
  addButton: {
    position: 'absolute',
    right: 24,
    bottom: 96, // moved up from 40 to avoid tab bar
    backgroundColor: '#e44332',
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  inputTitle: {
    backgroundColor: 'transparent',
    color: '#fff',
    fontSize: 22, // increased size
    marginBottom: 8,
    borderWidth: 0,
    padding: 0,
    fontWeight: 'bold',
  },
  inputDescription: {
    backgroundColor: 'transparent',
    color: '#aaa',
    fontSize: 18, // increased size
    borderWidth: 0,
    padding: 0,
    marginBottom: 18,
  },
  priorityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 0.7,
    borderColor: '#bbb',
    backgroundColor: 'transparent',
    paddingVertical: 0,
    paddingHorizontal: 12,
    height: 32, // match add button height
    marginRight: 10,
    marginLeft: 0,
  },
  priorityButton_p1: {
    borderColor: '#e44332',
    backgroundColor: 'rgba(228,67,50,0.10)',
  },
  priorityButton_p2: {
    borderColor: '#ff9800',
    backgroundColor: 'rgba(255,152,0,0.10)',
  },
  priorityButton_p3: {
    borderColor: '#2196f3',
    backgroundColor: 'rgba(33,150,243,0.10)',
  },
  priorityButton_p4: {
    borderColor: '#bbb',
    backgroundColor: 'transparent',
  },
  prioritySelectorContainer: {
    backgroundColor: '#222',
    borderRadius: 10,
    padding: 8,
    marginTop: 4,
    marginBottom: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#333',
    zIndex: 10,
  },
  prioritySelectorOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginTop: 0,
    marginBottom: 10,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 0,
    marginTop: 0,
  },
  modalActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // space between left and right
    marginBottom: 0,
    marginTop: 0,
  },
  modalAddBtn: {
    backgroundColor: '#e44332',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
    marginTop: 0,
    marginBottom: 0,
  },
  modalContent: {
    backgroundColor: '#222',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    margin: 0,
  },
  bottomSheetOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#222',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 32,
    zIndex: 100,
  },
  bottomSheetList: {
    backgroundColor: '#292929',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  bottomSheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 10,
    backgroundColor: 'transparent',
  },
  bottomSheetDivider: {
    height: 1,
    backgroundColor: '#333',
    marginLeft: 0, // start at the very left
  },
  bottomSheetCancel: {
    marginTop: 8,
    backgroundColor: '#333',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  bottomSheetCancelText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});