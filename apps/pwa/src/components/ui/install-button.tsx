import { Download } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useInstallPWA } from "@/hooks/useInstallPWA"
import { Button } from "./button"

export function InstallButton() {
  const { t } = useTranslation("install.install")
  const { isInstallable, installPWA } = useInstallPWA()

  if (!isInstallable) {
    return null
  }

  return (
    <Button
      onClick={installPWA}
      variant="outline"
      className="w-full bg-gradient-to-r from-purple-500 via-[#D445E7] to-cyan-400 text-white font-semibold border-0 hover:opacity-90 transition-opacity"
    >
      <Download className="w-5 h-5 mr-2" />
      {t("button")}
    </Button>
  )
}
