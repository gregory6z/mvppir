import { useNavigate, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { ArrowLeft, ArrowDown, ArrowUp, Star, Copy, ArrowSquareOut, Calendar, Hash, Check } from "phosphor-react"
import type { UnifiedTransaction } from "@/api/user/schemas"
import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { ptBR, enUS, es, fr } from "date-fns/locale"

const localeMap = {
  pt: ptBR,
  en: enUS,
  es: es,
  fr: fr,
}

export function TransactionDetailScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t, i18n } = useTranslation("transactions.detail")
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const locale = localeMap[i18n.language as keyof typeof localeMap] || enUS

  // Get transaction from navigation state (passed from HomeScreen)
  const transaction = location.state?.transaction as UnifiedTransaction | undefined
  const isLoading = false // No loading since we have data from state

  const handleBack = () => {
    navigate(-1)
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleString(i18n.language, {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return dateString
    }
  }

  const formatTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return formatDistanceToNow(date, { addSuffix: true, locale })
    } catch {
      return dateString
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-zinc-950">
        <div className="sticky top-0 z-10 bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 backdrop-blur-lg border-b border-zinc-800/50">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={handleBack}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-800/50 hover:bg-zinc-700/50 transition-colors"
            >
              <ArrowLeft size={20} color="#fff" weight="bold" />
            </button>
            <h1 className="text-white text-lg font-bold">{t("title")}</h1>
            <div className="w-10" />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!transaction) {
    return (
      <div className="flex min-h-screen flex-col bg-zinc-950">
        <div className="sticky top-0 z-10 bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 backdrop-blur-lg border-b border-zinc-800/50">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={handleBack}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-800/50 hover:bg-zinc-700/50 transition-colors"
            >
              <ArrowLeft size={20} color="#fff" weight="bold" />
            </button>
            <h1 className="text-white text-lg font-bold">{t("title")}</h1>
            <div className="w-10" />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <p className="text-red-400 text-base">{t("notFound")}</p>
          </div>
        </div>
      </div>
    )
  }

  const isDeposit = transaction.type === "DEPOSIT"
  const isWithdrawal = transaction.type === "WITHDRAWAL"
  const isCommission = transaction.type === "COMMISSION"
  const isDailyCommission = isCommission && transaction.commissionLevel === 0

  let Icon = ArrowDown
  let iconColor = "text-green-500"
  let iconBgColor = "bg-green-500/10"
  let amountColor = "text-green-500"
  let amountSign = "+"

  if (isWithdrawal) {
    Icon = ArrowUp
    iconColor = "text-red-500"
    iconBgColor = "bg-red-500/10"
    amountColor = "text-red-500"
    amountSign = "-"
  } else if (isCommission) {
    Icon = Star
    if (isDailyCommission) {
      iconColor = "text-yellow-500"
      iconBgColor = "bg-yellow-500/10"
    } else {
      iconColor = "text-purple-500"
      iconBgColor = "bg-purple-500/10"
    }
    amountSign = "+"
  }

  const transactionType = isDeposit
    ? t("types.deposit")
    : isWithdrawal
      ? t("types.withdrawal")
      : isDailyCommission
        ? t("types.dailyCommission")
        : t("types.commission")

  const statusColor =
    transaction.status === "PENDING"
      ? "text-orange-500 bg-orange-500/10 border-orange-500/20"
      : transaction.status === "CONFIRMED" || transaction.status === "PAID"
        ? "text-green-500 bg-green-500/10 border-green-500/20"
        : transaction.status === "SENT_TO_GLOBAL"
          ? "text-purple-500 bg-purple-500/10 border-purple-500/20"
          : "text-red-500 bg-red-500/10 border-red-500/20"

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
          <h1 className="text-white text-lg font-bold">{t("title")}</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Icon & Amount Card */}
        <div className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/50 border border-zinc-800/50 rounded-2xl p-8">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${iconBgColor}`}>
              <Icon
                size={40}
                className={iconColor}
                strokeWidth={isCommission ? 0 : 2.5}
                fill={isCommission ? "currentColor" : "none"}
              />
            </div>
            <div>
              <p className="text-zinc-400 text-sm mb-2">{transactionType}</p>
              <h2 className={`text-5xl font-black ${amountColor}`}>
                {amountSign}${parseFloat(transaction.amount).toFixed(2)}
              </h2>
              <p className="text-zinc-500 text-sm mt-2">{transaction.tokenSymbol}</p>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className={`border rounded-xl p-4 flex items-center justify-between ${statusColor}`}>
          <span className="font-semibold">{t(`status.${transaction.status}`)}</span>
          <span className="text-xs">{formatTimeAgo(transaction.createdAt)}</span>
        </div>

        {/* Commission Level Badge (if commission) */}
        {isCommission && typeof transaction.commissionLevel === "number" && (
          <div className={`border rounded-xl p-4 ${
            transaction.commissionLevel === 0
              ? "bg-yellow-500/10 border-yellow-500/20"
              : "bg-purple-500/10 border-purple-500/20"
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-xs mb-1">{t("commissionLevel")}</p>
                <p className={`font-bold text-lg ${
                  transaction.commissionLevel === 0 ? "text-yellow-500" : "text-purple-500"
                }`}>
                  N{transaction.commissionLevel} - {t(`levels.N${transaction.commissionLevel}`)}
                </p>
              </div>
              {transaction.fromUserName && (
                <div className="text-right">
                  <p className="text-zinc-400 text-xs mb-1">{t("from")}</p>
                  <p className="text-white font-semibold text-sm">{transaction.fromUserName}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Details Section */}
        <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-zinc-800/50">
            <h3 className="text-white font-bold text-base">{t("details")}</h3>
          </div>

          {/* Date */}
          <div className="p-4 border-b border-zinc-800/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar size={20} className="text-zinc-500" />
              <span className="text-zinc-400 text-sm">{t("date")}</span>
            </div>
            <span className="text-white text-sm font-medium">{formatDate(transaction.createdAt)}</span>
          </div>

          {/* Transaction Hash */}
          {transaction.txHash && (
            <div className="p-4 border-b border-zinc-800/50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Hash size={20} className="text-zinc-500" />
                  <span className="text-zinc-400 text-sm">{t("txHash")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(transaction.txHash!, "txHash")}
                    className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    {copiedField === "txHash" ? (
                      <Check size={16} className="text-green-500" />
                    ) : (
                      <Copy size={16} className="text-zinc-500" />
                    )}
                  </button>
                  <a
                    href={`https://polygonscan.com/tx/${transaction.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    <ArrowSquareOut size={16} className="text-violet-500" />
                  </a>
                </div>
              </div>
              <p className="text-zinc-500 text-xs font-mono break-all pl-8">
                {transaction.txHash}
              </p>
            </div>
          )}

          {/* Transfer Hash (if exists) */}
          {transaction.transferTxHash && (
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Hash size={20} className="text-zinc-500" />
                  <span className="text-zinc-400 text-sm">{t("transferHash")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(transaction.transferTxHash!, "transferHash")}
                    className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    {copiedField === "transferHash" ? (
                      <Check size={16} className="text-green-500" />
                    ) : (
                      <Copy size={16} className="text-zinc-500" />
                    )}
                  </button>
                  <a
                    href={`https://polygonscan.com/tx/${transaction.transferTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    <ArrowSquareOut size={16} className="text-violet-500" />
                  </a>
                </div>
              </div>
              <p className="text-zinc-500 text-xs font-mono break-all pl-8">
                {transaction.transferTxHash}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
