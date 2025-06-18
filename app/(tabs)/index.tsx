// app/(tabs)/index.tsx
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
import { Colors } from '../../constants/Colors'; // Import for type definition
import { Todo, useTodosContext } from '../../hooks/TodosContext';
import { useTheme } from '../../hooks/useTheme'; // Import the theme hook

const { height } = Dimensions.get('window');

// Type for our color palette
type ThemeColors = typeof Colors.light;

export default function Index() {
  const colors = useTheme(); // Use the hook
  const styles = getStyles(colors); // Generate styles with current theme colors

  const { todos, addTodo, updateTodo, toggleTodoCompleted, deleteTodo, reload } = useTodosContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [input, setInput] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'p1' | 'p2' | 'p3' | 'p4'>('p4');
  const [showPrioritySelector, setShowPrioritySelector] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [rowAnimValues, setRowAnimValues] = useState<{ [id: string]: Animated.Value }>({});
  const [completingId, setCompletingId] = useState<string | null>(null);

  const activeTodos = todos.filter((t: Todo) => !t.completed);

  useEffect(() => {
    const newAnimValues: { [id: string]: Animated.Value } = {};
    activeTodos.forEach(todo => {
      if (!rowAnimValues[todo.id]) {
        newAnimValues[todo.id] = new Animated.Value(1);
      } else {
        let value = 1;
        try {
          value = (rowAnimValues[todo.id] as any)._value ?? 1;
        } catch {}
        if (value === 0) {
          rowAnimValues[todo.id].setValue(1);
        }
      }
    });
    if (Object.keys(newAnimValues).length > 0) {
      setRowAnimValues(prev => ({ ...prev, ...newAnimValues }));
    }
  }, [activeTodos, rowAnimValues]);

  const saveTodo = async () => {
    if (!input.trim()) return;
    if (editingTodo) {
      await updateTodo({ ...editingTodo, text: input, description, priority });
    } else {
      await addTodo(input, description, priority);
    }
    setInput('');
    setDescription('');
    setPriority('p4');
    setEditingTodo(null);
    setModalVisible(false);
    reload();
  };

  const deleteTodoHandler = async (id: string) => {
    await deleteTodo(id);
    reload();
  };

  const startEditTodo = (todo: Todo) => {
    setEditingTodo(todo);
    setInput(todo.text);
    setDescription(todo.description || '');
    setPriority(todo.priority);
    setModalVisible(true);
  };

  const handleComplete = (item: Todo) => {
    if (completingId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCompletingId(item.id);
    const animValue = rowAnimValues[item.id];
    Animated.timing(animValue, {
      toValue: 0,
      duration: 350,
      useNativeDriver: true,
    }).start(async () => {
      await toggleTodoCompleted(item.id, true);
      setCompletingId(null);
      reload();
    });
  };

  useFocusEffect(
    React.useCallback(() => {
      reload();
    }, [reload])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.today}>Tasks</Text>
      <FlatList
        data={activeTodos}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => {
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
                  onPress={() => handleComplete(item)}
                  style={[styles.circle,
                    item.priority === 'p1' && styles.circleP1,
                    item.priority === 'p2' && styles.circleP2,
                    item.priority === 'p3' && styles.circleP3,
                    item.priority === 'p4' && styles.circleP4,
                    (item.completed || isCompleting) && [
                      styles.circleCompletedP1,
                      styles.circleCompletedP2,
                      styles.circleCompletedP3,
                      styles.circleCompletedP4,
                    ]
                  ]}
                >
                  {(item.completed || isCompleting) && (
                    <Ionicons
                      name="checkmark"
                      size={16}
                      color="#fff" // Checkmark is always white
                      style={{ backgroundColor: 'transparent' }}
                    />
                  )}
                </TouchableOpacity>
                <View style={styles.todoTextContainer}>
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
                placeholderTextColor={colors.textSecondary}
              />
              <TextInput
                style={styles.inputDescription}
                placeholder="Description"
                value={description}
                onChangeText={setDescription}
                placeholderTextColor={colors.textSecondary}
                multiline
              />
              <View style={styles.divider} />
              <View style={styles.modalActionsRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TouchableOpacity
                    style={[styles.priorityButton, styles[`priorityButton_${priority}`]]}
                    onPress={() => setShowPrioritySelector(true)}
                  >
                    <Ionicons name="flag" size={16} color={colors[priority]} style={{ marginRight: 6 }} />
                    <Text style={{ color: colors.text, fontSize: 13 }}>
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
                {([['p1', 'Priority 1'], ['p2', 'Priority 2'], ['p3', 'Priority 3'], ['p4', 'No Priority']] as const).map(([val, label], idx, arr) => (
                  <React.Fragment key={val}>
                    <TouchableOpacity
                      style={styles.bottomSheetOption}
                      onPress={() => { setPriority(val); setShowPrioritySelector(false); }}
                    >
                      <Ionicons name="flag" size={20} color={colors[val]} style={{ marginRight: 12 }} />
                      <Text style={{ color: colors.text, fontSize: 18 }}>{label}</Text>
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

// Styles are now generated by a function that receives the theme colors
const getStyles = (colors: ThemeColors) => StyleSheet.create({
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
    marginBottom: 8,
  },
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
  empty: { color: colors.textSecondary, textAlign: 'center', marginTop: 40 },
  addButton: {
    position: 'absolute',
    right: 24,
    bottom: 96,
    backgroundColor: colors.tint,
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
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  inputTitle: {
    color: colors.text,
    fontSize: 22,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  inputDescription: {
    color: colors.textSecondary,
    fontSize: 18,
    marginBottom: 18,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginBottom: 10,
  },
  modalActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priorityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 0,
    paddingHorizontal: 12,
    height: 32,
  },
  priorityButton_p1: { borderColor: colors.p1, backgroundColor: colors.p1_bg },
  priorityButton_p2: { borderColor: colors.p2, backgroundColor: colors.p2_bg },
  priorityButton_p3: { borderColor: colors.p3, backgroundColor: colors.p3_bg },
  priorityButton_p4: { borderColor: colors.p4, backgroundColor: colors.p4_bg },
  modalAddBtn: {
    backgroundColor: colors.tint,
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSheetOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 32,
    zIndex: 100,
  },
  bottomSheetList: {
    backgroundColor: colors.cardSecondary,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  bottomSheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 10,
  },
  bottomSheetDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  bottomSheetCancel: {
    marginTop: 8,
    backgroundColor: colors.cardSecondary,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  bottomSheetCancelText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
});