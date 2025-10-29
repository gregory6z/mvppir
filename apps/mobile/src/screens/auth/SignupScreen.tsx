import { useState } from "react";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Pressable } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { signupSchema, type SignupInput } from "@/api/schemas/auth.schema";
import { useSignupMutation, transformSignupError, type SignupError } from "@/api/mutations/use-signup-mutation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { spacing, screenPadding, formSpacing } from "@/lib/design-system";
import { Logo } from "@/components/Logo";

interface SignupScreenProps {
  onNavigateToLogin: () => void;
  referrerId: string;
  referralCode: string;
}

export function SignupScreen({ onNavigateToLogin, referrerId, referralCode }: SignupScreenProps) {
  const { t } = useTranslation("auth.signup");
  const { t: tGlobal } = useTranslation(); // Para traduzir chaves absolutas (errors)
  const [error, setError] = useState<SignupError | null>(null);

  const signupMutation = useSignupMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      passwordConfirm: "",
      referralCode: referralCode, // Always set from props
    },
    mode: "onBlur",
  });

  const onSubmit = (data: SignupInput) => {
    setError(null);
    signupMutation.mutate(data, {
      onError: (err) => {
        const errorType = transformSignupError(err);
        setError(errorType);
      },
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-zinc-950"
    >
      {/* Purple line at bottom with blur */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 3,
          backgroundColor: "#8b5cf6",
          shadowColor: "#8b5cf6",
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
              backgroundColor: "#8b5cf6",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: spacing.md,
              overflow: "hidden",
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
          <Text style={{ fontSize: 16, color: "#a1a1aa" }}>{t("subtitle")}</Text>
        </View>

        {/* Signup Card - Modern minimalist style */}
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

            {/* Referral Info Banner */}
            <View
              style={{
                backgroundColor: "#8b5cf6",
                borderRadius: 12,
                padding: spacing.md,
                marginBottom: spacing.md,
                borderWidth: 1,
                borderColor: "#a78bfa",
              }}
            >
              <Text style={{ fontSize: 12, color: "#e9d5ff", marginBottom: spacing.xs }}>
                Invited by
              </Text>
              <Text style={{ fontSize: 16, color: "white", fontWeight: "600" }}>
                {referralCode}
              </Text>
            </View>

            <View style={{ gap: formSpacing.fieldGap }}>
              {/* Name Field */}
              <View style={{ gap: formSpacing.labelToInput }}>
                <Label>{t("fields.name")}</Label>
                <Controller
                  control={control}
                  name="name"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      placeholder={t("placeholders.name")}
                      autoCapitalize="words"
                      autoComplete="name"
                      textContentType="name"
                      returnKeyType="next"
                      editable={!signupMutation.isPending}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      error={!!errors.name}
                      className="h-12 bg-zinc-950 text-white text-base"
                      accessibilityLabel={t("accessibility.nameField")}
                      accessibilityHint={t("accessibility.nameHint")}
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
                      editable={!signupMutation.isPending}
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
                      returnKeyType="next"
                      editable={!signupMutation.isPending}
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

              {/* Password Confirmation Field */}
              <View style={{ gap: formSpacing.labelToInput }}>
                <Label>{t("fields.passwordConfirm")}</Label>
                <Controller
                  control={control}
                  name="passwordConfirm"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      placeholder={t("placeholders.passwordConfirm")}
                      secureTextEntry
                      autoCapitalize="none"
                      autoComplete="password"
                      textContentType="password"
                      returnKeyType="next"
                      editable={!signupMutation.isPending}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      error={!!errors.passwordConfirm}
                      className="h-12 bg-zinc-950 text-white text-base"
                      accessibilityLabel={t("accessibility.passwordConfirmField")}
                      accessibilityHint={t("accessibility.passwordConfirmHint")}
                    />
                  )}
                />
                {errors.passwordConfirm && (
                  <Text
                    style={{
                      fontSize: 14,
                      color: "#ef4444",
                      marginTop: formSpacing.inputToError,
                    }}
                    accessibilityRole="alert"
                  >
                    {errors.passwordConfirm.message}
                  </Text>
                )}
              </View>

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{tGlobal(error)}</AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                label={t("buttons.submit")}
                onPress={handleSubmit(onSubmit)}
                loading={signupMutation.isPending}
                className="w-full h-12 bg-accent mt-2"
                accessibilityLabel={signupMutation.isPending ? t("accessibility.submitButtonLoading") : t("accessibility.submitButton")}
                accessibilityHint={t("accessibility.submitButtonHint")}
                accessibilityRole="button"
                accessibilityState={{ disabled: signupMutation.isPending, busy: signupMutation.isPending }}
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
                <Text style={{ fontSize: 14, color: "#a1a1aa" }}>{t("links.hasAccount")}</Text>
                <Pressable
                  onPress={onNavigateToLogin}
                  disabled={signupMutation.isPending}
                  style={{
                    minHeight: 44,
                    minWidth: 44,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  accessibilityLabel={t("accessibility.loginButton")}
                  accessibilityHint={t("accessibility.loginHint")}
                  accessibilityRole="button"
                >
                  <Text style={{ fontSize: 14, color: "#8b5cf6", fontWeight: "600" }}>
                    {t("links.login")}
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
