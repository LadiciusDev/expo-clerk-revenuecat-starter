import React from 'react'
import { Alert, AlertButton, Text, TouchableOpacity, View } from 'react-native'

import { isClerkAPIResponseError } from '@clerk/clerk-expo'
import type { useUser } from '@clerk/clerk-expo'
import { FontAwesome } from '@expo/vector-icons'

interface PhoneManagementProps {
  phoneNumbers: NonNullable<ReturnType<typeof useUser>['user']>['phoneNumbers']
  emailAddresses: NonNullable<ReturnType<typeof useUser>['user']>['emailAddresses']
  primaryPhoneNumberId?: string | null
  onPhoneDeleted: () => void
}

export default function PhoneManagement({
  phoneNumbers,
  emailAddresses,
  primaryPhoneNumberId,
  onPhoneDeleted,
}: PhoneManagementProps) {
  if (!phoneNumbers || phoneNumbers.length === 0) {
    return (
      <View className="rounded-2xl border border-dashed border-gray-250 bg-gray-50/50 px-4 py-6 items-center">
        <FontAwesome name="phone" size={20} color="#9CA3AF" />
        <Text className="text-center text-sm font-semibold text-gray-400 mt-2">No phone numbers yet</Text>
      </View>
    )
  }

  const handleMakePrimary = async (phone: any) => {
    try {
      // Note: Clerk's API for making phone primary
      await phone.makePrimary()
      onPhoneDeleted() // reload user
      Alert.alert('Success', 'Phone number has been set as primary.')
    } catch (error: unknown) {
      if (isClerkAPIResponseError(error)) {
        const message = error.errors?.[0]?.longMessage || 'Failed to make phone primary'
        Alert.alert('Error', message)
      } else {
        Alert.alert('Error', 'Failed to make phone primary')
      }
    }
  }

  const handleDelete = async (phoneToDelete: any) => {
    try {
      // Check if user has at least one verified email or phone after deletion
      const otherVerifiedPhones = phoneNumbers?.filter(
        (phone) => phone.id !== phoneToDelete.id && phone.verification?.status === 'verified'
      ) || []
      const verifiedEmails = emailAddresses.filter(
        (email) => email.verification?.status === 'verified'
      )
      
      const hasOtherVerifiedContact = otherVerifiedPhones.length > 0 || verifiedEmails.length > 0

      if (!hasOtherVerifiedContact) {
        Alert.alert(
          'Cannot Delete Phone',
          'You must have at least one verified phone number or email address.',
          [{ text: 'OK' }]
        )
        return
      }

      const phoneWithDestroy = phoneToDelete as typeof phoneToDelete & { 
        destroy?: () => Promise<void> 
      }
      if (phoneWithDestroy.destroy) {
        await phoneWithDestroy.destroy()
        onPhoneDeleted()
        Alert.alert('Success', 'Phone number deleted successfully!')
      } else {
        Alert.alert('Error', 'Unable to delete phone number')
      }
    } catch (error: unknown) {
      if (isClerkAPIResponseError(error)) {
        const message = error.errors?.[0]?.longMessage || 'Failed to delete phone number'
        Alert.alert('Error', message)
      } else {
        Alert.alert('Error', 'Failed to delete phone number')
      }
    }
  }

  const showOptions = (phone: any) => {
    const isPrimary = phone.id === primaryPhoneNumberId
    const isVerified = phone.verification?.status === 'verified'

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
        onPress: () => handleMakePrimary(phone),
      })
    }

    buttons.push({
      text: 'Delete Phone Number',
      style: 'destructive',
      onPress: () => {
        Alert.alert(
          'Delete Phone Number',
          `Are you sure you want to delete ${phone.phoneNumber}?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: () => handleDelete(phone),
            }
          ]
        )
      },
    })

    Alert.alert(
      'Phone Settings',
      phone.phoneNumber,
      buttons,
      { cancelable: true }
    )
  }

  return (
    <View className="space-y-3">
      {phoneNumbers.map((phone: any) => {
        const isPrimary = phone.id === primaryPhoneNumberId
        const isVerified = phone.verification?.status === 'verified'
        
        return (
          <View 
            key={phone.id} 
            className="flex-row items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
          >
            <View className="flex-1 pr-3">
              <Text className="font-semibold text-gray-900 text-base">
                {phone.phoneNumber}
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
              onPress={() => showOptions(phone)}
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
