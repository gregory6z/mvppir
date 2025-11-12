import i18n from "i18next"
import { initReactI18next } from "react-i18next"

// Portuguese translations
import ptCommon from "./pt/common.json"
import ptLogin from "./pt/features/auth/login.json"
import ptSignup from "./pt/features/auth/signup.json"
import ptInvite from "./pt/features/auth/invite.json"
import ptValidation from "./pt/features/auth/validation.json"
import ptHome from "./pt/features/home/home.json"
import ptWallet from "./pt/features/wallet/wallet.json"
import ptProfile from "./pt/features/profile/profile.json"
import ptReferrals from "./pt/features/referrals/referrals.json"

// English translations
import enCommon from "./en/common.json"
import enLogin from "./en/features/auth/login.json"
import enSignup from "./en/features/auth/signup.json"
import enInvite from "./en/features/auth/invite.json"
import enValidation from "./en/features/auth/validation.json"
import enHome from "./en/features/home/home.json"
import enWallet from "./en/features/wallet/wallet.json"
import enProfile from "./en/features/profile/profile.json"
import enReferrals from "./en/features/referrals/referrals.json"

// Spanish translations
import esCommon from "./es/common.json"
import esLogin from "./es/features/auth/login.json"
import esSignup from "./es/features/auth/signup.json"
import esInvite from "./es/features/auth/invite.json"
import esValidation from "./es/features/auth/validation.json"
import esHome from "./es/features/home/home.json"
import esWallet from "./es/features/wallet/wallet.json"
import esProfile from "./es/features/profile/profile.json"
import esReferrals from "./es/features/referrals/referrals.json"

// French translations
import frCommon from "./fr/common.json"
import frLogin from "./fr/features/auth/login.json"
import frSignup from "./fr/features/auth/signup.json"
import frInvite from "./fr/features/auth/invite.json"
import frValidation from "./fr/features/auth/validation.json"
import frHome from "./fr/features/home/home.json"
import frWallet from "./fr/features/wallet/wallet.json"
import frProfile from "./fr/features/profile/profile.json"
import frReferrals from "./fr/features/referrals/referrals.json"

const resources = {
  pt: {
    "common.greetings": ptCommon.greetings,
    "common.navigation": ptCommon.navigation,
    "auth.login": ptLogin,
    "auth.signup": ptSignup,
    "auth.invite": ptInvite,
    "auth.validation": ptValidation,
    "home.home": ptHome,
    "wallet.wallet": ptWallet,
    "profile.profile": ptProfile,
    "referrals.referrals": ptReferrals,
  },
  en: {
    "common.greetings": enCommon.greetings,
    "common.navigation": enCommon.navigation,
    "auth.login": enLogin,
    "auth.signup": enSignup,
    "auth.invite": enInvite,
    "auth.validation": enValidation,
    "home.home": enHome,
    "wallet.wallet": enWallet,
    "profile.profile": enProfile,
    "referrals.referrals": enReferrals,
  },
  es: {
    "common.greetings": esCommon.greetings,
    "common.navigation": esCommon.navigation,
    "auth.login": esLogin,
    "auth.signup": esSignup,
    "auth.invite": esInvite,
    "auth.validation": esValidation,
    "home.home": esHome,
    "wallet.wallet": esWallet,
    "profile.profile": esProfile,
    "referrals.referrals": esReferrals,
  },
  fr: {
    "common.greetings": frCommon.greetings,
    "common.navigation": frCommon.navigation,
    "auth.login": frLogin,
    "auth.signup": frSignup,
    "auth.invite": frInvite,
    "auth.validation": frValidation,
    "home.home": frHome,
    "wallet.wallet": frWallet,
    "profile.profile": frProfile,
    "referrals.referrals": frReferrals,
  },
}

// Detect browser language
const browserLanguage = navigator.language.split("-")[0] || "pt"

i18n.use(initReactI18next).init({
  lng: browserLanguage, // pt, en, es, fr
  fallbackLng: "pt",
  resources,
  interpolation: {
    escapeValue: false, // React already escapes
  },
})

export default i18n
