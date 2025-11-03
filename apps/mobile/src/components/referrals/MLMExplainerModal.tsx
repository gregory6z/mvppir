import { Modal, View, Text, ScrollView, TouchableOpacity } from "react-native"
import { useTranslation } from "react-i18next"
import { X, Sparkle, TrendUp, Users, Coins, Robot } from "phosphor-react-native"

interface MLMExplainerModalProps {
  visible: boolean
  onClose: () => void
}

export function MLMExplainerModal({ visible, onClose }: MLMExplainerModalProps) {
  const { t } = useTranslation("referrals.referrals")

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-zinc-950">
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4 border-b border-zinc-800">
          <View className="flex-row items-center gap-2">
            <Sparkle size={24} color="#8b5cf6" weight="duotone" />
            <Text className="text-white text-xl font-bold">
              {t("explainer.title")}
            </Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            className="w-10 h-10 items-center justify-center rounded-full bg-zinc-800 active:bg-zinc-700"
            accessibilityLabel="Close"
          >
            <X size={20} color="#fff" weight="bold" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Hero Section */}
          <View className="px-6 pt-6 pb-4">
            <View className="bg-gradient-to-br from-violet-500/20 to-blue-500/20 p-6 rounded-3xl border border-violet-500/30">
              <View className="items-center mb-4">
                <View className="w-16 h-16 bg-violet-500/20 rounded-2xl items-center justify-center mb-3">
                  <Robot size={32} color="#8b5cf6" weight="duotone" />
                </View>
                <Text className="text-white text-2xl font-bold text-center">
                  {t("explainer.hero.title")}
                </Text>
              </View>
              <Text className="text-zinc-300 text-base text-center leading-6">
                {t("explainer.hero.description")}
              </Text>
            </View>
          </View>

          {/* How It Works */}
          <View className="px-6 mt-4">
            <Text className="text-white text-lg font-bold mb-4">
              {t("explainer.howItWorks.title")}
            </Text>

            {/* Step 1: Investment */}
            <View className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 mb-3">
              <View className="flex-row items-start gap-3">
                <View className="w-12 h-12 bg-violet-500/20 rounded-xl items-center justify-center shrink-0">
                  <Coins size={24} color="#8b5cf6" weight="duotone" />
                </View>
                <View className="flex-1">
                  <Text className="text-white text-base font-bold mb-2">
                    {t("explainer.howItWorks.step1.title")}
                  </Text>
                  <Text className="text-zinc-400 text-sm leading-5">
                    {t("explainer.howItWorks.step1.description")}
                  </Text>
                </View>
              </View>
            </View>

            {/* Step 2: Network */}
            <View className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 mb-3">
              <View className="flex-row items-start gap-3">
                <View className="w-12 h-12 bg-blue-500/20 rounded-xl items-center justify-center shrink-0">
                  <Users size={24} color="#3b82f6" weight="duotone" />
                </View>
                <View className="flex-1">
                  <Text className="text-white text-base font-bold mb-2">
                    {t("explainer.howItWorks.step2.title")}
                  </Text>
                  <Text className="text-zinc-400 text-sm leading-5">
                    {t("explainer.howItWorks.step2.description")}
                  </Text>
                </View>
              </View>
            </View>

            {/* Step 3: Earnings */}
            <View className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 mb-3">
              <View className="flex-row items-start gap-3">
                <View className="w-12 h-12 bg-green-500/20 rounded-xl items-center justify-center shrink-0">
                  <TrendUp size={24} color="#10b981" weight="duotone" />
                </View>
                <View className="flex-1">
                  <Text className="text-white text-base font-bold mb-2">
                    {t("explainer.howItWorks.step3.title")}
                  </Text>
                  <Text className="text-zinc-400 text-sm leading-5">
                    {t("explainer.howItWorks.step3.description")}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Ranks Breakdown */}
          <View className="px-6 mt-6">
            <Text className="text-white text-lg font-bold mb-4">
              {t("explainer.ranks.title")}
            </Text>

            {/* Recruit */}
            <View className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 mb-3">
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center gap-2">
                  <Text className="text-2xl">🎖️</Text>
                  <Text className="text-white text-base font-bold">
                    {t("rankCard.ranks.recruit")}
                  </Text>
                </View>
                <Text className="text-violet-400 text-sm font-bold">0.35% / dia</Text>
              </View>
              <Text className="text-zinc-400 text-sm">
                {t("explainer.ranks.recruit")}
              </Text>
            </View>

            {/* Bronze */}
            <View className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 mb-3">
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center gap-2">
                  <Text className="text-2xl">🥉</Text>
                  <Text className="text-white text-base font-bold">
                    {t("rankCard.ranks.bronze")}
                  </Text>
                </View>
                <Text className="text-violet-400 text-sm font-bold">1.05% / dia</Text>
              </View>
              <Text className="text-zinc-400 text-sm">
                {t("explainer.ranks.bronze")}
              </Text>
            </View>

            {/* Silver */}
            <View className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 mb-3">
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center gap-2">
                  <Text className="text-2xl">🥈</Text>
                  <Text className="text-white text-base font-bold">
                    {t("rankCard.ranks.silver")}
                  </Text>
                </View>
                <Text className="text-violet-400 text-sm font-bold">1.80% / dia</Text>
              </View>
              <Text className="text-zinc-400 text-sm">
                {t("explainer.ranks.silver")}
              </Text>
            </View>

            {/* Gold */}
            <View className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 mb-3">
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center gap-2">
                  <Text className="text-2xl">🥇</Text>
                  <Text className="text-white text-base font-bold">
                    {t("rankCard.ranks.gold")}
                  </Text>
                </View>
                <Text className="text-violet-400 text-sm font-bold">2.60% / dia</Text>
              </View>
              <Text className="text-zinc-400 text-sm">
                {t("explainer.ranks.gold")}
              </Text>
            </View>
          </View>

          {/* AI Agent Info */}
          <View className="px-6 mt-6">
            <View className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 p-5 rounded-2xl border border-violet-500/30">
              <View className="flex-row items-start gap-3">
                <View className="w-12 h-12 bg-violet-500/20 rounded-xl items-center justify-center shrink-0">
                  <Robot size={24} color="#8b5cf6" weight="duotone" />
                </View>
                <View className="flex-1">
                  <Text className="text-violet-300 text-base font-bold mb-2">
                    {t("explainer.ai.title")}
                  </Text>
                  <Text className="text-violet-200/80 text-sm leading-5">
                    {t("explainer.ai.description")}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Key Points */}
          <View className="px-6 mt-6">
            <Text className="text-white text-lg font-bold mb-4">
              {t("explainer.keyPoints.title")}
            </Text>
            <View className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800">
              <View className="flex-row items-start gap-3 mb-3">
                <Text className="text-violet-400 text-lg">•</Text>
                <Text className="text-zinc-300 text-sm leading-5 flex-1">
                  {t("explainer.keyPoints.point1")}
                </Text>
              </View>
              <View className="flex-row items-start gap-3 mb-3">
                <Text className="text-violet-400 text-lg">•</Text>
                <Text className="text-zinc-300 text-sm leading-5 flex-1">
                  {t("explainer.keyPoints.point2")}
                </Text>
              </View>
              <View className="flex-row items-start gap-3">
                <Text className="text-violet-400 text-lg">•</Text>
                <Text className="text-zinc-300 text-sm leading-5 flex-1">
                  {t("explainer.keyPoints.point3")}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Close Button */}
        <View className="px-6 py-4 border-t border-zinc-800">
          <TouchableOpacity
            onPress={onClose}
            className="bg-violet-500 py-4 rounded-xl active:bg-violet-600"
            accessibilityLabel="Close modal"
          >
            <Text className="text-white text-center font-bold text-base">
              {t("explainer.closeButton")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}
