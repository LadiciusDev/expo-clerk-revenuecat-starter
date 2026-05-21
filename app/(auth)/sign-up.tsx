import React, { useState } from 'react'
import {
  Text,
  KeyboardAvoidingView,
  Platform,
  View,
  TouchableOpacity,
} from 'react-native'

import { useRouter } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { isClerkAPIResponseError, useSignUp } from '@clerk/clerk-expo'

import FormInput from '@/components/forms/FormInput'
import { Button } from '@/components/ui/Button'
import SignInWith from '@/features/auth/components/SignInWith'
import { APP_CONFIG } from '@/config/app'

// Sign-up validation schema
const signUpSchema = z.object({
  firstName: z.string({ message: 'First name is required' }).min(1, 'First name is required'),
  lastName: z.string({ message: 'Last name is required' }).min(1, 'Last name is required'),
  email: z.string({ message: 'Email is required' }).email('Invalid email'),
  password: z
    .string({ message: 'Password is required' })
    .min(8, 'Password should be at least 8 characters long'),
})

const verifySchema = z.object({
  code: z.string({ message: 'Verification code is required' }).min(6, 'Code must be 6 digits'),
})

type SignUpFields = z.infer<typeof signUpSchema>
type VerifyFields = z.infer<typeof verifySchema>

const mapClerkErrorToFormField = (error: any) => {
  switch (error.meta?.paramName) {
    case 'first_name':
      return 'firstName'
    case 'last_name':
      return 'lastName'
    case 'email_address':
      return 'email'
    case 'password':
      return 'password'
    default:
      return 'root'
  }
}

export default function SignUpScreen() {
  const router = useRouter()
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false)
  const [pendingEmail, setPendingEmail] = useState('')
  
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SignUpFields>({
    resolver: zodResolver(signUpSchema),
  })

  const {
    control: verifyControl,
    handleSubmit: handleVerifySubmit,
    setError: setVerifyError,
    formState: { errors: verifyErrors },
  } = useForm<VerifyFields>({
    resolver: zodResolver(verifySchema),
  })

  const { signUp, isLoaded, setActive } = useSignUp()

  const openLegalUrl = async (url: string) => {
    try {
      await WebBrowser.openBrowserAsync(url, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FORM_SHEET,
        controlsColor: '#3B82F6',
        readerMode: false,
        showTitle: true,
        enableBarCollapsing: false,
      })
    } catch (error) {
      console.error('Error opening legal URL:', error)
    }
  }

  const onSignUp = async (data: SignUpFields) => {
    if (!isLoaded || !signUp) return

    try {
      const signUpAttempt = await signUp.create({
        firstName: data.firstName,
        lastName: data.lastName,
        emailAddress: data.email,
        password: data.password,
      })

      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId })
        router.replace('/(tabs)/home')
        return
      }

      await signUpAttempt.prepareEmailAddressVerification({ strategy: 'email_code' })
      setPendingEmail(data.email)
      setIsVerifyingEmail(true)
    } catch (err) {
      if (isClerkAPIResponseError(err)) {
        err.errors.forEach((error) => {
          const fieldName = mapClerkErrorToFormField(error)
          setError(fieldName, {
            message: error.longMessage,
          })
        })
      } else {
        setError('root', { message: 'Unknown error' })
      }
    }
  }

  const onVerify = async (data: VerifyFields) => {
    if (!isLoaded || !signUp) return

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code: data.code,
      })

      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId })
        router.replace('/(tabs)/home')
      } else {
        setVerifyError('root', { message: 'Verification failed. Please try again.' })
      }
    } catch (err) {
      if (isClerkAPIResponseError(err)) {
        err.errors.forEach((error) => {
          setVerifyError('code', {
            message: error.longMessage || error.message,
          })
        })
      } else {
        setVerifyError('root', { message: 'Unknown error' })
      }
    }
  }

  if (isVerifyingEmail) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-gray-50"
      >
        <View className="flex-1 justify-center px-6">
          <View className="max-w-sm mx-auto w-full">
            <Text className="text-3xl font-bold text-center mb-2 text-gray-900">
              Verify Your Email
            </Text>
            <Text className="text-center mb-8 text-gray-600">
              We sent a verification code to {pendingEmail}
            </Text>

            <View className="mb-4">
              <FormInput
                control={verifyControl}
                name="code"
                placeholder="Enter verification code"
                autoFocus
                keyboardType="number-pad"
                maxLength={6}
                autoComplete="one-time-code"
              />
            </View>

            {verifyErrors.root && (
              <Text className="text-red-500 text-sm text-center mb-4">
                {verifyErrors.root.message}
              </Text>
            )}

            <Button
              title="Verify Email"
              onPress={handleVerifySubmit(onVerify)}
              className="mb-6"
            />

            <View className="flex-row justify-center">
              <TouchableOpacity onPress={() => setIsVerifyingEmail(false)}>
                <Text className="text-sm font-semibold">Edit account details</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    )
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gray-50"
    >
      <View className="flex-1 justify-center px-6">
        <View className="max-w-sm mx-auto w-full">
          <Text className="text-3xl font-bold text-center mb-2 text-gray-900">
            Create Account
          </Text>
          <Text className="text-center mb-8 text-gray-600">
            Join our community today
          </Text>

          <View className="flex-row gap-3 mb-6">
            <View className="flex-1">
              <SignInWith strategy="oauth_google" variant="button" />
            </View>
            <View className="flex-1">
              <SignInWith strategy="oauth_apple" variant="button" />
            </View>
          </View>

          <View className="flex-row items-center mb-6">
            <View className="flex-1 h-px bg-gray-300" />
            <Text className="mx-4 text-gray-600 text-sm">or</Text>
            <View className="flex-1 h-px bg-gray-300" />
          </View>

          <View className="flex-row gap-3 mb-4">
            <View className="flex-1">
              <FormInput
                control={control}
                name="firstName"
                placeholder="First name"
                autoFocus
                autoCapitalize="words"
                autoComplete="given-name"
              />
            </View>
            <View className="flex-1">
              <FormInput
                control={control}
                name="lastName"
                placeholder="Last name"
                autoCapitalize="words"
                autoComplete="family-name"
              />
            </View>
          </View>

          <View className="mb-4">
            <FormInput
              control={control}
              name="email"
              placeholder="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
          </View>

          <View className="mb-4">
            <FormInput
              control={control}
              name="password"
              placeholder="Password"
              secureTextEntry
              autoComplete="new-password"
            />
          </View>

          {errors.root && (
            <Text className="text-red-500 text-sm text-center mb-4">
              Failed to create account
            </Text>
          )}

          <View className="mb-4">
            <Text className="text-xs text-gray-600 text-center leading-relaxed">
              By continuing, you agree to our{' '}
              <Text 
                className="underline" 
                onPress={() => void openLegalUrl(APP_CONFIG.termsUrl)}
              >
                Terms of Service
              </Text>
              {' '}and{' '}
              <Text 
                className="underline" 
                onPress={() => void openLegalUrl(APP_CONFIG.privacyUrl)}
              >
                Privacy Policy
              </Text>
            </Text>
          </View>

          <Button
            title="Create Account"
            onPress={handleSubmit(onSignUp)}
            className="mb-6"
          />

          <View className="flex-row justify-center">
            <Text className="text-gray-600 text-sm">Already have an account? </Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/sign-in')}>
              <Text className="text-sm font-semibold">Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}
