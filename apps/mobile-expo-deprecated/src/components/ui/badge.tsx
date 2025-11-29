import { cva, type VariantProps } from "class-variance-authority";
import { View, Text, type ViewProps } from "react-native";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary",
        secondary: "border-transparent bg-accent",
        success: "border-transparent bg-success",
        warning: "border-transparent bg-warning",
        destructive: "border-transparent bg-danger",
        outline: "border-zinc-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const badgeTextVariants = cva("text-xs font-semibold", {
  variants: {
    variant: {
      default: "text-white",
      secondary: "text-white",
      success: "text-white",
      warning: "text-white",
      destructive: "text-white",
      outline: "text-zinc-200",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface BadgeProps extends Omit<ViewProps, "className">, VariantProps<typeof badgeVariants> {
  label: string;
  className?: string;
  textClassName?: string;
}

export function Badge({
  label,
  variant,
  className,
  textClassName,
  ...props
}: BadgeProps) {
  return (
    <View className={cn(badgeVariants({ variant }), className)} {...props}>
      <Text className={cn(badgeTextVariants({ variant }), textClassName)}>
        {label}
      </Text>
    </View>
  );
}
