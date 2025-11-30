import { useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Smartphone, ArrowLeft, Download } from "lucide-react"
import { useTranslation } from "react-i18next"
import { usePWAInstallStatus } from "@/hooks/usePWAInstallStatus"
import { useBrowserDetection } from "@/hooks/useBrowserDetection"
import { Logo } from "@/components/ui/logo"

export function IOSInstallScreen() {
  const navigate = useNavigate()
  const { t } = useTranslation("install.install")
  const { isInstalled, isIOS } = usePWAInstallStatus()
  const { browserName, isInAppBrowser } = useBrowserDetection()

  // Trigger PWA install prompt
  const triggerInstall = useCallback(() => {
    const pwaInstall = document.querySelector("pwa-install") as HTMLElement & { showDialog: () => void }
    if (pwaInstall?.showDialog) {
      pwaInstall.showDialog()
    }
  }, [])

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

  // iOS + Safari (or other browser): Show app info and install button
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
          <Logo width={56} height={56} color="white" />
        </div>

        <h2 className="text-white text-2xl font-bold mb-3 text-center">
          {t("safari.addToHomeScreen")}
        </h2>

        <p className="text-zinc-400 text-sm text-center max-w-sm leading-relaxed">
          {t("safari.description")}
        </p>

        {/* Install CTA */}
        <button
          onClick={triggerInstall}
          className="mt-8 w-full max-w-sm py-4 rounded-xl bg-gradient-to-r from-violet-500 to-blue-500 hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          <Download size={20} className="text-white" />
          <span className="text-white font-semibold">{t("button")}</span>
        </button>

        {/* Secondary CTA */}
        <button
          onClick={handleBack}
          className="mt-4 px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-[0.99] transition-all"
        >
          <span className="text-white font-semibold">{t("buttons.doItLater")}</span>
        </button>
      </div>
    </div>
  )
}
