import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Lock, Wallet, TrendUp, Users, ArrowRight, Sparkle, Lightning, ShieldCheck, ChartLineUp, SignOut } from "phosphor-react"
import { useUserStatus } from "@/api/user/queries/use-user-status"
import { useAuthStore } from "@/stores/auth.store"

export function InactiveAccountScreen() {
  const navigate = useNavigate()
  const { t } = useTranslation("home.inactive")
  const { data: status, isLoading: isLoadingStatus } = useUserStatus()
  const { clearAuth } = useAuthStore()

  const totalDeposits = parseFloat(status?.totalDepositsUsd || "0")
  const threshold = parseFloat(status?.activationThreshold || "100")
  const remaining = Math.max(0, threshold - totalDeposits)
  const progress = status?.activationProgress || 0

  const handleDeposit = () => {
    navigate("/deposit")
  }

  const handleLogout = () => {
    clearAuth()
    navigate("/login")
  }

  if (isLoadingStatus) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-400 text-sm">{t("loading")}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-20 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-20 -right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-96 bg-gradient-to-t from-violet-500/5 to-transparent" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-12 relative z-10">
        {/* Status Badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/40">
            <Lock size={16} color="#eab308" weight="fill" />
            <span className="text-yellow-500 font-bold text-sm">
              {t("statusBadge")}
            </span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="flex flex-col items-center mb-12">
          <div className="relative w-32 h-32 mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/30 to-purple-600/30 rounded-full blur-2xl animate-pulse" />
            <div className="relative w-32 h-32 bg-gradient-to-br from-violet-500/20 to-purple-600/20 rounded-full flex items-center justify-center border border-violet-500/30 shadow-2xl">
              <Wallet size={64} color="#8b5cf6" weight="duotone" />
            </div>
          </div>

          <h1 className="text-white text-4xl font-black text-center mb-4 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            {t("hero.title")}
          </h1>

          <p className="text-zinc-400 text-center text-lg leading-7 mb-3 max-w-md">
            {t("hero.subtitle", { threshold: threshold.toFixed(0) })}
          </p>

          <div className="flex items-center gap-2 text-violet-400 text-center text-base font-semibold">
            <Sparkle size={20} weight="fill" />
            <p>{t("hero.tagline")}</p>
            <Sparkle size={20} weight="fill" />
          </div>
        </div>

        {/* Progress Card */}
        <div className="bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border border-zinc-800/60 rounded-3xl p-6 mb-6 shadow-2xl shadow-black/40">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold text-lg">
              {t("progress.title")}
            </h2>
            <div className="text-right">
              <p className="text-violet-400 font-black text-2xl">
                ${totalDeposits.toFixed(2)}
              </p>
              <p className="text-zinc-500 text-xs">
                {t("progress.of")} ${threshold.toFixed(0)}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative h-4 bg-zinc-800 rounded-full overflow-hidden mb-3 shadow-inner">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full transition-all duration-500 shadow-lg shadow-violet-500/50"
              style={{ width: `${progress}%` }}
            />
            <div
              className="absolute inset-y-0 left-0 bg-white/20 rounded-full animate-pulse"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="text-zinc-400 text-sm text-center font-medium">
            {remaining > 0
              ? t("progress.remaining", { remaining: remaining.toFixed(2) })
              : t("progress.activated")}
          </p>
        </div>

        {/* Deposit Button - Prominent CTA */}
        <button
          onClick={handleDeposit}
          className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 rounded-2xl py-5 px-6 flex items-center justify-center gap-3 mb-8 shadow-2xl shadow-violet-500/30 transition-all active:scale-95"
        >
          <Wallet size={28} color="#ffffff" weight="fill" />
          <span className="text-white font-black text-xl">
            {t("depositButton")}
          </span>
          <ArrowRight size={28} color="#ffffff" weight="bold" />
        </button>

        {/* Benefits */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Lightning size={24} color="#8b5cf6" weight="fill" />
            <h2 className="text-white font-black text-2xl text-center">
              {t("benefits.title")}
            </h2>
            <Lightning size={24} color="#8b5cf6" weight="fill" />
          </div>

          <div className="space-y-4">
            {/* Benefit 1 */}
            <div className="group bg-gradient-to-br from-zinc-900/90 to-zinc-900/50 border border-zinc-800/60 rounded-2xl p-5 flex items-start gap-4 shadow-2xl hover:shadow-violet-500/20 hover:scale-[1.02] hover:border-violet-500/40 transition-all duration-300">
              <div className="relative w-16 h-16 flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/30 to-purple-600/30 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
                <div className="relative w-16 h-16 bg-gradient-to-br from-violet-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center border border-violet-500/40 group-hover:border-violet-400/60 transition-colors">
                  <TrendUp size={32} color="#8b5cf6" weight="duotone" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-white font-bold text-lg">
                    {t("benefits.benefit1.title")}
                  </h3>
                  <ChartLineUp size={18} color="#10b981" weight="fill" />
                </div>
                <p className="text-zinc-400 text-sm leading-6 mb-2">
                  {t("benefits.benefit1.description")}
                </p>
                <div className="flex items-center gap-2 text-violet-400 text-xs font-semibold">
                  <Sparkle size={14} weight="fill" />
                  <span>{t("benefits.benefit1.badge")}</span>
                </div>
              </div>
            </div>

            {/* Benefit 2 */}
            <div className="group bg-gradient-to-br from-zinc-900/90 to-zinc-900/50 border border-zinc-800/60 rounded-2xl p-5 flex items-start gap-4 shadow-2xl hover:shadow-green-500/20 hover:scale-[1.02] hover:border-green-500/40 transition-all duration-300">
              <div className="relative w-16 h-16 flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/30 to-emerald-600/30 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
                <div className="relative w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-2xl flex items-center justify-center border border-green-500/40 group-hover:border-green-400/60 transition-colors">
                  <Users size={32} color="#10b981" weight="duotone" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-white font-bold text-lg">
                    {t("benefits.benefit2.title")}
                  </h3>
                  <TrendUp size={18} color="#10b981" weight="fill" />
                </div>
                <p className="text-zinc-400 text-sm leading-6 mb-2">
                  {t("benefits.benefit2.description")}
                </p>
                <div className="flex items-center gap-2 text-green-400 text-xs font-semibold">
                  <Lightning size={14} weight="fill" />
                  <span>{t("benefits.benefit2.badge")}</span>
                </div>
              </div>
            </div>

            {/* Benefit 3 */}
            <div className="group bg-gradient-to-br from-zinc-900/90 to-zinc-900/50 border border-zinc-800/60 rounded-2xl p-5 flex items-start gap-4 shadow-2xl hover:shadow-blue-500/20 hover:scale-[1.02] hover:border-blue-500/40 transition-all duration-300">
              <div className="relative w-16 h-16 flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-cyan-600/30 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
                <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500/20 to-cyan-600/20 rounded-2xl flex items-center justify-center border border-blue-500/40 group-hover:border-blue-400/60 transition-colors">
                  <Wallet size={32} color="#3b82f6" weight="duotone" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-white font-bold text-lg">
                    {t("benefits.benefit3.title")}
                  </h3>
                  <ShieldCheck size={18} color="#3b82f6" weight="fill" />
                </div>
                <p className="text-zinc-400 text-sm leading-6 mb-2">
                  {t("benefits.benefit3.description")}
                </p>
                <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold">
                  <ArrowRight size={14} weight="bold" />
                  <span>{t("benefits.benefit3.badge")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Footer */}
        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-2xl p-5 shadow-lg mb-6">
          <p className="text-blue-300 text-sm text-center leading-6 font-medium">
            {t("footer.info", { threshold: threshold.toFixed(0) })}
          </p>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full bg-zinc-900/50 hover:bg-zinc-800/50 border border-zinc-800 rounded-2xl py-4 px-6 flex items-center justify-center gap-3 transition-all active:scale-95"
        >
          <SignOut size={20} color="#ef4444" weight="bold" />
          <span className="text-red-400 font-semibold text-base">
            Sair da conta
          </span>
        </button>
      </div>
    </div>
  )
}
