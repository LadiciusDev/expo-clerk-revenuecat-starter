import { ClerkProvider } from '@clerk/clerk-expo';
import { useFonts } from 'expo-font';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import 'react-native-reanimated';
import '../global.css';

import { AuthGate } from '@/features/auth/AuthGate';
import { clientEnv } from '@/lib/env/client';

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ClerkProvider publishableKey={clientEnv.clerkPublishableKey} tokenCache={tokenCache}>
      <AuthGate />
    </ClerkProvider>
  );
}
