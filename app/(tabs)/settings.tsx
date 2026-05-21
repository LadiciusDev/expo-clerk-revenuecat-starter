import { Text, View } from 'react-native';

import SignOutButton from '@/features/auth/components/SignOutButton';

export default function SettingsScreen() {
  return (
    <View className="flex-1 bg-gray-50 px-6 py-16">
      <Text className="mb-2 text-3xl font-bold text-gray-900">Settings</Text>
      <Text className="mb-8 text-gray-600">
        Add app-specific preferences, billing links, and account shortcuts here.
      </Text>

      <View className="rounded-lg border border-gray-200 bg-white p-5">
        <Text className="mb-2 text-lg font-semibold text-gray-900">Account</Text>
        <Text className="mb-6 text-gray-600">
          This template includes Clerk authentication and a reusable sign out action.
        </Text>
        <SignOutButton />
      </View>
    </View>
  );
}
