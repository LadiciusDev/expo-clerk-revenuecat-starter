import React, { useState } from 'react'
import { Modal, Text, TouchableOpacity, View } from 'react-native'

import { useUser } from '@clerk/clerk-expo'
import { FontAwesome } from '@expo/vector-icons'

import { APP_CONFIG } from '@/config/app'
import UserProfileSettings from '@/features/auth/UserProfileSettings'

export default function HomeScreen() {
  const { user } = useUser()
  const [showProfileSettings, setShowProfileSettings] = useState(false)

  return (
    <View className="flex-1 justify-center items-center bg-gray-50 px-6">
      <View className="bg-white rounded-lg shadow-md p-6 w-full max-w-sm">
        <Text className="text-2xl font-bold text-center mb-4 text-gray-800">
          Welcome to {APP_CONFIG.name}
        </Text>

        {user && (
          <View className="mb-6">
            <Text className="text-gray-600 text-center mb-2">
              Hello, {user.emailAddresses[0]?.emailAddress}!
            </Text>
            <Text className="text-gray-500 text-center text-sm">
              You&apos;re successfully signed in
            </Text>
          </View>
        )}

        <View className="items-center space-y-3">
          <TouchableOpacity
            onPress={() => setShowProfileSettings(true)}
            className="bg-black rounded-lg py-3 px-6 flex-row items-center"
          >
            <FontAwesome name="user" size={16} color="white" />
            <Text className="text-white font-semibold ml-2">Profile Settings</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={showProfileSettings}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowProfileSettings(false)}
      >
        <View className="flex-1 bg-gray-100">
          <View className="flex-row items-center justify-between border-b border-gray-200 bg-white p-4">
            <TouchableOpacity
              onPress={() => setShowProfileSettings(false)}
              className="h-9 w-9 items-center justify-center rounded-full bg-gray-100"
            >
              <FontAwesome name="times" size={18} color="#374151" />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-gray-950">Profile Settings</Text>
            <View className="h-9 w-9" />
          </View>
          <UserProfileSettings />
        </View>
      </Modal>
    </View>
  )
}
