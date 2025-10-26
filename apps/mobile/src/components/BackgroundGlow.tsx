import { View } from "react-native";
import { memo } from "react";

interface BackgroundGlowProps {
  color: string;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  size?: number;
}

/**
 * Creates a soft glow effect using multiple layered circles
 * Optimized for performance - no heavy SVG filters
 */
export const BackgroundGlow = memo(function BackgroundGlow({
  color,
  top,
  bottom,
  left,
  right,
  size = 300
}: BackgroundGlowProps) {
  const position = {
    ...(top && { top }),
    ...(bottom && { bottom }),
    ...(left && { left }),
    ...(right && { right }),
  };

  // Lightweight layered circles for glow effect
  const layers = [
    { scale: 2.0, opacity: 0.03 },
    { scale: 1.6, opacity: 0.05 },
    { scale: 1.3, opacity: 0.08 },
    { scale: 1.0, opacity: 0.12 },
    { scale: 0.7, opacity: 0.15 },
  ];

  return (
    <View
      style={{
        position: "absolute",
        ...position,
        width: size * 2.2,
        height: size * 2.2,
        alignItems: "center",
        justifyContent: "center",
      }}
      pointerEvents="none"
    >
      {layers.map((layer, index) => (
        <View
          key={index}
          style={{
            position: "absolute",
            width: size * layer.scale,
            height: size * layer.scale,
            borderRadius: (size * layer.scale) / 2,
            backgroundColor: color,
            opacity: layer.opacity,
          }}
        />
      ))}
    </View>
  );
});
