import i18n from "i18next"
import { initReactI18next } from "react-i18next"

// Portuguese translations
import ptCommon from "./pt/common.json"
import ptLogin from "./pt/features/auth/login.json"
import ptSignup from "./pt/features/auth/signup.json"
import ptInvite from "./pt/features/auth/invite.json"
import ptValidation from "./pt/features/auth/validation.json"
import ptHome from "./pt/features/home/home.json"
import ptInactive from "./pt/features/home/inactive.json"
import ptWallet from "./pt/features/wallet/wallet.json"
import ptProfile from "./pt/features/profile/profile.json"
import ptReferrals from "./pt/features/referrals/referrals.json"
import ptDeposit from "./pt/features/deposit/deposit.json"
import ptWithdraw from "./pt/features/withdraw/withdraw.json"
import ptNotifications from "./pt/features/notifications/notifications.json"
import ptCommissionDrawer from "./pt/features/commission/drawer.json"
import ptTransactionDetail from "./pt/features/transactions/detail.json"
import ptInstall from "./pt/features/install/install.json"

// English translations
import enCommon from "./en/common.json"
import enLogin from "./en/features/auth/login.json"
import enSignup from "./en/features/auth/signup.json"
import enInvite from "./en/features/auth/invite.json"
import enValidation from "./en/features/auth/validation.json"
import enHome from "./en/features/home/home.json"
import enInactive from "./en/features/home/inactive.json"
import enWallet from "./en/features/wallet/wallet.json"
import enProfile from "./en/features/profile/profile.json"
import enReferrals from "./en/features/referrals/referrals.json"
import enDeposit from "./en/features/deposit/deposit.json"
import enWithdraw from "./en/features/withdraw/withdraw.json"
import enNotifications from "./en/features/notifications/notifications.json"
import enCommissionDrawer from "./en/features/commission/drawer.json"
import enTransactionDetail from "./en/features/transactions/detail.json"
import enInstall from "./en/features/install/install.json"

// Spanish translations
import esCommon from "./es/common.json"
import esLogin from "./es/features/auth/login.json"
import esSignup from "./es/features/auth/signup.json"
import esInvite from "./es/features/auth/invite.json"
import esValidation from "./es/features/auth/validation.json"
import esHome from "./es/features/home/home.json"
import esInactive from "./es/features/home/inactive.json"
import esWallet from "./es/features/wallet/wallet.json"
import esProfile from "./es/features/profile/profile.json"
import esReferrals from "./es/features/referrals/referrals.json"
import esDeposit from "./es/features/deposit/deposit.json"
import esWithdraw from "./es/features/withdraw/withdraw.json"
import esNotifications from "./es/features/notifications/notifications.json"
import esCommissionDrawer from "./es/features/commission/drawer.json"
import esTransactionDetail from "./es/features/transactions/detail.json"
import esInstall from "./es/features/install/install.json"

// French translations
import frCommon from "./fr/common.json"
import frLogin from "./fr/features/auth/login.json"
import frSignup from "./fr/features/auth/signup.json"
import frInvite from "./fr/features/auth/invite.json"
import frValidation from "./fr/features/auth/validation.json"
import frHome from "./fr/features/home/home.json"
import frInactive from "./fr/features/home/inactive.json"
import frWallet from "./fr/features/wallet/wallet.json"
import frProfile from "./fr/features/profile/profile.json"
import frReferrals from "./fr/features/referrals/referrals.json"
import frDeposit from "./fr/features/deposit/deposit.json"
import frWithdraw from "./fr/features/withdraw/withdraw.json"
import frNotifications from "./fr/features/notifications/notifications.json"
import frCommissionDrawer from "./fr/features/commission/drawer.json"
import frTransactionDetail from "./fr/features/transactions/detail.json"
import frInstall from "./fr/features/install/install.json"

const resources = {
  pt: {
    "common.greetings": ptCommon.greetings,
    "common.navigation": ptCommon.navigation,
    "auth.login": ptLogin,
    "auth.signup": ptSignup,
    "auth.invite": ptInvite,
    "auth.validation": ptValidation,
    "home.home": ptHome,
    "home.inactive": ptInactive,
    "wallet.wallet": ptWallet,
    "profile.profile": ptProfile,
    "referrals.referrals": ptReferrals,
    "deposit.deposit": ptDeposit,
    "withdraw.withdraw": ptWithdraw,
    "notifications.notifications": ptNotifications,
    "commission.drawer": ptCommissionDrawer,
    "transactions.detail": ptTransactionDetail,
    "install.install": ptInstall,
  },
  en: {
    "common.greetings": enCommon.greetings,
    "common.navigation": enCommon.navigation,
    "auth.login": enLogin,
    "auth.signup": enSignup,
    "auth.invite": enInvite,
    "auth.validation": enValidation,
    "home.home": enHome,
    "home.inactive": enInactive,
    "wallet.wallet": enWallet,
    "profile.profile": enProfile,
    "referrals.referrals": enReferrals,
    "deposit.deposit": enDeposit,
    "withdraw.withdraw": enWithdraw,
    "notifications.notifications": enNotifications,
    "commission.drawer": enCommissionDrawer,
    "transactions.detail": enTransactionDetail,
    "install.install": enInstall,
  },
  es: {
    "common.greetings": esCommon.greetings,
    "common.navigation": esCommon.navigation,
    "auth.login": esLogin,
    "auth.signup": esSignup,
    "auth.invite": esInvite,
    "auth.validation": esValidation,
    "home.home": esHome,
    "home.inactive": esInactive,
    "wallet.wallet": esWallet,
    "profile.profile": esProfile,
    "referrals.referrals": esReferrals,
    "deposit.deposit": esDeposit,
    "withdraw.withdraw": esWithdraw,
    "notifications.notifications": esNotifications,
    "commission.drawer": esCommissionDrawer,
    "transactions.detail": esTransactionDetail,
    "install.install": esInstall,
  },
  fr: {
    "common.greetings": frCommon.greetings,
    "common.navigation": frCommon.navigation,
    "auth.login": frLogin,
    "auth.signup": frSignup,
    "auth.invite": frInvite,
    "auth.validation": frValidation,
    "home.home": frHome,
    "home.inactive": frInactive,
    "wallet.wallet": frWallet,
    "profile.profile": frProfile,
    "referrals.referrals": frReferrals,
    "deposit.deposit": frDeposit,
    "withdraw.withdraw": frWithdraw,
    "notifications.notifications": frNotifications,
    "commission.drawer": frCommissionDrawer,
    "transactions.detail": frTransactionDetail,
    "install.install": frInstall,
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
