import { View, Text, type ViewProps } from "react-native";
import { cn } from "@/lib/utils";

interface CardProps extends Omit<ViewProps, "className"> {
  className?: string;
}

function Card({ className, ...props }: CardProps) {
  return (
    <View
      className={cn(
        "rounded-lg border border-zinc-800 bg-zinc-900/50 backdrop-blur",
        className
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: CardProps) {
  return (
    <View
      className={cn("flex-col space-y-2 p-6 pb-4", className)}
      {...props}
    />
  );
}

interface CardTitleProps {
  children: string;
  className?: string;
}

function CardTitle({ className, children }: CardTitleProps) {
  return (
    <Text
      className={cn(
        "text-2xl font-semibold text-white leading-none tracking-tight",
        className
      )}
    >
      {children}
    </Text>
  );
}

interface CardDescriptionProps {
  children: string;
  className?: string;
}

function CardDescription({
  className,
  children,
}: CardDescriptionProps) {
  return (
    <Text
      className={cn("text-sm text-zinc-400", className)}
    >
      {children}
    </Text>
  );
}

function CardContent({ className, ...props }: CardProps) {
  return <View className={cn("p-6 pt-0", className)} {...props} />;
}

function CardFooter({ className, ...props }: CardProps) {
  return (
    <View
      className={cn("flex-row items-center p-6 pt-0", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
};
