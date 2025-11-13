import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Copy,
  CheckCircle,
  Warning,
  CurrencyCircleDollar,
  Clock,
} from "phosphor-react"
import { BottomNavigation } from "@/components/navigation/BottomNavigation"
import { useDepositAddress } from "@/api/user/queries/use-deposit-address"

export function DepositScreen() {
  const { t } = useTranslation("deposit.deposit")
  const navigate = useNavigate()
  const { data: depositAddress, isPending, isError } = useDepositAddress()
  const [copied, setCopied] = useState(false)

  const handleCopyAddress = async () => {
    if (!depositAddress) return

    try {
      await navigator.clipboard.writeText(depositAddress.polygonAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const handleBack = () => {
    navigate("/")
  }

  // Loading state
  if (isPending) {
    return (
      <div className="flex min-h-screen flex-col bg-zinc-950">
        <div className="flex-row items-center px-6 py-4 border-b border-zinc-800">
          <button
            onClick={handleBack}
            className="mr-3 w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-900 hover:bg-zinc-800"
          >
            <ArrowLeft size={20} color="#ffffff" weight="bold" />
          </button>
          <div className="flex-1">
            <h1 className="text-white text-2xl font-bold">{t("title")}</h1>
            <p className="text-zinc-400 text-sm mt-1">{t("subtitle")}</p>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500" />
        </div>
        <BottomNavigation />
      </div>
    )
  }

  // Error state
  if (isError || !depositAddress) {
    return (
      <div className="flex min-h-screen flex-col bg-zinc-950">
        <div className="flex-row items-center px-6 py-4 border-b border-zinc-800">
          <button
            onClick={handleBack}
            className="mr-3 w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-900 hover:bg-zinc-800"
          >
            <ArrowLeft size={20} color="#ffffff" weight="bold" />
          </button>
          <div className="flex-1">
            <h1 className="text-white text-2xl font-bold">{t("title")}</h1>
            <p className="text-zinc-400 text-sm mt-1">{t("subtitle")}</p>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center px-6">
          <p className="text-white text-base text-center">
            {t("errors.loadFailed")}
          </p>
        </div>
        <BottomNavigation />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      {/* Title Section with Back Button */}
      <div className="flex items-center px-6 py-5 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-sm sticky top-0 z-10">
        <button
          onClick={handleBack}
          className="mr-4 w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-800 transition-all shadow-lg shadow-black/20 active:scale-95"
        >
          <ArrowLeft size={24} color="#ffffff" weight="bold" />
        </button>
        <div className="flex-1">
          <h1 className="text-white text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-zinc-400 text-sm mt-0.5">{t("subtitle")}</p>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        {/* Network Warning */}
        <div className="mx-6 mt-6 bg-gradient-to-br from-orange-500/15 to-amber-500/15 border border-orange-500/40 p-4 rounded-2xl">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-orange-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <Warning size={24} color="#f97316" weight="fill" />
            </div>
            <div className="flex-1">
              <p className="text-orange-300 font-bold text-base mb-1">
                {t("network")}
              </p>
              <p className="text-orange-200/80 text-sm leading-5">
                {t("networkWarning")}
              </p>
            </div>
          </div>
        </div>

        {/* QR Code */}
        <div className="mx-6 mt-6 bg-gradient-to-br from-violet-500/10 to-blue-500/10 p-6 rounded-2xl border border-violet-500/30 flex flex-col items-center">
          <p className="text-white font-bold text-lg mb-4">
            {t("qrCode")}
          </p>
          <div className="bg-white p-5 rounded-2xl shadow-lg shadow-violet-500/20">
            <img
              src={depositAddress.qrCode}
              alt="QR Code"
              className="w-[220px] h-[220px]"
            />
          </div>
          <p className="text-violet-200 text-sm mt-4 text-center font-medium">
            {t("scanQR")}
          </p>
        </div>

        {/* Wallet Address */}
        <div className="mx-6 mt-4 bg-gradient-to-br from-zinc-900 to-zinc-900/80 p-5 rounded-2xl border border-zinc-800">
          <p className="text-white font-bold text-base mb-3">
            {t("address")}
          </p>
          <div className="bg-zinc-950 p-4 rounded-xl mb-4 border border-zinc-800">
            <p className="text-zinc-300 text-sm font-mono break-all leading-6">
              {depositAddress.polygonAddress}
            </p>
          </div>
          <button
            onClick={handleCopyAddress}
            className={`w-full flex items-center justify-center py-4 rounded-xl font-bold transition-all ${
              copied
                ? "bg-gradient-to-r from-green-500 to-emerald-500"
                : "bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-600 hover:to-blue-600"
            }`}
          >
            {copied ? (
              <>
                <CheckCircle size={22} color="#ffffff" weight="fill" />
                <span className="text-white ml-2 text-base">
                  {t("addressCopied")}
                </span>
              </>
            ) : (
              <>
                <Copy size={22} color="#ffffff" weight="bold" />
                <span className="text-white ml-2 text-base">
                  {t("copyAddress")}
                </span>
              </>
            )}
          </button>
        </div>

        {/* Supported Tokens */}
        <div className="mx-6 mt-4 bg-gradient-to-br from-zinc-900 to-zinc-900/80 p-5 rounded-2xl border border-zinc-800">
          <p className="text-white font-bold text-base mb-4">
            {t("supportedTokens.title")}
          </p>
          <div className="flex gap-3">
            <div className="flex-1 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/40 p-4 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-500/30 rounded-lg flex items-center justify-center">
                  <CurrencyCircleDollar size={20} color="#10b981" weight="bold" />
                </div>
                <span className="text-green-300 text-sm font-bold">
                  {t("supportedTokens.usdt")}
                </span>
              </div>
            </div>
            <div className="flex-1 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/40 p-4 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500/30 rounded-lg flex items-center justify-center">
                  <CurrencyCircleDollar size={20} color="#3b82f6" weight="bold" />
                </div>
                <span className="text-blue-300 text-sm font-bold">
                  {t("supportedTokens.usdc")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mx-6 mt-4 bg-gradient-to-br from-zinc-900 to-zinc-900/80 p-5 rounded-2xl border border-zinc-800">
          <p className="text-white font-bold text-base mb-4">
            {t("instructions.title")}
          </p>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">1</span>
              </div>
              <p className="text-zinc-300 text-sm flex-1 leading-6">
                {t("instructions.step1")}
              </p>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">2</span>
              </div>
              <p className="text-zinc-300 text-sm flex-1 leading-6">
                {t("instructions.step2")}
              </p>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">3</span>
              </div>
              <p className="text-zinc-300 text-sm flex-1 leading-6">
                {t("instructions.step3")}
              </p>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">4</span>
              </div>
              <p className="text-zinc-300 text-sm flex-1 leading-6">
                {t("instructions.step4")}
              </p>
            </div>
          </div>
        </div>

        {/* Warnings */}
        <div className="mx-6 mt-4 mb-6 bg-gradient-to-br from-red-500/15 to-orange-500/15 border border-red-500/40 p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Warning size={24} color="#ef4444" weight="fill" />
            <p className="text-red-300 font-bold text-base">
              {t("warnings.title")}
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3 bg-red-500/10 p-3 rounded-xl border border-red-500/30">
              <Warning size={20} color="#f87171" weight="fill" className="flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm flex-1 leading-5">
                {t("warnings.wrongNetwork")}
              </p>
            </div>
            <div className="flex items-start gap-3 bg-red-500/10 p-3 rounded-xl border border-red-500/30">
              <Warning size={20} color="#f87171" weight="fill" className="flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm flex-1 leading-5">
                {t("warnings.minDeposit")}
              </p>
            </div>
            <div className="flex items-start gap-3 bg-yellow-500/10 p-3 rounded-xl border border-yellow-500/30">
              <Clock size={20} color="#fbbf24" weight="fill" className="flex-shrink-0 mt-0.5" />
              <p className="text-yellow-300 text-sm flex-1 leading-5">
                {t("warnings.activation")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}
