import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SignOut, PencilSimple, Globe, Check } from "phosphor-react-native";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/home/Header";
import { useUserAccount } from "@/api/user/queries/use-user-account-query";
import { useAuthStore } from "@/stores/auth.store";

const LANGUAGES = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "pt", name: "Português", flag: "🇧🇷" },
];

export function ProfileScreen() {
  const { t, i18n } = useTranslation("profile.profile");
  const { data: userAccount } = useUserAccount();
  const { clearAuth } = useAuthStore();

  const currentLanguage = i18n.language;

  const handleLogout = () => {
    Alert.alert(
      t("logout.title"),
      t("logout.message"),
      [
        {
          text: t("logout.cancel"),
          style: "cancel",
        },
        {
          text: t("logout.confirm"),
          style: "destructive",
          onPress: () => {
            clearAuth();
            console.log("User logged out");
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleEditProfile = () => {
    // TODO: Navigate to edit profile screen
    console.log("Edit profile pressed");
    Alert.alert(t("editProfile.comingSoon"), t("editProfile.comingSoonMessage"));
  };

  const handleChangeLanguage = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    console.log(`Language changed to: ${languageCode}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-950" edges={["left", "right"]}>
      {/* Header */}
      <Header
        userName={userAccount?.name || ""}
        avatarUrl={undefined}
        notificationCount={0}
        onAvatarPress={() => {}}
        onNotificationPress={() => {}}
      />

      {/* Title Section */}
      <View className="px-4 py-4 border-b border-zinc-800">
        <Text className="text-white text-2xl font-bold">{t("title")}</Text>
        <Text className="text-zinc-400 text-sm mt-1">{t("subtitle")}</Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* User Info Card */}
        <View className="mx-4 mt-4 bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
          <View className="flex-row items-center mb-4">
            <View className="w-16 h-16 rounded-full bg-violet-500 items-center justify-center mr-4">
              <Text className="text-white text-xl font-bold">
                {userAccount?.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .substring(0, 2)
                  .toUpperCase()}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-white text-xl font-bold">{userAccount?.name}</Text>
              <Text className="text-zinc-400 text-sm mt-1">{userAccount?.email}</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleEditProfile}
            className="flex-row items-center justify-center py-3 rounded-xl bg-violet-500 active:bg-violet-600"
            accessibilityLabel="Edit profile"
            accessibilityRole="button"
          >
            <PencilSimple size={20} color="#ffffff" weight="bold" />
            <Text className="text-white font-semibold ml-2">{t("editProfile.button")}</Text>
          </TouchableOpacity>
        </View>

        {/* Account Information */}
        <View className="mx-4 mt-4 bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
          <Text className="text-white font-semibold text-sm mb-3">{t("accountInfo.title")}</Text>

          <View className="space-y-3">
            <View className="py-2 border-b border-zinc-800">
              <Text className="text-zinc-400 text-xs">{t("accountInfo.name")}</Text>
              <Text className="text-white text-base mt-1">{userAccount?.name}</Text>
            </View>

            <View className="py-2 border-b border-zinc-800">
              <Text className="text-zinc-400 text-xs">{t("accountInfo.email")}</Text>
              <Text className="text-white text-base mt-1">{userAccount?.email}</Text>
            </View>

            <View className="py-2 border-b border-zinc-800">
              <Text className="text-zinc-400 text-xs">{t("accountInfo.status")}</Text>
              <View className="flex-row items-center mt-1">
                <View
                  className={`w-2 h-2 rounded-full mr-2 ${
                    userAccount?.status === "ACTIVE" ? "bg-green-500" : "bg-orange-500"
                  }`}
                />
                <Text className="text-white text-base">
                  {userAccount?.status === "ACTIVE"
                    ? t("accountInfo.statusActive")
                    : t("accountInfo.statusInactive")}
                </Text>
              </View>
            </View>

            <View className="py-2">
              <Text className="text-zinc-400 text-xs">{t("accountInfo.referralCode")}</Text>
              <Text className="text-white text-base mt-1 font-mono">
                {userAccount?.referralCode}
              </Text>
            </View>
          </View>
        </View>

        {/* Language Settings */}
        <View className="mx-4 mt-4 bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
          <View className="flex-row items-center mb-3">
            <Globe size={20} color="#8b5cf6" weight="bold" />
            <Text className="text-white font-semibold text-sm ml-2">{t("language.title")}</Text>
          </View>

          <View>
            {LANGUAGES.map((language, index) => (
              <TouchableOpacity
                key={language.code}
                onPress={() => handleChangeLanguage(language.code)}
                className={`flex-row items-center justify-between py-3 px-4 rounded-xl ${
                  currentLanguage === language.code ? "bg-violet-500/20 border border-violet-500/50" : "bg-zinc-800"
                } ${index !== LANGUAGES.length - 1 ? "mb-2" : ""}`}
                accessibilityLabel={`Select ${language.name}`}
                accessibilityRole="button"
              >
                <View className="flex-row items-center">
                  <Text className="text-2xl mr-3">{language.flag}</Text>
                  <Text
                    className={`text-base ${
                      currentLanguage === language.code ? "text-violet-400 font-semibold" : "text-white"
                    }`}
                  >
                    {language.name}
                  </Text>
                </View>
                {currentLanguage === language.code && (
                  <Check size={20} color="#a78bfa" weight="bold" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Logout Button */}
        <View className="mx-4 mt-6">
          <TouchableOpacity
            onPress={handleLogout}
            className="flex-row items-center justify-center py-4 rounded-xl bg-red-500/10 border border-red-500/30 active:bg-red-500/20"
            accessibilityLabel="Logout"
            accessibilityRole="button"
          >
            <SignOut size={24} color="#ef4444" weight="bold" />
            <Text className="text-red-500 font-semibold text-base ml-2">{t("logout.button")}</Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View className="mx-4 mt-6">
          <Text className="text-zinc-600 text-xs text-center">{t("version", { version: "1.0.0" })}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
