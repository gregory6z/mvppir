import { Share, Plus, X } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useBrowserDetection } from "@/hooks/useBrowserDetection"
import { Logo } from "@/components/ui/logo"

interface IOSInstallInstructionsProps {
  onClose: () => void
}

export function IOSInstallInstructions({
  onClose,
}: IOSInstallInstructionsProps) {
  const { t } = useTranslation("features.install.install")
  const { browserName, isInAppBrowser } = useBrowserDetection()

  // If in-app browser (Instagram, Facebook, etc.), show special message
  if (isInAppBrowser) {
    return (
      <div className="fixed inset-y-0 left-[var(--app-left)] w-[var(--app-max-width)] z-50 flex items-end bg-black/60 backdrop-blur-sm">
        <div className="w-full bg-zinc-900 rounded-t-3xl border-t border-zinc-800 p-6 pb-safe">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white text-xl font-bold">{t("header")}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-zinc-800 transition-colors"
              aria-label="Close"
            >
              <X size={24} className="text-zinc-400" />
            </button>
          </div>

          {/* Warning */}
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-4 mb-6">
            <p className="text-orange-400 text-sm leading-relaxed">
              <strong className="font-semibold">⚠️ {t("inAppBrowser.title")}</strong>
              <br />
              {t("inAppBrowser.description", { browser: browserName })}
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-4">
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

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-full mt-6 py-4 rounded-xl bg-violet-500 hover:bg-violet-600 active:scale-[0.99] transition-all"
          >
            <span className="text-white font-semibold">{t("buttons.goToLogin")}</span>
          </button>
        </div>
      </div>
    )
  }

  // If not Safari, show message to open in Safari
  return (
    <div className="fixed inset-y-0 left-[var(--app-left,0)] w-full max-w-[var(--app-max-width,100%)] z-50 flex items-end bg-black/60 backdrop-blur-sm">
      <div className="w-full bg-zinc-900 rounded-t-3xl border-t border-zinc-800 p-6 pb-safe">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white text-xl font-bold">{t("header")}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-zinc-800 transition-colors"
            aria-label="Close"
          >
            <X size={24} className="text-zinc-400" />
          </button>
        </div>

        {/* App icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shadow-2xl">
            <Logo width={48} height={48} color="white" />
          </div>
        </div>

        {/* Description */}
        <p className="text-center text-zinc-300 text-sm mb-8 leading-relaxed">
          {t("safari.description")}
        </p>

        {/* Instructions */}
        <div className="space-y-5">
          {/* Step 1: Share button */}
          <div className="flex items-start">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center mr-4">
              <Share size={20} className="text-white" strokeWidth={2.5} />
            </div>
            <div className="flex-1 pt-1">
              <p className="text-white font-semibold text-sm mb-1">
                {t("safari.step1.title")}
              </p>
              <p className="text-zinc-400 text-xs leading-relaxed">
                {t("safari.step1.description")}
              </p>
            </div>
          </div>

          {/* Step 2: Add to Home Screen */}
          <div className="flex items-start">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-violet-500 flex items-center justify-center mr-4">
              <Plus size={20} className="text-white" strokeWidth={2.5} />
            </div>
            <div className="flex-1 pt-1">
              <p className="text-white font-semibold text-sm mb-1">
                {t("safari.step2.title")}
              </p>
              <p className="text-zinc-400 text-xs leading-relaxed">
                {t("safari.step2.description")}
              </p>
            </div>
          </div>

          {/* Step 3: Confirm */}
          <div className="flex items-start">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center mr-4">
              <span className="text-white font-bold text-lg">3</span>
            </div>
            <div className="flex-1 pt-1">
              <p className="text-white font-semibold text-sm mb-1">{t("safari.step3.title")}</p>
              <p className="text-zinc-400 text-xs leading-relaxed">
                {t("safari.step3.description")}
              </p>
            </div>
          </div>
        </div>

        {/* Visual hint */}
        <div className="mt-8 p-4 bg-zinc-800/50 rounded-xl border border-zinc-700">
          <p className="text-zinc-400 text-xs text-center leading-relaxed">
            💡 {t("safari.tip")}
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="w-full mt-6 py-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-[0.99] transition-all"
        >
          <span className="text-white font-semibold">{t("buttons.doItLater")}</span>
        </button>
      </div>
    </div>
  )
}
