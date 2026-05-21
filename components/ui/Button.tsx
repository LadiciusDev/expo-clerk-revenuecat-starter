import { Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';

type ButtonProps = TouchableOpacityProps & {
  title: string;
  variant?: 'primary' | 'secondary' | 'destructive';
  loading?: boolean;
  loadingText?: string;
};

const variantClasses = {
  primary: 'bg-black',
  secondary: 'border border-black bg-white',
  destructive: 'bg-red-500',
} as const;

const textClasses = {
  primary: 'text-white',
  secondary: 'text-black',
  destructive: 'text-white',
} as const;

export function Button({
  title,
  variant = 'primary',
  loading = false,
  loadingText,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      {...props}
      disabled={isDisabled}
      className={`items-center rounded-lg px-4 py-4 ${
        isDisabled ? 'bg-gray-300' : variantClasses[variant]
      } ${className || ''}`}
    >
      <Text className={`font-semibold ${isDisabled ? 'text-gray-500' : textClasses[variant]}`}>
        {loading && loadingText ? loadingText : title}
      </Text>
    </TouchableOpacity>
  );
}
