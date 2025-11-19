import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Link, Copy, Share } from "phosphor-react"

interface ReferralCodeProps {
  referralCode: string // e.g., "GREGORY123"
}

export function ReferralCode({
  referralCode,
}: ReferralCodeProps) {
  const { t } = useTranslation("referrals.referrals")
  const [copied, setCopied] = useState(false)

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Copy failed:", error)
    }
  }

  const handleShare = async () => {
    const shareMessage = `🚀 Junte-se a mim no Stakly e comece a ganhar!\n\n💰 Use meu código de indicação: ${referralCode}\n\nGanhe comissões diárias com IA! 📈`

    try {
      // Try Web Share API first (mobile browsers)
      if (navigator.share) {
        // Try to fetch and share the logo image
        try {
          const response = await fetch("/icons/icon-512x512.png")
          const blob = await response.blob()
          const file = new File([blob], "stakly-logo.png", { type: "image/png" })

          // Check if files can be shared
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: "Junte-se ao Stakly",
              text: shareMessage,
              files: [file],
            })
          } else {
            // Share without image if files are not supported
            await navigator.share({
              title: "Junte-se ao Stakly",
              text: shareMessage,
            })
          }
        } catch (imageError) {
          // If image fetch fails, share without it
          await navigator.share({
            title: "Junte-se ao Stakly",
            text: shareMessage,
          })
        }
      } else {
        // Fallback: copy full message to clipboard
        await navigator.clipboard.writeText(shareMessage)
        alert("Mensagem copiada para a área de transferência!")
      }
    } catch (error) {
      console.error("Share failed:", error)
    }
  }

  return (
    <div className="mx-6 mt-6">
      <p className="text-white text-base font-semibold mb-4">
        {t("referralCode.title")}
      </p>

      {/* Referral Code Card */}
      <div className="bg-gradient-to-br from-violet-500/20 to-blue-500/20 p-6 rounded-3xl border border-violet-500/30 mb-3">
        <div className="flex items-center gap-2 mb-3">
          <Link size={20} color="#8b5cf6" weight="bold" />
          <p className="text-zinc-300 text-sm font-medium">
            {t("referralCode.shareCode")}
          </p>
        </div>

        {/* Code Display */}
        <div className="bg-zinc-900 p-4 rounded-2xl mb-4">
          <p className="text-violet-400 text-xs font-medium mb-1 text-center">
            {t("referralCode.referralCodeLabel")}
          </p>
          <p className="text-white text-3xl font-bold text-center tracking-wider">
            {referralCode}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {/* Copy Code */}
          <button
            onClick={handleCopyCode}
            className="flex-1 bg-violet-500 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-violet-600 active:scale-[0.98] transition-all"
            aria-label={t("referralCode.accessibility.copyCode")}
          >
            <Copy size={18} color="#ffffff" weight="bold" />
            <span className="text-white font-semibold text-sm">
              {copied ? t("referralCode.copied") : t("referralCode.copyCode")}
            </span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="bg-zinc-800 py-3 px-4 rounded-xl hover:bg-zinc-700 active:scale-[0.98] transition-all"
            aria-label={t("referralCode.accessibility.shareLink")}
          >
            <Share size={18} color="#8b5cf6" weight="bold" />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="mt-3 bg-blue-500/10 p-3 rounded-xl border border-blue-500/30">
        <p className="text-blue-400 text-xs text-center">
          {t("referralCode.infoMessage")}
        </p>
      </div>
    </div>
  )
}
