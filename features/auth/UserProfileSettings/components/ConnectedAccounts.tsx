import React, { useState } from 'react'
import { Alert, Text, TouchableOpacity, View } from 'react-native'

import { isClerkAPIResponseError } from '@clerk/clerk-expo'
import type { useUser } from '@clerk/clerk-expo'
import { FontAwesome } from '@expo/vector-icons'

interface ConnectedAccountsProps {
  externalAccounts: NonNullable<ReturnType<typeof useUser>['user']>['externalAccounts']
  onAccountDisconnected: () => void
}

export default function ConnectedAccounts({ 
  externalAccounts, 
  onAccountDisconnected 
}: ConnectedAccountsProps) {
  if (!externalAccounts || externalAccounts.length === 0) {
    return (
      <View className="rounded-2xl border border-dashed border-gray-250 bg-gray-50/50 px-4 py-6 items-center">
        <FontAwesome name="link" size={20} color="#9CA3AF" />
        <Text className="text-center text-sm font-semibold text-gray-400 mt-2">No connected accounts yet</Text>
      </View>
    )
  }

  const handleDisconnect = async (account: any) => {
    try {
      const accountWithDestroy = account as typeof account & { destroy?: () => Promise<void> }
      if (accountWithDestroy.destroy) {
        await accountWithDestroy.destroy()
        Alert.alert('Success', 'Account disconnected successfully!')
        onAccountDisconnected()
      } else {
        Alert.alert('Error', 'Unable to disconnect account')
      }
    } catch (error: unknown) {
      if (isClerkAPIResponseError(error)) {
        const message = error.errors?.[0]?.longMessage || 'Failed to disconnect account'
        Alert.alert('Error', message)
      } else {
        Alert.alert('Error', 'Failed to disconnect account')
      }
    }
  }

  const showOptions = (account: any) => {
    Alert.alert(
      'Disconnect Account',
      `Are you sure you want to disconnect your ${getProviderName(account.provider)} account?`,
      [
        { text: 'Cancel', style: 'cancel' as const },
        {
          text: 'Disconnect',
          style: 'destructive' as const,
          onPress: () => handleDisconnect(account)
        }
      ],
      { cancelable: true }
    )
  }

  const getProviderIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'google':
        return 'google'
      case 'apple':
        return 'apple'
      case 'github':
        return 'github'
      case 'facebook':
        return 'facebook'
      case 'twitter':
        return 'twitter'
      default:
        return 'link'
    }
  }

  const getProviderName = (provider: string) => {
    return provider.charAt(0).toUpperCase() + provider.slice(1)
  }

  return (
    <View className="space-y-3">
      {externalAccounts.map((account: any) => {
        return (
          <View 
            key={account.id} 
            className="flex-row items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
          >
            <View className="flex-row items-center flex-1 pr-3">
              <View className="mr-3.5 h-10 w-10 items-center justify-center rounded-full bg-gray-50 border border-gray-100">
                <FontAwesome 
                  name={getProviderIcon(account.provider) as any} 
                  size={18} 
                  color="#111827" 
                />
              </View>
              
              <View className="flex-1">
                <Text className="font-semibold text-gray-900 text-base">
                  {getProviderName(account.provider)}
                </Text>
                {account.emailAddress && (
                  <Text className="text-sm text-gray-500 mt-0.5" numberOfLines={1}>
                    {account.emailAddress}
                  </Text>
                )}
                {account.username && !account.emailAddress && (
                  <Text className="text-sm text-gray-500 mt-0.5">
                    @{account.username}
                  </Text>
                )}
              </View>
            </View>
            
            <TouchableOpacity
              className="h-10 w-10 items-center justify-center rounded-full bg-gray-50 border border-gray-100 active:bg-gray-100"
              onPress={() => showOptions(account)}
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
