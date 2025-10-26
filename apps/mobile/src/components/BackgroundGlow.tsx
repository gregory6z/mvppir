import { View } from "react-native";

interface BackgroundGlowProps {
  color: string;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  size?: number;
}

/**
 * Creates a blurred glow effect in the background
 * Uses multiple layered circles with different opacities to simulate blur
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
      {/* Outer glow - most blurred (largest, lowest opacity) */}
      <View
        style={{
          position: "absolute",
          width: size * 1.2,
          height: size * 1.2,
          borderRadius: (size * 1.2) / 2,
          backgroundColor: color,
          opacity: 0.03,
        }}
      />

      {/* Middle glow */}
      <View
        style={{
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity: 0.06,
        }}
      />

      {/* Inner glow */}
      <View
        style={{
          position: "absolute",
          width: size * 0.8,
          height: size * 0.8,
          borderRadius: (size * 0.8) / 2,
          backgroundColor: color,
          opacity: 0.08,
        }}
      />

      {/* Core */}
      <View
        style={{
          position: "absolute",
          width: size * 0.6,
          height: size * 0.6,
          borderRadius: (size * 0.6) / 2,
          backgroundColor: color,
          opacity: 0.12,
        }}
      />
    </View>
  );
}
