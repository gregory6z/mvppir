import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Lock, Wallet, TrendUp, Users, ArrowRight } from "phosphor-react-native";
import { useUserStatus } from "@/api/user/queries/use-user-status-query";
import { useUserAccount } from "@/api/user/queries/use-user-account-query";
import { Header } from "@/components/home/Header";
import { useAuthStore } from "@/stores/auth.store";

interface InactiveAccountScreenProps {
  onNavigateToDeposit: () => void;
}

export function InactiveAccountScreen({ onNavigateToDeposit }: InactiveAccountScreenProps) {
  const { data: status, isLoading: isLoadingStatus } = useUserStatus();
  const { data: userAccount, isLoading: isLoadingAccount } = useUserAccount();
  const { clearAuth } = useAuthStore();

  const totalDeposits = parseFloat(status?.totalDepositsUsd || "0");
  const threshold = parseFloat(status?.activationThreshold || "100");
  const remaining = Math.max(0, threshold - totalDeposits);
  const progress = status?.activationProgress || 0;

  const handleAvatarPress = () => {
    Alert.alert(
      "Logout",
      "Do you want to logout from your account?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: () => {
            clearAuth();
            console.log("User logged out");
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleNotificationPress = () => {
    console.log("Notification pressed - open notifications");
  };

  if (isLoadingStatus || isLoadingAccount) {
    return (
      <SafeAreaView className="flex-1 bg-zinc-950 items-center justify-center">
        <ActivityIndicator size="large" color="#8b5cf6" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-zinc-950" edges={["bottom", "left", "right"]}>
      {/* Header */}
      <Header
        userName={userAccount?.name || "User"}
        avatarUrl={undefined}
        notificationCount={0}
        onAvatarPress={handleAvatarPress}
        onNotificationPress={handleNotificationPress}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 32 }}
      >
        {/* Status Badge */}
        <View className="items-center mb-8">
          <View className="bg-yellow-500/10 border border-yellow-500/30 rounded-full px-6 py-2 flex-row items-center gap-2">
            <Lock size={16} color="#eab308" weight="fill" />
            <Text className="text-yellow-500 font-semibold text-sm">
              Conta Inativa
            </Text>
          </View>
        </View>

        {/* Hero Section */}
        <View className="items-center mb-12">
          <View className="w-32 h-32 bg-violet-500/20 rounded-full items-center justify-center mb-6">
            <Wallet size={64} color="#8b5cf6" weight="duotone" />
          </View>

          <Text className="text-white text-3xl font-bold text-center mb-4">
            Ative sua conta
          </Text>

          <Text className="text-zinc-400 text-center text-base leading-6 mb-3">
            Deposite <Text className="text-white font-bold">${threshold.toFixed(0)} USD</Text> para desbloquear todos os recursos
          </Text>

          <Text className="text-violet-400 text-center text-sm font-medium">
            Lucre com investimentos em IA e ganhe até 2.60% ao dia + comissões da rede
          </Text>
        </View>

        {/* Progress Slider */}
        <View className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-white font-semibold text-base">
              Progresso de Ativação
            </Text>
            <Text className="text-violet-500 font-bold text-lg">
              ${totalDeposits.toFixed(2)} / ${threshold.toFixed(0)}
            </Text>
          </View>

          {/* Progress Bar */}
          <View className="h-3 bg-zinc-800 rounded-full overflow-hidden mb-2">
            <View
              className="h-full bg-violet-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </View>

          <Text className="text-zinc-500 text-xs text-center">
            {remaining > 0
              ? `Faltam $${remaining.toFixed(2)} para ativar sua conta`
              : "Conta ativada! Recarregando..."}
          </Text>
        </View>

        {/* Deposit Button - Prominent CTA */}
        <TouchableOpacity
          onPress={onNavigateToDeposit}
          className="bg-violet-500 rounded-2xl py-4 px-6 flex-row items-center justify-center gap-3 mb-8 active:bg-violet-600"
        >
          <Wallet size={24} color="#ffffff" weight="fill" />
          <Text className="text-white font-bold text-lg">
            Fazer Depósito
          </Text>
          <ArrowRight size={24} color="#ffffff" weight="bold" />
        </TouchableOpacity>

        {/* Benefits */}
        <View className="gap-4 mb-8">
          <Text className="text-white font-bold text-lg mb-2">
            O que você ganha ao ativar:
          </Text>

          {/* Benefit 1 */}
          <View className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex-row items-start gap-4">
            <View className="w-12 h-12 bg-violet-500/10 rounded-full items-center justify-center">
              <TrendUp size={24} color="#8b5cf6" weight="duotone" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-semibold text-base mb-1">
                IA Gerando Lucros 24/7
              </Text>
              <Text className="text-zinc-400 text-sm">
                Inteligência Artificial trabalhando para você enquanto você dorme
              </Text>
            </View>
          </View>

          {/* Benefit 2 */}
          <View className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex-row items-start gap-4">
            <View className="w-12 h-12 bg-green-500/10 rounded-full items-center justify-center">
              <Users size={24} color="#10b981" weight="duotone" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-semibold text-base mb-1">
                Comissões em 3 Níveis
              </Text>
              <Text className="text-zinc-400 text-sm">
                Ganhe sobre lucros da rede em até 3 gerações de indicados
              </Text>
            </View>
          </View>

          {/* Benefit 3 */}
          <View className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex-row items-start gap-4">
            <View className="w-12 h-12 bg-blue-500/10 rounded-full items-center justify-center">
              <Wallet size={24} color="#3b82f6" weight="duotone" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-semibold text-base mb-1">
                Saques Rápidos
              </Text>
              <Text className="text-zinc-400 text-sm">
                Retire lucros da IA e comissões quando quiser
              </Text>
            </View>
          </View>
        </View>

        {/* Info Footer */}
        <View className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4">
          <Text className="text-blue-400 text-sm text-center">
            Após seu primeiro depósito de $100, sua conta será ativada automaticamente e você começará a ganhar comissões
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
