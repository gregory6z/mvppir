import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { getLocales } from "expo-localization";

// Portuguese translations
import ptLogin from "./pt/features/auth/login.json";
import ptSignup from "./pt/features/auth/signup.json";
import ptValidation from "./pt/features/auth/validation.json";

// English translations
import enLogin from "./en/features/auth/login.json";
import enSignup from "./en/features/auth/signup.json";
import enValidation from "./en/features/auth/validation.json";

// Spanish translations
import esLogin from "./es/features/auth/login.json";
import esSignup from "./es/features/auth/signup.json";
import esValidation from "./es/features/auth/validation.json";

// French translations
import frLogin from "./fr/features/auth/login.json";
import frSignup from "./fr/features/auth/signup.json";
import frValidation from "./fr/features/auth/validation.json";

const resources = {
  pt: {
    "auth.login": ptLogin,
    "auth.signup": ptSignup,
    "auth.validation": ptValidation,
  },
  en: {
    "auth.login": enLogin,
    "auth.signup": enSignup,
    "auth.validation": enValidation,
  },
  es: {
    "auth.login": esLogin,
    "auth.signup": esSignup,
    "auth.validation": esValidation,
  },
  fr: {
    "auth.login": frLogin,
    "auth.signup": frSignup,
    "auth.validation": frValidation,
  },
};

const deviceLanguage = getLocales()[0]?.languageCode || "pt";

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: "v4", // React Native fix
    lng: deviceLanguage, // pt, en, es, fr
    fallbackLng: "pt",
    resources,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false, // Disable suspense for React Native
    },
  });

export default i18n;
