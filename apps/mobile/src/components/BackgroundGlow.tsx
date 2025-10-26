import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface BackgroundGlowProps {
  color: string;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  size?: number;
}

/**
 * Creates a soft radial glow effect using LinearGradient
 * Smooth blur-like effect without performance issues
 */
export function BackgroundGlow({ color, top, bottom, left, right, size = 300 }: BackgroundGlowProps) {
  const position = {
    ...(top && { top }),
    ...(bottom && { bottom }),
    ...(left && { left }),
    ...(right && { right }),
  };

  // Convert hex to rgba for gradient
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <View
      style={{
        position: "absolute",
        ...position,
        width: size * 2,
        height: size * 2,
        alignItems: "center",
        justifyContent: "center",
      }}
      pointerEvents="none"
    >
      <LinearGradient
        colors={[
          hexToRgba(color, 0.15),
          hexToRgba(color, 0.1),
          hexToRgba(color, 0.06),
          hexToRgba(color, 0.03),
          hexToRgba(color, 0.01),
          "transparent",
        ]}
        start={{ x: 0.5, y: 0.5 }}
        end={{ x: 1, y: 1 }}
        style={{
          width: size * 2,
          height: size * 2,
          borderRadius: size,
        }}
      />
    </View>
  );
}
