# CLAUDE.md - MVPPIR Mobile App

This file provides guidance to Claude Code (claude.ai/code) when working with the mobile application of the mvppir project.

## How to Use This Document

This is a **living document** that defines conventions, patterns, and critical knowledge for working on the mobile app. Claude Code automatically loads this file into context at the start of every session.

**What's in here:**
- Development workflow and best practices
- Expo + React Native patterns and conventions
- NativeWind v4 configuration and usage
- State management with Zustand
- API integration with TanStack Query
- Authentication with Better Auth
- Code style conventions and TypeScript guidelines

**Quick Navigation:**
- New to mobile? Read: [Project Overview](#project-overview), [Development Workflow](#development-workflow), [Architecture](#architecture)
- Starting a task? Review: [Key Patterns](#key-patterns), [Important Rules (Do NOT)](#important-rules-do-not)
- Debugging? Check: [Common Gotchas](#common-gotchas)

**Updating this file:**
- Press `#` key in Claude Code to add instructions automatically
- Keep it concise - only include what Claude needs to know to do the work
- Commit changes to Git (this is the single source of truth for the team)

**What to include/exclude:**
- ✅ Include: Mobile-specific patterns, state management, navigation, gotchas
- ✅ Include: Expo-specific behaviors, NativeWind patterns, performance tips
- ❌ Exclude: Complete React Native API docs (link to official docs instead)
- ❌ Exclude: Exhaustive component props (refer to component code)
- ❌ Exclude: Implementation details already clear in code

**Rule of thumb:** If it's not essential for Claude to complete tasks correctly, it doesn't belong here. Brevity saves context space for actual code.

## Project Overview

This is the **mobile application** of mvppir, a React Native app built with Expo for managing cryptocurrency deposits, withdrawals, and MLM operations on iOS and Android.

**Tech Stack:**
- **Framework:** Expo SDK 54 + React Native 0.81.5
- **UI Framework:** React 19
- **Styling:** NativeWind v4 (Tailwind CSS for React Native)
- **State Management:** Zustand v5 with persist middleware
- **Server State:** TanStack Query (React Query) v5
- **Authentication:** Better Auth client
- **Storage:** AsyncStorage (for persistence)
- **Network:** NetInfo (for online detection)
- **TypeScript:** v5.9 (strict mode)

## Development Workflow

When working on this mobile app, follow this systematic approach:

1. **Analysis Phase**
   - First, think about the UI/UX requirements from PRD
   - Check API endpoints documentation (`docs/API-ENDPOINTS.md`)
   - Review existing screens and patterns
   - Consider mobile-specific constraints (network, storage, performance)
   - Review related documentation and design mockups

2. **Planning**
   - Create a mental plan with clear component breakdown
   - Track tasks using TodoWrite for complex multi-step work
   - Break down UI into screens and components
   - Plan navigation structure (if using React Navigation)
   - Define data fetching strategy (TanStack Query)
   - Consider mobile-first responsive design (phone vs tablet)
   - Identify potential performance challenges

3. **Validation**
   - Before starting significant changes, contact the user to validate approach
   - Discuss architecture decisions that impact multiple screens
   - Confirm breaking changes to existing patterns
   - Validate design decisions with user when unclear

4. **Implementation**
   - Work on components systematically, one at a time
   - Mark tasks as completed in TodoWrite as progress is made
   - Use NativeWind classes for styling
   - Implement TanStack Query for server state
   - Use Zustand for global client state
   - Follow existing code patterns and conventions

5. **Documentation**
   - At each step, provide detailed explanations of changes made
   - Document reasoning behind architecture decisions
   - Update relevant documentation (CLAUDE.md, component comments)
   - Add JSDoc comments for complex component props or logic

6. **Simplicity**
   - Make each component and code change as simple as possible
   - Avoid massive or complex components - break them down
   - Each change should impact the codebase minimally
   - Prefer incremental improvements over rewrites
   - Keep component hierarchy shallow
   - Avoid premature abstraction
   - **Everything comes down to simplicity**

7. **Review**
   - Provide comprehensive summary of changes made
   - Highlight any relevant mobile-specific considerations
   - Verify TypeScript types pass
   - Test on iOS and Android simulators
   - Check performance (avoid unnecessary re-renders)
   - Ensure components are well-documented

## Development Commands

```bash
# Development (starts Expo dev server)
pnpm dev

# Start specific platforms
pnpm start          # Interactive menu
pnpm ios            # iOS simulator
pnpm android        # Android emulator
pnpm web            # Web browser

# Type checking
pnpm type-check

# Clean and restart
pnpm dev --clear    # Clear Metro bundler cache
```

## Architecture

### Folder Structure

```
apps/mobile/
├── src/
│   ├── api/                    # Backend communication layer
│   │   ├── client/             # Service functions (pure async functions)
│   │   │   └── user.api.ts    # User API calls
│   │   ├── queries/            # TanStack Query hooks
│   │   │   └── use-user-balance-query.ts
│   │   └── schemas/            # Zod validation schemas
│   │       └── login.schema.ts
│   ├── components/             # Reusable UI components
│   │   ├── ui/                 # Base UI components
│   │   └── features/           # Feature-specific components
│   ├── screens/                # Screen components (pages)
│   │   ├── auth/              # Auth screens (Login, Register)
│   │   └── dashboard/         # Dashboard screens
│   ├── navigation/             # Navigation setup (if using React Navigation)
│   ├── stores/                 # Zustand stores
│   │   └── auth.store.ts     # Auth state management
│   ├── hooks/                  # Custom React hooks (not queries)
│   └── lib/                    # External libraries and utilities
│       ├── auth-client.ts    # Better Auth client
│       ├── react-query.ts    # React Query config
│       ├── react-query-config.tsx # Focus/Online manager setup
│       └── utils.ts          # Utility functions (cn, formatters)
├── App.tsx                     # Root app component with providers
├── app.config.ts              # Expo configuration
├── metro.config.js            # Metro bundler configuration
├── tailwind.config.js         # Tailwind/NativeWind configuration
├── global.css                 # Global styles + custom utilities
├── babel.config.js            # Babel configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies and scripts
```

**Important distinction:**
- `api/client/` = Service functions (pure async functions that call backend)
- `api/queries/` = TanStack Query hooks (useQuery, useMutation)
- `api/schemas/` = Zod validation schemas
- `lib/` = External libraries, utilities, general helpers
- `hooks/` = Custom React hooks (not queries/mutations)
- `stores/` = Zustand stores for global state

### Key Architectural Patterns

**1. State Management Strategy**

- **Server State** (TanStack Query) - Data from API (user balance, transactions)
- **Global Client State** (Zustand) - Auth tokens, user session, app settings
- **Local Component State** (useState) - Form inputs, UI toggles, ephemeral state

```tsx
// Server state - TanStack Query
const { data, isLoading } = useUserBalance();

// Global client state - Zustand
const { token, isAuthenticated } = useAuthStore();

// Local state - useState
const [isModalOpen, setIsModalOpen] = useState(false);
```

**2. Data Fetching with TanStack Query**

- Always use hooks in `api/queries/` for server state
- Configure `refetchOnWindowFocus`, `staleTime`, and `refetchInterval`
- Leverage `focusManager` and `onlineManager` for React Native

```tsx
import { useQuery } from "@tanstack/react-query";
import { getUserBalance } from "@/api/client/user.api";

export function useUserBalance() {
  return useQuery({
    queryKey: ["user", "balance"],
    queryFn: getUserBalance,
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Refetch every minute
  });
}
```

**3. Zustand with Persistence**

- Use `persist` middleware for data that needs to survive app restarts
- Store auth tokens, user preferences, and offline data

```tsx
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({ /* state and actions */ }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

**4. Styling with NativeWind v4**

- Use Tailwind utility classes directly on React Native components
- Leverage platform-specific variants (`ios:`, `android:`, `web:`)
- Use custom utilities defined in `global.css`

```tsx
import { View, Text } from "react-native";

export function Card() {
  return (
    <View className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 ios:shadow-lg android:elevation-md">
      <Text className="text-white text-lg font-bold">Card Title</Text>
      <Text className="text-zinc-400 text-sm mt-2">Card description</Text>
    </View>
  );
}
```

## Key Patterns

### 1. React Query Configuration for React Native

Configure `focusManager` and `onlineManager` to refetch data when:
- App returns to foreground (via AppState)
- Device reconnects to internet (via NetInfo)

See `src/lib/react-query-config.tsx` for implementation.

### 2. Environment Variables

Use `EXPO_PUBLIC_` prefix for environment variables accessible in the app:

```typescript
const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3333";
```

### 3. Platform-Specific Code

Use NativeWind variants or Platform API:

```tsx
// NativeWind variants
<View className="ios:bg-blue-500 android:bg-green-500" />

// Platform API
import { Platform } from "react-native";

if (Platform.OS === "ios") {
  // iOS-specific code
}
```

### 4. Safe Area Handling

Always use `SafeAreaView` for screens:

```tsx
import { SafeAreaView } from "react-native";

export function Screen() {
  return (
    <SafeAreaView className="flex-1 bg-zinc-950">
      {/* Content */}
    </SafeAreaView>
  );
}
```

## NativeWind v4 Configuration

NativeWind is configured in `metro.config.js`, `tailwind.config.js`, and `global.css`.

**Custom Utilities** (defined in `global.css`):
- `elevation-*` - Android/iOS elevation (shadow)
- `ripple-*` - Android ripple effect
- Platform variants: `ios:`, `android:`, `native:`, `web:`

**Color Palette** (same as web):
- Primary: `#3b82f6` (Blue)
- Accent: `#8b5cf6` (Purple)
- Success: `#10b981` (Green)
- Warning: `#f59e0b` (Orange)
- Danger: `#ef4444` (Red)
- Zinc: Tailwind zinc scale (50-950)

## Code Style Conventions

1. **Use functional components** with hooks
2. **Arrow functions** for components
3. **No semicolons** (consistent with web/server)
4. **Double quotes** for strings
5. **2 spaces** indentation
6. **Import type** for TypeScript types
7. **NativeWind classes** for styling (avoid StyleSheet)

```tsx
// ✅ Good
import type { User } from "./types"

export const UserCard = ({ user }: { user: User }) => {
  return (
    <View className="p-4 bg-zinc-900">
      <Text className="text-white">{user.name}</Text>
    </View>
  )
}

// ❌ Bad
import { User } from "./types"; // semicolon

export function UserCard(props: { user: User }) { // function declaration
  return (
    <View style={{padding: 16}}> {/* inline styles */}
      <Text>{props.user.name}</Text>
    </View>
  );
}
```

## Important Rules (Do NOT)

**NEVER do these things in this codebase:**

1. **DO NOT use `any` type** - Always use proper TypeScript types or `unknown`
2. **DO NOT fetch in components without TanStack Query** - Use `api/queries/` hooks
3. **DO NOT hardcode API URLs** - Use environment variables (`EXPO_PUBLIC_API_URL`)
4. **DO NOT use StyleSheet.create** - Use NativeWind classes exclusively
5. **DO NOT ignore platform differences** - Test on both iOS and Android
6. **DO NOT skip loading/error states** - Always handle loading, error, and empty states
7. **DO NOT store sensitive data in AsyncStorage** - Use secure storage for tokens
8. **DO NOT use absolute imports without @** - Always use `@/` path alias
9. **DO NOT mutate Zustand state directly** - Use actions to update state
10. **DO NOT forget to configure focusManager and onlineManager** - Already configured in `react-query-config.tsx`

**Additional Mobile-Specific Rules:**

- **DO NOT use web-only APIs** - Check React Native compatibility
- **DO NOT ignore accessibility** - Use `accessibilityLabel`, `accessibilityHint`
- **DO NOT use large images** - Optimize images for mobile (use expo-image)
- **DO NOT block the main thread** - Use InteractionManager for heavy operations
- **DO NOT use inline styles** - Use NativeWind classes
- **DO NOT skip keyboard handling** - Use KeyboardAvoidingView, ScrollView
- **DO NOT assume network availability** - Handle offline mode gracefully
- **DO NOT use deprecated Expo APIs** - Check Expo SDK 54 docs

## Performance Best Practices

1. **Use React.memo sparingly** - Prefer composition over optimization
2. **Avoid unnecessary re-renders** - Use `useCallback`, `useMemo` wisely
3. **Optimize images** - Use `expo-image` instead of `<Image>`
4. **Lazy load screens** - Use React Navigation lazy loading
5. **Cache API responses** - TanStack Query handles this automatically
6. **Use FlatList** - For long lists, use `FlatList` or `SectionList`
7. **Avoid heavy computations** - Move to background with `InteractionManager`

## Common Gotchas

1. **Metro bundler cache** - Clear with `pnpm dev --clear` if styles don't update
2. **AsyncStorage limits** - Don't store large data (max ~6MB on Android)
3. **Platform-specific bugs** - Always test on both iOS and Android
4. **NativeWind class order** - Last class wins (like Tailwind)
5. **TanStack Query persistence** - Data persists across app restarts with `PersistQueryClientProvider`
6. **Zustand persistence** - Data persists with `persist` middleware + AsyncStorage
7. **Environment variables** - Must use `EXPO_PUBLIC_` prefix for client-side access
8. **SafeAreaView behavior** - Different on iOS vs Android (use `react-native-safe-area-context` if needed)
9. **Keyboard overlapping inputs** - Use `KeyboardAvoidingView` with correct `behavior` prop
10. **Network detection** - NetInfo returns `null` initially, handle gracefully

## Roadmap Context

### MVP v1.0 (Mobile - In Progress)
- ✅ Project setup with Expo + TypeScript
- ✅ NativeWind v4 configuration
- ✅ TanStack Query integration
- ✅ Zustand state management
- ✅ Better Auth client
- ⏳ Login screen
- ⏳ Dashboard screen (balance, transactions)
- ⏳ Deposit screen (QR code, address)
- ⏳ Withdrawal screen

### MVP v2.0 (Future)
- React Navigation setup
- Deposit QR code scanner
- Push notifications (deposits, withdrawals)
- Biometric authentication (Face ID, Touch ID)
- Multi-language support (i18n)

### MVP v3.0+ (Future)
- MLM dashboard (commissions, referrals)
- Referral QR code sharing
- In-app messaging
- Charts and analytics

## Testing Strategy

The mobile app uses **manual testing** during development. Future automated testing will be added.

**Current Testing Approach:**

1. **Simulator Testing** (Primary)
   - Test on iOS Simulator (Xcode)
   - Test on Android Emulator (Android Studio)
   - Use Expo Go app for quick testing

2. **Device Testing**
   - Test on physical iOS device via Expo Go
   - Test on physical Android device via Expo Go
   - Test network conditions (slow 3G, offline)

3. **TypeScript Validation**
   - Run `pnpm type-check` before commits
   - Ensure no TypeScript errors

**Future Testing (v2.0+):**
- Jest for unit tests
- React Native Testing Library for component tests
- Detox for E2E testing

## Key Files Reference

**Core App:**
- `App.tsx` - Root component with providers
- `app.config.ts` - Expo configuration
- `global.css` - Global styles + NativeWind utilities
- `metro.config.js` - Metro bundler configuration
- `tailwind.config.js` - Tailwind/NativeWind configuration

**Configuration:**
- `tsconfig.json` - TypeScript configuration with path aliases
- `babel.config.js` - Babel preset for Expo
- `package.json` - Dependencies and scripts

**State Management:**
- `src/stores/auth.store.ts` - Auth state with Zustand
- `src/lib/react-query.ts` - TanStack Query client
- `src/lib/react-query-config.tsx` - Focus/Online manager setup

**API Layer:**
- `src/api/client/user.api.ts` - User API service functions
- `src/api/queries/use-user-balance-query.ts` - User balance query hook
- `src/lib/auth-client.ts` - Better Auth client

**Utilities:**
- `src/lib/utils.ts` - Utility functions (cn, formatters)

**Documentation:**
- `docs/API-ENDPOINTS.md` - Backend API reference (shared with web)
- `docs/PRD-ADMIN-v1.md` - Product requirements (shared with web)
- `CLAUDE.md` - This file (mobile-specific patterns)

## Related Backend

- **Backend URL:** http://localhost:3333
- **Backend CLAUDE.md:** `/Users/gregoryrag/mvppir/apps/server/CLAUDE.md`
- **Backend Routes:** See `apps/server/src/app.ts`
- **API Documentation:** `docs/API-ENDPOINTS.md`

## Related Web App

- **Web URL:** http://localhost:3000
- **Web CLAUDE.md:** `/Users/gregoryrag/mvppir/apps/web/CLAUDE.md`
- **Shared Design System:** Same color palette and component patterns

## Related Documentation

- **API Endpoints:** `docs/API-ENDPOINTS.md` - Complete backend API reference
- **Product Requirements:** `docs/PRD-ADMIN-v1.md` - Features and workflows
- **Backend Architecture:** `apps/server/CLAUDE.md` - Server-side patterns
- **Web Architecture:** `apps/web/CLAUDE.md` - Web app patterns
- **Monorepo Guide:** `/CLAUDE.md` - Workspace commands and deployment

---

**Last Updated:** 2025-10-26
**Stack Version:** Expo SDK 54, React Native 0.81, NativeWind v4, React 19
**Claude Code Version:** Optimized for claude-sonnet-4-5
