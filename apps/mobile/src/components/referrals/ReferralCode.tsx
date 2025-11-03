import { View, Text, TouchableOpacity, Share } from "react-native";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";
import { Link, Copy, ShareNetwork } from "phosphor-react-native";
import * as Clipboard from "expo-clipboard";
import { useState } from "react";

interface ReferralCodeProps {
  referralCode: string; // e.g., "GREGORY123"
  referralLink: string; // e.g., "https://stakly.com/ref/GREGORY123"
}

export function ReferralCode({
  referralCode,
  referralLink,
}: ReferralCodeProps) {
  const { t } = useTranslation("referrals.referrals");
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await Clipboard.setStringAsync(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await Share.share({
        message: `Join Stakly and start earning! Use my referral code: ${referralCode}\n\n${referralLink}`,
        title: "Join Stakly",
      });
    } catch (error) {
      console.error("Share failed:", error);
    }
  };

  return (
    <View className="mx-4 mt-6">
      <Text className="text-white text-base font-semibold mb-4">
        {t("referralCode.title")}
      </Text>

      {/* Referral Code Card */}
      <View className="bg-gradient-to-br from-violet-500/20 to-blue-500/20 p-6 rounded-3xl border border-violet-500/30 mb-3">
        <View className="flex-row items-center gap-2 mb-3">
          <Link size={20} color="#8b5cf6" weight="bold" />
          <Text className="text-zinc-300 text-sm font-medium">
            {t("referralCode.shareCode")}
          </Text>
        </View>

        {/* Code Display */}
        <View className="bg-zinc-900 p-4 rounded-2xl mb-4">
          <Text className="text-violet-400 text-xs font-medium mb-1 text-center">
            {t("referralCode.referralCodeLabel")}
          </Text>
          <Text className="text-white text-3xl font-bold text-center tracking-wider">
            {referralCode}
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-2">
          {/* Copy Code */}
          <TouchableOpacity
            onPress={handleCopyCode}
            className="flex-1 bg-violet-500 py-3 rounded-xl flex-row items-center justify-center gap-2 active:scale-[0.98]"
            accessibilityLabel="Copy referral code"
          >
            <Copy size={18} color="#ffffff" weight="bold" />
            <Text className="text-white font-semibold text-sm">
              {copied ? t("referralCode.copied") : t("referralCode.copyCode")}
            </Text>
          </TouchableOpacity>

          {/* Share */}
          <TouchableOpacity
            onPress={handleShare}
            className="bg-zinc-800 py-3 px-4 rounded-xl active:scale-[0.98]"
            accessibilityLabel="Share referral link"
          >
            <ShareNetwork size={18} color="#8b5cf6" weight="bold" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Info */}
      <View className="mt-3 bg-blue-500/10 p-3 rounded-xl border border-blue-500/30">
        <Text className="text-blue-400 text-xs text-center">
          {t("referralCode.infoMessage")}
        </Text>
      </View>
    </View>
  );
}
