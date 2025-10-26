import { useState } from "react";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Pressable } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUp } from "@/lib/auth-client";
import { signupSchema, type SignupInput } from "@/api/schemas/auth.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthStore } from "@/stores/auth.store";
import { spacing, screenPadding, formSpacing } from "@/lib/design-system";

interface SignupScreenProps {
  onNavigateToLogin: () => void;
  referralCode?: string;
}

type SignupError =
  | "EMAIL_EXISTS"
  | "INVALID_REFERRAL"
  | "NETWORK_ERROR"
  | "UNKNOWN_ERROR";

const errorMessages: Record<SignupError, string> = {
  EMAIL_EXISTS: "Este email já está cadastrado",
  INVALID_REFERRAL: "Código de indicação inválido",
  NETWORK_ERROR: "Erro de conexão. Tente novamente.",
  UNKNOWN_ERROR: "Erro desconhecido. Tente novamente.",
};

export function SignupScreen({ onNavigateToLogin, referralCode }: SignupScreenProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<SignupError | null>(null);
  const { setAuth } = useAuthStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      referralCode: referralCode || "",
    },
  });

  const onSubmit = async (data: SignupInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signUp.email({
        name: data.name,
        email: data.email,
        password: data.password,
        // @ts-ignore - Better Auth supports additional fields
        referralCode: data.referralCode?.toUpperCase(),
      });

      if (result.error) {
        if (result.error.message?.includes("already exists")) {
          setError("EMAIL_EXISTS");
        } else if (result.error.message?.includes("referral")) {
          setError("INVALID_REFERRAL");
        } else {
          setError("UNKNOWN_ERROR");
        }
        setIsLoading(false);
        return;
      }

      // Signup bem-sucedido
      if (result.data?.token && result.data?.user) {
        setAuth(result.data.token, result.data.user.id);
        // Navigation will be handled by auth state change
      }
    } catch (err) {
      console.error("❌ Erro no cadastro:", err);
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
      <View
        style={{
          position: "absolute",
          top: "15%",
          right: "-20%",
          width: 300,
          height: 300,
          backgroundColor: "#8b5cf6",
          opacity: 0.1,
          borderRadius: 150,
        }}
      />
      <View
        style={{
          position: "absolute",
          bottom: "25%",
          left: "-15%",
          width: 250,
          height: 250,
          backgroundColor: "#3b82f6",
          opacity: 0.1,
          borderRadius: 125,
        }}
      />

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
              backgroundColor: "#8b5cf6",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: spacing.md,
              // Shadow para iOS e Android
              ...Platform.select({
                ios: {
                  shadowColor: "#8b5cf6",
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
          <Text style={{ fontSize: 16, color: "#a1a1aa" }}>Crie sua conta</Text>
        </View>

        {/* Signup Card - Modern style with shadow */}
        <View
          style={{
            backgroundColor: "#18181b",
            borderRadius: 20,
            borderWidth: 1,
            borderColor: "#27272a",
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
              Criar nova conta
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#a1a1aa",
                marginBottom: spacing.lg,
              }}
            >
              Preencha os dados abaixo para começar
            </Text>

            <View style={{ gap: formSpacing.fieldGap }}>
              {/* Name Field */}
              <View style={{ gap: formSpacing.labelToInput }}>
                <Label>Nome completo</Label>
                <Controller
                  control={control}
                  name="name"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      placeholder="Seu nome"
                      autoCapitalize="words"
                      autoComplete="name"
                      textContentType="name"
                      returnKeyType="next"
                      editable={!isLoading}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      className="h-12 bg-zinc-950 border-zinc-800 text-white text-base"
                      accessibilityLabel="Campo de nome completo"
                      accessibilityHint="Digite seu nome completo"
                    />
                  )}
                />
                {errors.name && (
                  <Text
                    style={{
                      fontSize: 14,
                      color: "#ef4444",
                      marginTop: formSpacing.inputToError,
                    }}
                    accessibilityRole="alert"
                  >
                    {errors.name.message}
                  </Text>
                )}
              </View>

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
                      returnKeyType="next"
                      editable={!isLoading}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      className="h-12 bg-zinc-950 border-zinc-800 text-white text-base"
                      accessibilityLabel="Campo de senha"
                      accessibilityHint="Digite sua senha, mínimo 8 caracteres"
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

              {/* Referral Code Field */}
              <View style={{ gap: formSpacing.labelToInput }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
                  <Label>Código de indicação</Label>
                  <Text style={{ fontSize: 12, color: "#71717a" }}>(opcional)</Text>
                </View>
                <Controller
                  control={control}
                  name="referralCode"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      placeholder="Digite o código"
                      autoCapitalize="characters"
                      returnKeyType="done"
                      editable={!isLoading}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      className="h-12 bg-zinc-950 border-zinc-800 text-white text-base"
                      accessibilityLabel="Campo de código de indicação"
                      accessibilityHint="Digite o código de indicação, se tiver"
                    />
                  )}
                />
                {errors.referralCode && (
                  <Text
                    style={{
                      fontSize: 14,
                      color: "#ef4444",
                      marginTop: formSpacing.inputToError,
                    }}
                    accessibilityRole="alert"
                  >
                    {errors.referralCode.message}
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
                label={isLoading ? "Criando conta..." : "Criar conta"}
                onPress={handleSubmit(onSubmit)}
                disabled={isLoading}
                className="w-full h-12 bg-accent mt-2"
                accessibilityLabel={isLoading ? "Carregando, aguarde" : "Criar sua conta"}
                accessibilityHint="Toca duas vezes para criar conta"
                accessibilityRole="button"
                accessibilityState={{ disabled: isLoading, busy: isLoading }}
              />

              {/* Login Link */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: spacing.md,
                  gap: spacing.sm,
                }}
              >
                <Text style={{ fontSize: 14, color: "#a1a1aa" }}>Já tem uma conta?</Text>
                <Pressable
                  onPress={onNavigateToLogin}
                  disabled={isLoading}
                  style={{
                    minHeight: 44,
                    minWidth: 44,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  accessibilityLabel="Fazer login"
                  accessibilityHint="Toca duas vezes para ir para a tela de login"
                  accessibilityRole="button"
                >
                  <Text style={{ fontSize: 14, color: "#8b5cf6", fontWeight: "600" }}>
                    Entrar
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
