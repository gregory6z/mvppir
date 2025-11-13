import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  CheckCircle,
  Warning,
  CurrencyDollar,
  Clipboard,
  ArrowRight,
  Wallet,
} from "phosphor-react"
import { BottomNavigation } from "@/components/navigation/BottomNavigation"
import { useUserBalance } from "@/api/user/queries/use-user-balance"
import { useCalculateWithdrawalFee } from "@/api/withdrawal/queries/use-calculate-withdrawal-fee"
import { useRequestWithdrawal } from "@/api/withdrawal/queries/use-request-withdrawal"
import { useMLMProfile } from "@/api/mlm/queries/use-mlm-profile"
import { DownrankWarningDrawer } from "@/components/drawers/DownrankWarningDrawer"
import type { MLMRank } from "@/api/mlm/schemas"

type Step = 1 | 2

// Helper function to calculate new rank based on blocked balance
function calculateNewRank(balance: number): MLMRank {
  if (balance >= 10000) return "GOLD"
  if (balance >= 1000) return "SILVER"
  if (balance >= 100) return "BRONZE"
  return "RECRUIT"
}

export function WithdrawScreen() {
  const { t } = useTranslation("withdraw.withdraw")
  const navigate = useNavigate()
  const { data: balanceData } = useUserBalance()
  const { data: mlmProfile } = useMLMProfile()

  // Get available balance - use totalUSD as it represents total withdrawable amount
  const availableBalance = balanceData?.totalUSD || 0

  // Form state
  const [step, setStep] = useState<Step>(1)
  const [amount, setAmount] = useState("")
  const [address, setAddress] = useState("")
  const [amountError, setAmountError] = useState("")
  const [addressError, setAddressError] = useState("")

  // Drawer state
  const [downrankDrawerOpen, setDownrankDrawerOpen] = useState(false)

  // Modal state
  const [successModalOpen, setSuccessModalOpen] = useState(false)

  // API hooks
  const numericAmount = parseFloat(amount) || 0
  const { data: feeData, isPending: isCalculatingFee } =
    useCalculateWithdrawalFee(numericAmount, step === 1 && numericAmount > 0)
  const requestWithdrawalMutation = useRequestWithdrawal()

  // MLM calculations for downrank warning
  const currentRank = mlmProfile?.user.currentRank || "RECRUIT"
  const blockedBalance = mlmProfile?.user.blockedBalance || 0
  const minRequired = mlmProfile?.currentRankRequirements.maintenance.blockedBalance.required || 0
  const currentDailyYield = mlmProfile?.commissionRates.N0 || 0

  // Calculate if withdrawal would cause downrank
  const balanceAfterWithdrawal = blockedBalance - numericAmount
  const newRank = calculateNewRank(balanceAfterWithdrawal)
  const wouldCauseDownrank = balanceAfterWithdrawal < minRequired && minRequired > 0
  const wouldBeInactivated = balanceAfterWithdrawal < 100

  // Calculate new yield (hardcoded for now, backend should provide this)
  const yieldsByRank: Record<MLMRank, number> = {
    RECRUIT: 0.1,
    BRONZE: 0.125,
    SILVER: 0.15,
    GOLD: 0.175,
  }
  const newDailyYield = yieldsByRank[newRank] || 0

  const handleBack = () => {
    if (step === 2) {
      setStep(1)
      setAddress("")
      setAddressError("")
    } else {
      navigate("/")
    }
  }

  const validateAmount = (): boolean => {
    setAmountError("")

    if (!amount || numericAmount <= 0) {
      setAmountError(t("errors.amountRequired"))
      return false
    }

    if (!feeData) {
      setAmountError(t("errors.calculatingFee"))
      return false
    }

    // Backend handles balance validation including blocked balance auto-unblocking
    return true
  }

  const handleContinueToAddress = () => {
    if (!validateAmount()) return

    // Show downrank warning if applicable
    if (wouldCauseDownrank || wouldBeInactivated) {
      setDownrankDrawerOpen(true)
    } else {
      setStep(2)
    }
  }

  const handleDownrankConfirm = () => {
    setDownrankDrawerOpen(false)
    setStep(2)
  }

  const validateAddress = (): boolean => {
    setAddressError("")

    if (!address) {
      setAddressError(t("errors.addressRequired"))
      return false
    }

    // Validate Ethereum address format (0x followed by 40 hex characters)
    const addressRegex = /^0x[a-fA-F0-9]{40}$/
    if (!addressRegex.test(address)) {
      setAddressError(t("errors.invalidAddress"))
      return false
    }

    return true
  }

  const handleSubmitWithdrawal = async () => {
    if (!validateAddress()) return

    try {
      const response = await requestWithdrawalMutation.mutateAsync({
        amount: numericAmount,
        polygonAddress: address,
      })

      // Show success modal
      setSuccessModalOpen(true)

      // Reset form after 3 seconds and navigate home
      setTimeout(() => {
        setSuccessModalOpen(false)
        navigate("/")
      }, 3000)
    } catch (error) {
      console.error("Withdrawal request failed:", error)
      setAddressError(t("errors.requestFailed"))
    }
  }

  const handlePasteAddress = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setAddress(text)
      setAddressError("")
    } catch (error) {
      console.error("Failed to paste:", error)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      {/* Title Section with Back Button and Steppers */}
      <div className="bg-zinc-950/95 backdrop-blur-sm sticky top-0 z-10">
        {/* Title and Back Button */}
        <div className="flex items-center px-6 py-5 border-b border-zinc-800">
          <button
            onClick={handleBack}
            className="mr-4 w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-800 transition-all shadow-lg shadow-black/20 active:scale-95"
          >
            <ArrowLeft size={24} color="#ffffff" weight="bold" />
          </button>
          <div className="flex-1">
            <h1 className="text-white text-2xl font-bold tracking-tight">{t("title")}</h1>
            <p className="text-zinc-400 text-sm mt-0.5">
              {step === 1 ? t("subtitle.step1") : t("subtitle.step2")}
            </p>
          </div>
        </div>

        {/* Step Indicator - Centered Below Separator */}
        <div className="flex items-center justify-center gap-2 py-4">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              step === 1
                ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/30"
                : "bg-violet-500/20 text-violet-400"
            }`}
          >
            1
          </div>
          <div className="w-8 h-1 rounded-full bg-zinc-700" />
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              step === 2
                ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/30"
                : "bg-zinc-800 text-zinc-600"
            }`}
          >
            2
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        {step === 1 ? (
          /* STEP 1: Amount Selection */
          <>
            {/* Available Balance */}
            <div className="mx-6 mt-6 bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
              <div className="flex items-center gap-2 mb-2">
                <Wallet size={20} color="#8b5cf6" weight="duotone" />
                <p className="text-zinc-400 text-sm">{t("availableBalance")}</p>
              </div>
              <p className="text-white text-3xl font-bold">
                ${availableBalance.toFixed(2)}
              </p>
              <p className="text-zinc-500 text-xs mt-1">USDC</p>
            </div>

            {/* Amount Input */}
            <div className="mx-6 mt-6 bg-zinc-900 p-5 rounded-2xl border border-zinc-800">
              <label className="text-white font-semibold text-base block mb-3">
                {t("amountLabel")}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-xl font-bold">
                  $
                </span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value)
                    setAmountError("")
                  }}
                  placeholder="0.00"
                  className="w-full bg-zinc-800 text-white text-2xl font-bold py-4 pl-10 pr-4 rounded-xl border border-zinc-700 focus:border-violet-500 focus:outline-none"
                  step="0.01"
                  min="0"
                />
              </div>
              {amountError && (
                <div className="flex items-center gap-2 mt-3">
                  <Warning size={16} color="#ef4444" weight="fill" />
                  <p className="text-red-400 text-sm">{amountError}</p>
                </div>
              )}
            </div>

            {/* Fee Breakdown */}
            {feeData && numericAmount > 0 && !isCalculatingFee && (
              <div className="mx-6 mt-4 bg-zinc-900 p-5 rounded-2xl border border-zinc-800">
                <p className="text-white font-semibold text-base mb-4">
                  {t("feeBreakdown.title")}
                </p>

                {/* Withdrawal Amount */}
                <div className="flex items-center justify-between py-2">
                  <p className="text-zinc-400 text-sm">
                    {t("feeBreakdown.withdrawalAmount")}
                  </p>
                  <p className="text-white text-base font-semibold">
                    ${feeData.amount.toFixed(2)}
                  </p>
                </div>

                {/* Fee */}
                <div className="flex items-center justify-between py-2 border-b border-zinc-800">
                  <p className="text-zinc-400 text-sm">
                    {t("feeBreakdown.fee")} ({feeData.totalFeePercentage.toFixed(1)}%)
                  </p>
                  <p className="text-orange-400 text-base font-semibold">
                    -${feeData.totalFeeAmount.toFixed(2)}
                  </p>
                </div>

                {/* Net Amount */}
                <div className="flex items-center justify-between py-3 mt-2">
                  <p className="text-white text-base font-bold">
                    {t("feeBreakdown.youWillReceive")}
                  </p>
                  <p className="text-green-400 text-xl font-bold">
                    ${feeData.netAmount.toFixed(2)}
                  </p>
                </div>
              </div>
            )}

            {/* Continue Button */}
            <div className="mx-6 mt-6 mb-6">
              <button
                onClick={handleContinueToAddress}
                disabled={!amount || numericAmount <= 0 || isCalculatingFee}
                className="w-full bg-violet-500 hover:bg-violet-600 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold text-base py-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                {t("continueButton")}
                <ArrowRight size={20} weight="bold" />
              </button>
            </div>
          </>
        ) : (
          /* STEP 2: Address Input */
          <>
            {/* Amount Summary */}
            <div className="mx-6 mt-6 bg-zinc-900 p-5 rounded-2xl border border-zinc-800">
              <p className="text-zinc-400 text-sm mb-2">{t("withdrawalAmount")}</p>
              <p className="text-white text-3xl font-bold">
                ${numericAmount.toFixed(2)}
              </p>
              {feeData && feeData.netAmount && (
                <p className="text-green-400 text-sm mt-2">
                  {t("youWillReceive")}: ${feeData.netAmount.toFixed(2)}
                </p>
              )}
            </div>

            {/* Address Input */}
            <div className="mx-6 mt-6 bg-zinc-900 p-5 rounded-2xl border border-zinc-800">
              <div className="flex items-center justify-between mb-3">
                <label className="text-white font-semibold text-base">
                  {t("addressLabel")}
                </label>
                <button
                  onClick={handlePasteAddress}
                  className="flex items-center gap-1 text-violet-400 text-sm font-semibold hover:text-violet-300"
                >
                  <Clipboard size={16} weight="bold" />
                  {t("pasteButton")}
                </button>
              </div>
              <input
                type="text"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value)
                  setAddressError("")
                }}
                placeholder="0x..."
                className="w-full bg-zinc-800 text-white text-sm font-mono py-4 px-4 rounded-xl border border-zinc-700 focus:border-violet-500 focus:outline-none"
              />
              {addressError && (
                <div className="flex items-center gap-2 mt-3">
                  <Warning size={16} color="#ef4444" weight="fill" />
                  <p className="text-red-400 text-sm">{addressError}</p>
                </div>
              )}
              <div className="bg-blue-500/10 p-3 rounded-xl border border-blue-500/30 mt-4">
                <p className="text-blue-400 text-xs leading-5">
                  ⚠️ {t("addressWarning")}
                </p>
              </div>
            </div>

            {/* Network Info */}
            <div className="mx-6 mt-4 bg-orange-500/10 border border-orange-500/30 p-4 rounded-xl">
              <p className="text-orange-500 font-semibold text-sm mb-1">
                {t("network")}
              </p>
              <p className="text-orange-400 text-xs">{t("networkWarning")}</p>
            </div>

            {/* Submit Button */}
            <div className="mx-6 mt-6 mb-6">
              <button
                onClick={handleSubmitWithdrawal}
                disabled={
                  !address || requestWithdrawalMutation.isPending
                }
                className="w-full bg-violet-500 hover:bg-violet-600 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold text-base py-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                {requestWithdrawalMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    {t("submitting")}
                  </>
                ) : (
                  <>
                    <CurrencyDollar size={20} weight="bold" />
                    {t("submitButton")}
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />

      {/* Downrank Warning Drawer */}
      <DownrankWarningDrawer
        open={downrankDrawerOpen}
        onOpenChange={setDownrankDrawerOpen}
        onConfirm={handleDownrankConfirm}
        currentRank={currentRank}
        newRank={newRank}
        currentBalance={blockedBalance}
        balanceAfterWithdrawal={balanceAfterWithdrawal}
        minimumRequired={minRequired}
        currentDailyYield={currentDailyYield}
        newDailyYield={newDailyYield}
        willBeInactivated={wouldBeInactivated}
      />

      {/* Success Modal */}
      {successModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-zinc-900 rounded-3xl p-8 max-w-sm w-full border border-zinc-800">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle size={48} color="#10b981" weight="fill" />
              </div>
              <h2 className="text-white text-2xl font-bold text-center mb-3">
                {t("success.title")}
              </h2>
              <p className="text-zinc-400 text-base text-center leading-6">
                {t("success.description")}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
