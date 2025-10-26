import "./global.css";
import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { View, Text, SafeAreaView } from "react-native";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { queryClient, asyncStoragePersister } from "@/lib/react-query";
import { useReactQueryConfig } from "@/lib/react-query-config";
import { useAuthStore } from "@/stores/auth.store";
import { LoginScreen } from "@/screens/auth/LoginScreen";
import { SignupScreen } from "@/screens/auth/SignupScreen";

type AuthScreen = "login" | "signup";

function AppContent() {
  // Configure React Query for React Native
  useReactQueryConfig();

  const { isAuthenticated } = useAuthStore();
  const [authScreen, setAuthScreen] = useState<AuthScreen>("login");

  // If not authenticated, show auth screens
  if (!isAuthenticated) {
    return (
      <>
        {authScreen === "login" ? (
          <LoginScreen onNavigateToSignup={() => setAuthScreen("signup")} />
        ) : (
          <SignupScreen onNavigateToLogin={() => setAuthScreen("login")} />
        )}
        <StatusBar style="light" />
      </>
    );
  }

  // Authenticated - show main app
  return (
    <SafeAreaView className="flex-1 bg-zinc-950">
      <View className="flex-1 justify-center items-center">
        <Text className="text-4xl font-bold text-white mb-2">MVPPIR</Text>
        <Text className="text-zinc-400 text-base">Mobile App</Text>
        <View className="mt-8 p-6 bg-zinc-900 rounded-lg border border-zinc-800">
          <Text className="text-zinc-200 text-center mb-2">
            ✅ Autenticado com sucesso!
          </Text>
          <Text className="text-zinc-400 text-center text-sm">
            Dashboard em breve...
          </Text>
        </View>
      </View>
      <StatusBar style="light" />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: asyncStoragePersister }}
    >
      <AppContent />
    </PersistQueryClientProvider>
  );
}
