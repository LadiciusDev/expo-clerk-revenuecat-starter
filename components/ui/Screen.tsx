import { ReactNode } from 'react';
import { View } from 'react-native';

type ScreenProps = {
  children: ReactNode;
  className?: string;
};

export function Screen({ children, className }: ScreenProps) {
  return <View className={`flex-1 bg-gray-50 px-6 ${className || ''}`}>{children}</View>;
}
