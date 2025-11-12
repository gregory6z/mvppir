import { useTranslation } from "react-i18next"
import { X, Sparkle, TrendUp, Users, Coin, Robot } from "phosphor-react"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"

interface MLMExplainerDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MLMExplainerDrawer({
  open,
  onOpenChange,
}: MLMExplainerDrawerProps) {
  const { t } = useTranslation("referrals.referrals")

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        {/* Header */}
        <DrawerHeader className="flex flex-row items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Sparkle size={24} color="#8b5cf6" weight="duotone" />
            <DrawerTitle className="text-white text-xl font-bold">
              {t("explainer.title")}
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
          {/* Hero Section */}
          <div className="mb-6">
            <div className="bg-gradient-to-br from-violet-500/20 to-blue-500/20 p-6 rounded-3xl border border-violet-500/30">
              <div className="flex flex-col items-center mb-4">
                <div className="w-16 h-16 bg-violet-500/20 rounded-2xl flex items-center justify-center mb-3">
                  <Robot size={32} color="#8b5cf6" weight="duotone" />
                </div>
                <h2 className="text-white text-2xl font-bold text-center">
                  {t("explainer.hero.title")}
                </h2>
              </div>
              <p className="text-zinc-300 text-base text-center leading-6">
                {t("explainer.hero.description")}
              </p>
            </div>
          </div>

          {/* How It Works */}
          <div className="mb-6">
            <h3 className="text-white text-lg font-bold mb-4">
              {t("explainer.howItWorks.title")}
            </h3>

            {/* Step 1: Investment */}
            <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 mb-3">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Coin size={24} color="#8b5cf6" weight="duotone" />
                </div>
                <div className="flex-1">
                  <h4 className="text-white text-base font-bold mb-2">
                    {t("explainer.howItWorks.step1.title")}
                  </h4>
                  <p className="text-zinc-400 text-sm leading-5">
                    {t("explainer.howItWorks.step1.description")}
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2: Network */}
            <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 mb-3">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users size={24} color="#3b82f6" weight="duotone" />
                </div>
                <div className="flex-1">
                  <h4 className="text-white text-base font-bold mb-2">
                    {t("explainer.howItWorks.step2.title")}
                  </h4>
                  <p className="text-zinc-400 text-sm leading-5">
                    {t("explainer.howItWorks.step2.description")}
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3: Earnings */}
            <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 mb-3">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <TrendUp size={24} color="#10b981" weight="duotone" />
                </div>
                <div className="flex-1">
                  <h4 className="text-white text-base font-bold mb-2">
                    {t("explainer.howItWorks.step3.title")}
                  </h4>
                  <p className="text-zinc-400 text-sm leading-5">
                    {t("explainer.howItWorks.step3.description")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Ranks Breakdown */}
          <div className="mb-6">
            <h3 className="text-white text-lg font-bold mb-4">
              {t("explainer.ranks.title")}
            </h3>

            {/* Recruit */}
            <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 mb-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🎖️</span>
                  <span className="text-white text-base font-bold">
                    {t("rankCard.ranks.recruit")}
                  </span>
                </div>
                <span className="text-violet-400 text-sm font-bold">
                  0.35% / dia
                </span>
              </div>
              <p className="text-zinc-400 text-sm">
                {t("explainer.ranks.recruit")}
              </p>
            </div>

            {/* Bronze */}
            <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 mb-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🥉</span>
                  <span className="text-white text-base font-bold">
                    {t("rankCard.ranks.bronze")}
                  </span>
                </div>
                <span className="text-violet-400 text-sm font-bold">
                  1.05% / dia
                </span>
              </div>
              <p className="text-zinc-400 text-sm">
                {t("explainer.ranks.bronze")}
              </p>
            </div>

            {/* Silver */}
            <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 mb-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🥈</span>
                  <span className="text-white text-base font-bold">
                    {t("rankCard.ranks.silver")}
                  </span>
                </div>
                <span className="text-violet-400 text-sm font-bold">
                  1.80% / dia
                </span>
              </div>
              <p className="text-zinc-400 text-sm">
                {t("explainer.ranks.silver")}
              </p>
            </div>

            {/* Gold */}
            <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 mb-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🥇</span>
                  <span className="text-white text-base font-bold">
                    {t("rankCard.ranks.gold")}
                  </span>
                </div>
                <span className="text-violet-400 text-sm font-bold">
                  2.60% / dia
                </span>
              </div>
              <p className="text-zinc-400 text-sm">
                {t("explainer.ranks.gold")}
              </p>
            </div>
          </div>

          {/* AI Agent Info */}
          <div className="mb-6">
            <div className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 p-5 rounded-2xl border border-violet-500/30">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Robot size={24} color="#8b5cf6" weight="duotone" />
                </div>
                <div className="flex-1">
                  <h4 className="text-violet-300 text-base font-bold mb-2">
                    {t("explainer.ai.title")}
                  </h4>
                  <p className="text-violet-200/80 text-sm leading-5">
                    {t("explainer.ai.description")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Key Points */}
          <div className="mb-6">
            <h3 className="text-white text-lg font-bold mb-4">
              {t("explainer.keyPoints.title")}
            </h3>
            <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800">
              <div className="flex items-start gap-3 mb-3">
                <span className="text-violet-400 text-lg">•</span>
                <p className="text-zinc-300 text-sm leading-5 flex-1">
                  {t("explainer.keyPoints.point1")}
                </p>
              </div>
              <div className="flex items-start gap-3 mb-3">
                <span className="text-violet-400 text-lg">•</span>
                <p className="text-zinc-300 text-sm leading-5 flex-1">
                  {t("explainer.keyPoints.point2")}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-violet-400 text-lg">•</span>
                <p className="text-zinc-300 text-sm leading-5 flex-1">
                  {t("explainer.keyPoints.point3")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Close Button */}
        <DrawerFooter className="px-6 py-4 border-t border-zinc-800">
          <DrawerClose asChild>
            <Button className="w-full bg-violet-500 hover:bg-violet-600 text-white font-bold text-base py-4 rounded-xl">
              {t("explainer.closeButton")}
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
