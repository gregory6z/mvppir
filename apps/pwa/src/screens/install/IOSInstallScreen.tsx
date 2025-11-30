import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Share, Plus, Smartphone, ArrowLeft } from "lucide-react"
import { useTranslation } from "react-i18next"
import { usePWAInstallStatus } from "@/hooks/usePWAInstallStatus"
import { useBrowserDetection } from "@/hooks/useBrowserDetection"

export function IOSInstallScreen() {
  const navigate = useNavigate()
  const { t } = useTranslation("features.install.install")
  const { isInstalled, isIOS } = usePWAInstallStatus()
  const { isSafari, browserName, isInAppBrowser } = useBrowserDetection()

  // If already installed, redirect to login
  useEffect(() => {
    if (isInstalled) {
      navigate("/login", { replace: true })
    }
  }, [isInstalled, navigate])

  const handleBack = () => {
    navigate("/login")
  }

  // If not iOS, show message to access from iPhone
  if (!isIOS) {
    return (
      <div className="flex min-h-screen flex-col bg-zinc-950 p-6">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={handleBack}
            className="p-2 -ml-2 rounded-full hover:bg-zinc-800 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={24} className="text-white" />
          </button>
          <h1 className="text-white text-xl font-bold ml-2">{t("header")}</h1>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center -mt-16">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shadow-2xl mb-6">
            <Smartphone size={48} className="text-white" strokeWidth={2} />
          </div>

          <h2 className="text-white text-2xl font-bold mb-3 text-center">
            {t("notIOS.title")}
          </h2>

          <p className="text-zinc-400 text-sm text-center max-w-sm leading-relaxed">
            {t("notIOS.description")}
            <br />
            <br />
            {t("notIOS.hint")}
          </p>

          <div className="mt-8 p-4 bg-zinc-900 rounded-2xl border border-zinc-800">
            <p className="text-zinc-400 text-xs text-center">
              <strong className="text-white">{t("notIOS.currentDevice")}:</strong> {t("notIOS.deviceType")}
            </p>
          </div>

          {/* CTA */}
          <button
            onClick={handleBack}
            className="mt-8 px-6 py-3 rounded-xl bg-violet-500 hover:bg-violet-600 active:scale-[0.99] transition-all"
          >
            <span className="text-white font-semibold">{t("buttons.goToLogin")}</span>
          </button>
        </div>
      </div>
    )
  }

  // If in-app browser (Instagram, Facebook, etc.)
  if (isInAppBrowser) {
    return (
      <div className="flex min-h-screen flex-col bg-zinc-950 p-6">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={handleBack}
            className="p-2 -ml-2 rounded-full hover:bg-zinc-800 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={24} className="text-white" />
          </button>
          <h1 className="text-white text-xl font-bold ml-2">{t("header")}</h1>
        </div>

        {/* Warning */}
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-5 mb-6">
          <h3 className="text-orange-400 font-semibold text-base mb-2">
            ⚠️ {t("inAppBrowser.title")}
          </h3>
          <p className="text-orange-300 text-sm leading-relaxed">
            {t("inAppBrowser.description", { browser: browserName })}
          </p>
        </div>

        {/* Instructions to open in Safari */}
        <div className="space-y-4">
          <h2 className="text-white text-lg font-semibold">{t("inAppBrowser.howToOpen")}</h2>

          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center mr-3">
              <span className="text-white font-semibold text-sm">1</span>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed pt-1">
              {t("inAppBrowser.step1")}
            </p>
          </div>

          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center mr-3">
              <span className="text-white font-semibold text-sm">2</span>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed pt-1">
              {t("inAppBrowser.step2")}
            </p>
          </div>

          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center mr-3">
              <span className="text-white font-semibold text-sm">3</span>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed pt-1">
              {t("notSafari.step3")}
            </p>
          </div>
        </div>

        {/* Button */}
        <button
          onClick={handleBack}
          className="mt-8 w-full py-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-[0.99] transition-all"
        >
          <span className="text-white font-semibold">{t("buttons.goToLogin")}</span>
        </button>
      </div>
    )
  }

  // If not Safari, show message to open in Safari
  if (!isSafari) {
    return (
      <div className="flex min-h-screen flex-col bg-zinc-950 p-6">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={handleBack}
            className="p-2 -ml-2 rounded-full hover:bg-zinc-800 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={24} className="text-white" />
          </button>
          <h1 className="text-white text-xl font-bold ml-2">{t("header")}</h1>
        </div>

        {/* Warning */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-5 mb-6">
          <h3 className="text-blue-400 font-semibold text-base mb-2">
            {t("notSafari.title")}
          </h3>
          <p className="text-blue-300 text-sm leading-relaxed">
            {t("notSafari.description", { browser: browserName })}
          </p>
        </div>

        {/* Instructions */}
        <div className="space-y-4">
          <h2 className="text-white text-lg font-semibold">{t("notSafari.howToInstall")}</h2>

          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center mr-3">
              <span className="text-white font-semibold text-sm">1</span>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed pt-1">
              {t("notSafari.step1")}
            </p>
          </div>

          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center mr-3">
              <span className="text-white font-semibold text-sm">2</span>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed pt-1">
              {t("notSafari.step2")}
            </p>
          </div>

          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center mr-3">
              <span className="text-white font-semibold text-sm">3</span>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed pt-1">
              {t("notSafari.step3")}
            </p>
          </div>
        </div>

        {/* Button */}
        <button
          onClick={handleBack}
          className="mt-8 w-full py-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-[0.99] transition-all"
        >
          <span className="text-white font-semibold">{t("buttons.goToLogin")}</span>
        </button>
      </div>
    )
  }

  // iOS + Safari: Show full installation instructions
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button
          onClick={handleBack}
          className="p-2 -ml-2 rounded-full hover:bg-zinc-800 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft size={24} className="text-white" />
        </button>
        <h1 className="text-white text-xl font-bold ml-2">{t("header")}</h1>
      </div>

      {/* App Icon */}
      <div className="flex justify-center mb-6">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shadow-2xl">
          <span className="text-white text-5xl font-bold">S</span>
        </div>
      </div>

      {/* Title */}
      <h2 className="text-white text-2xl font-bold text-center mb-3">
        {t("safari.addToHomeScreen")}
      </h2>

      {/* Description */}
      <p className="text-center text-zinc-300 text-sm mb-10 leading-relaxed max-w-md mx-auto">
        {t("safari.description")}
      </p>

      {/* Instructions */}
      <div className="space-y-6 max-w-md mx-auto w-full">
        {/* Step 1: Share button */}
        <div className="flex items-start">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center mr-4 shadow-lg">
            <Share size={24} className="text-white" strokeWidth={2.5} />
          </div>
          <div className="flex-1 pt-1">
            <p className="text-white font-semibold text-base mb-2">{t("safari.step1.title")}</p>
            <p className="text-zinc-400 text-sm leading-relaxed">
              {t("safari.step1.description")}
            </p>
          </div>
        </div>

        {/* Step 2: Add to Home Screen */}
        <div className="flex items-start">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-violet-500 flex items-center justify-center mr-4 shadow-lg">
            <Plus size={24} className="text-white" strokeWidth={2.5} />
          </div>
          <div className="flex-1 pt-1">
            <p className="text-white font-semibold text-base mb-2">
              {t("safari.step2.title")}
            </p>
            <p className="text-zinc-400 text-sm leading-relaxed">
              {t("safari.step2.description")}
            </p>
          </div>
        </div>

        {/* Step 3: Confirm */}
        <div className="flex items-start">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center mr-4 shadow-lg">
            <span className="text-white font-bold text-xl">3</span>
          </div>
          <div className="flex-1 pt-1">
            <p className="text-white font-semibold text-base mb-2">{t("safari.step3.title")}</p>
            <p className="text-zinc-400 text-sm leading-relaxed">
              {t("safari.step3.description")}
            </p>
          </div>
        </div>
      </div>

      {/* Visual hint */}
      <div className="mt-10 p-5 bg-zinc-900 rounded-2xl border border-zinc-800 max-w-md mx-auto w-full">
        <p className="text-zinc-400 text-xs text-center leading-relaxed">
          💡 {t("safari.tip")}
        </p>
      </div>

      {/* CTA */}
      <div className="mt-8 max-w-md mx-auto w-full">
        <button
          onClick={handleBack}
          className="w-full py-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-[0.99] transition-all"
        >
          <span className="text-white font-semibold">{t("buttons.doItLater")}</span>
        </button>
      </div>

      {/* Spacer for safe area */}
      <div className="h-8" />
    </div>
  )
}
