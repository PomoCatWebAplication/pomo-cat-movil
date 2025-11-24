// components/calendar/DailyPlanModal.tsx
import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
const API_URL = process.env.EXPO_PUBLIC_API_URL;

export interface DailyPlan {
  _id: string; // MongoDB usa _id
  id?: string; // Alias opcional
  day: number; // 0-6 (Monday-Sunday)
  startTime: string; // ISO string
  endTime: string; // ISO string
  note?: string;
  userId: string;
  taskId: string;
  createdAt: string;
  updatedAt: string;
}


export interface Task {
  _id: string; // MongoDB usa _id
  id?: string; // Alias opcional
  title: string;
  description?: string;
  state: 'COMPLETED' | 'PENDING' | 'IN_PROGRESS';
  notifyLocalTime?: string;
  dailyMinutes?: number;
  timezone?: string;
  dueDate: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}


interface DailyPlanModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedDay?: number;
  selectedHour?: string;
  editingPlan?: DailyPlan | null;
  userId: string;
}

export interface CreateDailyPlanDto {
  day: number; // 0-6
  startTime: string; // ISO string
  endTime: string; // ISO string
  note?: string;
  taskId: string;
}

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export default function DailyPlanModal({
  visible,
  onClose,
  onSuccess,
  selectedDay = 0,
  selectedHour = '9:00',
  editingPlan,
  userId,
}: DailyPlanModalProps) {
  const [formData, setFormData] = useState({
    day: selectedDay,
    startTime: '',
    endTime: '',
    note: '',
    taskId: '',
  });
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
  });
  const [createNewTask, setCreateNewTask] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (visible) {
      loadTasks();
      initializeForm();
    }
  }, [visible, selectedDay, selectedHour, editingPlan]);

  const loadTasks = async () => {
    try {
      setLoadingTasks(true);
      const allTasks = await fetch(`${API_URL}/tasks/user/${userId}`, {
        credentials: "include",
      }).then(res => res.json());
      setTasks(allTasks);
    } catch (err) {
      console.error('Error loading tasks:', err);
    } finally {
      setLoadingTasks(false);
    }
  };

  const initializeForm = () => {
    if (editingPlan) {
      setFormData({
        day: editingPlan.day,
        startTime: new Date(editingPlan.startTime).toISOString().slice(0, 16),
        endTime: new Date(editingPlan.endTime).toISOString().slice(0, 16),
        note: editingPlan.note || '',
        taskId: editingPlan.taskId,
      });
      setCreateNewTask(false);
    } else {
      const today = new Date();
      const hour = parseInt(selectedHour.split(':')[0]);
      const startDate = new Date(today.setHours(hour, 0, 0, 0));
      const endDate = new Date(today.setHours(hour + 1, 0, 0, 0));

      setFormData({
        day: selectedDay,
        startTime: startDate.toISOString().slice(0, 16),
        endTime: endDate.toISOString().slice(0, 16),
        note: '',
        taskId: '',
      });
      setNewTask({
        title: '',
        description: '',
        dueDate: startDate.toISOString().split('T')[0],
      });
      setCreateNewTask(true);
    }
    setError(null);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      let taskId = formData.taskId;

      if (createNewTask) {
        if (!newTask.title.trim()) {
          throw new Error('El título de la tarea es requerido');
        }

        const createdTask = await  fetch(`${API_URL}/tasks/${userId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: newTask.title,
            description: newTask.description || undefined,
            dueDate: newTask.dueDate,
            state: 'PENDING',
          }),
          credentials: "include",
        });

        taskId = (await createdTask.json())._id;
      } else if (!taskId) {
        throw new Error('Debes seleccionar una tarea');
      }

      const dto: CreateDailyPlanDto = {
        day: formData.day,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        note: formData.note || undefined,
        taskId: taskId,
      };

      if (editingPlan) {
        const planId = (editingPlan as any)._id || editingPlan._id || editingPlan.id;
        await fetch(`${API_URL}/daily-plans/${planId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            day: dto.day,
            startTime: dto.startTime,
            endTime: dto.endTime,
            note: dto.note,
            taskId: dto.taskId,
          }),
          credentials: "include",
        });
      } else {
        await fetch(`${API_URL}/daily-plans/${userId}/${taskId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            day: dto.day,
            startTime: dto.startTime,
            endTime: dto.endTime,
            note: dto.note,
            taskId: dto.taskId,
          }),
          credentials: "include",
        });
      }

      onSuccess();
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al guardar el plan';
      setError(message);
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="bg-white px-5 pt-12 pb-4 border-b border-gray-200 flex-row items-center justify-between">
          <Text className="text-xl font-bold">
            {editingPlan ? 'Editar Plan' : 'Crear Nuevo Plan'}
          </Text>
          <TouchableOpacity onPress={onClose} className="p-2">
            <Ionicons name="close" size={28} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Form */}
        <ScrollView className="flex-1 px-5 pt-5" showsVerticalScrollIndicator={false}>
          {error && (
            <View className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-4">
              <Text className="text-red-600 text-sm">{error}</Text>
            </View>
          )}

          {/* Day Picker */}
          <View className="mb-5">
            <Text className="text-sm font-semibold text-gray-700 mb-2">Día</Text>
            <View className="border-2 border-gray-300 rounded-lg overflow-hidden">
              <Picker
                selectedValue={formData.day}
                onValueChange={(value) => setFormData({ ...formData, day: value })}
              >
                {DAYS.map((dayName, index) => (
                  <Picker.Item key={index} label={dayName} value={index} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Start Time */}
          <View className="mb-5">
            <Text className="text-sm font-semibold text-gray-700 mb-2">Hora de inicio</Text>
            <TextInput
              className="border-2 border-gray-300 rounded-lg px-4 py-3 text-base"
              placeholder="HH:MM"
              value={formData.startTime.slice(11, 16)}
              onChangeText={(text) => {
                const newDateTime = formData.startTime.slice(0, 11) + text;
                setFormData({ ...formData, startTime: newDateTime });
              }}
            />
          </View>

          {/* End Time */}
          <View className="mb-5">
            <Text className="text-sm font-semibold text-gray-700 mb-2">Hora de fin</Text>
            <TextInput
              className="border-2 border-gray-300 rounded-lg px-4 py-3 text-base"
              placeholder="HH:MM"
              value={formData.endTime.slice(11, 16)}
              onChangeText={(text) => {
                const newDateTime = formData.endTime.slice(0, 11) + text;
                setFormData({ ...formData, endTime: newDateTime });
              }}
            />
          </View>

          {/* Toggle New Task */}
          {!editingPlan && (
            <TouchableOpacity
              className="flex-row items-center mb-5"
              onPress={() => setCreateNewTask(!createNewTask)}
            >
              <View className={`w-6 h-6 rounded border-2 mr-3 items-center justify-center ${
                createNewTask ? 'bg-[#e74c3c] border-[#e74c3c]' : 'border-gray-400'
              }`}>
                {createNewTask && <Ionicons name="checkmark" size={18} color="white" />}
              </View>
              <Text className="text-base font-medium">Crear nueva tarea</Text>
            </TouchableOpacity>
          )}

          {/* New Task Fields */}
          {createNewTask && !editingPlan ? (
            <>
              <View className="mb-5">
                <Text className="text-sm font-semibold text-gray-700 mb-2">Título de la tarea *</Text>
                <TextInput
                  className="border-2 border-gray-300 rounded-lg px-4 py-3 text-base"
                  placeholder="Ej: Estudiar para examen"
                  value={newTask.title}
                  onChangeText={(text) => setNewTask({ ...newTask, title: text })}
                />
              </View>

              <View className="mb-5">
                <Text className="text-sm font-semibold text-gray-700 mb-2">Descripción (opcional)</Text>
                <TextInput
                  className="border-2 border-gray-300 rounded-lg px-4 py-3 text-base"
                  placeholder="Detalles adicionales..."
                  value={newTask.description}
                  onChangeText={(text) => setNewTask({ ...newTask, description: text })}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View className="mb-5">
                <Text className="text-sm font-semibold text-gray-700 mb-2">Fecha de vencimiento *</Text>
                <TextInput
                  className="border-2 border-gray-300 rounded-lg px-4 py-3 text-base"
                  placeholder="YYYY-MM-DD"
                  value={newTask.dueDate}
                  onChangeText={(text) => setNewTask({ ...newTask, dueDate: text })}
                />
              </View>
            </>
          ) : (
            <View className="mb-5">
              <Text className="text-sm font-semibold text-gray-700 mb-2">Tarea</Text>
              <View className="border-2 border-gray-300 rounded-lg overflow-hidden">
                <Picker
                  selectedValue={formData.taskId}
                  onValueChange={(value) => setFormData({ ...formData, taskId: value })}
                  enabled={!loadingTasks}
                >
                  <Picker.Item 
                    label={loadingTasks ? 'Cargando...' : 'Selecciona una tarea'} 
                    value="" 
                  />
                  {tasks.map((task) => {
                    const taskId = (task as any)._id || task._id || task.id;
                    return (
                      <Picker.Item key={taskId} label={task.title} value={taskId} />
                    );
                  })}
                </Picker>
              </View>
            </View>
          )}

          {/* Note */}
          <View className="mb-5">
            <Text className="text-sm font-semibold text-gray-700 mb-2">Nota (opcional)</Text>
            <TextInput
              className="border-2 border-gray-300 rounded-lg px-4 py-3 text-base"
              placeholder="Añade una nota..."
              value={formData.note}
              onChangeText={(text) => setFormData({ ...formData, note: text })}
              multiline
              numberOfLines={3}
            />
          </View>

          <View className="h-24" />
        </ScrollView>

        {/* Footer Buttons */}
        <View className="px-5 py-4 border-t border-gray-200 flex-row gap-3 bg-white">
          <TouchableOpacity
            className="flex-1 bg-gray-100 py-4 rounded-lg items-center"
            onPress={onClose}
          >
            <Text className="text-gray-700 font-semibold text-base">Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-1 py-4 rounded-lg items-center ${
              loading ? 'bg-gray-400' : 'bg-[#e74c3c]'
            }`}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-base">
                {editingPlan ? 'Actualizar' : 'Crear'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}