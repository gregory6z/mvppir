import { View, type ViewProps } from "react-native";
import { cn } from "@/lib/utils";

interface SeparatorProps extends Omit<ViewProps, "className"> {
  orientation?: "horizontal" | "vertical";
  className?: string;
}

export function Separator({
  className,
  orientation = "horizontal",
  ...props
}: SeparatorProps) {
  return (
    <View
      className={cn(
        "shrink-0 bg-zinc-800",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      )}
      {...props}
    />
  );
}
