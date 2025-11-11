import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/ui/logo"
import { validateReferralCode } from "@/api/referral/client"
import type { ReferralValidationResponse } from "@/api/referral/schemas"

const RANK_EMOJIS: Record<string, string> = {
  RECRUIT: "🎖️",
  BRONZE: "🥉",
  SILVER: "🥈",
  GOLD: "🥇",
}

export function InviteScreen() {
  const { t } = useTranslation("auth.invite")
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [referralCode, setReferralCode] = useState(searchParams.get("ref") || "")
  const [error, setError] = useState("")
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<ReferralValidationResponse | null>(null)

  const handleValidateCode = async () => {
    if (!referralCode.trim()) {
      setError(t("errors.required"))
      return
    }

    setIsValidating(true)
    setError("")
    setValidationResult(null)

    try {
      const result = await validateReferralCode(referralCode.trim().toUpperCase())
      setValidationResult(result)

      if (!result.valid) {
        setError(result.message || t("errors.invalidCode"))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.failedValidation"))
    } finally {
      setIsValidating(false)
    }
  }

  const handleContinue = () => {
    if (validationResult?.valid && validationResult.referrer) {
      navigate(`/signup?ref=${encodeURIComponent(referralCode.trim().toUpperCase())}`)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-black relative px-6 py-10 overflow-hidden">
      {/* Mesh Gradient Background - Same as other auth screens */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Base gradient layer */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(at 0% 0%, rgba(157, 131, 231, 0.15) 0%, transparent 50%), radial-gradient(at 100% 0%, rgba(212, 69, 231, 0.12) 0%, transparent 50%), radial-gradient(at 100% 100%, rgba(16, 203, 244, 0.1) 0%, transparent 50%), radial-gradient(at 0% 100%, rgba(157, 131, 231, 0.08) 0%, transparent 50%)',
          }}
        />

        {/* Mesh blur layers */}
        <div className="absolute top-[10%] left-[20%] w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-purple-500/20 rounded-full blur-[60px] sm:blur-[120px] animate-[float_15s_ease-in-out_infinite]" />
        <div className="absolute top-[15%] right-[15%] w-[250px] h-[250px] sm:w-[400px] sm:h-[400px] bg-[#D445E7]/15 rounded-full blur-[50px] sm:blur-[100px] animate-[float_18s_ease-in-out_infinite_2s]" />
        <div className="absolute bottom-[20%] left-[10%] w-[280px] h-[280px] sm:w-[450px] sm:h-[450px] bg-cyan-400/12 rounded-full blur-[55px] sm:blur-[110px] animate-[float_20s_ease-in-out_infinite_4s]" />
        <div className="absolute top-[40%] right-[25%] w-[220px] h-[220px] sm:w-[350px] sm:h-[350px] bg-purple-600/15 rounded-full blur-[50px] sm:blur-[100px] animate-[float_16s_ease-in-out_infinite_3s]" />

        {/* Gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60" />
      </div>

      {/* Plasma gradient divider at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-400/60 via-[#D445E7]/60 via-cyan-300/60 to-transparent shadow-[0_0_10px_rgba(157,131,231,0.3)]" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-22 h-22 rounded-full bg-gradient-to-br from-purple-500 via-[#D445E7] to-cyan-400 flex items-center justify-center overflow-hidden mb-4 shadow-[0_8px_16px_rgba(157,131,231,0.6)]">
            <Logo width={64} height={64} color="white" />
          </div>
          <h1 className="text-[32px] font-bold text-white tracking-tight mb-1">Stakly</h1>
          <p className="text-base text-zinc-400">{t("subtitle")}</p>
        </div>

        {/* Invite Card - Glass morphism */}
        <div className="rounded-[20px] border border-purple-500/30 bg-zinc-900/80 backdrop-blur-xl overflow-hidden shadow-[0_12px_24px_rgba(0,0,0,0.5)]">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-1">{t("title")}</h2>
            <p className="text-sm text-zinc-400 mb-6">{t("description")}</p>

            {/* Referral Code Input */}
            <div className="flex flex-col gap-6">
              <div className="flex flex-col">
                <Label htmlFor="referralCode" className="mb-2">
                  {t("fields.referralCode")}
                </Label>
                <Input
                  id="referralCode"
                  type="text"
                  placeholder={t("placeholders.referralCode")}
                  autoComplete="off"
                  value={referralCode}
                  onChange={(e) => {
                    setReferralCode(e.target.value.toUpperCase())
                    setError("")
                    setValidationResult(null)
                  }}
                  error={!!error}
                  disabled={isValidating}
                  className={
                    validationResult?.valid
                      ? "border-green-500 focus:border-green-500 focus:ring-green-500/20"
                      : error
                        ? "border-red-500"
                        : ""
                  }
                  aria-label={t("accessibility.referralCodeField")}
                  aria-describedby={error ? "referral-code-error" : undefined}
                />
                {error && (
                  <p id="referral-code-error" className="text-sm text-red-500 mt-1" role="alert">
                    {error}
                  </p>
                )}

                {/* Validation Success Banner */}
                {validationResult?.valid && validationResult.referrer && (
                  <div className="bg-gradient-to-r from-green-500/20 via-emerald-500/20 to-green-500/20 rounded-xl p-4 mt-4 border border-green-400/50 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-green-400 text-lg">✓</span>
                      <p className="text-sm font-semibold text-green-400">
                        {t("success.validCode")}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-green-300/70 mb-1">
                          {t("success.invitedBy")}
                        </p>
                        <p className="text-base text-white font-semibold">
                          {validationResult.referrer.name}
                        </p>
                      </div>
                      <span className="text-2xl">
                        {RANK_EMOJIS[validationResult.referrer.currentRank] || "🎖️"}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Validate Button */}
              {!validationResult?.valid && (
                <Button
                  type="button"
                  className="w-full"
                  onClick={handleValidateCode}
                  loading={isValidating}
                  disabled={isValidating || !referralCode.trim()}
                  aria-label={t("accessibility.validateButton")}
                >
                  {t("buttons.validate")}
                </Button>
              )}

              {/* Continue Button (only shows after valid code) */}
              {validationResult?.valid && (
                <Button
                  type="button"
                  className="w-full"
                  onClick={handleContinue}
                  aria-label={t("accessibility.continueButton")}
                >
                  {t("buttons.continue")}
                </Button>
              )}

              {/* Info Banner */}
              <div className="bg-blue-500/10 border border-blue-400/30 rounded-xl p-4">
                <p className="text-sm text-blue-300 text-center">
                  {t("info.requirement")}
                </p>
              </div>

              {/* Back to Login Link */}
              <div className="flex items-center justify-center gap-2 mt-4">
                <span className="text-sm text-zinc-400">{t("links.alreadyHaveAccount")}</span>
                <Link
                  to="/login"
                  className="text-sm bg-gradient-to-r from-purple-400 via-[#D445E7] to-cyan-400 bg-clip-text text-transparent font-semibold hover:opacity-80 transition-opacity min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label={t("accessibility.backToLoginButton")}
                >
                  {t("links.backToLogin")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
