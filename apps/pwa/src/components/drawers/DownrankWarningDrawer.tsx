import { useTranslation } from "react-i18next"
import {
  Warning,
  TrendDown,
  CurrencyDollar,
  Lightning,
  ProhibitInset,
} from "phosphor-react"
import type { MLMRank } from "@/api/mlm/schemas"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"

interface DownrankWarningDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  currentRank: MLMRank
  newRank: MLMRank
  currentBalance: number
  balanceAfterWithdrawal: number
  minimumRequired: number
  currentDailyYield: number
  newDailyYield: number
  willBeInactivated?: boolean
}

const RANK_NAMES: Record<string, string> = {
  RECRUIT: "Recruit",
  BRONZE: "Bronze",
  SILVER: "Silver",
  GOLD: "Gold",
  INACTIVE: "Inactive",
}

const RANK_EMOJIS: Record<string, string> = {
  RECRUIT: "🏅",
  BRONZE: "🥉",
  SILVER: "🥈",
  GOLD: "🥇",
  INACTIVE: "⛔",
}

export function DownrankWarningDrawer({
  open,
  onOpenChange,
  onConfirm,
  currentRank,
  newRank,
  currentBalance,
  balanceAfterWithdrawal,
  minimumRequired,
  currentDailyYield,
  newDailyYield,
  willBeInactivated = false,
}: DownrankWarningDrawerProps) {
  const { t } = useTranslation("withdraw.withdraw")

  // If account will be inactivated, show INACTIVE instead of rank
  const displayNewRank = willBeInactivated ? "INACTIVE" : newRank
  const displayNewRankName = willBeInactivated
    ? t("modal.inactive")
    : RANK_NAMES[newRank]

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-6 border-b border-zinc-800/50 bg-gradient-to-b from-zinc-900/80 to-zinc-950">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
              <Warning size={28} color="#f59e0b" weight="fill" />
            </div>
          </div>
          <h2 className="text-white text-xl font-black text-center mb-1">
            {t("modal.title")}
          </h2>
          <p className="text-zinc-400 text-sm text-center">
            {willBeInactivated
              ? "Este saque resultará em inativação da conta"
              : "Este saque causará rebaixamento de rank"}
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-5 py-6">
          {/* Rank Change */}
          <div className="bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border border-zinc-800/60 rounded-2xl p-5 mb-4 shadow-xl shadow-black/20">
            <div className="flex items-center justify-center gap-6 mb-4">
              {/* Current Rank */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center mb-2 shadow-lg">
                  <span className="text-5xl">{RANK_EMOJIS[currentRank]}</span>
                </div>
                <p className="text-white font-bold text-sm">
                  {RANK_NAMES[currentRank]}
                </p>
              </div>

              {/* Arrow */}
              <div className="flex flex-col items-center">
                <TrendDown
                  size={32}
                  color={willBeInactivated ? "#ef4444" : "#f59e0b"}
                  weight="fill"
                />
              </div>

              {/* New Rank / Inactive */}
              <div className="text-center">
                <div className={`w-16 h-16 rounded-2xl ${
                  willBeInactivated
                    ? "bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30"
                    : "bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30"
                } flex items-center justify-center mb-2 shadow-lg`}>
                  <span className="text-5xl">{RANK_EMOJIS[displayNewRank]}</span>
                </div>
                <p className={`${willBeInactivated ? "text-red-400" : "text-orange-400"} font-bold text-sm`}>
                  {displayNewRankName}
                </p>
              </div>
            </div>

            <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-3">
              <p className="text-zinc-300 text-sm text-center font-medium">
                {t("modal.rankChange", {
                  from: RANK_NAMES[currentRank],
                  to: displayNewRankName,
                })}
              </p>
            </div>
          </div>

          {/* Balance Warning */}
          <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-2xl p-4 mb-4 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                <Warning size={20} color="#f87171" weight="fill" />
              </div>
              <p className="text-red-300 text-xs uppercase tracking-wide font-bold">
                {t("modal.balanceAfter")}
              </p>
            </div>
            <p className="text-white text-3xl font-black mb-2">
              ${balanceAfterWithdrawal.toFixed(2)}
            </p>
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2.5">
              <p className="text-red-300 text-sm font-semibold">
                Abaixo do mínimo de ${minimumRequired.toFixed(2)} necessário
              </p>
            </div>
          </div>

          {/* Long-term Impact - ALWAYS SHOW */}
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl p-5 mb-4 shadow-lg">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <CurrencyDollar size={20} color="#a855f7" weight="fill" />
              </div>
              <p className="text-purple-400 font-black text-base text-center">
                Impacto Financeiro de Longo Prazo
              </p>
            </div>

            {/* Monthly Loss */}
            <div className="bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/40 rounded-xl p-4 mb-3 shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-red-300 text-xs uppercase tracking-wide font-bold">
                  Perda Mensal
                </p>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <p className="text-red-400 font-black text-2xl">
                  -$
                  {(
                    ((currentBalance * currentDailyYield) / 100 -
                      (balanceAfterWithdrawal * newDailyYield) / 100) *
                    30
                  ).toFixed(2)}
                </p>
                <p className="text-red-400/70 font-bold text-base">
                  (
                  {(
                    ((((currentBalance * currentDailyYield) / 100 -
                      (balanceAfterWithdrawal * newDailyYield) / 100) *
                      30) /
                      currentBalance) *
                    100
                  ).toFixed(1)}
                  %)
                </p>
              </div>
              <p className="text-red-300/70 text-xs">
                Rendimento perdido por mês
              </p>
            </div>

            {/* Annual Loss */}
            <div className="bg-gradient-to-br from-red-600/20 to-red-700/10 border border-red-600/40 rounded-xl p-4 mb-3 shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-red-300 text-xs uppercase tracking-wide font-bold">
                  Perda Anual
                </p>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <p className="text-red-500 font-black text-3xl">
                  -$
                  {(
                    ((currentBalance * currentDailyYield) / 100 -
                      (balanceAfterWithdrawal * newDailyYield) / 100) *
                    365
                  ).toFixed(2)}
                </p>
                <p className="text-red-500/70 font-bold text-lg">
                  (
                  {(
                    ((((currentBalance * currentDailyYield) / 100 -
                      (balanceAfterWithdrawal * newDailyYield) / 100) *
                      30) /
                      currentBalance) *
                    100 *
                    12
                  ).toFixed(1)}
                  %)
                </p>
              </div>
              <p className="text-red-300/70 text-xs">
                Rendimento perdido por ano
              </p>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3">
              <div className="flex items-center gap-2">
                <Lightning size={16} color="#fbbf24" weight="fill" />
                <p className="text-yellow-300 text-xs leading-5 font-medium flex-1">
                  Essa perda será permanente enquanto você mantiver o rank inferior
                </p>
              </div>
            </div>
          </div>

          {/* Inactivation Warning */}
          {willBeInactivated && (
            <div className="bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/40 rounded-2xl p-4 mb-4 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/30 flex items-center justify-center">
                  <ProhibitInset size={20} color="#f87171" weight="fill" />
                </div>
                <p className="text-red-400 font-black text-base">
                  ⚠️ Conta Será Inativada
                </p>
              </div>
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                <p className="text-red-300 text-sm leading-6">
                  Com saldo bloqueado abaixo de $100, sua conta será <span className="font-bold">automaticamente inativada</span> e você perderá todos os benefícios e rendimentos.
                </p>
              </div>
            </div>
          )}

          {/* Info */}
          <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-4">
            <p className="text-zinc-300 text-sm text-center leading-6 font-medium">
              Tem certeza que deseja continuar com este saque?
            </p>
          </div>
        </div>

        {/* Fixed Actions at Bottom */}
        <DrawerFooter className="px-5 py-5 border-t border-zinc-800/50 bg-zinc-950/80 gap-3">
          <DrawerClose asChild>
            <Button
              onClick={onConfirm}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold text-base py-4 rounded-xl shadow-lg shadow-purple-500/20 transition-all active:scale-95"
            >
              {t("modal.confirmButton")}
            </Button>
          </DrawerClose>

          <DrawerClose asChild>
            <Button
              variant="outline"
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-base py-4 rounded-xl border border-zinc-700 shadow-md transition-all active:scale-95"
            >
              {t("modal.cancelButton")}
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
