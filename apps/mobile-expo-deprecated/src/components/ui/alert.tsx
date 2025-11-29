import { cva, type VariantProps } from "class-variance-authority";
import { View, Text, type ViewProps } from "react-native";
import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border p-4",
  {
    variants: {
      variant: {
        default: "bg-zinc-900 border-zinc-800 text-white",
        destructive: "bg-danger/10 border-danger/50 text-danger",
        success: "bg-success/10 border-success/50 text-success",
        warning: "bg-warning/10 border-warning/50 text-warning",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface AlertProps extends Omit<ViewProps, "className">, VariantProps<typeof alertVariants> {
  className?: string;
}

function Alert({ className, variant, ...props }: AlertProps) {
  return (
    <View className={cn(alertVariants({ variant }), className)} {...props} />
  );
}

interface AlertTitleProps {
  children: string;
  className?: string;
}

function AlertTitle({ className, children }: AlertTitleProps) {
  return (
    <Text
      className={cn(
        "mb-1 font-medium leading-none tracking-tight text-white",
        className
      )}
    >
      {children}
    </Text>
  );
}

interface AlertDescriptionProps {
  children: string;
  className?: string;
}

function AlertDescription({ className, children }: AlertDescriptionProps) {
  return (
    <Text className={cn("text-sm text-zinc-400 leading-relaxed", className)}>
      {children}
    </Text>
  );
}

export { Alert, AlertTitle, AlertDescription };
