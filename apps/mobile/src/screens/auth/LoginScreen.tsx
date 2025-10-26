import { useState } from "react";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Pressable } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "@/lib/auth-client";
import { loginSchema, type LoginInput } from "@/api/schemas/auth.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthStore } from "@/stores/auth.store";

interface LoginScreenProps {
  onNavigateToSignup: () => void;
}

type LoginError =
  | "INVALID_CREDENTIALS"
  | "ACCOUNT_BLOCKED"
  | "NETWORK_ERROR"
  | "UNKNOWN_ERROR";

const errorMessages: Record<LoginError, string> = {
  INVALID_CREDENTIALS: "Email ou senha incorretos",
  ACCOUNT_BLOCKED: "Sua conta foi bloqueada. Entre em contato com o suporte.",
  NETWORK_ERROR: "Erro de conexão. Tente novamente.",
  UNKNOWN_ERROR: "Erro desconhecido. Tente novamente.",
};

export function LoginScreen({ onNavigateToSignup }: LoginScreenProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<LoginError | null>(null);
  const { setAuth } = useAuthStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn.email({
        email: data.email,
        password: data.password,
      });

      if (result.error) {
        if (result.error.message?.includes("Invalid credentials")) {
          setError("INVALID_CREDENTIALS");
        } else if (result.error.message?.includes("blocked")) {
          setError("ACCOUNT_BLOCKED");
        } else {
          setError("UNKNOWN_ERROR");
        }
        setIsLoading(false);
        return;
      }

      // Login bem-sucedido
      if (result.data?.token && result.data?.user) {
        setAuth(result.data.token, result.data.user.id);
        // Navigation will be handled by auth state change
      }
    } catch (err) {
      console.error("❌ Erro no login:", err);
      setError("NETWORK_ERROR");
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-zinc-950"
    >
      <ScrollView
        contentContainerClassName="flex-1 justify-center px-6 py-12"
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo Placeholder */}
        <View className="items-center mb-8">
          <View className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent items-center justify-center mb-4">
            <Text className="text-4xl font-bold text-white">M</Text>
          </View>
          <Text className="text-3xl font-bold text-white">MVPPIR</Text>
          <Text className="text-zinc-400 text-sm mt-1">Bem-vindo de volta</Text>
        </View>

        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader className="pb-4">
            <CardTitle>Entrar na sua conta</CardTitle>
            <CardDescription>
              Digite suas credenciais para acessar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <View className="space-y-6">
              {/* Email */}
              <View className="space-y-2">
                <Label>Email</Label>
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      placeholder="seu@email.com"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      editable={!isLoading}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      className="bg-zinc-950 border-zinc-800 text-white"
                    />
                  )}
                />
                {errors.email && (
                  <Text className="text-sm text-danger">
                    {errors.email.message}
                  </Text>
                )}
              </View>

              {/* Password */}
              <View className="space-y-2">
                <Label>Senha</Label>
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      placeholder="••••••••"
                      secureTextEntry
                      autoCapitalize="none"
                      autoComplete="password"
                      editable={!isLoading}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      className="bg-zinc-950 border-zinc-800 text-white"
                    />
                  )}
                />
                {errors.password && (
                  <Text className="text-sm text-danger">
                    {errors.password.message}
                  </Text>
                )}
              </View>

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{errorMessages[error]}</AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                label={isLoading ? "Entrando..." : "Entrar"}
                onPress={handleSubmit(onSubmit)}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-primary to-accent"
              />

              {/* Signup Link */}
              <View className="flex-row justify-center items-center gap-2 mt-4">
                <Text className="text-zinc-400 text-sm">
                  Não tem uma conta?
                </Text>
                <Pressable onPress={onNavigateToSignup} disabled={isLoading}>
                  <Text className="text-primary text-sm font-semibold">
                    Criar conta
                  </Text>
                </Pressable>
              </View>
            </View>
          </CardContent>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
