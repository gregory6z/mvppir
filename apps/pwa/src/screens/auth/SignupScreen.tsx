import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { Link, useSearchParams } from "react-router-dom"
import { signupSchema, type SignupInput } from "@/api/auth/schemas"
import { useSignupMutation, transformSignupError, type SignupError } from "@/api/auth/mutations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Logo } from "@/components/ui/logo"
import { InstallButton } from "@/components/ui/install-button"

export function SignupScreen() {
  const { t } = useTranslation("auth.signup")
  const [searchParams] = useSearchParams()
  const referralCode = searchParams.get("ref") || ""
  const [error, setError] = useState<SignupError | null>(null)

  const signupMutation = useSignupMutation()

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      passwordConfirm: "",
      referralCode: referralCode, // From URL query parameter
    },
    mode: "onBlur",
  })

  const onSubmit = (data: SignupInput) => {
    setError(null)
    signupMutation.mutate(data, {
      onError: (err) => {
        const errorType = transformSignupError(err)
        setError(errorType)
      },
    })
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-black relative px-6 py-10 overflow-hidden">
      {/* Mesh Gradient Background - Same as Hero */}
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

        {/* Signup Card - Glass morphism */}
        <div className="rounded-[20px] border border-purple-500/30 bg-zinc-900/80 backdrop-blur-xl overflow-hidden shadow-[0_12px_24px_rgba(0,0,0,0.5)]">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-1">{t("title")}</h2>
            <p className="text-sm text-zinc-400 mb-6">{t("description")}</p>

            {/* Referral Info Banner */}
            {referralCode && (
              <div className="bg-gradient-to-r from-purple-500/20 via-[#D445E7]/20 to-cyan-400/20 rounded-xl p-4 mb-6 border border-purple-400/50 backdrop-blur-sm">
                <p className="text-xs text-purple-300 mb-1">Invited by</p>
                <p className="text-base text-white font-semibold">{referralCode}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
              {/* Name Field */}
              <div className="flex flex-col">
                <Label htmlFor="name" className="mb-2">{t("fields.name")}</Label>
                <Controller
                  control={control}
                  name="name"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      id="name"
                      type="text"
                      placeholder={t("placeholders.name")}
                      autoComplete="name"
                      disabled={signupMutation.isPending}
                      onBlur={onBlur}
                      onChange={onChange}
                      value={value}
                      error={!!errors.name}
                      aria-label={t("accessibility.nameField")}
                      aria-describedby={errors.name ? "name-error" : undefined}
                    />
                  )}
                />
                {errors.name && (
                  <p id="name-error" className="text-sm text-red-500 mt-1" role="alert">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div className="flex flex-col">
                <Label htmlFor="email" className="mb-2">{t("fields.email")}</Label>
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      id="email"
                      type="email"
                      placeholder={t("placeholders.email")}
                      autoComplete="email"
                      disabled={signupMutation.isPending}
                      onBlur={onBlur}
                      onChange={onChange}
                      value={value}
                      error={!!errors.email}
                      aria-label={t("accessibility.emailField")}
                      aria-describedby={errors.email ? "email-error" : undefined}
                    />
                  )}
                />
                {errors.email && (
                  <p id="email-error" className="text-sm text-red-500 mt-1" role="alert">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="flex flex-col">
                <Label htmlFor="password" className="mb-2">{t("fields.password")}</Label>
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      id="password"
                      type="password"
                      placeholder={t("placeholders.password")}
                      autoComplete="new-password"
                      disabled={signupMutation.isPending}
                      onBlur={onBlur}
                      onChange={onChange}
                      value={value}
                      error={!!errors.password}
                      aria-label={t("accessibility.passwordField")}
                      aria-describedby={errors.password ? "password-error" : undefined}
                    />
                  )}
                />
                {errors.password && (
                  <p id="password-error" className="text-sm text-red-500 mt-1" role="alert">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Password Confirmation Field */}
              <div className="flex flex-col">
                <Label htmlFor="passwordConfirm" className="mb-2">{t("fields.passwordConfirm")}</Label>
                <Controller
                  control={control}
                  name="passwordConfirm"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      id="passwordConfirm"
                      type="password"
                      placeholder={t("placeholders.passwordConfirm")}
                      autoComplete="new-password"
                      disabled={signupMutation.isPending}
                      onBlur={onBlur}
                      onChange={onChange}
                      value={value}
                      error={!!errors.passwordConfirm}
                      aria-label={t("accessibility.passwordConfirmField")}
                      aria-describedby={errors.passwordConfirm ? "password-confirm-error" : undefined}
                    />
                  )}
                />
                {errors.passwordConfirm && (
                  <p id="password-confirm-error" className="text-sm text-red-500 mt-1" role="alert">
                    {errors.passwordConfirm.message}
                  </p>
                )}
              </div>

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{t(error)}</AlertDescription>
                </Alert>
              )}

              {/* Install Button */}
              <InstallButton />

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full mt-2"
                loading={signupMutation.isPending}
                disabled={signupMutation.isPending}
                aria-label={
                  signupMutation.isPending
                    ? t("accessibility.submitButtonLoading")
                    : t("accessibility.submitButton")
                }
              >
                {t("buttons.submit")}
              </Button>

              {/* Login Link */}
              <div className="flex items-center justify-center gap-2 mt-4">
                <span className="text-sm text-zinc-400">{t("links.hasAccount")}</span>
                <Link
                  to="/login"
                  className="text-sm bg-gradient-to-r from-purple-400 via-[#D445E7] to-cyan-400 bg-clip-text text-transparent font-semibold hover:opacity-80 transition-opacity min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label={t("accessibility.loginButton")}
                >
                  {t("links.login")}
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
