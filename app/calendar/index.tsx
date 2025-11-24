// app/(calendar)/calendar.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DailyPlanModal from '../../components/calendar/DailyPlanModal';
import { meMobile, type UserDto } from '../../components/Me';

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

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = ['7:00', '8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

export default function CalendarScreen() {
  const [user, setUser] = useState<UserDto | null>(null);
  const [dailyPlans, setDailyPlans] = useState<DailyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ day: number; hour: string }>({ day: 0, hour: '9:00' });
  const [editingPlan, setEditingPlan] = useState<DailyPlan | null>(null);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        // 1) Obtener usuario
        const u = await meMobile();
        if (!active) return;

        if (!u) {
          console.error('No se pudo obtener el usuario');
          setLoading(false);
          return;
        }

        setUser(u);

        // 2) Cargar daily plans del usuario
        if (!API_URL) {
          console.error('Falta EXPO_PUBLIC_API_URL');
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_URL}/daily-plans/user/${u._id}`, {
          credentials: 'include',
        });

        if (!active) return;

        if (!res.ok) {
          console.error('Error cargando daily plans');
          setDailyPlans([]);
        } else {
          const data = await res.json();
          setDailyPlans(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const getPlansForDayAndHour = (dayIndex: number, hour: string): DailyPlan[] => {
    return dailyPlans.filter(plan => {
      if (plan.day !== dayIndex) return false;

      const planStart = new Date(plan.startTime);
      const planHour = planStart.getHours();
      const cellHour = parseInt(hour.split(':')[0]);

      return planHour === cellHour;
    });
  };

  const handleCellPress = (dayIndex: number, hour: string) => {
    setSelectedCell({ day: dayIndex, hour });
    setEditingPlan(null);
    setIsModalOpen(true);
  };

  const handleEditPlan = (plan: DailyPlan) => {
    setEditingPlan(plan);
    setIsModalOpen(true);
  };

  const handleDeletePlan = async (planId: string) => {
    Alert.alert(
      'Eliminar Plan',
      '¿Estás seguro de eliminar este plan?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!API_URL || !user?._id) return;

              await fetch(`${API_URL}/daily-plans/${planId}`, {
                method: 'DELETE',
                credentials: 'include',
              });

              const refreshed = await fetch(`${API_URL}/daily-plans/user/${user._id}`, {
                credentials: 'include',
              }).then(res => res.json());

              setDailyPlans(refreshed);
            } catch (err) {
              Alert.alert('Error', 'No se pudo eliminar el plan');
            }
          },
        },
      ]
    );
  };

  const formatTime = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#F5F5F5] items-center justify-center">
        <ActivityIndicator size="large" color="#CFD7AF" />
        <Text className="mt-4 text-gray-600 font-madimi">Cargando calendario...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F5F5F5]">
      {/* Header */}
      <View className="bg-white px-4 py-3 flex-row items-center justify-between shadow-sm">
        <View className="bg-[#D4DBB2] rounded-xl px-3 py-2 flex-row items-center">
          <Text className="text-lg font-bold mr-1">🍅</Text>
          <Text className="text-base font-semibold">{user?.coins || '0'}</Text>
        </View>

        <Text className="text-2xl font-madimi text-gray-800">Calendar</Text>

        <View className="w-12" />
      </View>

      {/* Calendar Grid */}
      <ScrollView
        className="flex-1 px-2"
        showsVerticalScrollIndicator={false}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-3"
        >
          <View className="min-w-full">
            {/* Header Row */}
            <View className="flex-row mb-1">
              <View className="w-12" />
              {DAYS.map((day) => (
                <View
                  key={day}
                  className="flex-1 min-w-[80px] bg-[#CFD7AF] py-2 mx-0.5 rounded-t-lg items-center"
                >
                  <Text className="text-xs font-bold text-gray-800">{day}</Text>
                </View>
              ))}
            </View>

            {/* Time Rows */}
            {HOURS.map((hour) => (
              <View key={hour} className="flex-row mb-1">
                {/* Hour Cell */}
                <View className="w-12 bg-[#CFD7AF] justify-center items-center rounded-l-lg mr-0.5">
                  <Text className="text-xs font-semibold text-gray-700">{hour}</Text>
                </View>

                {/* Day Cells */}
                {DAYS.map((_, dayIndex) => {
                  const plans = getPlansForDayAndHour(dayIndex, hour);

                  return (
                    <TouchableOpacity
                      key={`${dayIndex}-${hour}`}
                      className="flex-1 min-w-[80px] min-h-[60px] bg-white border border-gray-200 mx-0.5 p-1 rounded-lg active:bg-gray-50"
                      onPress={() => handleCellPress(dayIndex, hour)}
                    >
                      {plans.map((plan) => {
                        const planId = (plan as any)._id || plan._id || plan.id;
                        return (
                          <TouchableOpacity
                            key={planId}
                            className="bg-[#CFD7AF] rounded-md p-2 mb-1 border border-[#b8c499]"
                            onPress={() => handleEditPlan(plan)}
                            onLongPress={() => handleDeletePlan(planId)}
                          >
                            <Text className="text-[10px] font-bold text-gray-800">
                              {formatTime(plan.startTime)} - {formatTime(plan.endTime)}
                            </Text>
                            {plan.note && (
                              <Text
                                className="text-[9px] text-gray-700 mt-0.5"
                                numberOfLines={1}
                              >
                                {plan.note}
                              </Text>
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 w-14 h-14 bg-[#CFD7AF] rounded-full items-center justify-center shadow-lg active:scale-95"
        onPress={() => {
          setEditingPlan(null);
          setIsModalOpen(true);
        }}
      >
        <Ionicons name="add" size={32} color="#41513f" />
      </TouchableOpacity>

      {/* Modal */}
      <DailyPlanModal
        userId={user?._id!}
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={async () => {
          try {
            if (!API_URL || !user?._id) return;
            const data = await fetch(`${API_URL}/daily-plans/user/${user._id}`, {
              credentials: 'include',
            }).then(res => res.json());
            setDailyPlans(data);
          } catch (e) {
            console.error(e);
          }
        }}
        selectedDay={selectedCell.day}
        selectedHour={selectedCell.hour}
        editingPlan={editingPlan}
      />
    </SafeAreaView>
  );
}
