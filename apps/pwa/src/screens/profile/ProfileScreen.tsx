import { useTranslation } from "react-i18next"
import { Globe, Check, LogOut } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useUserAccount } from "@/api/user/queries/use-user-account"
import { BottomNavigation } from "@/components/navigation/BottomNavigation"
import { useAuthStore } from "@/stores/auth.store"
import { ProfileScreenSkeleton } from "@/components/skeletons/ProfileScreenSkeleton"

const LANGUAGES = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "pt", name: "Português", flag: "🇧🇷" },
]

export function ProfileScreen() {
  const { t, i18n } = useTranslation("profile.profile")
  const { data: userAccount, isPending } = useUserAccount()
  const { clearAuth } = useAuthStore()
  const navigate = useNavigate()

  const currentLanguage = i18n.language

  const handleLogout = () => {
    const confirmed = window.confirm(t("logout.message"))
    if (confirmed) {
      clearAuth()
      navigate("/login")
    }
  }

  const handleChangeLanguage = (languageCode: string) => {
    i18n.changeLanguage(languageCode)
  }

  // Get initials from name
  const getInitials = (name: string) => {
    if (!name) return "U"
    const parts = name.trim().split(" ")
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  if (isPending) {
    return <ProfileScreenSkeleton />
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-24 pt-6">
        {/* User Info Card */}
        <div className="mx-6 mt-6 bg-gradient-to-br from-violet-500/20 to-blue-500/20 p-4 rounded-2xl border border-violet-500/30">
          <div className="flex items-center">
            <div className="w-16 h-16 rounded-full bg-violet-500 flex items-center justify-center mr-3 shadow-lg">
              <span className="text-white text-xl font-bold">
                {getInitials(userAccount?.name || "")}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-white text-lg font-bold">{userAccount?.name}</h2>
              <p className="text-zinc-300 text-sm mt-1">{userAccount?.email}</p>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="mx-6 mt-6 bg-zinc-900 p-5 rounded-2xl border border-zinc-800">
          <h3 className="text-white font-semibold text-base mb-4">
            {t("accountInfo.title")}
          </h3>

          <div className="space-y-0">
            <div className="py-3 border-b border-zinc-800">
              <p className="text-zinc-400 text-xs mb-1.5">{t("accountInfo.name")}</p>
              <p className="text-white text-base">{userAccount?.name}</p>
            </div>

            <div className="py-3 border-b border-zinc-800">
              <p className="text-zinc-400 text-xs mb-1.5">{t("accountInfo.email")}</p>
              <p className="text-white text-base">{userAccount?.email}</p>
            </div>

            <div className="py-3 border-b border-zinc-800">
              <p className="text-zinc-400 text-xs mb-1.5">{t("accountInfo.status")}</p>
              <div className="flex items-center">
                <div
                  className={`w-2 h-2 rounded-full mr-2 ${
                    userAccount?.status === "ACTIVE" ? "bg-green-500" : "bg-orange-500"
                  }`}
                />
                <p className="text-white text-base">
                  {userAccount?.status === "ACTIVE"
                    ? t("accountInfo.statusActive")
                    : t("accountInfo.statusInactive")}
                </p>
              </div>
            </div>

            <div className="py-3">
              <p className="text-zinc-400 text-xs mb-1.5">
                {t("accountInfo.referralCode")}
              </p>
              <p className="text-white text-base font-mono">
                {userAccount?.referralCode}
              </p>
            </div>
          </div>
        </div>

        {/* Language Settings */}
        <div className="mx-6 mt-6 bg-zinc-900 p-5 rounded-2xl border border-zinc-800">
          <div className="flex items-center mb-4">
            <Globe size={22} className="text-violet-500" strokeWidth={2.5} />
            <h3 className="text-white font-semibold text-base ml-2">
              {t("language.title")}
            </h3>
          </div>

          <div className="space-y-3">
            {LANGUAGES.map((language) => (
              <button
                key={language.code}
                onClick={() => handleChangeLanguage(language.code)}
                className={`w-full flex items-center justify-between py-3.5 px-4 rounded-xl transition-all ${
                  currentLanguage === language.code
                    ? "bg-violet-500/20 border border-violet-500/50"
                    : "bg-zinc-800 hover:bg-zinc-700"
                }`}
                aria-label={`Select ${language.name}`}
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{language.flag}</span>
                  <span
                    className={`text-base ${
                      currentLanguage === language.code
                        ? "text-violet-400 font-semibold"
                        : "text-white"
                    }`}
                  >
                    {language.name}
                  </span>
                </div>
                {currentLanguage === language.code && (
                  <Check size={20} className="text-violet-400" strokeWidth={2.5} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Logout Button */}
        <div className="mx-6 mt-8">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center py-4 rounded-xl bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 active:scale-[0.99] transition-all"
            aria-label="Logout"
          >
            <LogOut size={24} className="text-red-500" strokeWidth={2.5} />
            <span className="text-red-500 font-semibold text-base ml-2">
              {t("logout.button")}
            </span>
          </button>
        </div>

        {/* App Version */}
        <div className="mx-6 mt-8 mb-6">
          <p className="text-zinc-600 text-xs text-center">
            {t("version", { version: "1.0.0" })}
          </p>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}
