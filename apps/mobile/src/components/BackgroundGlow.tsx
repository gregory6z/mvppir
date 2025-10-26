import { View } from "react-native";
import { BlurView } from "expo-blur";

interface BackgroundGlowProps {
  color: string;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  size?: number;
}

/**
 * Creates a blurred glow effect in the background using expo-blur
 * Simulates the blur effect from web with native blur
 */
export function BackgroundGlow({ color, top, bottom, left, right, size = 300 }: BackgroundGlowProps) {
  const position = {
    ...(top && { top }),
    ...(bottom && { bottom }),
    ...(left && { left }),
    ...(right && { right }),
  };

  return (
    <View
      style={{
        position: "absolute",
        ...position,
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
      pointerEvents="none"
    >
      {/* Colored circle with blur effect */}
      <BlurView
        intensity={80}
        tint="dark"
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          overflow: "hidden",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            width: size * 0.8,
            height: size * 0.8,
            borderRadius: (size * 0.8) / 2,
            backgroundColor: color,
            opacity: 0.3,
          }}
        />
      </BlurView>
    </View>
  );
}
