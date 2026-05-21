# Expo Clerk Template

A reusable Expo starter for mobile apps with Expo Router, Clerk authentication, NativeWind, React Hook Form, and Zod.

## Stack

- Expo SDK 55
- Expo Router
- Clerk Expo
- NativeWind
- React Hook Form
- Zod
- pnpm

## Quick Start

```bash
pnpm install
cp .env.example .env
pnpm start
```

Set your Clerk publishable key in `.env`:

```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_replace_me
```

## Scripts

```bash
pnpm start        # Start Expo
pnpm start:clear  # Start Expo with cache reset
pnpm ios          # Start iOS
pnpm android      # Start Android
pnpm web          # Start Web
pnpm typecheck    # TypeScript check
pnpm lint         # Expo lint
pnpm check        # TypeScript + lint
```

## Project Structure

```txt
app/
  (auth)/          Auth screens
  (tabs)/          Protected app screens
  _layout.tsx      Clerk provider
features/
  auth/            Auth guard and auth-specific components
components/
  forms/           Shared form inputs
  ui/              Shared UI primitives
config/
  app.ts           Template app metadata
lib/
  env/             Client environment validation
```

## Auth Flow

- Public routes: `/`, `/(auth)/sign-in`, `/(auth)/sign-up`, `/(auth)/forgot-password`
- Protected routes: `/(tabs)/*`
- `features/auth/AuthGate.tsx` redirects signed-in users to `/(tabs)/home` and signed-out users away from protected screens.
- Sign in, sign up, OAuth, and sign out all use explicit `router.replace(...)` navigation after Clerk state changes.

## Customization

- Rename native app metadata in `app.config.ts`.
- Rename in-app display labels and legal URLs in `config/app.ts`.
- Replace placeholder Terms and Privacy URLs in `config/app.ts`.
- Replace icons and splash assets in `assets/images`.
- The profile settings screen under `features/auth/UserProfileSettings` is an optional Clerk account-management example. Remove it and the modal entry in `app/(tabs)/home.tsx` if your app does not need account management.
