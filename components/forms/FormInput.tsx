import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { Text, TextInput, TextInputProps, View } from 'react-native';

type FormInputProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label?: string;
} & TextInputProps;

export default function FormInput<T extends FieldValues>({
  control,
  name,
  label,
  className,
  ...props
}: FormInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
        <View>
          {label && <Text className="mb-2 text-sm font-medium text-gray-700">{label}</Text>}
          <TextInput
            {...props}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            className={`rounded-lg border bg-white px-4 py-3 ${
              error ? 'border-red-500' : 'border-gray-300'
            } ${className || ''}`}
            placeholderTextColor="#9CA3AF"
          />
          {error && <Text className="mt-1 text-xs text-red-500">{error.message}</Text>}
        </View>
      )}
    />
  );
}
