import "./global.css";
import "@/locales"; // Initialize i18n
import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { queryClient, asyncStoragePersister } from "@/lib/react-query";
import { useReactQueryConfig } from "@/lib/react-query-config";
import { useAuthStore } from "@/stores/auth.store";
import { LoginScreen } from "@/screens/auth/LoginScreen";
import { SignupScreen } from "@/screens/auth/SignupScreen";
import { ReferralInputScreen } from "@/screens/auth/ReferralInputScreen";
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

  // Authenticated - show main app
  return (
    <>
      <HomeScreen />
      <StatusBar style="light" />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister: asyncStoragePersister }}
      >
        <AppContent />
      </PersistQueryClientProvider>
    </SafeAreaProvider>
  );
}
