import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Modal, Clipboard } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Wallet, ArrowRight, Check, Warning, CheckCircle, ClipboardText } from "phosphor-react-native";
import { Header } from "@/components/home/Header";
import { DownrankWarningModal } from "@/components/withdraw/DownrankWarningModal";
import { useUserAccount } from "@/api/user/queries/use-user-account-query";
import { useUserBalance } from "@/api/user/queries/use-user-balance-query";
import { useMLMProfile } from "@/api/mlm/queries/use-mlm-profile-query";
import { useCalculateWithdrawalFee } from "@/api/user/queries/use-calculate-withdrawal-fee-query";
import { useRequestWithdrawal } from "@/api/user/mutations/use-request-withdrawal-mutation";
import type { MLMRank } from "@/api/mlm/schemas/mlm.schema";

interface WithdrawScreenProps {
  onBack: () => void;
}

type Step = 1 | 2;

// Helper function to calculate new rank based on balance
function calculateNewRank(balance: number): MLMRank {
  if (balance >= 10000) return "GOLD";
  if (balance >= 1000) return "SILVER";
  if (balance >= 100) return "BRONZE";
  return "RECRUIT";
}

export function WithdrawScreen({ onBack }: WithdrawScreenProps) {
  const { t } = useTranslation("withdraw.withdraw");
  const { t: tAccessibility } = useTranslation("common.accessibility");
  const { data: userAccount, isLoading: isLoadingAccount } = useUserAccount();
  const { data: balanceData, isLoading: isLoadingBalance } = useUserBalance();
  const { data: mlmProfile, isLoading: isLoadingMLM } = useMLMProfile();
  const { mutate: requestWithdrawal, isPending } = useRequestWithdrawal();

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [amount, setAmount] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [showDownrankModal, setShowDownrankModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const notificationCount = 0;
  const withdrawAmount = parseFloat(amount) || 0;

  // Loading state
  if (isLoadingAccount || isLoadingBalance || isLoadingMLM) {
    return (
      <SafeAreaView className="flex-1 bg-zinc-950 items-center justify-center" edges={["left", "right"]}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text className="text-zinc-400 text-sm mt-4">{t("common.loading")}</Text>
      </SafeAreaView>
    );
  }

  const availableBalance = balanceData?.totalUSD || 0;
  const currentRank = mlmProfile?.user.currentRank || "RECRUIT";
  const blockedBalance = mlmProfile?.user.blockedBalance || 0;
  const minRequired = mlmProfile?.currentRankRequirements.maintenance.blockedBalance.required || 0;

  // Must have at least $500 to be able to withdraw (but can withdraw everything)
  const minBalanceRequired = 500;
  const maxWithdrawable = availableBalance >= minBalanceRequired ? availableBalance : 0;

  // Fetch fee calculation from backend
  const { data: feeData, isLoading: isLoadingFee, error: feeError } = useCalculateWithdrawalFee(
    withdrawAmount,
    withdrawAmount > 0 && withdrawAmount <= maxWithdrawable // Only fetch if amount is valid
  );

  // Use fee data from backend (with safe defaults)
  const totalFeeAmount = feeData?.totalFeeAmount ?? 0;
  const netAmount = feeData?.netAmount ?? (withdrawAmount > 0 ? withdrawAmount : 0);
  const baseFeePercent = feeData?.baseFee ?? 0;
  const progressiveFeePercent = feeData?.progressiveFee ?? 0;
  const loyaltyDiscountPercent = feeData?.loyaltyDiscount ?? 0;
  const totalFeePercent = feeData?.totalFeePercentage ?? 0;

  // Calculate if withdrawal would cause downrank
  // Use blockedBalance for rank calculation (since that's what determines rank)
  const balanceAfterWithdrawal = blockedBalance - withdrawAmount;
  const newRank = calculateNewRank(balanceAfterWithdrawal);
  const wouldCauseDownrank = balanceAfterWithdrawal < minRequired && minRequired > 0;
  const wouldBeInactivated = balanceAfterWithdrawal < 100;

  // Get yield percentages from backend
  const currentDailyYield = mlmProfile?.commissionRates.N0 || 0;

  // TODO: Backend should provide an endpoint to get yields for all ranks
  // For now, we use hardcoded fallback to calculate new rank yield
  const yieldsByRank: Record<MLMRank, number> = {
    RECRUIT: 0.1,
    BRONZE: 0.125,
    SILVER: 0.15,
    GOLD: 0.175,
  };
  const newDailyYield = yieldsByRank[newRank] || 0;

  // Step 1 validation
  const isAmountValid = withdrawAmount > 0 && withdrawAmount <= maxWithdrawable;
  const canGoToStep2 = isAmountValid;

  // Step 2 validation
  const isAddressValid = destinationAddress.length === 42 && destinationAddress.startsWith("0x");
  const canSubmit = isAddressValid && !isPending;

  const handleNextStep = () => {
    if (currentStep === 1 && canGoToStep2) {
      setCurrentStep(2);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    } else {
      onBack();
    }
  };

  const handleSubmit = () => {
    if (!canSubmit) return;

    // Show downrank warning if applicable OR if account will be inactivated
    if (wouldCauseDownrank || wouldBeInactivated) {
      setShowDownrankModal(true);
    } else {
      submitWithdrawal();
    }
  };

  const submitWithdrawal = () => {
    setShowDownrankModal(false);
    requestWithdrawal(
      {
        amount: withdrawAmount,
        destinationAddress,
      },
      {
        onSuccess: () => {
          // Show success modal
          setShowSuccessModal(true);
        },
        onError: (error: Error) => {
          console.error("Withdrawal error:", error.message);
        },
      }
    );
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    onBack();
  };

  const handlePasteAddress = async () => {
    try {
      const text = await Clipboard.getString();
      if (text) {
        setDestinationAddress(text);
      }
    } catch (error) {
      console.error("Failed to paste from clipboard:", error);
    }
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
          onPress={handlePreviousStep}
          className="mr-3 w-11 h-11 items-center justify-center rounded-xl bg-zinc-900 active:bg-zinc-800"
          accessibilityLabel={tAccessibility("navigation.goBack")}
          accessibilityRole="button"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ArrowLeft size={24} color="#ffffff" weight="bold" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-white text-2xl font-bold">{t("title")}</Text>
          <Text className="text-zinc-400 text-sm mt-1">
            {t("steps.step")} {currentStep} {t("steps.of")} 2
          </Text>
        </View>
      </View>

      {/* Step Indicators */}
      <View className="flex-row items-center px-4 py-4 gap-2">
        <View className={`flex-1 h-1 rounded-full ${currentStep >= 1 ? "bg-purple-500" : "bg-zinc-800"}`} />
        <View className={`flex-1 h-1 rounded-full ${currentStep >= 2 ? "bg-purple-500" : "bg-zinc-800"}`} />
      </View>

      {/* Scrollable Content */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Step 1: Amount */}
        {currentStep === 1 && (
          <>
            {/* Available Balance Card */}
            <View className="mx-4 mt-4 bg-zinc-900 rounded-2xl p-4 mb-4 border border-zinc-800">
              <View className="flex-row items-center gap-2 mb-2">
                <Wallet size={20} color="#8b5cf6" weight="duotone" />
                <Text className="text-zinc-400 text-sm">{t("availableBalance")}</Text>
              </View>
              <Text className="text-white text-3xl font-bold">${availableBalance.toFixed(2)}</Text>
              <Text className="text-zinc-500 text-xs mt-1">USDC</Text>
            </View>

            {/* Amount Input */}
            <View className="mx-4 mb-4">
              <Text className="text-white font-semibold mb-2">{t("amount.label")}</Text>
              <View className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
                <View className="flex-row items-center px-4 py-3">
                  <TextInput
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="0.00"
                    placeholderTextColor="#71717a"
                    keyboardType="decimal-pad"
                    className="flex-1 text-white text-lg"
                    style={{ paddingVertical: 0, includeFontPadding: false }}
                  />
                  <Text className="text-zinc-500 text-lg ml-2">USDC</Text>
                </View>
              </View>
              <Text className="text-zinc-500 text-xs mt-1">
                {availableBalance >= minBalanceRequired
                  ? t("amount.canWithdrawUpTo", { amount: availableBalance.toFixed(2) })
                  : t("amount.needMinimum", { amount: minBalanceRequired })}
              </Text>
              {availableBalance < minBalanceRequired && (
                <Text className="text-red-400 text-xs mt-1">
                  {t("amount.insufficientMinimum", { amount: minBalanceRequired })}
                </Text>
              )}
              {withdrawAmount > 0 && withdrawAmount > availableBalance && (
                <Text className="text-red-400 text-xs mt-1">
                  {t("amount.exceedsAvailable")}
                </Text>
              )}
            </View>

            {/* Fee Breakdown */}
            {withdrawAmount > 0 && isAmountValid && (
              <View className="mx-4 bg-zinc-900 rounded-2xl p-4 mb-4 border border-zinc-800">
                <Text className="text-white font-semibold mb-3">{t("feeBreakdown.title")}</Text>

                {isLoadingFee ? (
                  <View className="items-center py-4">
                    <ActivityIndicator size="small" color="#8b5cf6" />
                    <Text className="text-zinc-400 text-xs mt-2">{t("feeBreakdown.calculatingFees")}</Text>
                  </View>
                ) : feeError ? (
                  <View className="items-center py-2">
                    <Text className="text-red-400 text-xs">{t("feeBreakdown.failedToCalculate")}</Text>
                    <Text className="text-zinc-500 text-xs mt-1">{t("feeBreakdown.usingEstimated")}</Text>
                  </View>
                ) : feeData ? (
                  <>
                    <View className="flex-row justify-between mb-2">
                      <Text className="text-zinc-400 text-sm">{t("feeBreakdown.withdrawalAmount")}</Text>
                      <Text className="text-white text-sm">${withdrawAmount.toFixed(2)}</Text>
                    </View>

                    <View className="flex-row justify-between mb-2">
                      <Text className="text-zinc-400 text-sm">{t("feeBreakdown.baseFee")} ({totalFeePercent.toFixed(1)}%)</Text>
                      <Text className="text-red-400 text-sm">-${totalFeeAmount.toFixed(2)}</Text>
                    </View>

                    <View className="border-t border-zinc-800 my-2" />

                    <View className="flex-row justify-between">
                      <Text className="text-white font-semibold">{t("feeBreakdown.youReceive")}</Text>
                      <Text className="text-green-500 font-bold text-lg">${netAmount.toFixed(2)}</Text>
                    </View>
                  </>
                ) : (
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-zinc-400 text-sm">{t("feeBreakdown.withdrawalAmount")}</Text>
                    <Text className="text-white text-sm">${withdrawAmount.toFixed(2)}</Text>
                  </View>
                )}
              </View>
            )}

            {/* Next Button */}
            <View className="mx-4 mt-4">
              <TouchableOpacity
                onPress={handleNextStep}
                disabled={!canGoToStep2}
                className={`rounded-xl py-4 flex-row items-center justify-center gap-2 ${
                  canGoToStep2 ? "bg-purple-500" : "bg-zinc-800"
                }`}
              >
                <Text className={`font-bold ${canGoToStep2 ? "text-white" : "text-zinc-600"}`}>
                  {t("steps.nextButton")}
                </Text>
                <ArrowRight size={20} color={canGoToStep2 ? "#ffffff" : "#52525b"} weight="bold" />
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Step 2: Address */}
        {currentStep === 2 && (
          <>
            {/* Withdrawal Summary */}
            <View className="mx-4 mt-4 bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 mb-4">
              <Text className="text-purple-400 font-semibold text-sm mb-2">{t("steps.summary")}</Text>
              <View className="flex-row justify-between">
                <Text className="text-purple-300 text-sm">{t("feeBreakdown.youReceive")}</Text>
                <Text className="text-white font-bold text-xl">${netAmount.toFixed(2)}</Text>
              </View>
            </View>

            {/* Destination Address Input */}
            <View className="mx-4 mb-6">
              <Text className="text-white font-semibold mb-2">{t("address.label")}</Text>
              <View className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
                <View className="flex-row items-center">
                  <TextInput
                    value={destinationAddress}
                    onChangeText={setDestinationAddress}
                    placeholder="0x..."
                    placeholderTextColor="#71717a"
                    autoCapitalize="none"
                    autoCorrect={false}
                    className="flex-1 px-4 py-3 text-white text-sm"
                  />
                  <TouchableOpacity
                    onPress={handlePasteAddress}
                    className="px-4 py-3 active:opacity-70"
                    accessibilityLabel={tAccessibility("actions.pasteAddress")}
                    accessibilityRole="button"
                  >
                    <ClipboardText size={20} color="#8b5cf6" weight="duotone" />
                  </TouchableOpacity>
                </View>
              </View>
              <Text className="text-zinc-500 text-xs mt-1">{t("address.description")}</Text>
              {destinationAddress.length > 0 && !isAddressValid && (
                <Text className="text-red-400 text-xs mt-1">{t("address.invalid")}</Text>
              )}
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
          </>
        )}
      </ScrollView>

      {/* Downrank Warning Modal */}
      <DownrankWarningModal
        visible={showDownrankModal}
        onClose={() => setShowDownrankModal(false)}
        onConfirm={submitWithdrawal}
        currentRank={currentRank}
        newRank={newRank}
        currentBalance={blockedBalance}
        balanceAfterWithdrawal={balanceAfterWithdrawal}
        minimumRequired={minRequired}
        currentDailyYield={currentDailyYield}
        newDailyYield={newDailyYield}
        willBeInactivated={wouldBeInactivated}
      />

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={handleSuccessClose}
      >
        <View className="flex-1 bg-black/80 justify-center items-center px-6">
          <View className="bg-zinc-950 rounded-3xl w-full max-w-md border-2 border-zinc-800/50 p-6">
            {/* Success Icon */}
            <View className="items-center mb-4">
              <View className="bg-green-500/20 p-4 rounded-full mb-4">
                <CheckCircle size={64} color="#22c55e" weight="fill" />
              </View>
              <Text className="text-white text-2xl font-black text-center mb-2">
                {t("success.title")}
              </Text>
              <Text className="text-zinc-400 text-sm text-center leading-6">
                {t("success.message")}
              </Text>
            </View>

            {/* Processing Time Info */}
            <View className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-4">
              <View className="flex-row items-center gap-2 mb-2">
                <Check size={18} color="#3b82f6" weight="bold" />
                <Text className="text-blue-400 font-semibold text-sm">
                  {t("processing.title")}
                </Text>
              </View>
              <Text className="text-blue-300 text-xs leading-5">
                {t("processing.description")}
              </Text>
            </View>

            {/* Close Button */}
            <TouchableOpacity
              onPress={handleSuccessClose}
              className="bg-purple-500 rounded-xl py-3.5 active:bg-purple-600"
              accessibilityLabel={tAccessibility("actions.closeModal")}
              accessibilityRole="button"
            >
              <Text className="text-white font-bold text-sm text-center">
                {t("common.ok")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
