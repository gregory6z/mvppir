import { Text, type TextProps } from "react-native";
import { cn } from "@/lib/utils";

interface LabelProps extends TextProps {
  children: string;
  className?: string;
}

export function Label({ className, children, ...props }: LabelProps) {
  return (
    <Text
      className={cn(
        "text-sm font-medium leading-none text-zinc-200 peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    >
      {children}
    </Text>
  );
}
