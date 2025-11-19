import { useTranslation } from "react-i18next"
import {
  X,
  Calendar,
  Users,
  TrendUp,
  CheckCircle,
  WarningCircle,
  Check,
} from "phosphor-react"
import type { MLMRank } from "@/api/mlm/schemas"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"

interface MonthlyMaintenanceDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRank: MLMRank
}

export function MonthlyMaintenanceDrawer({
  open,
  onOpenChange,
  currentRank,
}: MonthlyMaintenanceDrawerProps) {
  const { t } = useTranslation("referrals.referrals")

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        {/* Header */}
        <DrawerHeader className="flex flex-row items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Calendar size={24} color="#10b981" weight="duotone" />
            <DrawerTitle className="text-white text-xl font-bold">
              {t("explainer.maintenance.title")}
            </DrawerTitle>
          </div>
          <DrawerClose asChild>
            <button
              className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors"
              aria-label="Close"
            >
              <X size={20} color="#fff" weight="bold" />
            </button>
          </DrawerClose>
        </DrawerHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Subtitle */}
          <p className="text-zinc-300 text-base text-center leading-6 mb-6">
            {t("explainer.maintenance.subtitle")}
          </p>

          {/* Current Rank Highlight */}
          <div className={`p-5 rounded-2xl border mb-6 ${
            currentRank === "RECRUIT"
              ? "bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/40"
              : currentRank === "BRONZE"
              ? "bg-gradient-to-br from-orange-500/20 to-amber-600/20 border-orange-500/40"
              : currentRank === "SILVER"
              ? "bg-gradient-to-br from-zinc-400/20 to-slate-400/20 border-zinc-400/40"
              : "bg-gradient-to-br from-yellow-500/20 to-amber-400/20 border-yellow-500/40"
          }`}>
            <p className={`text-sm font-semibold text-center ${
              currentRank === "RECRUIT" ? "text-green-400"
              : currentRank === "BRONZE" ? "text-orange-400"
              : currentRank === "SILVER" ? "text-zinc-300"
              : "text-yellow-400"
            }`}>
              {t("monthlyMaintenance.yourCurrentRank")}
            </p>
            <p className="text-white text-3xl font-bold text-center mt-2">
              {currentRank === "RECRUIT" && "🎖️ "}
              {currentRank === "BRONZE" && "🥉 "}
              {currentRank === "SILVER" && "🥈 "}
              {currentRank === "GOLD" && "🥇 "}
              {t(`rankCard.ranks.${currentRank.toLowerCase()}`)}
            </p>
          </div>

          {/* Recruit - No Requirements */}
          {currentRank === "RECRUIT" ? (
            <div className="bg-gradient-to-br from-green-500/15 to-emerald-500/15 p-5 rounded-2xl border border-green-500/40 mb-6">
              <div className="flex items-start gap-3">
                <CheckCircle size={32} color="#10b981" weight="fill" />
                <div className="flex-1">
                  <h3 className="text-green-400 text-lg font-bold mb-2">
                    {t("explainer.maintenance.recruit.title")}
                  </h3>
                  <p className="text-green-200/90 text-base leading-6">
                    {t("explainer.maintenance.recruit.description")}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Higher Ranks - Show Requirements */
            <div className="mb-6">
              <h3 className="text-white text-lg font-bold mb-4">
                {t("monthlyMaintenance.requirementsTitle")}
              </h3>

              {/* Requirement 1: Active Directs */}
              <div className={`p-5 rounded-2xl border mb-3 ${
                currentRank === "BRONZE"
                  ? "bg-gradient-to-br from-orange-500/10 to-amber-600/10 border-orange-500/30"
                  : currentRank === "SILVER"
                  ? "bg-gradient-to-br from-zinc-400/10 to-slate-400/10 border-zinc-400/30"
                  : "bg-gradient-to-br from-yellow-500/10 to-amber-400/10 border-yellow-500/30"
              }`}>
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    currentRank === "BRONZE"
                      ? "bg-orange-500/20"
                      : currentRank === "SILVER"
                      ? "bg-zinc-400/20"
                      : "bg-yellow-500/20"
                  }`}>
                    <Users size={24} color={
                      currentRank === "BRONZE" ? "#f97316"
                      : currentRank === "SILVER" ? "#a1a1aa"
                      : "#eab308"
                    } weight="duotone" />
                  </div>
                  <div className="flex-1">
                    <h4 className={`text-base font-bold mb-2 ${
                      currentRank === "BRONZE" ? "text-orange-300"
                      : currentRank === "SILVER" ? "text-zinc-200"
                      : "text-yellow-300"
                    }`}>
                      {t("monthlyMaintenance.activeDirectsTitle")}
                    </h4>
                    <p className={`text-sm leading-5 ${
                      currentRank === "BRONZE" ? "text-orange-200/80"
                      : currentRank === "SILVER" ? "text-zinc-300/80"
                      : "text-yellow-200/80"
                    }`}>
                      {t(
                        `explainer.maintenance.${currentRank.toLowerCase()}.activeDirects`
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Requirement 2: Monthly Volume */}
              <div className={`p-5 rounded-2xl border mb-4 ${
                currentRank === "BRONZE"
                  ? "bg-gradient-to-br from-orange-500/10 to-amber-600/10 border-orange-500/30"
                  : currentRank === "SILVER"
                  ? "bg-gradient-to-br from-zinc-400/10 to-slate-400/10 border-zinc-400/30"
                  : "bg-gradient-to-br from-yellow-500/10 to-amber-400/10 border-yellow-500/30"
              }`}>
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    currentRank === "BRONZE"
                      ? "bg-orange-500/20"
                      : currentRank === "SILVER"
                      ? "bg-zinc-400/20"
                      : "bg-yellow-500/20"
                  }`}>
                    <TrendUp size={24} color={
                      currentRank === "BRONZE" ? "#f97316"
                      : currentRank === "SILVER" ? "#a1a1aa"
                      : "#eab308"
                    } weight="duotone" />
                  </div>
                  <div className="flex-1">
                    <h4 className={`text-base font-bold mb-2 ${
                      currentRank === "BRONZE" ? "text-orange-300"
                      : currentRank === "SILVER" ? "text-zinc-200"
                      : "text-yellow-300"
                    }`}>
                      {t("monthlyMaintenance.networkVolumeTitle")}
                    </h4>
                    <p className={`text-sm leading-5 mb-3 ${
                      currentRank === "BRONZE" ? "text-orange-200/80"
                      : currentRank === "SILVER" ? "text-zinc-300/80"
                      : "text-yellow-200/80"
                    }`}>
                      {t(
                        `explainer.maintenance.${currentRank.toLowerCase()}.monthlyVolume`
                      )}
                    </p>
                    <div className={`p-3 rounded-xl border ${
                      currentRank === "BRONZE"
                        ? "bg-orange-500/10 border-orange-500/30"
                        : currentRank === "SILVER"
                        ? "bg-zinc-400/10 border-zinc-400/30"
                        : "bg-yellow-500/10 border-yellow-500/30"
                    }`}>
                      <p className={`text-xs leading-4 ${
                        currentRank === "BRONZE" ? "text-orange-300"
                        : currentRank === "SILVER" ? "text-zinc-200"
                        : "text-yellow-300"
                      }`}>
                        💡 {t("monthlyMaintenance.volumeExplanation")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* All Ranks - Info Section */}
          <div className="mb-6">
            <h3 className="text-white text-lg font-bold mb-4">
              {t("monthlyMaintenance.importantInfo")}
            </h3>

            {/* What is network volume */}
            <div className="bg-gradient-to-br from-blue-500/15 to-violet-500/15 p-5 rounded-2xl border border-blue-500/40 mb-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">💡</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-blue-300 text-base font-bold mb-2">
                    {t("monthlyMaintenance.whatIsVolumeTitle")}
                  </h4>
                  <p className="text-blue-200/80 text-sm leading-5">
                    {t("explainer.maintenance.note")}
                  </p>
                </div>
              </div>
            </div>

            {/* Warning about downrank */}
            <div className="bg-gradient-to-br from-red-500/15 to-orange-500/15 p-5 rounded-2xl border border-red-500/40">
              <div className="flex items-start gap-3">
                <WarningCircle size={28} color="#f97316" weight="fill" />
                <div className="flex-1">
                  <h4 className="text-orange-300 text-base font-bold mb-2">
                    {t("monthlyMaintenance.downrankWarningTitle")}
                  </h4>
                  <p className="text-orange-200/80 text-sm leading-5">
                    {t("explainer.maintenance.warning")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* All Ranks Comparison */}
          <div className="mb-6">
            <h3 className="text-white text-lg font-bold mb-4">
              {t("monthlyMaintenance.allRanksTitle")}
            </h3>

            {/* Recruit */}
            <div className={`p-4 rounded-2xl border mb-3 ${
              currentRank === "RECRUIT"
                ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/40"
                : "bg-zinc-900/50 border-zinc-800"
            }`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl">🎖️</span>
                </div>
                <span className={`text-lg font-bold ${
                  currentRank === "RECRUIT" ? "text-green-400" : "text-white"
                }`}>
                  {t("rankCard.ranks.recruit")}
                </span>
              </div>
              <div className="bg-green-500/10 p-3 rounded-xl border border-green-500/30">
                <p className="text-green-400 text-sm font-semibold">
                  ✓ {t("explainer.maintenance.recruit.title")}
                </p>
              </div>
            </div>

            {/* Bronze */}
            <div className={`p-4 rounded-2xl border mb-3 ${
              currentRank === "BRONZE"
                ? "bg-gradient-to-r from-orange-500/20 to-amber-600/20 border-orange-500/40"
                : "bg-zinc-900/50 border-zinc-800"
            }`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl">🥉</span>
                </div>
                <span className={`text-lg font-bold ${
                  currentRank === "BRONZE" ? "text-orange-400" : "text-white"
                }`}>
                  {t("rankCard.ranks.bronze")}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-orange-400 text-sm">•</span>
                  <p className={`text-sm flex-1 ${
                    currentRank === "BRONZE" ? "text-orange-200" : "text-zinc-400"
                  }`}>
                    {t("explainer.maintenance.bronze.activeDirects")}
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-orange-400 text-sm">•</span>
                  <p className={`text-sm flex-1 ${
                    currentRank === "BRONZE" ? "text-orange-200" : "text-zinc-400"
                  }`}>
                    {t("explainer.maintenance.bronze.monthlyVolume")}
                  </p>
                </div>
              </div>
            </div>

            {/* Silver */}
            <div className={`p-4 rounded-2xl border mb-3 ${
              currentRank === "SILVER"
                ? "bg-gradient-to-r from-zinc-400/20 to-slate-400/20 border-zinc-400/40"
                : "bg-zinc-900/50 border-zinc-800"
            }`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-zinc-400/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl">🥈</span>
                </div>
                <span className={`text-lg font-bold ${
                  currentRank === "SILVER" ? "text-zinc-300" : "text-white"
                }`}>
                  {t("rankCard.ranks.silver")}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-zinc-400 text-sm">•</span>
                  <p className={`text-sm flex-1 ${
                    currentRank === "SILVER" ? "text-zinc-200" : "text-zinc-400"
                  }`}>
                    {t("explainer.maintenance.silver.activeDirects")}
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-zinc-400 text-sm">•</span>
                  <p className={`text-sm flex-1 ${
                    currentRank === "SILVER" ? "text-zinc-200" : "text-zinc-400"
                  }`}>
                    {t("explainer.maintenance.silver.monthlyVolume")}
                  </p>
                </div>
              </div>
            </div>

            {/* Gold */}
            <div className={`p-4 rounded-2xl border mb-3 ${
              currentRank === "GOLD"
                ? "bg-gradient-to-r from-yellow-500/20 to-amber-400/20 border-yellow-500/40"
                : "bg-zinc-900/50 border-zinc-800"
            }`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl">🥇</span>
                </div>
                <span className={`text-lg font-bold ${
                  currentRank === "GOLD" ? "text-yellow-400" : "text-white"
                }`}>
                  {t("rankCard.ranks.gold")}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-yellow-400 text-sm">•</span>
                  <p className={`text-sm flex-1 ${
                    currentRank === "GOLD" ? "text-yellow-200" : "text-zinc-400"
                  }`}>
                    {t("explainer.maintenance.gold.activeDirects")}
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-yellow-400 text-sm">•</span>
                  <p className={`text-sm flex-1 ${
                    currentRank === "GOLD" ? "text-yellow-200" : "text-zinc-400"
                  }`}>
                    {t("explainer.maintenance.gold.monthlyVolume")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Close Button */}
        <DrawerFooter className="px-6 py-4 border-t border-zinc-800">
          <DrawerClose asChild>
            <Button className="w-full bg-violet-500 hover:bg-violet-600 text-white font-bold text-base py-4 rounded-xl transition-colors flex items-center justify-center gap-2">
              <Check size={20} weight="bold" />
              {t("explainer.closeButton")}
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
