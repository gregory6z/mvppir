import { View, Text, TouchableOpacity } from "react-native";
import * as Haptics from "expo-haptics";
import { House, Wallet, Users, User } from "phosphor-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { IconProps } from "phosphor-react-native";

type TabId = "home" | "wallet" | "referrals" | "profile";

interface TabItem {
  id: TabId;
  label: string;
  icon: React.ComponentType<IconProps>;
}

interface TabBarProps {
  activeTab: TabId;
  onTabPress: (tab: TabId) => void;
}

const tabs: TabItem[] = [
  { id: "home", label: "Home", icon: House },
  { id: "wallet", label: "Wallet", icon: Wallet },
  { id: "referrals", label: "Referrals", icon: Users },
  { id: "profile", label: "Profile", icon: User },
];

export function TabBar({ activeTab, onTabPress }: TabBarProps) {
  const insets = useSafeAreaInsets();

  const handleTabPress = (tabId: TabId) => {
    if (tabId !== activeTab) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onTabPress(tabId);
  };

  return (
    <View
      style={{ paddingBottom: insets.bottom }}
      className="bg-zinc-900"
    >
      {/* Tab Container */}
      <View className="flex-row items-center justify-around px-4 py-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => handleTabPress(tab.id)}
              className={`flex-1 items-center py-2.5 rounded-2xl ${
                isActive ? "bg-violet-500/10" : ""
              }`}
              accessibilityLabel={tab.label}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
            >
              <Icon
                size={26}
                color={isActive ? "#8b5cf6" : "#71717a"}
                weight={isActive ? "fill" : "regular"}
              />
              <Text
                className={`text-[10px] mt-1 ${
                  isActive
                    ? "text-violet-500 font-bold"
                    : "text-zinc-500 font-medium"
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
