import { Modal, View, Text, ScrollView, TouchableOpacity } from "react-native"
import { useTranslation } from "react-i18next"
import { X, CalendarCheck, Users, TrendUp, CheckCircle, WarningCircle } from "phosphor-react-native"
import type { MLMRank } from "@/api/mlm/schemas/mlm.schema"

interface MonthlyMaintenanceModalProps {
  visible: boolean
  onClose: () => void
  currentRank: MLMRank
}

export function MonthlyMaintenanceModal({ visible, onClose, currentRank }: MonthlyMaintenanceModalProps) {
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
            <CalendarCheck size={24} color="#10b981" weight="duotone" />
            <Text className="text-white text-xl font-bold">
              {t("explainer.maintenance.title")}
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
          {/* Subtitle */}
          <View className="px-6 pt-6">
            <Text className="text-zinc-300 text-base text-center leading-6 mb-6">
              {t("explainer.maintenance.subtitle")}
            </Text>
          </View>

          {/* Current Rank Highlight */}
          <View className="px-6 mb-6">
            <View className="bg-violet-500/10 p-4 rounded-2xl border border-violet-500/30">
              <Text className="text-violet-400 text-sm font-semibold text-center">
                {t("monthlyMaintenance.yourCurrentRank")}
              </Text>
              <Text className="text-white text-2xl font-bold text-center mt-2">
                {currentRank === "RECRUIT" && "🎖️ "}
                {currentRank === "BRONZE" && "🥉 "}
                {currentRank === "SILVER" && "🥈 "}
                {currentRank === "GOLD" && "🥇 "}
                {t(`rankCard.ranks.${currentRank.toLowerCase()}`)}
              </Text>
            </View>
          </View>

          {/* Recruit - No Requirements */}
          {currentRank === "RECRUIT" ? (
            <View className="px-6 mb-6">
              <View className="bg-green-500/10 p-5 rounded-3xl border border-green-500/30">
                <View className="flex-row items-start gap-3">
                  <CheckCircle size={32} color="#10b981" weight="fill" />
                  <View className="flex-1">
                    <Text className="text-green-400 text-lg font-bold mb-2">
                      {t("explainer.maintenance.recruit.title")}
                    </Text>
                    <Text className="text-green-300/90 text-base leading-6">
                      {t("explainer.maintenance.recruit.description")}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ) : (
            /* Higher Ranks - Show Requirements */
            <View className="px-6">
              <Text className="text-white text-lg font-bold mb-4">
                {t("monthlyMaintenance.requirementsTitle")}
              </Text>

              {/* Requirement 1: Active Directs */}
              <View className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 mb-3">
                <View className="flex-row items-start gap-3">
                  <View className="w-12 h-12 bg-violet-500/20 rounded-xl items-center justify-center shrink-0">
                    <Users size={24} color="#8b5cf6" weight="duotone" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white text-base font-bold mb-2">
                      {t("explainer.maintenance.activeDirectsTitle")}
                    </Text>
                    <Text className="text-zinc-400 text-sm leading-5">
                      {t(`explainer.maintenance.${currentRank.toLowerCase()}.activeDirects`)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Requirement 2: Monthly Volume */}
              <View className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 mb-4">
                <View className="flex-row items-start gap-3">
                  <View className="w-12 h-12 bg-blue-500/20 rounded-xl items-center justify-center shrink-0">
                    <TrendUp size={24} color="#3b82f6" weight="duotone" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white text-base font-bold mb-2">
                      {t("monthlyMaintenance.networkVolumeTitle")}
                    </Text>
                    <Text className="text-zinc-400 text-sm leading-5 mb-3">
                      {t(`explainer.maintenance.${currentRank.toLowerCase()}.monthlyVolume`)}
                    </Text>
                    <View className="bg-blue-500/10 p-3 rounded-xl border border-blue-500/30">
                      <Text className="text-blue-400 text-xs leading-4">
                        💡 {t("monthlyMaintenance.volumeExplanation")}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* All Ranks - Info Section */}
          <View className="px-6 mt-2">
            <Text className="text-white text-lg font-bold mb-4">
              {t("monthlyMaintenance.importantInfo")}
            </Text>

            {/* What is network volume */}
            <View className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 mb-3">
              <Text className="text-violet-400 text-sm font-semibold mb-2">
                {t("monthlyMaintenance.whatIsVolumeTitle")}
              </Text>
              <Text className="text-zinc-300 text-sm leading-5">
                {t("explainer.maintenance.note")}
              </Text>
            </View>

            {/* Warning about downrank */}
            <View className="bg-orange-500/10 p-5 rounded-2xl border border-orange-500/30">
              <View className="flex-row items-start gap-3">
                <WarningCircle size={24} color="#f59e0b" weight="fill" />
                <View className="flex-1">
                  <Text className="text-orange-400 text-sm font-semibold mb-2">
                    {t("monthlyMaintenance.downrankWarningTitle")}
                  </Text>
                  <Text className="text-orange-300/90 text-sm leading-5">
                    {t("explainer.maintenance.warning")}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* All Ranks Comparison */}
          <View className="px-6 mt-6">
            <Text className="text-white text-lg font-bold mb-4">
              {t("monthlyMaintenance.allRanksTitle")}
            </Text>

            {/* Recruit */}
            <View className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 mb-3">
              <View className="flex-row items-center gap-2 mb-2">
                <Text className="text-2xl">🎖️</Text>
                <Text className="text-white text-base font-bold">
                  {t("rankCard.ranks.recruit")}
                </Text>
              </View>
              <Text className="text-green-400 text-sm">
                ✓ {t("explainer.maintenance.recruit.title")}
              </Text>
            </View>

            {/* Bronze */}
            <View className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 mb-3">
              <View className="flex-row items-center gap-2 mb-2">
                <Text className="text-2xl">🥉</Text>
                <Text className="text-white text-base font-bold">
                  {t("rankCard.ranks.bronze")}
                </Text>
              </View>
              <Text className="text-zinc-400 text-sm">
                • {t("explainer.maintenance.bronze.activeDirects")}
              </Text>
              <Text className="text-zinc-400 text-sm">
                • {t("explainer.maintenance.bronze.monthlyVolume")}
              </Text>
            </View>

            {/* Silver */}
            <View className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 mb-3">
              <View className="flex-row items-center gap-2 mb-2">
                <Text className="text-2xl">🥈</Text>
                <Text className="text-white text-base font-bold">
                  {t("rankCard.ranks.silver")}
                </Text>
              </View>
              <Text className="text-zinc-400 text-sm">
                • {t("explainer.maintenance.silver.activeDirects")}
              </Text>
              <Text className="text-zinc-400 text-sm">
                • {t("explainer.maintenance.silver.monthlyVolume")}
              </Text>
            </View>

            {/* Gold */}
            <View className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 mb-3">
              <View className="flex-row items-center gap-2 mb-2">
                <Text className="text-2xl">🥇</Text>
                <Text className="text-white text-base font-bold">
                  {t("rankCard.ranks.gold")}
                </Text>
              </View>
              <Text className="text-zinc-400 text-sm">
                • {t("explainer.maintenance.gold.activeDirects")}
              </Text>
              <Text className="text-zinc-400 text-sm">
                • {t("explainer.maintenance.gold.monthlyVolume")}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Close Button */}
        <View className="px-6 py-4 border-t border-zinc-800">
          <TouchableOpacity
            onPress={onClose}
            className="bg-green-500 py-4 rounded-xl active:bg-green-600"
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
