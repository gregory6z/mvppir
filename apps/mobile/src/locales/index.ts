import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { getLocales } from "expo-localization";

// Portuguese translations
import ptLogin from "./pt/features/auth/login.json";
import ptSignup from "./pt/features/auth/signup.json";
import ptValidation from "./pt/features/auth/validation.json";
import ptReferral from "./pt/features/auth/referral.json";
import ptGreetings from "./pt/common/greetings.json";
import ptHome from "./pt/features/home/home.json";
import ptWallet from "./pt/features/wallet/wallet.json";
import ptDeposit from "./pt/features/deposit/deposit.json";
import ptProfile from "./pt/features/profile/profile.json";

// English translations
import enLogin from "./en/features/auth/login.json";
import enSignup from "./en/features/auth/signup.json";
import enValidation from "./en/features/auth/validation.json";
import enReferral from "./en/features/auth/referral.json";
import enGreetings from "./en/common/greetings.json";
import enHome from "./en/features/home/home.json";
import enWallet from "./en/features/wallet/wallet.json";
import enDeposit from "./en/features/deposit/deposit.json";
import enProfile from "./en/features/profile/profile.json";

// Spanish translations
import esLogin from "./es/features/auth/login.json";
import esSignup from "./es/features/auth/signup.json";
import esValidation from "./es/features/auth/validation.json";
import esReferral from "./es/features/auth/referral.json";
import esGreetings from "./es/common/greetings.json";
import esHome from "./es/features/home/home.json";
import esWallet from "./es/features/wallet/wallet.json";
import esDeposit from "./es/features/deposit/deposit.json";
import esProfile from "./es/features/profile/profile.json";

// French translations
import frLogin from "./fr/features/auth/login.json";
import frSignup from "./fr/features/auth/signup.json";
import frValidation from "./fr/features/auth/validation.json";
import frReferral from "./fr/features/auth/referral.json";
import frGreetings from "./fr/common/greetings.json";
import frHome from "./fr/features/home/home.json";
import frWallet from "./fr/features/wallet/wallet.json";
import frDeposit from "./fr/features/deposit/deposit.json";
import frProfile from "./fr/features/profile/profile.json";

const resources = {
  pt: {
    "auth.login": ptLogin,
    "auth.signup": ptSignup,
    "auth.validation": ptValidation,
    "auth.referral": ptReferral,
    "common.greetings": ptGreetings,
    "home.home": ptHome,
    "wallet.wallet": ptWallet,
    "deposit.deposit": ptDeposit,
    "profile.profile": ptProfile,
  },
  en: {
    "auth.login": enLogin,
    "auth.signup": enSignup,
    "auth.validation": enValidation,
    "auth.referral": enReferral,
    "common.greetings": enGreetings,
    "home.home": enHome,
    "wallet.wallet": enWallet,
    "deposit.deposit": enDeposit,
    "profile.profile": enProfile,
  },
  es: {
    "auth.login": esLogin,
    "auth.signup": esSignup,
    "auth.validation": esValidation,
    "auth.referral": esReferral,
    "common.greetings": esGreetings,
    "home.home": esHome,
    "wallet.wallet": esWallet,
    "deposit.deposit": esDeposit,
    "profile.profile": esProfile,
  },
  fr: {
    "auth.login": frLogin,
    "auth.signup": frSignup,
    "auth.validation": frValidation,
    "auth.referral": frReferral,
    "common.greetings": frGreetings,
    "home.home": frHome,
    "wallet.wallet": frWallet,
    "deposit.deposit": frDeposit,
    "profile.profile": frProfile,
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
