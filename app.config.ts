import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Expo Clerk Template',
  slug: 'expo-clerk-template',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'expo-clerk-template',
  userInterfaceStyle: 'automatic',
  platforms: ['ios', 'android'],
  ios: {
    supportsTablet: true,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
      },
    ],
    'expo-font',
    'expo-secure-store',
    'expo-web-browser',
  ],
  experiments: {
    typedRoutes: true,
  },
};

export default config;