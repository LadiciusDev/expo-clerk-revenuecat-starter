import React from 'react'
import { Text, View } from 'react-native'

import { SignedIn, SignedOut } from '@clerk/clerk-expo'
import { Redirect, useRouter } from 'expo-router'

import { APP_CONFIG } from '@/config/app'
import { Button } from '@/components/ui/Button'

export default function WelcomeScreen() {
  const router = useRouter()

  return (
    <>
      <SignedIn>
        <Redirect href="/(tabs)/home" />
      </SignedIn>

      <SignedOut>
        <View className="flex-1 justify-center bg-gray-50 px-6">
          <View className="max-w-sm mx-auto w-full">
            <Text className="text-3xl font-bold text-center mb-2 text-gray-900">
              Welcome to
            </Text>
            <Text className="text-4xl font-bold text-center mb-8 text-black">
              {APP_CONFIG.name}
            </Text>

            <Button
              title="Sign In"
              onPress={() => router.push('/(auth)/sign-in')}
              className="mb-4"
            />

            <Button
              title="Create Account"
              variant="secondary"
              onPress={() => router.push('/(auth)/sign-up')}
            />
          </View>
        </View>
      </SignedOut>
    </>
  )
}
