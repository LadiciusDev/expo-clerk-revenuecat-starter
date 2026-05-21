import { useAuth } from '@clerk/clerk-expo';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, usePathname, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { useColorScheme } from '@/hooks/useColorScheme';

const PUBLIC_ROUTE_GROUPS = new Set(['(auth)']);
const PRIVATE_ROUTES = new Set(['(tabs)']);

export function AuthGate() {
  const { isLoaded, isSignedIn } = useAuth();
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    const routeGroup = segments[0];
    const isPublicRoute = pathname === '/' || PUBLIC_ROUTE_GROUPS.has(routeGroup);
    const isPrivateRoute = PRIVATE_ROUTES.has(routeGroup);

    if (isSignedIn && !isPrivateRoute) {
      router.replace('/(tabs)/home');
      return;
    }

    if (!isSignedIn && !isPublicRoute) {
      router.replace('/');
    }
  }, [isLoaded, isSignedIn, pathname, router, segments]);

  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
