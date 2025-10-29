import "./global.css";
import "@/locales"; // Initialize i18n
import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { queryClient, asyncStoragePersister } from "@/lib/react-query";
import { useReactQueryConfig } from "@/lib/react-query-config";
import { useAuthStore } from "@/stores/auth.store";
import { useUserStatus } from "@/api/user/queries/use-user-status-query";
import { LoginScreen } from "@/screens/auth/LoginScreen";
import { SignupScreen } from "@/screens/auth/SignupScreen";
import { ReferralInputScreen } from "@/screens/auth/ReferralInputScreen";
import { InactiveAccountScreen } from "@/screens/home/InactiveAccountScreen";
import { DepositScreen } from "@/screens/deposit/DepositScreen";
import { HomeScreen } from "@/screens/home/HomeScreen";

type AuthScreen = "login" | "referral" | "signup";

function AppContent() {
  // Configure React Query for React Native
  useReactQueryConfig();

  const { isAuthenticated } = useAuthStore();
  const [authScreen, setAuthScreen] = useState<AuthScreen>("login");
  const [referralData, setReferralData] = useState<{
    referrerId: string;
    referralCode: string;
  } | null>(null);
  const [showDepositScreen, setShowDepositScreen] = useState(false);

  const handleValidReferralCode = (referrerId: string, referralCode: string) => {
    setReferralData({ referrerId, referralCode });
    setAuthScreen("signup");
  };

  // If not authenticated, show auth screens
  if (!isAuthenticated) {
    return (
      <>
        {authScreen === "login" && (
          <LoginScreen onNavigateToSignup={() => setAuthScreen("referral")} />
        )}
        {authScreen === "referral" && (
          <ReferralInputScreen
            onValidCode={handleValidReferralCode}
            onNavigateToLogin={() => setAuthScreen("login")}
          />
        )}
        {authScreen === "signup" && referralData && (
          <SignupScreen
            referrerId={referralData.referrerId}
            referralCode={referralData.referralCode}
            onNavigateToLogin={() => {
              setAuthScreen("login");
              setReferralData(null);
            }}
          />
        )}
        <StatusBar style="light" />
      </>
    );
  }

  // Authenticated - check account status
  const { data: userStatus, isLoading: isLoadingStatus } = useUserStatus();

  // Loading user status
  if (isLoadingStatus) {
    return (
      <>
        <View className="flex-1 bg-zinc-950 items-center justify-center">
          <ActivityIndicator size="large" color="#8b5cf6" />
        </View>
        <StatusBar style="light" />
      </>
    );
  }

  // Blocked accounts - logout immediately
  if (userStatus?.status === "BLOCKED") {
    useAuthStore.getState().clearAuth();
    return null;
  }

  // Inactive accounts - show activation screen (FULLSCREEN, no navigation)
  if (userStatus?.status === "INACTIVE") {
    // Show deposit screen if requested
    if (showDepositScreen) {
      return (
        <>
          <DepositScreen onBack={() => setShowDepositScreen(false)} />
          <StatusBar style="light" />
        </>
      );
    }

    return (
      <>
        <InactiveAccountScreen
          onNavigateToDeposit={() => setShowDepositScreen(true)}
        />
        <StatusBar style="light" />
      </>
    );
  }

  // Active accounts - show full app
  return (
    <>
      <HomeScreen />
      <StatusBar style="light" />
    </>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{ persister: asyncStoragePersister }}
        >
          <AppContent />
        </PersistQueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
