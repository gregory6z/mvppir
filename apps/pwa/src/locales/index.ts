import i18n from "i18next"
import { initReactI18next } from "react-i18next"

// Portuguese translations
import ptLogin from "./pt/features/auth/login.json"
import ptSignup from "./pt/features/auth/signup.json"
import ptInvite from "./pt/features/auth/invite.json"
import ptValidation from "./pt/features/auth/validation.json"

// English translations
import enLogin from "./en/features/auth/login.json"
import enSignup from "./en/features/auth/signup.json"
import enInvite from "./en/features/auth/invite.json"
import enValidation from "./en/features/auth/validation.json"

// Spanish translations
import esLogin from "./es/features/auth/login.json"
import esSignup from "./es/features/auth/signup.json"
import esInvite from "./es/features/auth/invite.json"
import esValidation from "./es/features/auth/validation.json"

// French translations
import frLogin from "./fr/features/auth/login.json"
import frSignup from "./fr/features/auth/signup.json"
import frInvite from "./fr/features/auth/invite.json"
import frValidation from "./fr/features/auth/validation.json"

const resources = {
  pt: {
    "auth.login": ptLogin,
    "auth.signup": ptSignup,
    "auth.invite": ptInvite,
    "auth.validation": ptValidation,
  },
  en: {
    "auth.login": enLogin,
    "auth.signup": enSignup,
    "auth.invite": enInvite,
    "auth.validation": enValidation,
  },
  es: {
    "auth.login": esLogin,
    "auth.signup": esSignup,
    "auth.invite": esInvite,
    "auth.validation": esValidation,
  },
  fr: {
    "auth.login": frLogin,
    "auth.signup": frSignup,
    "auth.invite": frInvite,
    "auth.validation": frValidation,
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
