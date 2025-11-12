import { useTranslation } from "react-i18next"
import { Trophy, TrendUp, Coins } from "phosphor-react"
import type { MLMRank } from "@/types/mlm"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer"

interface CommissionData {
  amount: number
  tokenSymbol: string
  rank: MLMRank
  date: string
}

interface CommissionDrawerProps {
  isOpen: boolean
  data: CommissionData | null
  onClose: () => void
}

const rankIcons: Record<MLMRank, string> = {
  RECRUIT: "🌱",
  BRONZE: "🥉",
  SILVER: "🥈",
  GOLD: "🥇",
}

const rankColors: Record<MLMRank, string> = {
  RECRUIT: "from-green-500/20 to-emerald-500/20 border-green-500/40",
  BRONZE: "from-orange-500/20 to-amber-500/20 border-orange-500/40",
  SILVER: "from-zinc-300/20 to-zinc-400/20 border-zinc-300/40",
  GOLD: "from-yellow-400/20 to-yellow-500/20 border-yellow-400/40",
}

export function CommissionDrawer({ isOpen, data, onClose }: CommissionDrawerProps) {
  const { t } = useTranslation("commission.drawer")

  if (!data) return null

  const rankColor = rankColors[data.rank]
  const rankIcon = rankIcons[data.rank]

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent>
        {/* Header with title */}
        <DrawerHeader className="text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Coins size={40} weight="duotone" className="text-yellow-400 animate-pulse" />
            <DrawerTitle className="text-3xl font-black text-white">
              {t("title")}
            </DrawerTitle>
          </div>
          <DrawerDescription className="text-base text-zinc-400">
            {t("subtitle")}
          </DrawerDescription>
        </DrawerHeader>

        {/* Content */}
        <div className="px-6 pb-8 pt-4 space-y-6 overflow-y-auto">
          {/* Amount Card */}
          <div className="bg-gradient-to-br from-violet-500/10 to-purple-600/10 border border-violet-500/30 rounded-2xl p-8 shadow-lg">
            <div className="text-center">
              <p className="text-zinc-400 text-sm mb-3">{t("amountLabel")}</p>
              <div className="flex items-center justify-center gap-3 mb-2">
                <span className="text-6xl font-black bg-gradient-to-r from-violet-400 to-purple-500 bg-clip-text text-transparent">
                  {data.amount.toFixed(2)}
                </span>
                <span className="text-3xl font-bold text-violet-400">{data.tokenSymbol}</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-green-400 text-base mt-3">
                <TrendUp size={18} weight="bold" />
                <span className="font-semibold">{t("credited")}</span>
              </div>
            </div>
          </div>

          {/* Rank Badge */}
          <div className={`bg-gradient-to-br ${rankColor} border rounded-2xl p-6`}>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl bg-zinc-900/50 flex items-center justify-center text-5xl">
                {rankIcon}
              </div>
              <div className="flex-1">
                <p className="text-zinc-400 text-sm mb-2">{t("yourRank")}</p>
                <div className="flex items-center gap-3">
                  <Trophy size={24} weight="fill" className="text-yellow-400" />
                  <span className="text-white text-xl font-bold">{t(`ranks.${data.rank}`)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Info Cards Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-5">
              <p className="text-zinc-500 text-sm mb-2">{t("frequency")}</p>
              <p className="text-white font-bold text-base">{t("daily")}</p>
            </div>
            <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-5">
              <p className="text-zinc-500 text-sm mb-2">{t("status")}</p>
              <p className="text-green-400 font-bold text-base">{t("paid")}</p>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-bold py-5 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-violet-500/25 text-base"
          >
            {t("viewDetails")}
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
