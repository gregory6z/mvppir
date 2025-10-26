import { useState } from "react";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Pressable } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "@/lib/auth-client";
import { loginSchema, type LoginInput } from "@/api/schemas/auth.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthStore } from "@/stores/auth.store";
import { spacing, screenPadding, formSpacing } from "@/lib/design-system";
import { BackgroundGlow } from "@/components/BackgroundGlow";

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
      {/* Background gradient effect */}
      <View className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black" />

      {/* Glow effects */}
      <BackgroundGlow color="#3b82f6" top="20%" left="-20%" size={350} />
      <BackgroundGlow color="#8b5cf6" bottom="25%" right="-15%" size={300} />

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingHorizontal: screenPadding.horizontal,
          paddingVertical: screenPadding.vertical * 2,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo Section */}
        <View style={{ alignItems: "center", marginBottom: spacing.xl }}>
          <View
            style={{
              width: 88,
              height: 88,
              borderRadius: 44,
              backgroundColor: "#3b82f6",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: spacing.md,
              // Shadow para iOS e Android
              ...Platform.select({
                ios: {
                  shadowColor: "#3b82f6",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.4,
                  shadowRadius: 16,
                },
                android: {
                  elevation: 12,
                },
              }),
            }}
            accessible={true}
            accessibilityLabel="Logo MVPPIR"
            accessibilityRole="image"
          >
            <Text style={{ fontSize: 44, fontWeight: "bold", color: "white" }}>M</Text>
          </View>
          <Text
            style={{
              fontSize: 32,
              fontWeight: "bold",
              color: "white",
              marginBottom: spacing.xs,
              letterSpacing: -0.5,
            }}
          >
            MVPPIR
          </Text>
          <Text style={{ fontSize: 16, color: "#a1a1aa" }}>Bem-vindo de volta</Text>
        </View>

        {/* Login Card - Modern minimalist style */}
        <View
          style={{
            borderRadius: 20,
            borderWidth: 1,
            borderColor: "#27272a",
            backgroundColor: "#18181b",
            // Shadow para profundidade
            ...Platform.select({
              ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.5,
                shadowRadius: 24,
              },
              android: {
                elevation: 16,
              },
            }),
          }}
        >
          <View style={{ padding: spacing.lg }}>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "700",
                color: "white",
                marginBottom: spacing.xs,
              }}
            >
              Entrar na sua conta
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#a1a1aa",
                marginBottom: spacing.lg,
              }}
            >
              Digite suas credenciais para acessar
            </Text>

            <View style={{ gap: formSpacing.fieldGap }}>
              {/* Email Field */}
              <View style={{ gap: formSpacing.labelToInput }}>
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
                      textContentType="emailAddress"
                      returnKeyType="next"
                      editable={!isLoading}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      className="h-12 bg-zinc-950 border-zinc-800 text-white text-base"
                      accessibilityLabel="Campo de email"
                      accessibilityHint="Digite seu endereço de email"
                    />
                  )}
                />
                {errors.email && (
                  <Text
                    style={{
                      fontSize: 14,
                      color: "#ef4444",
                      marginTop: formSpacing.inputToError,
                    }}
                    accessibilityRole="alert"
                  >
                    {errors.email.message}
                  </Text>
                )}
              </View>

              {/* Password Field */}
              <View style={{ gap: formSpacing.labelToInput }}>
                <Label>Senha</Label>
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      placeholder="Mínimo 8 caracteres"
                      secureTextEntry
                      autoCapitalize="none"
                      autoComplete="password"
                      textContentType="password"
                      returnKeyType="done"
                      editable={!isLoading}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      className="h-12 bg-zinc-950 border-zinc-800 text-white text-base"
                      accessibilityLabel="Campo de senha"
                      accessibilityHint="Digite sua senha"
                    />
                  )}
                />
                {errors.password && (
                  <Text
                    style={{
                      fontSize: 14,
                      color: "#ef4444",
                      marginTop: formSpacing.inputToError,
                    }}
                    accessibilityRole="alert"
                  >
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
                className="w-full h-12 bg-primary mt-2"
                accessibilityLabel={isLoading ? "Carregando, aguarde" : "Entrar na sua conta"}
                accessibilityHint="Toca duas vezes para fazer login"
                accessibilityRole="button"
                accessibilityState={{ disabled: isLoading, busy: isLoading }}
              />

              {/* Signup Link */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: spacing.md,
                  gap: spacing.sm,
                }}
              >
                <Text style={{ fontSize: 14, color: "#a1a1aa" }}>Não tem uma conta?</Text>
                <Pressable
                  onPress={onNavigateToSignup}
                  disabled={isLoading}
                  style={{
                    minHeight: 44,
                    minWidth: 44,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  accessibilityLabel="Criar nova conta"
                  accessibilityHint="Toca duas vezes para ir para a tela de cadastro"
                  accessibilityRole="button"
                >
                  <Text style={{ fontSize: 14, color: "#3b82f6", fontWeight: "600" }}>
                    Criar conta
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
