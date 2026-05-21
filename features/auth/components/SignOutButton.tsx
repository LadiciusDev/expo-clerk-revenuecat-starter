import React from 'react'
import { Alert } from 'react-native'

import { useRouter } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'
import { Button } from '@/components/ui/Button'

const SignOutButton = () => {
  const { signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      // Show confirmation dialog
      Alert.alert(
        'Sign Out',
        'Are you sure you want to sign out?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Sign Out',
            style: 'destructive',
            onPress: async () => {
              try {
                await signOut()
                router.replace('/')
              } catch (error) {
                console.error('Error during sign out:', error)
                Alert.alert(
                  'Sign Out Failed',
                  'There was an error signing you out. Please try again.'
                )
              }
            },
          },
        ],
        { cancelable: true }
      )
    } catch (error) {
      console.error('Error showing sign out dialog:', error)
    }
  }

  return (
    <Button
      title="Sign Out"
      variant="destructive"
      onPress={handleSignOut}
      className="mt-5 px-6 py-3"
    />
  )
}

export default SignOutButton
