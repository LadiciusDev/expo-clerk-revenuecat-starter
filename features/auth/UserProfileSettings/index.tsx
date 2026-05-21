import React, { useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'

import { useUser } from '@clerk/clerk-expo'
import { FontAwesome } from '@expo/vector-icons'

import ProfileSection from './ProfileSection'
import SecuritySection from './SecuritySection'
import { cn } from '@/utils/style'

type TabType = 'profile' | 'security'

const tabs: { key: TabType; label: string }[] = [
  { key: 'profile', label: 'Profile' },
  { key: 'security', label: 'Security' },
]

export default function UserProfileSettings() {
  const [activeTab, setActiveTab] = useState<TabType>('profile')
  const { user, isLoaded } = useUser()

  if (!isLoaded) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-600">Loading...</Text>
      </View>
    )
  }

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-600">No user found</Text>
      </View>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSection user={user} />
      case 'security':
        return <SecuritySection user={user} />
      default:
        return <ProfileSection user={user} />
    }
  }

  return (
    <View className="flex-1 bg-gray-100">
      <View className="bg-white px-6 pt-12 pb-5 border-b border-gray-200">
        <View className="flex-row items-center">
          <View className="w-11 h-11 rounded-2xl bg-gray-900 items-center justify-center mr-3">
            <FontAwesome name="user" size={18} color="#ffffff" />
          </View>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-950">Account</Text>
            <Text className="text-gray-500 mt-1">Manage your profile and sign-in methods.</Text>
          </View>
        </View>
      </View>

      <View className="bg-white border-b border-gray-200 px-6 py-4">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          <View className="flex-row rounded-xl bg-gray-100 p-1">
            {tabs.map((tab) => (
              <Pressable
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                className={cn(
                  "min-w-[112px] rounded-lg px-4 py-2.5"
                )}
                style={{ backgroundColor: activeTab === tab.key ? '#ffffff' : '#f3f4f6' }}
              >
                <Text
                  className={cn(
                    "text-center font-semibold"
                  )}
                  style={{ color: activeTab === tab.key ? '#0f172a' : '#6b7280' }}
                >
                  {tab.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 24 }}>
        {renderContent()}
      </ScrollView>
    </View>
  )
} 
