import { View, Text, TouchableOpacity } from "react-native";
import { Bell, UserCircle } from "phosphor-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

interface HeaderProps {
  userName: string;
  avatarUrl?: string;
  notificationCount?: number;
  onAvatarPress: () => void;
  onNotificationPress: () => void;
}

export function Header({
  userName,
  notificationCount = 0,
  onAvatarPress,
  onNotificationPress,
}: HeaderProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation("common.greetings");

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t("morning");
    if (hour < 18) return t("afternoon");
    return t("evening");
  };

  // Get initials from name
  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <View
      style={{ paddingTop: insets.top > 0 ? insets.top + 12 : 20 }}
      className="bg-zinc-950 px-4 pb-2"
    >
      <View className="flex-row items-center justify-between">
        {/* Avatar + Greeting */}
        <TouchableOpacity
          onPress={onAvatarPress}
          className="flex-row items-center gap-3"
          accessibilityLabel="Profile"
          accessibilityHint="Tap to open profile settings"
        >
          {/* Avatar Circle with Initials */}
          <View className="w-12 h-12 rounded-full bg-violet-500 items-center justify-center">
            <Text className="text-white text-base font-semibold">
              {getInitials(userName)}
            </Text>
          </View>

          {/* Greeting Text */}
          <View>
            <Text className="text-zinc-400 text-xs font-medium">
              {getGreeting()}
            </Text>
            <Text className="text-white text-base font-semibold">
              {userName}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Notification Bell */}
        <TouchableOpacity
          onPress={onNotificationPress}
          className="relative"
          accessibilityLabel="Notifications"
          accessibilityHint="Tap to view notifications"
        >
          <Bell size={28} color="#ffffff" weight="regular" />
          {notificationCount > 0 && (
            <View className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-[18px] h-[18px] items-center justify-center px-1">
              <Text className="text-white text-xs font-bold">
                {notificationCount > 9 ? "9+" : notificationCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
