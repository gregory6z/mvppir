import { TextInput, type TextInputProps } from "react-native";
import { cn } from "@/lib/utils";

interface InputProps extends TextInputProps {
  className?: string;
}

export function Input({ className, placeholderTextColor, ...props }: InputProps) {
  return (
    <TextInput
      className={cn(
        "h-12 rounded-lg border border-zinc-800 bg-zinc-950 px-4 text-base text-white placeholder:text-zinc-500",
        "focus:border-primary focus:ring-2 focus:ring-primary/20",
        className
      )}
      placeholderTextColor={placeholderTextColor || "#71717a"}
      {...props}
    />
  );
}
