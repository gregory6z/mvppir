import "./global.css";
import { StatusBar } from "expo-status-bar";
import { View, Text, SafeAreaView } from "react-native";
import { QueryClientProvider } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { queryClient, asyncStoragePersister } from "@/lib/react-query";
import { useReactQueryConfig } from "@/lib/react-query-config";

function AppContent() {
  // Configure React Query for React Native
  useReactQueryConfig();

  return (
    <SafeAreaView className="flex-1 bg-zinc-950">
      <View className="flex-1 justify-center items-center">
        <Text className="text-4xl font-bold text-white mb-2">MVPPIR</Text>
        <Text className="text-zinc-400 text-base">Mobile App</Text>
        <View className="mt-8 p-6 bg-zinc-900 rounded-lg border border-zinc-800">
          <Text className="text-zinc-200 text-center">
            ✅ Expo + TypeScript
          </Text>
          <Text className="text-zinc-200 text-center">
            ✅ NativeWind v4
          </Text>
          <Text className="text-zinc-200 text-center">
            ✅ TanStack Query
          </Text>
          <Text className="text-zinc-200 text-center">
            ✅ Zustand
          </Text>
          <Text className="text-zinc-200 text-center">
            ✅ Better Auth
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
