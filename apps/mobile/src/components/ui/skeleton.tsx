import { View, type ViewProps } from "react-native";
import { cn } from "@/lib/utils";

interface SkeletonProps extends Omit<ViewProps, "className"> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <View
      className={cn("animate-pulse rounded-md bg-zinc-800", className)}
      {...props}
    />
  );
}
