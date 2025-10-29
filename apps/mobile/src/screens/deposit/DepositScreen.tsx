import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Copy, CheckCircle } from "phosphor-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import * as Clipboard from "expo-clipboard";
import { Header } from "@/components/home/Header";
import { useDepositAddress } from "@/api/user/queries/use-deposit-address-query";
import { useUserAccount } from "@/api/user/queries/use-user-account-query";

interface DepositScreenProps {
  onBack: () => void;
}

export function DepositScreen({ onBack }: DepositScreenProps) {
  const { t } = useTranslation("deposit.deposit");
  const { data: userAccount } = useUserAccount();
  const { data: depositAddress, isLoading, error } = useDepositAddress();
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = async () => {
    if (!depositAddress) return;

    await Clipboard.setStringAsync(depositAddress.polygonAddress);
    setCopied(true);

    // Reset copied state after 2 seconds
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-zinc-950" edges={["left", "right"]}>
        <Header
          userName={userAccount?.name || ""}
          avatarUrl={undefined}
          notificationCount={0}
          onAvatarPress={() => {}}
          onNotificationPress={() => {}}
        />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#8b5cf6" />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !depositAddress) {
    return (
      <SafeAreaView className="flex-1 bg-zinc-950" edges={["left", "right"]}>
        <Header
          userName={userAccount?.name || ""}
          avatarUrl={undefined}
          notificationCount={0}
          onAvatarPress={() => {}}
          onNotificationPress={() => {}}
        />
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-white text-base text-center">{t("errors.loadFailed")}</Text>
          <TouchableOpacity
            onPress={onBack}
            className="mt-4 bg-violet-500 px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-zinc-950" edges={["left", "right"]}>
      {/* Header */}
      <Header
        userName={userAccount?.name || ""}
        avatarUrl={undefined}
        notificationCount={0}
        onAvatarPress={() => {}}
        onNotificationPress={() => {}}
      />

      {/* Title Section with Back Button */}
      <View className="flex-row items-center px-4 py-4 border-b border-zinc-800">
        <TouchableOpacity
          onPress={onBack}
          className="mr-3 w-10 h-10 items-center justify-center rounded-xl bg-zinc-900"
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <ArrowLeft size={20} color="#ffffff" weight="bold" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-white text-2xl font-bold">{t("title")}</Text>
          <Text className="text-zinc-400 text-sm mt-1">{t("subtitle")}</Text>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Network Warning */}
        <View className="mx-4 mt-4 bg-orange-500/10 border border-orange-500/30 p-4 rounded-xl">
          <Text className="text-orange-500 font-semibold text-sm mb-1">
            {t("network")}
          </Text>
          <Text className="text-orange-400 text-xs">
            {t("networkWarning")}
          </Text>
        </View>

        {/* QR Code */}
        <View className="mx-4 mt-6 bg-zinc-900 p-6 rounded-2xl border border-zinc-800 items-center">
          <Text className="text-white font-semibold text-base mb-4">
            {t("qrCode")}
          </Text>
          <View className="bg-white p-4 rounded-xl">
            <Image
              source={{ uri: depositAddress.qrCode }}
              style={{ width: 200, height: 200 }}
              resizeMode="contain"
            />
          </View>
          <Text className="text-zinc-400 text-xs mt-4 text-center">
            {t("scanQR")}
          </Text>
        </View>

        {/* Wallet Address */}
        <View className="mx-4 mt-4 bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
          <Text className="text-white font-semibold text-sm mb-3">
            {t("address")}
          </Text>
          <View className="bg-zinc-800 p-3 rounded-xl mb-3">
            <Text className="text-white text-xs font-mono" numberOfLines={2}>
              {depositAddress.polygonAddress}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleCopyAddress}
            className={`flex-row items-center justify-center py-3 rounded-xl ${
              copied ? "bg-green-500" : "bg-violet-500"
            }`}
            accessibilityLabel="Copy address"
            accessibilityRole="button"
          >
            {copied ? (
              <>
                <CheckCircle size={20} color="#ffffff" weight="bold" />
                <Text className="text-white font-semibold ml-2">
                  {t("addressCopied")}
                </Text>
              </>
            ) : (
              <>
                <Copy size={20} color="#ffffff" weight="bold" />
                <Text className="text-white font-semibold ml-2">
                  {t("copyAddress")}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Supported Tokens */}
        <View className="mx-4 mt-4 bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
          <Text className="text-white font-semibold text-sm mb-3">
            {t("supportedTokens.title")}
          </Text>
          <View className="space-y-2">
            <View className="flex-row items-center py-2">
              <View className="w-2 h-2 rounded-full bg-green-500 mr-3" />
              <Text className="text-zinc-300 text-sm">{t("supportedTokens.usdt")}</Text>
            </View>
            <View className="flex-row items-center py-2">
              <View className="w-2 h-2 rounded-full bg-blue-500 mr-3" />
              <Text className="text-zinc-300 text-sm">{t("supportedTokens.usdc")}</Text>
            </View>
            <View className="flex-row items-center py-2">
              <View className="w-2 h-2 rounded-full bg-violet-500 mr-3" />
              <Text className="text-zinc-300 text-sm">{t("supportedTokens.matic")}</Text>
            </View>
          </View>
        </View>

        {/* Instructions */}
        <View className="mx-4 mt-4 bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
          <Text className="text-white font-semibold text-sm mb-3">
            {t("instructions.title")}
          </Text>
          <View className="space-y-2">
            <View className="flex-row py-2">
              <Text className="text-violet-500 font-bold mr-3">1.</Text>
              <Text className="text-zinc-300 text-sm flex-1">
                {t("instructions.step1")}
              </Text>
            </View>
            <View className="flex-row py-2">
              <Text className="text-violet-500 font-bold mr-3">2.</Text>
              <Text className="text-zinc-300 text-sm flex-1">
                {t("instructions.step2")}
              </Text>
            </View>
            <View className="flex-row py-2">
              <Text className="text-violet-500 font-bold mr-3">3.</Text>
              <Text className="text-zinc-300 text-sm flex-1">
                {t("instructions.step3")}
              </Text>
            </View>
            <View className="flex-row py-2">
              <Text className="text-violet-500 font-bold mr-3">4.</Text>
              <Text className="text-zinc-300 text-sm flex-1">
                {t("instructions.step4")}
              </Text>
            </View>
          </View>
        </View>

        {/* Warnings */}
        <View className="mx-4 mt-4 bg-red-500/10 border border-red-500/30 p-4 rounded-2xl">
          <Text className="text-red-500 font-semibold text-sm mb-3">
            {t("warnings.title")}
          </Text>
          <View className="space-y-2">
            <View className="flex-row py-1">
              <Text className="text-red-400 mr-2">•</Text>
              <Text className="text-red-400 text-xs flex-1">
                {t("warnings.wrongNetwork")}
              </Text>
            </View>
            <View className="flex-row py-1">
              <Text className="text-red-400 mr-2">•</Text>
              <Text className="text-red-400 text-xs flex-1">
                {t("warnings.minDeposit")}
              </Text>
            </View>
            <View className="flex-row py-1">
              <Text className="text-yellow-400 mr-2">•</Text>
              <Text className="text-yellow-400 text-xs flex-1">
                {t("warnings.activation")}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
