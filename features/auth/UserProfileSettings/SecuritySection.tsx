import React, { useState } from 'react'
import { Alert, Modal, Text, TouchableOpacity, View } from 'react-native'

import type { useUser } from '@clerk/clerk-expo'
import { FontAwesome } from '@expo/vector-icons'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import FormInput from '@/components/forms/FormInput'

interface SecuritySectionProps {
  user: NonNullable<ReturnType<typeof useUser>['user']>
}

// Password update validation schema
const passwordUpdateSchema = z.object({
  currentPassword: z.string({ message: 'Current password is required' }).min(1, 'Current password is required'),
  newPassword: z.string({ message: 'New password is required' }).min(8, 'Password must be at least 8 characters long'),
  confirmPassword: z.string({ message: 'Confirm password is required' }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "New passwords don't match",
  path: ["confirmPassword"],
})

type PasswordUpdateFields = z.infer<typeof passwordUpdateSchema>

function SecurityCard({
  title,
  description,
  icon,
  children,
}: {
  title: string
  description: string
  icon: React.ComponentProps<typeof FontAwesome>['name']
  children: React.ReactNode
}) {
  return (
    <View className="mx-5 mt-5 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
      <View className="mb-5 flex-row items-center">
        <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-gray-50 border border-gray-100">
          <FontAwesome name={icon} size={15} color="#111827" />
        </View>
        <View className="flex-1">
          <Text className="text-base font-bold text-gray-900">{title}</Text>
          <Text className="mt-0.5 text-xs font-semibold text-gray-400">{description}</Text>
        </View>
      </View>
      {children}
    </View>
  )
}

export default function SecuritySection({ user }: SecuritySectionProps) {
  const clerkUser = user
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const {
    control,
    handleSubmit,
    reset,
  } = useForm<PasswordUpdateFields>({
    resolver: zodResolver(passwordUpdateSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const handleUpdatePassword = () => {
    reset()
    setShowPasswordModal(true)
  }

  const handlePasswordSubmit = async (data: PasswordUpdateFields) => {
    if (!clerkUser) return

    setIsUpdating(true)
    try {
      await clerkUser.updatePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })

      Alert.alert(
        'Success',
        'Your password has been updated successfully',
        [
          {
            text: 'OK',
            onPress: () => {
              setShowPasswordModal(false)
              reset()
            }
          }
        ]
      )
    } catch (error: any) {
      console.error('Password update error:', error)
      Alert.alert(
        'Error',
        error.errors?.[0]?.longMessage || 'Failed to update password. Please try again.'
      )
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and you will lose all your data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: confirmDeleteAccount
        },
      ]
    )
  }

  const confirmDeleteAccount = async () => {
    if (!clerkUser) return

    setIsDeleting(true)
    try {
      await clerkUser.delete()
      Alert.alert(
        'Account Deleted',
        'Your account has been successfully deleted.',
        [{ text: 'OK' }]
      )
    } catch (error: any) {
      console.error('Account deletion error:', error)
      Alert.alert(
        'Error',
        error.errors?.[0]?.longMessage || 'Failed to delete account. Please try again.'
      )
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <View className="flex-1 pb-6">
      <SecurityCard
        title="Password"
        description="Use a strong password and update it regularly."
        icon="lock"
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-950">Password set</Text>
            <Text className="mt-1 text-sm text-gray-500">Last updated information is managed by Clerk.</Text>
          </View>

          <TouchableOpacity
            onPress={handleUpdatePassword}
            className="ml-4 rounded-lg bg-gray-900 px-4 py-2.5 active:bg-gray-800"
          >
            <Text className="text-sm font-semibold text-white">Update</Text>
          </TouchableOpacity>
        </View>
      </SecurityCard>

      <View className="mx-5 mt-5 rounded-3xl border border-red-100 bg-red-50/50 p-5">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-base font-bold text-red-900">Delete account</Text>
            <Text className="mt-0.5 text-xs font-semibold text-red-600/70">Permanently delete your account and profile data.</Text>
          </View>

          <TouchableOpacity
            onPress={handleDeleteAccount}
            disabled={isDeleting}
            className="ml-4 rounded-xl border border-red-200 bg-white px-4 py-2 active:bg-red-50"
            activeOpacity={0.7}
          >
            <Text className="text-xs font-bold text-red-600">
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Password Update Modal */}
      {showPasswordModal && (
      <Modal
        visible
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View className="flex-1 bg-gray-50">
          <View className="flex-row justify-between items-center p-4 border-b border-gray-200 bg-white">
            <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
              <Text className="text-gray-700 font-semibold">Cancel</Text>
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-gray-950">Update Password</Text>
            <TouchableOpacity
              onPress={handleSubmit(handlePasswordSubmit)}
              disabled={isUpdating}
            >
              <Text className={`font-semibold ${isUpdating ? 'text-gray-400' : 'text-gray-900'
                }`}>
                {isUpdating ? 'Updating...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>

          <View className="p-6">
            <View className="mb-4">
              <FormInput
                control={control}
                name="currentPassword"
                label="Current Password"
                placeholder="Enter current password"
                secureTextEntry
                autoComplete="current-password"
              />
            </View>

            <View className="mb-4">
              <FormInput
                control={control}
                name="newPassword"
                label="New Password"
                placeholder="Enter new password"
                secureTextEntry
                autoComplete="new-password"
              />
            </View>

            <View className="mb-4">
              <FormInput
                control={control}
                name="confirmPassword"
                label="Confirm New Password"
                placeholder="Confirm new password"
                secureTextEntry
                autoComplete="new-password"
              />
            </View>

            <Text className="text-gray-500 text-sm">
              Password must be at least 8 characters long
            </Text>
          </View>
        </View>
      </Modal>
      )}
    </View>
  )
} 
