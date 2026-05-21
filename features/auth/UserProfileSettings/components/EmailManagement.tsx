import React from 'react'
import { Alert, AlertButton, Text, TouchableOpacity, View } from 'react-native'

import { isClerkAPIResponseError } from '@clerk/clerk-expo'
import type { useUser } from '@clerk/clerk-expo'
import { FontAwesome } from '@expo/vector-icons'

interface EmailManagementProps {
  emailAddresses: NonNullable<ReturnType<typeof useUser>['user']>['emailAddresses']
  phoneNumbers: NonNullable<ReturnType<typeof useUser>['user']>['phoneNumbers']
  primaryEmailAddressId?: string | null
  onEmailDeleted: () => void
}

export default function EmailManagement({
  emailAddresses,
  phoneNumbers,
  primaryEmailAddressId,
  onEmailDeleted,
}: EmailManagementProps) {
  if (!emailAddresses || emailAddresses.length === 0) {
    return (
      <View className="rounded-2xl border border-dashed border-gray-250 bg-gray-50/50 px-4 py-6 items-center">
        <FontAwesome name="envelope-o" size={20} color="#9CA3AF" />
        <Text className="text-center text-sm font-semibold text-gray-400 mt-2">No email addresses yet</Text>
      </View>
    )
  }

  const handleMakePrimary = async (emailAddress: any) => {
    try {
      // Note: Clerk's API for making email primary
      await emailAddress.makePrimary()
      onEmailDeleted() // refresh parent/reload user
      Alert.alert('Success', 'Email address has been set as primary.')
    } catch (error: unknown) {
      if (isClerkAPIResponseError(error)) {
        const message = error.errors?.[0]?.longMessage || 'Failed to make email primary'
        Alert.alert('Error', message)
      } else {
        Alert.alert('Error', 'Failed to make email primary')
      }
    }
  }

  const handleDelete = async (emailAddress: any) => {
    try {
      // Check if we have other verified methods before allowing deletion
      const hasOtherVerifiedEmails = emailAddresses.some(
        (email) => email.id !== emailAddress.id && email.verification?.status === 'verified'
      )
      const hasVerifiedPhone = phoneNumbers && phoneNumbers.some(
        (phone) => phone.verification?.status === 'verified'
      )

      if (!hasOtherVerifiedEmails && !hasVerifiedPhone) {
        Alert.alert(
          'Cannot Delete',
          'You must have at least one verified email or phone number to maintain account access.'
        )
        return
      }

      const emailWithDestroy = emailAddress as typeof emailAddress & { 
        destroy?: () => Promise<void> 
      }
      if (emailWithDestroy.destroy) {
        await emailWithDestroy.destroy()
        onEmailDeleted()
        Alert.alert('Success', 'Email address deleted successfully!')
      } else {
        Alert.alert('Error', 'Unable to delete email address')
      }
    } catch (error: unknown) {
      if (isClerkAPIResponseError(error)) {
        const message = error.errors?.[0]?.longMessage || 'Failed to delete email address'
        Alert.alert('Error', message)
      } else {
        Alert.alert('Error', 'Failed to delete email address')
      }
    }
  }

  const showOptions = (emailAddress: any) => {
    const isPrimary = emailAddress.id === primaryEmailAddressId
    const isVerified = emailAddress.verification?.status === 'verified'

    const buttons: AlertButton[] = [
      {
        text: 'Cancel',
        style: 'cancel',
      }
    ]

    if (!isPrimary && isVerified) {
      buttons.push({
        text: 'Make Primary',
        style: 'default',
        onPress: () => handleMakePrimary(emailAddress),
      })
    }

    if (emailAddresses.length > 1) {
      buttons.push({
        text: 'Delete Email',
        style: 'destructive',
        onPress: () => {
          Alert.alert(
            'Delete Email Address',
            `Are you sure you want to delete ${emailAddress.emailAddress}?`,
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: () => handleDelete(emailAddress),
              }
            ]
          )
        },
      })
    }

    if (buttons.length > 1) {
      Alert.alert(
        'Email Settings',
        emailAddress.emailAddress,
        buttons,
        { cancelable: true }
      )
    }
  }

  return (
    <View className="space-y-3">
      {emailAddresses.map((emailAddress) => {
        const isPrimary = emailAddress.id === primaryEmailAddressId
        const isVerified = emailAddress.verification?.status === 'verified'
        
        return (
          <View 
            key={emailAddress.id} 
            className="flex-row items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
          >
            <View className="flex-1 pr-3">
              <Text className="font-semibold text-gray-900 text-base" numberOfLines={1}>
                {emailAddress.emailAddress}
              </Text>
              
              <View className="flex-row items-center mt-2 flex-wrap gap-2">
                {isVerified ? (
                  <View className="flex-row items-center bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100/50">
                    <FontAwesome name="check-circle" size={11} color="#059669" />
                    <Text className="ml-1.5 text-xs font-semibold text-emerald-700">Verified</Text>
                  </View>
                ) : (
                  <View className="flex-row items-center bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100/50">
                    <FontAwesome name="exclamation-circle" size={11} color="#D97706" />
                    <Text className="ml-1.5 text-xs font-semibold text-amber-700">Unverified</Text>
                  </View>
                )}
                
                {isPrimary && (
                  <View className="bg-gray-900 px-2.5 py-1 rounded-full">
                    <Text className="text-[10px] font-bold text-white uppercase tracking-wider">Primary</Text>
                  </View>
                )}
              </View>
            </View>
            
            <TouchableOpacity
              className="h-10 w-10 items-center justify-center rounded-full bg-gray-50 border border-gray-100 active:bg-gray-100"
              onPress={() => showOptions(emailAddress)}
              activeOpacity={0.7}
            >
              <FontAwesome name="ellipsis-h" size={16} color="#4B5563" />
            </TouchableOpacity>
          </View>
        )
      })}
    </View>
  )
} 
