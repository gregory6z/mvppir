import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Link, Copy, Share } from "phosphor-react"

interface ReferralCodeProps {
  referralCode: string // e.g., "GREGORY123"
  referralLink: string // e.g., "https://stakly.com/ref/GREGORY123"
}

export function ReferralCode({
  referralCode,
  referralLink,
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
    const shareData = {
      title: "Join Stakly",
      text: `Join Stakly and start earning! Use my referral code: ${referralCode}`,
      url: referralLink,
    }

    try {
      // Try Web Share API first (mobile browsers)
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        // Fallback: copy link to clipboard
        await navigator.clipboard.writeText(referralLink)
        alert("Link copied to clipboard!")
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
            aria-label="Copy referral code"
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
            aria-label="Share referral link"
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
