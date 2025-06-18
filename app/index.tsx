import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Dimensions,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable // Import Pressable
    ,

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

const { height } = Dimensions.get('window');

export default function HomeScreen() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [input, setInput] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'p1' | 'p2' | 'p3' | 'p4'>('p4');
  const [showPrioritySelector, setShowPrioritySelector] = useState(false);

  const addTodo = () => {
    if (!input.trim()) return;
    setTodos([
      ...todos,
      {
        id: Date.now().toString(),
        text: input,
        completed: false,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        priority,
        description,
      },
    ]);
    setInput('');
    setDescription('');
    setPriority('p4');
    setShowPrioritySelector(false);
    setModalVisible(false);
  };

  const toggleTodo = (id: string) => {
    setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.today}>Today</Text>
      <FlatList
        data={todos}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.todoRow} onPress={() => toggleTodo(item.id)}>
            <View style={[styles.circle,
              item.priority === 'p1' && styles.circleP1,
              item.priority === 'p2' && styles.circleP2,
              item.priority === 'p3' && styles.circleP3,
              item.priority === 'p4' && styles.circleP4
            ]}>
              {item.completed && <Ionicons name="checkmark" size={16} color="#fff" />}
            </View>
            <View style={styles.todoTextContainer}>
              <Text style={[styles.todoText, item.completed && styles.todoTextCompleted]}>{item.text}</Text>
              {!!item.description && (
                <Text style={styles.todoDescription}>{item.description}</Text>
              )}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No tasks yet</Text>}
        contentContainerStyle={{ flexGrow: 1 }}
      />
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={36} color="#fff" />
      </TouchableOpacity>

      {/* --- UPDATED MODAL --- */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
        onDismiss={() => setShowPrioritySelector(false)}
      >
        <View style={styles.modalContainer}>
          {/* This Pressable acts as the background overlay. Clicking it closes the modal. */}
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setModalVisible(false)}
          />

          {/* The content sits on top of the Pressable background */}
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
                  {showPrioritySelector && (
                    <View style={styles.prioritySelectorContainer}>
                      {[['p1', 'Priority 1', '#e44332'], ['p2', 'Priority 2', '#ff9800'], ['p3', 'Priority 3', '#2196f3'], ['p4', 'No Priority', '#bbb']].map(([val, label, color]) => (
                        <TouchableOpacity
                          key={val}
                          style={styles.prioritySelectorOption}
                          onPress={() => { setPriority(val as any); setShowPrioritySelector(false); }}
                        >
                          <Ionicons name="flag" size={15} color={color as string} style={{ marginRight: 6 }} />
                          <Text style={{ color: '#fff', fontSize: 13 }}>{label}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
                <TouchableOpacity onPress={addTodo} style={styles.modalAddBtn}>
                  <Ionicons name="arrow-up" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

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
    bottom: 40,
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
    fontSize: 20, // increased size
    marginBottom: 8,
    borderWidth: 0,
    padding: 0,
    fontWeight: 'bold',
  },
  inputDescription: {
    backgroundColor: 'transparent',
    color: '#aaa',
    fontSize: 16,
    borderWidth: 0,
    padding: 0,
    marginBottom: 32, // increase gap below description
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
});