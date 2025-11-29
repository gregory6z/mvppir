import { View, Text, TouchableOpacity } from "react-native";
import * as Haptics from "expo-haptics";
import type { IconProps } from "phosphor-react-native";
import {
  ArrowDown,
  ArrowUp,
  UserPlus,
} from "phosphor-react-native";
import { useTranslation } from "react-i18next";

interface Action {
  id: "deposit" | "withdraw" | "refer";
  label: string;
  icon: React.ComponentType<IconProps>;
  onPress: () => void;
}

interface QuickActionsProps {
  onDepositPress: () => void;
  onWithdrawPress: () => void;
  onReferPress: () => void;
}

export function QuickActions({
  onDepositPress,
  onWithdrawPress,
  onReferPress,
}: QuickActionsProps) {
  const { t } = useTranslation("home.home");

  const handleActionPress = (action: Action) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    action.onPress();
  };

  const actions: Action[] = [
    {
      id: "deposit",
      label: t("quickActions.deposit"),
      icon: ArrowDown,
      onPress: onDepositPress,
    },
    {
      id: "withdraw",
      label: t("quickActions.withdraw"),
      icon: ArrowUp,
      onPress: onWithdrawPress,
    },
    {
      id: "refer",
      label: t("quickActions.refer"),
      icon: UserPlus,
      onPress: onReferPress,
    },
  ];

  return (
    <View className="mx-4 mt-6">
      {/* Title */}
      <Text className="text-white text-base font-semibold mb-3">
        {t("quickActions.title")}
      </Text>

      {/* Actions Grid */}
      <View className="gap-3">
        {/* First Row - Deposit and Withdraw */}
        <View className="flex-row gap-3">
          {actions.slice(0, 2).map((action) => {
            const Icon = action.icon;
            return (
              <TouchableOpacity
                key={action.id}
                onPress={() => handleActionPress(action)}
                className="flex-1 bg-zinc-900 min-h-[52px] rounded-2xl border border-zinc-800 flex-row items-center justify-center gap-2 active:bg-zinc-800 active:scale-[0.98]"
                style={{ minHeight: 52 }}
                accessibilityLabel={action.label}
                accessibilityRole="button"
              >
                <Icon size={22} color="#8b5cf6" weight="bold" />
                <Text className="text-white font-semibold text-[15px]">
                  {action.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Second Row - Refer Friends (full width) */}
        {actions.slice(2).map((action) => {
          const Icon = action.icon;
          return (
            <TouchableOpacity
              key={action.id}
              onPress={() => handleActionPress(action)}
              className="bg-violet-500 min-h-[52px] rounded-2xl flex-row items-center justify-center gap-2 active:bg-violet-600 active:scale-[0.98]"
              style={{ minHeight: 52 }}
              accessibilityLabel={action.label}
              accessibilityRole="button"
            >
              <Icon size={22} color="#ffffff" weight="bold" />
              <Text className="text-white font-bold text-[15px]">
                {action.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
