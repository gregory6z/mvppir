import { useState } from "react";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Pressable } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { loginSchema, type LoginInput } from "@/api/auth/schemas/auth.schema";
import { useLoginMutation, transformLoginError, type LoginError } from "@/api/auth/mutations/use-login-mutation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { spacing, screenPadding, formSpacing } from "@/lib/design-system";
import { Logo } from "@/components/Logo";

interface LoginScreenProps {
  onNavigateToSignup: () => void;
}

export function LoginScreen({ onNavigateToSignup }: LoginScreenProps) {
  const { t } = useTranslation("auth.login");
  const [error, setError] = useState<LoginError | null>(null);

  const loginMutation = useLoginMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur",
  });

  const onSubmit = (data: LoginInput) => {
    setError(null);
    loginMutation.mutate(data, {
      onError: (err) => {
        const errorType = transformLoginError(err);
        setError(errorType);
      },
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-zinc-950"
    >
      {/* Blue line at bottom with blur */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 3,
          backgroundColor: "#3b82f6",
          shadowColor: "#3b82f6",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: 20,
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
              backgroundColor: "#3b82f6",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: spacing.md,
              overflow: "hidden",
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
            accessibilityLabel={t("accessibility.logo")}
            accessibilityRole="image"
          >
            <Logo width={64} height={64} color="white" />
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
            Stakly
          </Text>
          <Text style={{ fontSize: 16, color: "#a1a1aa" }}>{t("welcome")}</Text>
        </View>

        {/* Login Card - Modern minimalist style */}
        <View
          style={{
            borderRadius: 20,
            borderWidth: 1,
            borderColor: "#27272a",
            backgroundColor: "#18181b",
            overflow: "hidden", // Garante que os cantos arredondados funcionem
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
              {t("title")}
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#a1a1aa",
                marginBottom: spacing.lg,
              }}
            >
              {t("description")}
            </Text>

            <View style={{ gap: formSpacing.fieldGap }}>
              {/* Email Field */}
              <View style={{ gap: formSpacing.labelToInput }}>
                <Label>{t("fields.email")}</Label>
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      placeholder={t("placeholders.email")}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      textContentType="emailAddress"
                      returnKeyType="next"
                      editable={!loginMutation.isPending}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      error={!!errors.email}
                      className="h-12 bg-zinc-950 text-white text-base"
                      accessibilityLabel={t("accessibility.emailField")}
                      accessibilityHint={t("accessibility.emailHint")}
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
                <Label>{t("fields.password")}</Label>
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      placeholder={t("placeholders.password")}
                      secureTextEntry
                      autoCapitalize="none"
                      autoComplete="password"
                      textContentType="password"
                      returnKeyType="done"
                      editable={!loginMutation.isPending}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      error={!!errors.password}
                      className="h-12 bg-zinc-950 text-white text-base"
                      accessibilityLabel={t("accessibility.passwordField")}
                      accessibilityHint={t("accessibility.passwordHint")}
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
                  <AlertDescription>{t(error)}</AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                label={t("buttons.submit")}
                onPress={handleSubmit(onSubmit)}
                loading={loginMutation.isPending}
                className="w-full h-12 bg-primary mt-2"
                accessibilityLabel={loginMutation.isPending ? t("accessibility.submitButtonLoading") : t("accessibility.submitButton")}
                accessibilityHint={t("accessibility.submitButtonHint")}
                accessibilityRole="button"
                accessibilityState={{ disabled: loginMutation.isPending, busy: loginMutation.isPending }}
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
                <Text style={{ fontSize: 14, color: "#a1a1aa" }}>{t("links.noAccount")}</Text>
                <Pressable
                  onPress={onNavigateToSignup}
                  disabled={loginMutation.isPending}
                  style={{
                    minHeight: 44,
                    minWidth: 44,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  accessibilityLabel={t("accessibility.createAccountButton")}
                  accessibilityHint={t("accessibility.createAccountHint")}
                  accessibilityRole="button"
                >
                  <Text style={{ fontSize: 14, color: "#3b82f6", fontWeight: "600" }}>
                    {t("links.createAccount")}
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
