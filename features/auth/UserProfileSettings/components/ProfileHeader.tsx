import React, { useState } from 'react'
import { ActivityIndicator, Alert, Modal, Text, TouchableOpacity, View } from 'react-native'

import { isClerkAPIResponseError } from '@clerk/clerk-expo'
import type { useUser } from '@clerk/clerk-expo'
import { FontAwesome } from '@expo/vector-icons'
import { zodResolver } from '@hookform/resolvers/zod'
import { Image } from 'expo-image'
import * as ImagePicker from 'expo-image-picker'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import FormInput from '@/components/forms/FormInput'

// Profile update validation schema
const profileUpdateSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')
    .optional()
    .or(z.literal('')),
})

type ProfileUpdateFields = z.infer<typeof profileUpdateSchema>

interface ProfileHeaderProps {
  user: NonNullable<ReturnType<typeof useUser>['user']>
  onProfileUpdated?: () => void
}

export default function ProfileHeader({ user, onProfileUpdated }: ProfileHeaderProps) {
  const clerkUser = user
  const [isUpdating, setIsUpdating] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  const {
    control,
    handleSubmit,
    reset,
  } = useForm<ProfileUpdateFields>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      username: user.username || '',
    },
  })

  const handleUpdateProfile = () => {
    // Reset form with current user data
    reset({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      username: user.username || '',
    })
    setShowEditModal(true)
  }

  const handleProfileSubmit = async (data: ProfileUpdateFields) => {
    if (!clerkUser) return

    setIsUpdating(true)
    try {
      // Prepare update data
      const updateData: any = {
        firstName: data.firstName,
        lastName: data.lastName,
      }

      // Only include username if it's provided and not empty
      if (data.username && data.username.trim() !== '') {
        updateData.username = data.username.trim()
      }

      await clerkUser.update(updateData)

      Alert.alert(
        'Success',
        'Your profile has been updated successfully',
        [
          {
            text: 'OK',
            onPress: () => {
              setShowEditModal(false)
            }
          }
        ]
      )
    } catch (error: any) {
      console.error('Profile update error:', error)

      // Handle specific username errors
      if (error.errors && error.errors.length > 0) {
        const usernameError = error.errors.find((err: any) =>
          err.code === 'form_username_invalid' ||
          err.code === 'form_username_taken' ||
          err.meta?.paramName === 'username'
        )

        if (usernameError) {
          Alert.alert(
            'Username Error',
            usernameError.longMessage || usernameError.message || 'This username is already taken or invalid. Please try a different one.'
          )
        } else {
          Alert.alert(
            'Error',
            error.errors[0].longMessage || 'Failed to update profile. Please try again.'
          )
        }
      } else {
        Alert.alert(
          'Error',
          'Failed to update profile. Please try again.'
        )
      }
    } finally {
      setIsUpdating(false)
    }
  }

  const handleAvatarPress = () => {
    Alert.alert(
      'Change Avatar',
      'Choose an option',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: () => openImagePicker('camera') },
        { text: 'Choose from Library', onPress: () => openImagePicker('library') },
      ]
    )
  }

  const openImagePicker = async (source: 'camera' | 'library') => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant permission to access your photos.')
        return
      }

      if (source === 'camera') {
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync()
        if (cameraStatus !== 'granted') {
          Alert.alert('Permission Required', 'Please grant permission to access your camera.')
          return
        }
      }

      const result = source === 'camera'
        ? await ImagePicker.launchCameraAsync({
          mediaTypes: "images",
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        })
        : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: "images",
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        })

      if (!result.canceled && result.assets[0]) {
        await handleUploadImage(result.assets[0].uri)
      }
    } catch (error) {
      console.error('Image picker error:', error)
      Alert.alert('Error', 'Failed to select image. Please try again.')
    }
  }

  const handleUploadImage = async (imageUri: string) => {
    if (!clerkUser) return

    setIsUploadingAvatar(true)
    try {
      // Dynamically determine MIME type and file extension based on URI
      const getImageTypeFromUri = (uri: string) => {
        const extension = uri.split('.').pop()?.toLowerCase()
        switch (extension) {
          case 'png':
            return { type: 'image/png', extension: '.png' }
          case 'gif':
            return { type: 'image/gif', extension: '.gif' }
          case 'webp':
            return { type: 'image/webp', extension: '.webp' }
          case 'jpg':
          case 'jpeg':
          default:
            return { type: 'image/jpeg', extension: '.jpg' }
        }
      }

      const imageInfo = getImageTypeFromUri(imageUri)
      const timestamp = Date.now()

      const fileInfo = {
        uri: imageUri,
        type: imageInfo.type,
        name: `avatar_${timestamp}${imageInfo.extension}`,
      }

      // React Native file objects differ from Web File API - use type assertion for Clerk compatibility
      await clerkUser.setProfileImage({ file: fileInfo as unknown as File })

      Alert.alert('Success', 'Avatar updated successfully!')
      onProfileUpdated?.()
    } catch (error: unknown) {
      if (isClerkAPIResponseError(error)) {
        const message = error.errors?.[0]?.longMessage || 'Failed to update avatar'
        Alert.alert('Error', message)
      } else {
        Alert.alert('Error', 'Failed to update avatar. Please try again.')
      }
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const getDisplayName = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`
    }
    if (user.firstName) {
      return user.firstName
    }
    if (user.fullName) {
      return user.fullName
    }
    return user.emailAddresses[0]?.emailAddress || 'User'
  }

  const getDisplayUsername = () => {
    if (user.username) {
      return `@${user.username}`
    }
    return null
  }

  return (
    <>
      <View>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1 pr-4">
            <TouchableOpacity
              onPress={handleAvatarPress}
              disabled={isUploadingAvatar}
              className="relative"
              activeOpacity={0.8}
            >
              <View className="bg-gray-950 mr-3 h-10 w-10 items-center justify-center rounded-xl bg-gray-50 border border-gray-100">
                <Image
                  source={{ uri: user.imageUrl }}
                  className="h-16 w-16 rounded-2xl bg-gray-100 border border-gray-150"
                  transition={200}
                />

                <FontAwesome name="camera" size={15} color="#ffffff" />
                {/* <View className={`absolute h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gray-950 shadow-sm ${isUploadingAvatar ? 'opacity-50' : ''
                  }`}>
                  {isUploadingAvatar ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <FontAwesome name="camera" size={10} color="#ffffff" />
                  )}
                </View> */}

                {isUploadingAvatar && (
                  <View className="absolute inset-0 items-center justify-center rounded-2xl bg-black/30">
                    <ActivityIndicator size="small" color="white" />
                  </View>
                )}
              </View>
            </TouchableOpacity>

            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-900 leading-tight">
                {getDisplayName()}
              </Text>
              {getDisplayUsername() && (
                <Text className="text-xs font-semibold text-gray-400 mt-0.5">
                  {getDisplayUsername()}
                </Text>
              )}
              <Text className="text-sm text-gray-500 mt-1" numberOfLines={1}>
                {user.emailAddresses[0]?.emailAddress}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleUpdateProfile}
            disabled={isUpdating || isUploadingAvatar}
            className={`rounded-xl px-4 py-2 border ${isUpdating || isUploadingAvatar
              ? 'bg-gray-100 border-gray-200'
              : 'bg-white border-gray-300 active:bg-gray-50'
              }`}
            activeOpacity={0.7}
          >
            <Text className={`text-xs font-semibold ${isUpdating || isUploadingAvatar ? 'text-gray-400' : 'text-gray-700'
              }`}>
              {isUpdating ? 'Saving...' : 'Edit'}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="mt-5 flex-row rounded-2xl border border-gray-100 bg-gray-50/50 p-4">
          <View className="flex-1 items-center">
            <View className="flex-row items-center space-x-1.5">
              <FontAwesome name="envelope-o" size={11} color="#6B7280" />
              <Text className="text-[10px] font-bold uppercase tracking-wider text-gray-400 ml-1">Emails</Text>
            </View>
            <Text className="mt-1 text-base font-bold text-gray-900">{user.emailAddresses.length}</Text>
          </View>
          <View className="w-px bg-gray-200/60" />
          <View className="flex-1 items-center">
            <View className="flex-row items-center space-x-1.5">
              <FontAwesome name="phone" size={11} color="#6B7280" />
              <Text className="text-[10px] font-bold uppercase tracking-wider text-gray-400 ml-1">Phones</Text>
            </View>
            <Text className="mt-1 text-base font-bold text-gray-900">{user.phoneNumbers?.length || 0}</Text>
          </View>
          <View className="w-px bg-gray-200/60" />
          <View className="flex-1 items-center">
            <View className="flex-row items-center space-x-1.5">
              <FontAwesome name="link" size={11} color="#6B7280" />
              <Text className="text-[10px] font-bold uppercase tracking-wider text-gray-400 ml-1">OAuth</Text>
            </View>
            <Text className="mt-1 text-base font-bold text-gray-900">{user.externalAccounts?.length || 0}</Text>
          </View>
        </View>
      </View>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <Modal
          visible
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View className="flex-1 bg-gray-50">
            <View className="flex-row justify-between items-center p-4 border-b border-gray-200 bg-white">
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Text className="text-gray-700 font-semibold">Cancel</Text>
              </TouchableOpacity>
              <Text className="text-lg font-semibold text-gray-950">Edit Profile</Text>
              <TouchableOpacity
                onPress={handleSubmit(handleProfileSubmit)}
                disabled={isUpdating}
              >
                <Text className={`font-semibold ${isUpdating ? 'text-gray-400' : 'text-gray-900'
                  }`}>
                  {isUpdating ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>

            <View className="p-6">
              <View className="mb-4">
                <FormInput
                  control={control}
                  name="firstName"
                  label="First Name"
                  placeholder="Enter your first name"
                  autoCapitalize="words"
                  autoComplete="given-name"
                />
              </View>

              <View className="mb-4">
                <FormInput
                  control={control}
                  name="lastName"
                  label="Last Name"
                  placeholder="Enter your last name"
                  autoCapitalize="words"
                  autoComplete="family-name"
                />
              </View>

              <View className="mb-4">
                <FormInput
                  control={control}
                  name="username"
                  label="Username"
                  placeholder="Enter your username (optional)"
                  autoCapitalize="none"
                  autoComplete="username"
                  autoCorrect={false}
                />
                <Text className="text-gray-500 text-xs mt-1">
                  Username can only contain letters, numbers, underscores, and hyphens. Leave empty to remove username.
                </Text>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </>
  )
} 
