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
 * Creates a simple colored circle for background decoration
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
        borderRadius: size / 2,
        backgroundColor: color,
        opacity: 0.15,
      }}
      pointerEvents="none"
    />
  );
}
