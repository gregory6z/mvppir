import { TextInput, type TextInputProps } from "react-native";
import { cn } from "@/lib/utils";

interface InputProps extends TextInputProps {
  className?: string;
  error?: boolean;
}

export function Input({ className, placeholderTextColor, error, ...props }: InputProps) {
  return (
    <TextInput
      className={cn(
        "h-12 rounded-lg border bg-zinc-950 px-4 text-base text-white placeholder:text-zinc-500",
        error
          ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
          : "border-zinc-800 focus:border-primary focus:ring-2 focus:ring-primary/20",
        className
      )}
      placeholderTextColor={placeholderTextColor || "#71717a"}
      {...props}
    />
  );
}
