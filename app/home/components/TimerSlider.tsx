import React, { JSX } from 'react';
import { View, Text } from 'react-native';
import Slider from '@react-native-community/slider';

export interface TimerSliderProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function TimerSlider({ label, value, min = 1, max = 120, onChange, disabled = false }: TimerSliderProps): JSX.Element {
  return (
    <View className="w-75 mt-4">
      <View className="flex-row items-center justify-between mb-1">
        <Text>{label}</Text>
        <Text>{value} min</Text>
      </View>
      <Slider
        minimumValue={min}
        maximumValue={max}
        step={1}
        value={value}
        onValueChange={onChange}
        disabled={disabled} 
      />
    </View>
  );
}
