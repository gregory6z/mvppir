import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { ArrowLeft, Users, TrendUp, CurrencyCircleDollar } from "phosphor-react"
import { useUserReferralLink } from "@/api/user/queries/use-user-referral-link"
import { ReferralCode } from "@/components/network/ReferralCode"

export function ReferScreen() {
  const navigate = useNavigate()
  const { t } = useTranslation("referrals.referrals")
  const { data, isLoading } = useUserReferralLink()

  const handleBack = () => {
    navigate(-1)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-zinc-950">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 backdrop-blur-lg border-b border-zinc-800/50">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={handleBack}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-800/50 hover:bg-zinc-700/50 transition-colors"
            >
              <ArrowLeft size={20} color="#fff" weight="bold" />
            </button>
            <h1 className="text-white text-lg font-bold">{t("referralCode.title")}</h1>
            <div className="w-10" />
          </div>
        </div>

        {/* Loading State */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex min-h-screen flex-col bg-zinc-950">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 backdrop-blur-lg border-b border-zinc-800/50">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={handleBack}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-800/50 hover:bg-zinc-700/50 transition-colors"
            >
              <ArrowLeft size={20} color="#fff" weight="bold" />
            </button>
            <h1 className="text-white text-lg font-bold">{t("referralCode.title")}</h1>
            <div className="w-10" />
          </div>
        </div>

        {/* Error State */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <p className="text-red-400 text-base">{t("screen.errorLoading")}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 backdrop-blur-lg border-b border-zinc-800/50">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={handleBack}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-800/50 hover:bg-zinc-700/50 transition-colors"
          >
            <ArrowLeft size={20} color="#fff" weight="bold" />
          </button>
          <h1 className="text-white text-lg font-bold">{t("referralCode.title")}</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-8">
        {/* Hero Section */}
        <div className="px-6 pt-6 pb-4">
          <div className="relative">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-blue-500/10 blur-3xl rounded-3xl" />

            {/* Content */}
            <div className="relative bg-gradient-to-br from-zinc-900/80 to-zinc-800/50 border border-zinc-800/50 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Users size={24} color="#fff" weight="bold" />
                </div>
                <div>
                  <h2 className="text-white text-xl font-bold">
                    {t("explainer.hero.title")}
                  </h2>
                </div>
              </div>
              <p className="text-zinc-300 text-sm leading-relaxed">
                {t("referralCode.infoMessage")}
              </p>
            </div>
          </div>
        </div>

        {/* Referral Code Component */}
        <ReferralCode referralCode={data.referralCode} referralLink={data.referralLink} />

        {/* How It Works */}
        <div className="px-6 mt-8">
          <h3 className="text-white text-lg font-bold mb-4">
            {t("explainer.howItWorks.title")}
          </h3>

          <div className="space-y-3">
            {/* Step 1 */}
            <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-violet-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users size={20} className="text-violet-500" weight="bold" />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-semibold text-sm mb-1">
                    {t("explainer.howItWorks.step2.title")}
                  </h4>
                  <p className="text-zinc-400 text-xs leading-relaxed">
                    {t("explainer.howItWorks.step2.description")}
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CurrencyCircleDollar size={20} className="text-green-500" weight="bold" />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-semibold text-sm mb-1">
                    {t("explainer.howItWorks.step1.title")}
                  </h4>
                  <p className="text-zinc-400 text-xs leading-relaxed">
                    {t("explainer.howItWorks.step1.description")}
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <TrendUp size={20} className="text-blue-500" weight="bold" />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-semibold text-sm mb-1">
                    {t("explainer.howItWorks.step3.title")}
                  </h4>
                  <p className="text-zinc-400 text-xs leading-relaxed">
                    {t("explainer.howItWorks.step3.description")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="px-6 mt-8">
          <div className="bg-gradient-to-br from-violet-500/20 to-purple-600/20 border border-violet-500/30 rounded-2xl p-6">
            <h4 className="text-white font-bold text-center mb-2">
              Comece a Ganhar Hoje!
            </h4>
            <p className="text-violet-200 text-sm text-center leading-relaxed">
              Compartilhe seu código e construa sua rede. Quanto mais pessoas você convidar, maiores serão seus ganhos.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
