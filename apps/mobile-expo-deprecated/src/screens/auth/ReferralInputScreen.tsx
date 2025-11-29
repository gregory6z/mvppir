import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { Users, ArrowRight, CheckCircle, XCircle, ArrowLeft } from "phosphor-react-native";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";
import { validateReferralCode } from "@/api/referral/client/referral.api"
import type { ReferralValidationResponse } from "@/api/referral/schemas/referral.schema"

const RANK_EMOJIS = {
  RECRUIT: "🎖️",
  BRONZE: "🥉",
  SILVER: "🥈",
  GOLD: "🥇",
};

interface ReferralInputScreenProps {
  onValidCode: (referrerId: string, referralCode: string) => void;
  onNavigateToLogin: () => void;
}

export function ReferralInputScreen({ onValidCode, onNavigateToLogin }: ReferralInputScreenProps) {
  const { t } = useTranslation("auth.referral");
  const [code, setCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ReferralValidationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleValidateCode = async () => {
    if (!code.trim()) {
      setError(t("errors.emptyCode"));
      return;
    }

    setIsValidating(true);
    setError(null);
    setValidationResult(null);

    try {
      const result = await validateReferralCode(code.trim().toUpperCase());

      setValidationResult(result);

      if (result.valid) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setError(result.message || t("errors.invalidCode"));
      }
    } catch (err) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(err instanceof Error ? err.message : t("errors.failedValidation"));
    } finally {
      setIsValidating(false);
    }
  };

  const handleContinue = () => {
    if (validationResult?.valid && validationResult.referrer) {
      onValidCode(validationResult.referrer.id, code.trim().toUpperCase());
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-950" edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-6 pt-12">
            {/* Header */}
            <View className="items-center mb-8">
              <View className="w-20 h-20 bg-violet-500/20 rounded-full items-center justify-center mb-4">
                <Users size={48} color="#8b5cf6" weight="duotone" />
              </View>
              <Text className="text-white text-3xl font-bold text-center mb-2">
                {t("welcome")}
              </Text>
              <Text className="text-zinc-400 text-base text-center">
                {t("title")}
              </Text>
            </View>

            {/* Referral Code Input */}
            <View className="mb-6">
              <Text className="text-zinc-300 text-sm font-medium mb-2">
                {t("fields.referralCode")}
              </Text>
              <View
                className={`flex-row items-center bg-zinc-900 border rounded-2xl px-4 ${
                  error
                    ? "border-red-500"
                    : validationResult?.valid
                      ? "border-green-500"
                      : "border-zinc-800"
                }`}
              >
                <TextInput
                  className="flex-1 text-white text-lg py-4 font-semibold"
                  placeholder={t("placeholders.referralCode")}
                  placeholderTextColor="#71717a"
                  value={code}
                  onChangeText={(text) => {
                    setCode(text.toUpperCase());
                    setError(null);
                    setValidationResult(null);
                  }}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  maxLength={20}
                  editable={!isValidating}
                  textAlignVertical="center"
                />
                {validationResult?.valid && (
                  <CheckCircle size={24} color="#10b981" weight="fill" />
                )}
                {error && <XCircle size={24} color="#ef4444" weight="fill" />}
              </View>

              {/* Error Message */}
              {error && (
                <Text className="text-red-500 text-sm mt-2">{error}</Text>
              )}

              {/* Validation Result */}
              {validationResult?.valid && validationResult.referrer && (
                <View className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 mt-4">
                  <View className="flex-row items-center gap-3 mb-2">
                    <CheckCircle size={20} color="#10b981" weight="fill" />
                    <Text className="text-green-500 font-semibold">
                      {t("success.validCode")}
                    </Text>
                  </View>
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className="text-zinc-400 text-xs mb-1">
                        {t("success.invitedBy")}
                      </Text>
                      <Text className="text-white font-semibold text-base">
                        {validationResult.referrer.name}
                      </Text>
                    </View>
                    <Text className="text-2xl">
                      {RANK_EMOJIS[validationResult.referrer.currentRank as keyof typeof RANK_EMOJIS] || "🎖️"}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Validate Button */}
            {!validationResult?.valid && (
              <TouchableOpacity
                onPress={handleValidateCode}
                disabled={isValidating || !code.trim()}
                className={`py-4 rounded-2xl mb-4 ${
                  isValidating || !code.trim()
                    ? "bg-zinc-800"
                    : "bg-violet-500 active:bg-violet-600"
                }`}
              >
                {isValidating ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="text-white text-center font-semibold text-base">
                    {t("buttons.validate")}
                  </Text>
                )}
              </TouchableOpacity>
            )}

            {/* Continue Button */}
            {validationResult?.valid && (
              <TouchableOpacity
                onPress={handleContinue}
                className="bg-violet-500 py-4 rounded-2xl flex-row items-center justify-center gap-2 active:bg-violet-600"
              >
                <Text className="text-white text-center font-semibold text-base">
                  {t("buttons.continue")}
                </Text>
                <ArrowRight size={20} color="#ffffff" weight="bold" />
              </TouchableOpacity>
            )}

            {/* Info */}
            <View className="mt-auto mb-4">
              <View className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4">
                <Text className="text-blue-400 text-sm text-center">
                  {t("info.requirement")}
                </Text>
              </View>
            </View>

            {/* Back to Login */}
            <View className="flex-row items-center justify-center mb-6">
              <Text className="text-zinc-400 text-sm">{t("links.alreadyHaveAccount")}</Text>
              <Pressable
                onPress={onNavigateToLogin}
                className="flex-row items-center ml-2 py-2 px-3"
                style={({ pressed }) => ({
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <ArrowLeft size={16} color="#8b5cf6" weight="bold" />
                <Text className="text-violet-500 text-sm font-semibold ml-1">
                  {t("links.backToLogin")}
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
