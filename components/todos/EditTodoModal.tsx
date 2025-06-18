// No changes to imports or the component body, only getStyles
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { useTheme } from '../../hooks/useTheme';

type ThemeColors = typeof Colors.light;

// ... (The EditTodoModal component code is unchanged) ...
export function EditTodoModal({ visible, onClose, onSave, todoToEdit }: any) {
    const colors = useTheme();
    const styles = getStyles(colors);
  
    // The modal now manages its own internal form state.
    const [input, setInput] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<'p1' | 'p2' | 'p3' | 'p4'>('p4');
    const [showPrioritySelector, setShowPrioritySelector] = useState(false);
  
    // When the modal is opened, populate the state from the `todoToEdit` prop.
    useEffect(() => {
      if (todoToEdit) {
        setInput(todoToEdit.text);
        setDescription(todoToEdit.description || '');
        setPriority(todoToEdit.priority);
      } else {
        // If adding a new task, reset to default state
        setInput('');
        setDescription('');
        setPriority('p4');
      }
    }, [todoToEdit, visible]); // Rerun effect when visibility or the todo item changes
  
    const handleSave = () => {
      if (!input.trim()) return;
      onSave({ text: input, description, priority });
    };
    
    const handleClose = () => {
        setShowPrioritySelector(false); // ensure sub-modal closes
        onClose();
    }
  
    return (
      <Modal
        visible={visible}
        animationType="slide"
        transparent
        onRequestClose={handleClose}
        onDismiss={() => setShowPrioritySelector(false)}
      >
        <View style={styles.modalContainer}>
          <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ width: '100%' }}
          >
            <View style={styles.modalContent}>
              <TextInput
                style={styles.inputTitle}
                placeholder="Title"
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
                <TouchableOpacity onPress={handleSave} style={styles.modalAddBtn}>
                  <Ionicons name={todoToEdit ? 'checkmark' : 'arrow-up'} size={16} color="#fff" />
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
                {(
                  [
                    ['p1', 'Priority 1'],
                    ['p2', 'Priority 2'],
                    ['p3', 'Priority 3'],
                    ['p4', 'No Priority'],
                  ] as const
                ).map(([val, label], idx, arr) => (
                  <React.Fragment key={val}>
                    <TouchableOpacity
                      style={styles.bottomSheetOption}
                      onPress={() => {
                        setPriority(val);
                        setShowPrioritySelector(false);
                      }}
                    >
                      <Ionicons name="flag" size={20} color={colors[val as keyof ThemeColors]} style={{ marginRight: 12 }} />
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
    );
  }

// Apply the explicit type to the 'colors' parameter here
const getStyles = (colors: ThemeColors) => StyleSheet.create({
    // ... (All the styles from before are unchanged) ...
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