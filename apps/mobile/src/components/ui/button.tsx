import { cva, type VariantProps } from "class-variance-authority";
import { Pressable, Text, ActivityIndicator } from "react-native";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "flex-row items-center justify-center rounded-lg active:opacity-80",
  {
    variants: {
      variant: {
        default: "bg-primary",
        secondary: "bg-accent",
        success: "bg-success",
        warning: "bg-warning",
        destructive: "bg-danger",
        outline: "border-2 border-zinc-700 bg-transparent",
        ghost: "bg-transparent",
      },
      size: {
        default: "h-12 px-6",
        sm: "h-10 px-4",
        lg: "h-14 px-8",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const buttonTextVariants = cva("font-semibold text-center", {
  variants: {
    variant: {
      default: "text-white",
      secondary: "text-white",
      success: "text-white",
      warning: "text-white",
      destructive: "text-white",
      outline: "text-zinc-200",
      ghost: "text-zinc-200",
    },
    size: {
      default: "text-base",
      sm: "text-sm",
      lg: "text-lg",
      icon: "text-base",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

interface ButtonProps
  extends React.ComponentPropsWithoutRef<typeof Pressable>,
    VariantProps<typeof buttonVariants> {
  label: string;
  textClassName?: string;
  loading?: boolean;
}

export function Button({
  label,
  variant,
  size,
  className,
  textClassName,
  loading = false,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <Pressable
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color="#ffffff" />
      ) : (
        <Text
          className={cn(buttonTextVariants({ variant, size }), textClassName)}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}
