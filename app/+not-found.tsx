import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className="flex-1 items-center justify-center bg-gray-50 px-6">
        <Text className="mb-4 text-center text-2xl font-bold text-gray-900">
          This screen does not exist.
        </Text>
        <Link href="/">
          <Text className="font-semibold text-black">Go to home screen</Text>
        </Link>
      </View>
    </>
  );
}
