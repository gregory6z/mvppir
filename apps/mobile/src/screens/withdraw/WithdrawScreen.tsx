import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Wallet, Warning, Info, Check } from "phosphor-react-native";
import { Header } from "@/components/home/Header";
import { useUserAccount } from "@/api/user/queries/use-user-account-query";
import { useUserBalance } from "@/api/user/queries/use-user-balance-query";
import { useRequestWithdrawal } from "@/api/user/mutations/use-request-withdrawal-mutation";

interface WithdrawScreenProps {
  onBack: () => void;
}

export function WithdrawScreen({ onBack }: WithdrawScreenProps) {
  const { t } = useTranslation("withdraw.withdraw");
  const { data: userAccount, isLoading: isLoadingAccount } = useUserAccount();
  const { data: balanceData, isLoading: isLoadingBalance } = useUserBalance();
  const { mutate: requestWithdrawal, isPending } = useRequestWithdrawal();

  const [amount, setAmount] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");

  const notificationCount = 0; // TODO: implement notifications

  // Loading state
  if (isLoadingAccount || isLoadingBalance) {
    return (
      <SafeAreaView className="flex-1 bg-zinc-950 items-center justify-center" edges={["left", "right"]}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text className="text-zinc-400 text-sm mt-4">{t("common.loading") || "Loading..."}</Text>
      </SafeAreaView>
    );
  }

  // Get available balance in USD
  const availableBalance = balanceData?.totalUSD || 0;

  // Calculate fee (fixed $5 for now, will be dynamic based on rank)
  const baseFee = 5;
  const withdrawAmount = parseFloat(amount) || 0;
  const netAmount = withdrawAmount > 0 ? withdrawAmount - baseFee : 0;

  // Check if withdrawal would cause downrank
  const minimumBalance = 100; // This should come from user's rank requirements
  const balanceAfterWithdrawal = availableBalance - withdrawAmount;
  const wouldCauseDownrank = balanceAfterWithdrawal < minimumBalance;

  // Daily limit (should come from rank)
  const dailyLimit = 1000;

  // Validation
  const isAmountValid = withdrawAmount >= 500 && withdrawAmount <= availableBalance;
  const isAddressValid = destinationAddress.length === 42 && destinationAddress.startsWith("0x");
  const canSubmit = isAmountValid && isAddressValid && !isPending;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    // Show downrank warning if applicable
    if (wouldCauseDownrank) {
      Alert.alert(
        t("warnings.downrankTitle"),
        t("warnings.downrankMessage", { balance: balanceAfterWithdrawal.toFixed(2), minimum: minimumBalance }),
        [
          { text: t("common.cancel"), style: "cancel" },
          {
            text: t("common.continue"),
            style: "destructive",
            onPress: submitWithdrawal,
          },
        ]
      );
    } else {
      submitWithdrawal();
    }
  };

  const submitWithdrawal = () => {
    requestWithdrawal(
      {
        amount: withdrawAmount,
        destinationAddress,
      },
      {
        onSuccess: () => {
          Alert.alert(
            t("success.title"),
            t("success.message"),
            [{ text: t("common.ok"), onPress: onBack }]
          );
        },
        onError: (error: Error) => {
          Alert.alert(
            t("errors.title"),
            error.message || t("errors.message"),
            [{ text: t("common.ok") }]
          );
        },
      }
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-950" edges={["left", "right"]}>
      {/* Header */}
      <Header
        userName={userAccount?.name || ""}
        avatarUrl={undefined}
        notificationCount={notificationCount}
        onAvatarPress={() => {}}
        onNotificationPress={() => {}}
      />

      {/* Title Section with Back Button */}
      <View className="flex-row items-center px-4 py-4 border-b border-zinc-800">
        <TouchableOpacity
          onPress={onBack}
          className="mr-3 w-11 h-11 items-center justify-center rounded-xl bg-zinc-900 active:bg-zinc-800"
          accessibilityLabel="Go back"
          accessibilityRole="button"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ArrowLeft size={24} color="#ffffff" weight="bold" />
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
        {/* Available Balance Card */}
        <View className="mx-4 mt-4 bg-zinc-900 rounded-2xl p-4 mb-4 border border-zinc-800">
          <View className="flex-row items-center gap-2 mb-2">
            <Wallet size={20} color="#8b5cf6" weight="duotone" />
            <Text className="text-zinc-400 text-sm">{t("availableBalance")}</Text>
          </View>
          <Text className="text-white text-3xl font-bold">${availableBalance.toFixed(2)}</Text>
          <Text className="text-zinc-500 text-xs mt-1">USDC</Text>
        </View>

        {/* Daily Limit Info */}
        <View className="mx-4 bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 mb-4 flex-row items-start gap-3">
          <Info size={20} color="#3b82f6" weight="fill" />
          <View className="flex-1">
            <Text className="text-blue-400 text-sm font-semibold mb-1">{t("dailyLimit.title")}</Text>
            <Text className="text-blue-300 text-xs">{t("dailyLimit.description", { limit: dailyLimit })}</Text>
          </View>
        </View>

        {/* Amount Input */}
        <View className="mx-4 mb-4">
          <Text className="text-white font-semibold mb-2">{t("amount.label")}</Text>
          <View className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
            <View className="flex-row items-center px-4 py-3">
              <Text className="text-zinc-400 text-lg mr-2">$</Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor="#71717a"
                keyboardType="decimal-pad"
                className="flex-1 text-white text-lg"
              />
              <Text className="text-zinc-500 text-sm">USDC</Text>
            </View>
          </View>
          <Text className="text-zinc-500 text-xs mt-1">{t("amount.minimum", { amount: 500 })}</Text>
          {withdrawAmount > 0 && withdrawAmount < 500 && (
            <Text className="text-red-400 text-xs mt-1">{t("amount.belowMinimum")}</Text>
          )}
          {withdrawAmount > availableBalance && (
            <Text className="text-red-400 text-xs mt-1">{t("amount.exceedsBalance")}</Text>
          )}
        </View>

        {/* Destination Address Input */}
        <View className="mx-4 mb-4">
          <Text className="text-white font-semibold mb-2">{t("address.label")}</Text>
          <View className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
            <TextInput
              value={destinationAddress}
              onChangeText={setDestinationAddress}
              placeholder="0x..."
              placeholderTextColor="#71717a"
              autoCapitalize="none"
              autoCorrect={false}
              className="px-4 py-3 text-white text-sm"
            />
          </View>
          <Text className="text-zinc-500 text-xs mt-1">{t("address.description")}</Text>
          {destinationAddress.length > 0 && !isAddressValid && (
            <Text className="text-red-400 text-xs mt-1">{t("address.invalid")}</Text>
          )}
        </View>

        {/* Fee Breakdown */}
        {withdrawAmount > 0 && isAmountValid && (
          <View className="mx-4 bg-zinc-900 rounded-2xl p-4 mb-4 border border-zinc-800">
            <Text className="text-white font-semibold mb-3">{t("feeBreakdown.title")}</Text>

            <View className="flex-row justify-between mb-2">
              <Text className="text-zinc-400 text-sm">{t("feeBreakdown.withdrawalAmount")}</Text>
              <Text className="text-white text-sm">${withdrawAmount.toFixed(2)}</Text>
            </View>

            <View className="flex-row justify-between mb-2">
              <Text className="text-zinc-400 text-sm">{t("feeBreakdown.baseFee")}</Text>
              <Text className="text-red-400 text-sm">-${baseFee.toFixed(2)}</Text>
            </View>

            <View className="border-t border-zinc-800 my-2" />

            <View className="flex-row justify-between">
              <Text className="text-white font-semibold">{t("feeBreakdown.youReceive")}</Text>
              <Text className="text-green-500 font-bold text-lg">${netAmount.toFixed(2)}</Text>
            </View>
          </View>
        )}

        {/* Downrank Warning */}
        {wouldCauseDownrank && withdrawAmount > 0 && (
          <View className="mx-4 bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 mb-4 flex-row items-start gap-3">
            <Warning size={24} color="#f59e0b" weight="fill" />
            <View className="flex-1">
              <Text className="text-orange-400 font-bold text-sm mb-2">{t("warnings.downrankTitle")}</Text>
              <Text className="text-orange-300 text-xs leading-5">
                {t("warnings.downrankDescription", {
                  newBalance: balanceAfterWithdrawal.toFixed(2),
                  minimum: minimumBalance
                })}
              </Text>
            </View>
          </View>
        )}

        {/* Processing Time Notice */}
        <View className="mx-4 bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 mb-6 flex-row items-start gap-3">
          <Check size={20} color="#8b5cf6" weight="bold" />
          <View className="flex-1">
            <Text className="text-purple-400 font-semibold text-sm mb-1">{t("processing.title")}</Text>
            <Text className="text-purple-300 text-xs leading-5">{t("processing.description")}</Text>
          </View>
        </View>

        {/* Submit Button */}
        <View className="mx-4">
          <TouchableOpacity
          onPress={handleSubmit}
          disabled={!canSubmit}
          className={`rounded-xl py-4 mb-6 ${
            canSubmit ? "bg-purple-500" : "bg-zinc-800"
          }`}
        >
          {isPending ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text className={`text-center font-bold ${canSubmit ? "text-white" : "text-zinc-600"}`}>
              {t("submitButton")}
            </Text>
          )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
