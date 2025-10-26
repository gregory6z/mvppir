import { useState } from "react";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Pressable } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUp } from "@/lib/auth-client";
import { signupSchema, type SignupInput } from "@/api/schemas/auth.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthStore } from "@/stores/auth.store";

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
          <Text className="text-zinc-400 text-sm mt-1">Crie sua conta</Text>
        </View>

        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader className="pb-4">
            <CardTitle>Criar nova conta</CardTitle>
            <CardDescription>
              Preencha os dados abaixo para começar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <View className="space-y-6">
              {/* Name */}
              <View className="space-y-2">
                <Label>Nome completo</Label>
                <Controller
                  control={control}
                  name="name"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      placeholder="Seu nome"
                      autoCapitalize="words"
                      autoComplete="name"
                      editable={!isLoading}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      className="bg-zinc-950 border-zinc-800 text-white"
                    />
                  )}
                />
                {errors.name && (
                  <Text className="text-sm text-danger">
                    {errors.name.message}
                  </Text>
                )}
              </View>

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
                      placeholder="Mínimo 8 caracteres"
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

              {/* Referral Code */}
              <View className="space-y-2">
                <Label>Código de indicação (opcional)</Label>
                <Controller
                  control={control}
                  name="referralCode"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      placeholder="Digite o código"
                      autoCapitalize="characters"
                      editable={!isLoading}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      className="bg-zinc-950 border-zinc-800 text-white"
                    />
                  )}
                />
                {errors.referralCode && (
                  <Text className="text-sm text-danger">
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
                className="w-full bg-gradient-to-r from-primary to-accent"
              />

              {/* Login Link */}
              <View className="flex-row justify-center items-center gap-2 mt-4">
                <Text className="text-zinc-400 text-sm">
                  Já tem uma conta?
                </Text>
                <Pressable onPress={onNavigateToLogin} disabled={isLoading}>
                  <Text className="text-primary text-sm font-semibold">
                    Entrar
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
