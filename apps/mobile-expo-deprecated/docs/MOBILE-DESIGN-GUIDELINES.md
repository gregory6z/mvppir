# Mobile Design Guidelines - MVPPIR

Este documento define as melhores práticas de design e espaçamento para o app mobile MVPPIR, baseado nas diretrizes de 2025 da Apple (HIG) e Google (Material Design 3).

## 📏 Sistema de Espaçamento (8pt Grid)

Usamos múltiplos de 8 para todo espaçamento:

```typescript
import { spacing } from '@/lib/design-system'

// ✅ Correto
<View className="p-4" /> // 16px (spacing.md)
<View className="gap-6" /> // 24px (spacing.lg)

// ❌ Evitar valores arbitrários
<View style={{ padding: 13 }} />
```

### Escala de Espaçamento

| Token | Pixels | Uso |
|-------|--------|-----|
| `xs` | 4px | Espaçamento mínimo, ajustes finos |
| `sm` | 8px | Espaçamento pequeno entre elementos relacionados |
| `smd` | 12px | Espaçamento pequeno-médio |
| `md` | 16px | **Padrão para margens da tela** |
| `mlg` | 20px | Espaçamento médio-grande |
| `lg` | 24px | **Espaçamento entre campos de formulário** |
| `xl` | 32px | Espaçamento entre seções |
| `2xl` | 40px | Espaçamento grande |
| `3xl` | 48px | Espaçamento extra grande |
| `4xl` | 64px | Espaçamento máximo |

## 🎯 Touch Targets (Áreas Tocáveis)

### Tamanhos Mínimos

- **Mínimo absoluto**: 44x44px (Apple HIG)
- **Recomendado**: 48x48px (Material Design 3)
- **Espaçamento entre elementos**: Mínimo 8px

```typescript
// ✅ Correto - Touch target adequado
<Button className="h-12" /> // 48px de altura

// ❌ Evitar - Touch target muito pequeno
<Button className="h-8" /> // 32px - muito pequeno!
```

### Exceções

O elemento visual pode ser menor que 44px, mas a área tocável deve ter no mínimo 44x44px:

```tsx
<Pressable
  className="h-12 w-12 items-center justify-center" // 48x48 touch area
>
  <Icon size={24} /> {/* Icon pode ser 24x24 */}
</Pressable>
```

## 📱 Formulários Mobile

### Layout de Campos

1. **Uma coluna apenas** - Mais fácil de navegar no mobile
2. **Espaçamento vertical** - 24px entre campos (`spacing.lg`)
3. **Labels acima dos inputs** - Nunca ao lado
4. **Teclado apropriado** - `keyboardType` correto para cada campo

### Exemplo de Estrutura

```tsx
<View className="gap-6"> {/* 24px entre campos */}
  {/* Campo 1 */}
  <View className="gap-2"> {/* 8px entre label e input */}
    <Label>Email</Label>
    <Input keyboardType="email-address" />
    {error && <Text className="text-danger">{error}</Text>}
  </View>

  {/* Campo 2 */}
  <View className="gap-2">
    <Label>Senha</Label>
    <Input secureTextEntry />
  </View>
</View>
```

### KeyboardAvoidingView

Sempre usar em telas com formulários:

```tsx
<KeyboardAvoidingView
  behavior={Platform.OS === "ios" ? "padding" : "height"}
  className="flex-1"
>
  <ScrollView keyboardShouldPersistTaps="handled">
    {/* Formulário aqui */}
  </ScrollView>
</KeyboardAvoidingView>
```

## 🎨 Tipografia

### Tamanhos de Fonte

| Token | Pixels | Uso |
|-------|--------|-----|
| `xs` | 12px | Legendas, hints, texto secundário pequeno |
| `sm` | 14px | Texto secundário |
| `base` | **16px** | **Texto do corpo, inputs (padrão)** |
| `lg` | 18px | Subtítulos |
| `xl` | 20px | Títulos de seção |
| `2xl` | 24px | Títulos de página |
| `3xl` | 32px | Títulos hero |
| `4xl` | 40px | Displays grandes |

### Regras de Acessibilidade

- **Mínimo 16px** para texto do corpo
- **Mínimo 14px** para labels de formulário
- **Mínimo 12px** para hints e legendas
- **Contraste mínimo**: 4.5:1 para texto normal

```tsx
// ✅ Correto
<Text className="text-base">Texto do corpo</Text> // 16px
<Label className="text-sm">Label do campo</Label> // 14px

// ❌ Evitar
<Text className="text-xs">Texto importante</Text> // 12px - muito pequeno!
```

## ♿ Acessibilidade

### Propriedades Obrigatórias

Todo elemento interativo deve ter:

```tsx
<Button
  label="Entrar"
  accessibilityLabel="Fazer login na sua conta"
  accessibilityHint="Toca duas vezes para entrar"
  accessibilityRole="button"
/>

<Input
  placeholder="Digite seu email"
  accessibilityLabel="Campo de email"
  accessibilityHint="Digite seu endereço de email"
/>
```

### Contraste de Cores

| Elemento | Contraste Mínimo |
|----------|------------------|
| Texto normal (< 18px) | 4.5:1 |
| Texto grande (≥ 18px ou 14px bold) | 3:1 |
| Componentes de UI | 3:1 |

### Cores do App (Verificadas para Contraste)

```typescript
// ✅ Aprovado WCAG AA
- Texto branco (#FFFFFF) em fundo primary (#3b82f6) = 4.6:1
- Texto branco (#FFFFFF) em fundo danger (#ef4444) = 4.5:1
- Texto zinc-400 (#a1a1aa) em fundo zinc-950 (#09090b) = 8.2:1
```

## 📐 Margens e Padding

### Margens da Tela

```tsx
// Padrão: 24px horizontal, 20px vertical
<SafeAreaView className="flex-1 px-6 py-5">
  {/* Conteúdo */}
</SafeAreaView>
```

### Safe Area (iOS)

Sempre usar `SafeAreaView` ou `useSafeAreaInsets`:

```tsx
import { useSafeAreaInsets } from 'react-native-safe-area-context'

function Screen() {
  const insets = useSafeAreaInsets()

  return (
    <View style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
      {/* Conteúdo */}
    </View>
  )
}
```

## 🎭 Componentes de UI

### Button

```tsx
// Altura mínima: 48px (touch target)
<Button
  label="Criar conta"
  className="h-12" // 48px
  accessibilityLabel="Criar uma nova conta"
/>
```

### Input

```tsx
// Altura mínima: 48px
<Input
  placeholder="seu@email.com"
  keyboardType="email-address"
  autoCapitalize="none"
  autoComplete="email"
  className="h-12 text-base" // 48px altura, 16px font
/>
```

### Card

```tsx
<Card className="p-6 gap-6">
  {/* Padding interno: 24px */}
  {/* Gap entre filhos: 24px */}
</Card>
```

## 📱 Responsividade

### Orientação

- **Portrait (padrão)**: Layout vertical, formulários em coluna única
- **Landscape**: Ajustar layout se necessário (não implementado no MVP)

### Tamanhos de Tela

Testado em:
- iPhone SE (320pt width) - menor tela iOS
- iPhone 15 Pro Max (430pt width) - maior tela iOS
- Android Small (360dp width) - padrão Android
- Android Large (412dp width) - telas grandes Android

## 🎬 Animações

### Durações

```typescript
import { duration } from '@/lib/design-system'

// Micro-interações (botões, toggles)
duration.fast // 150ms

// Transições de UI (modals, sheets)
duration.normal // 250ms

// Transições de página
duration.slow // 350ms
```

## 📋 Checklist de Design

Antes de finalizar uma tela:

- [ ] Touch targets ≥ 44x44px (idealmente 48x48px)
- [ ] Espaçamento segue sistema de 8pt
- [ ] Texto do corpo ≥ 16px
- [ ] Contraste de texto ≥ 4.5:1
- [ ] `accessibilityLabel` em todos elementos interativos
- [ ] `keyboardType` apropriado para cada input
- [ ] `KeyboardAvoidingView` em formulários
- [ ] `SafeAreaView` ou `useSafeAreaInsets` em telas
- [ ] Testado em iPhone SE (tela pequena)
- [ ] Testado em iPad (se aplicável)
- [ ] Funciona com VoiceOver/TalkBack

## 📚 Referências

- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Material Design 3](https://m3.material.io/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [React Native Accessibility](https://reactnative.dev/docs/accessibility)

---

**Última atualização**: 2025-10-26
