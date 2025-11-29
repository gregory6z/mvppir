# UI Components - React Native Reusables

Este projeto usa **React Native Reusables** como biblioteca de componentes UI, o equivalente do shadcn/ui para React Native.

## O que é React Native Reusables?

React Native Reusables (RNR) traz os componentes do shadcn/ui para React Native, mantendo a mesma filosofia:
- Componentes copiáveis (não é uma biblioteca NPM)
- Totalmente customizáveis
- Baseado em NativeWind (Tailwind CSS para React Native)
- Suporta iOS, Android e Web

## Instalação

```bash
# Já instalado no projeto:
# - nativewind
# - tailwindcss
# - react-native-css

# Adicionar componentes manualmente da documentação:
# https://rnr-docs.vercel.app/
```

## Componentes Disponíveis

### Layout
- **Card** - Container com bordas e espaçamento
- **Separator** - Divisor horizontal/vertical

### Forms
- **Button** - Botões interativos
- **Input** - Campos de entrada de texto
- **Label** - Rótulos para formulários
- **Switch** - Toggle switch
- **Checkbox** - Caixas de seleção
- **Radio Group** - Grupo de radio buttons

### Feedback
- **Alert** - Mensagens de alerta
- **Toast** - Notificações temporárias
- **Dialog** - Modais e diálogos
- **Alert Dialog** - Diálogos de confirmação

### Data Display
- **Badge** - Tags e badges
- **Avatar** - Imagens de perfil
- **Progress** - Barra de progresso

### Navigation
- **Tabs** - Navegação por abas
- **Accordion** - Painéis expansíveis

## Como Adicionar Componentes

1. Acesse a documentação: https://rnr-docs.vercel.app/
2. Escolha o componente desejado
3. Copie o código e cole em `src/components/ui/`
4. Importe e use no seu projeto

## Exemplo de Uso

```tsx
import { View } from "react-native";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function Example() {
  return (
    <View className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Meu Card</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onPress={() => console.log("Pressed!")}>
            Clique Aqui
          </Button>
        </CardContent>
      </Card>
    </View>
  );
}
```

## Customização

Todos os componentes usam NativeWind classes e podem ser customizados:

```tsx
<Button className="bg-purple-600 hover:bg-purple-700">
  Botão Customizado
</Button>
```

## Cores do Projeto

As cores já estão configuradas em `tailwind.config.js`:

- **Primary:** `#3b82f6` (Blue) - `bg-primary`
- **Accent:** `#8b5cf6` (Purple) - `bg-accent`
- **Success:** `#10b981` (Green) - `bg-success`
- **Warning:** `#f59e0b` (Orange) - `bg-warning`
- **Danger:** `#ef4444` (Red) - `bg-danger`
- **Zinc:** Escala completa (50-950) - `bg-zinc-900`

## Recursos

- **Documentação:** https://rnr-docs.vercel.app/
- **GitHub:** https://github.com/mrzachnugent/react-native-reusables
- **NativeWind Docs:** https://www.nativewind.dev/
