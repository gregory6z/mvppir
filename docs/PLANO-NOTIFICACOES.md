# 📱 Plano: Sistema de Notificações Mobile

Planejamento completo do sistema de notificações push e in-app para o aplicativo mobile.

---

## 🎯 Requisitos

### 1. Notificações Push (Quando App Está Fechado)

**Quando enviar:**
- ✅ Depósito confirmado na blockchain
- ✅ Conta ativada ($100 atingidos)
- ✅ Comissão diária recebida
- ✅ Saque aprovado
- ✅ Saque rejeitado
- ✅ Saque completado
- ✅ Mudança de rank (upgrade/downgrade)

### 2. Modal de Comissões (Quando App Abre)

**Exibir quando:**
- Usuário recebeu comissões desde a última vez que abriu o app
- Modal mostra:
  - 💰 Valor total das comissões
  - 🏆 Rank atual do usuário
  - 📊 Breakdown por nível (N0, N1, N2, N3)
  - 🎉 Animação celebratória

### 3. Notificações In-App (Quando App Está Aberto)

**Banner/Toast para:**
- Novo depósito detectado
- Status de saque mudou
- Nova comissão creditada

---

## 🏗️ Arquitetura

### Backend (Server)

```
apps/server/
├── src/
│   ├── modules/
│   │   └── notifications/
│   │       ├── controllers/
│   │       │   ├── register-push-token-controller.ts
│   │       │   └── get-unread-notifications-controller.ts
│   │       ├── use-cases/
│   │       │   ├── send-push-notification.ts
│   │       │   └── get-daily-commissions-summary.ts
│   │       └── routes.ts
│   └── lib/
│       └── expo-push.ts  # Expo Push Notifications client
├── prisma/
│   └── schema.prisma     # Add PushToken + Notification models
```

### Mobile (App)

```
apps/mobile/
├── src/
│   ├── screens/
│   │   └── notifications/
│   │       └── notifications-screen.tsx
│   ├── components/
│   │   ├── modals/
│   │   │   └── daily-commissions-modal.tsx
│   │   └── notifications/
│   │       └── notification-banner.tsx
│   ├── api/
│   │   ├── client/
│   │   │   └── notifications.api.ts
│   │   └── queries/
│   │       └── use-notifications-query.ts
│   ├── stores/
│   │   └── notifications.store.ts
│   └── lib/
│       └── push-notifications.ts  # Expo Notifications setup
```

---

## 📊 Schema do Banco de Dados

### Tabela: `push_tokens`

```prisma
model PushToken {
  id        String   @id @default(uuid())
  userId    String
  token     String   @unique  // Expo Push Token
  platform  String   // "ios" ou "android"
  active    Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([active])
  @@map("push_tokens")
}
```

### Tabela: `notifications` (Histórico)

```prisma
enum NotificationType {
  DEPOSIT_CONFIRMED
  ACCOUNT_ACTIVATED
  COMMISSION_RECEIVED
  WITHDRAWAL_APPROVED
  WITHDRAWAL_REJECTED
  WITHDRAWAL_COMPLETED
  RANK_UPGRADED
  RANK_DOWNGRADED
}

model Notification {
  id        String           @id @default(uuid())
  userId    String
  type      NotificationType
  title     String
  message   String
  data      Json?            // Dados extras (amount, txHash, etc)
  read      Boolean          @default(false)
  createdAt DateTime         @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, read])
  @@index([createdAt])
  @@map("notifications")
}
```

---

## 🔔 Tipos de Notificações

### 1. Depósito Confirmado

**Trigger:** Webhook confirma depósito (`process-moralis-webhook.ts`)

**Push Notification:**
```json
{
  "title": "💰 Depósito Confirmado!",
  "body": "Você recebeu 100 USDC",
  "data": {
    "type": "DEPOSIT_CONFIRMED",
    "amount": "100",
    "tokenSymbol": "USDC",
    "txHash": "0x..."
  }
}
```

**In-App:** Toast verde com link para histórico

---

### 2. Conta Ativada

**Trigger:** Saldo atinge $100 USD (`check-account-activation.ts`)

**Push Notification:**
```json
{
  "title": "🎉 Conta Ativada!",
  "body": "Sua conta foi ativada com sucesso. Bem-vindo ao MVPPIR!",
  "data": {
    "type": "ACCOUNT_ACTIVATED"
  }
}
```

**In-App:** Modal celebratório com confetti

---

### 3. Comissão Diária Recebida

**Trigger:** Worker de comissões diárias (`daily-commissions.worker.ts`)

**Push Notification:**
```json
{
  "title": "💸 Comissão Recebida!",
  "body": "Você ganhou $50.00 em comissões hoje",
  "data": {
    "type": "COMMISSION_RECEIVED",
    "amount": "50.00",
    "levels": {
      "N0": "10.00",
      "N1": "20.00",
      "N2": "15.00",
      "N3": "5.00"
    }
  }
}
```

**In-App:** Modal ao abrir app mostrando:
- Total ganho
- Rank atual
- Breakdown por nível
- Botão "Ver Detalhes"

---

### 4. Saque Aprovado

**Trigger:** Admin aprova saque

**Push Notification:**
```json
{
  "title": "✅ Saque Aprovado",
  "body": "Seu saque de 500 USDC foi aprovado pelo administrador",
  "data": {
    "type": "WITHDRAWAL_APPROVED",
    "amount": "500",
    "tokenSymbol": "USDC"
  }
}
```

---

### 5. Saque Rejeitado

**Trigger:** Admin rejeita saque

**Push Notification:**
```json
{
  "title": "❌ Saque Rejeitado",
  "body": "Seu saque foi rejeitado. Motivo: Saldo insuficiente",
  "data": {
    "type": "WITHDRAWAL_REJECTED",
    "reason": "Saldo insuficiente"
  }
}
```

---

### 6. Saque Completado

**Trigger:** Blockchain confirma transação de saque

**Push Notification:**
```json
{
  "title": "💰 Saque Completado",
  "body": "Seu saque de 500 USDC foi concluído com sucesso",
  "data": {
    "type": "WITHDRAWAL_COMPLETED",
    "amount": "500",
    "tokenSymbol": "USDC",
    "txHash": "0x..."
  }
}
```

---

### 7. Mudança de Rank

**Trigger:** Worker de manutenção mensal ou promoção automática

**Push Notification (Upgrade):**
```json
{
  "title": "🎉 Parabéns! Você subiu de rank!",
  "body": "Você foi promovido para GOLD",
  "data": {
    "type": "RANK_UPGRADED",
    "oldRank": "SILVER",
    "newRank": "GOLD"
  }
}
```

**Push Notification (Downgrade):**
```json
{
  "title": "⚠️ Seu rank foi alterado",
  "body": "Você foi rebaixado para BRONZE devido à falta de requisitos",
  "data": {
    "type": "RANK_DOWNGRADED",
    "oldRank": "SILVER",
    "newRank": "BRONZE"
  }
}
```

---

## 🎨 UI/UX - Modal de Comissões Diárias

### Quando Exibir:
- Ao abrir o app pela primeira vez no dia
- Se houver comissões não vistas desde ontem

### Design do Modal:

```
┌─────────────────────────────────────┐
│         🎉 Comissões Diárias        │
│                                     │
│  ┌───────────────────────────────┐ │
│  │   💰 Você ganhou hoje:        │ │
│  │                               │ │
│  │      $125.50 USDC            │ │
│  │                               │ │
│  │   🏆 Rank Atual: GOLD        │ │
│  └───────────────────────────────┘ │
│                                     │
│  📊 Breakdown:                      │
│  ├─ N0 (Próprio): $25.00           │
│  ├─ N1 (Diretos): $50.00           │
│  ├─ N2 (Indiretos): $35.00         │
│  └─ N3 (Rede): $15.50              │
│                                     │
│  ┌───────────────────────────────┐ │
│  │     Ver Histórico Completo    │ │
│  └───────────────────────────────┘ │
│                                     │
│         [ Fechar ]                  │
└─────────────────────────────────────┘
```

### Animações:
- Fade in suave
- Números animam (count up)
- Confetti ao abrir (biblioteca lottie-react-native)

---

## 🔧 Implementação Técnica

### Backend: Enviar Push Notification

```typescript
// src/lib/expo-push.ts
import { Expo, ExpoPushMessage } from 'expo-server-sdk'

const expo = new Expo()

export async function sendPushNotification(
  userId: string,
  notification: {
    title: string
    body: string
    data?: Record<string, any>
  }
) {
  // 1. Buscar tokens do usuário
  const tokens = await prisma.pushToken.findMany({
    where: {
      userId,
      active: true,
    },
  })

  if (tokens.length === 0) return

  // 2. Preparar mensagens
  const messages: ExpoPushMessage[] = tokens.map((token) => ({
    to: token.token,
    sound: 'default',
    title: notification.title,
    body: notification.body,
    data: notification.data,
  }))

  // 3. Enviar em chunks (Expo limita a 100 por request)
  const chunks = expo.chunkPushNotifications(messages)

  for (const chunk of chunks) {
    try {
      await expo.sendPushNotificationsAsync(chunk)
    } catch (error) {
      console.error('Failed to send push notification:', error)
    }
  }

  // 4. Salvar no histórico
  await prisma.notification.create({
    data: {
      userId,
      type: notification.data?.type || 'GENERIC',
      title: notification.title,
      message: notification.body,
      data: notification.data,
    },
  })
}
```

### Mobile: Registrar Push Token

```typescript
// src/lib/push-notifications.ts
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { Platform } from 'react-native'
import { registerPushToken } from '@/api/client/notifications.api'

export async function registerForPushNotifications() {
  if (!Device.isDevice) {
    console.log('Push notifications only work on physical devices')
    return null
  }

  // 1. Pedir permissão
  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  if (finalStatus !== 'granted') {
    console.log('Permission not granted for push notifications')
    return null
  }

  // 2. Obter token
  const token = await Notifications.getExpoPushTokenAsync({
    projectId: 'SEU_PROJECT_ID', // Do app.json
  })

  // 3. Registrar no backend
  await registerPushToken(token.data, Platform.OS)

  return token.data
}
```

### Mobile: Modal de Comissões

```typescript
// src/components/modals/daily-commissions-modal.tsx
'use client'

import { useState, useEffect } from 'react'
import { Modal, View, Text } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { getDailyCommissionsSummary } from '@/api/client/notifications.api'
import LottieView from 'lottie-react-native'

export function DailyCommissionsModal() {
  const [visible, setVisible] = useState(false)

  const { data } = useQuery({
    queryKey: ['daily-commissions-summary'],
    queryFn: getDailyCommissionsSummary,
  })

  useEffect(() => {
    // Mostrar modal se houver comissões não vistas
    if (data?.hasUnseenCommissions) {
      setVisible(true)
    }
  }, [data])

  if (!data) return null

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => setVisible(false)}
    >
      <View className="flex-1 bg-black/50 justify-center items-center p-6">
        <View className="bg-zinc-900 rounded-2xl p-6 w-full max-w-md">
          {/* Confetti animation */}
          <LottieView
            source={require('@/assets/animations/confetti.json')}
            autoPlay
            loop={false}
            style={{ position: 'absolute', width: '100%', height: '100%' }}
          />

          <Text className="text-white text-2xl font-bold text-center mb-4">
            🎉 Comissões Diárias
          </Text>

          <View className="bg-zinc-800 rounded-xl p-4 mb-4">
            <Text className="text-zinc-400 text-sm text-center mb-2">
              💰 Você ganhou hoje:
            </Text>
            <Text className="text-white text-4xl font-bold text-center">
              ${data.totalAmount}
            </Text>
            <Text className="text-purple-400 text-lg font-semibold text-center mt-2">
              🏆 Rank: {data.currentRank}
            </Text>
          </View>

          <View className="mb-4">
            <Text className="text-zinc-400 text-sm mb-2">📊 Breakdown:</Text>
            {data.breakdown.map((item) => (
              <View key={item.level} className="flex-row justify-between py-2">
                <Text className="text-zinc-400">{item.label}</Text>
                <Text className="text-white font-semibold">${item.amount}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            onPress={() => setVisible(false)}
            className="bg-purple-600 rounded-lg py-3"
          >
            <Text className="text-white text-center font-semibold">Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}
```

---

## 📦 Dependências Necessárias

### Backend:

```bash
cd apps/server
pnpm add expo-server-sdk
```

### Mobile:

```bash
cd apps/mobile
pnpm add expo-notifications expo-device lottie-react-native
```

---

## 🔄 Fluxo Completo

### 1. Usuário Instala App

```
Mobile                    Backend
  │                         │
  ├─ Registra push token ──>│
  │                         ├─ Salva em PushToken table
  │<─ Confirmação ──────────┤
```

### 2. Evento Acontece (Ex: Depósito)

```
Blockchain                Backend                Mobile
    │                       │                     │
    ├─ Webhook ────────────>│                     │
    │                       ├─ Confirma depósito  │
    │                       ├─ Envia push ───────>│
    │                       ├─ Salva em Notification
    │                       │                     ├─ Mostra notificação
    │                       │                     ├─ Usuário clica
    │                       │<─ App abre ─────────┤
    │                       │                     ├─ Busca detalhes
```

### 3. Usuário Abre App (Comissões)

```
Mobile                    Backend
  │                         │
  ├─ App abre ──────────────>│
  │<─ Verifica comissões ────┤
  │                         │
  ├─ Tem comissões não vistas?
  │   │                     │
  │   └─ SIM               │
  │     ├─ Mostra modal    │
  │     └─ Marca como visto─>│
```

---

## ✅ Checklist de Implementação

### Backend:

- [ ] Criar migration para `push_tokens` e `notifications`
- [ ] Instalar `expo-server-sdk`
- [ ] Criar módulo `notifications/`
- [ ] Criar `sendPushNotification()` helper
- [ ] Criar endpoint `POST /notifications/register-token`
- [ ] Criar endpoint `GET /notifications/unread`
- [ ] Criar endpoint `GET /notifications/daily-commissions-summary`
- [ ] Integrar push em `process-moralis-webhook.ts`
- [ ] Integrar push em `check-account-activation.ts`
- [ ] Integrar push em `daily-commissions.worker.ts`
- [ ] Integrar push em `monthly-maintenance.worker.ts`
- [ ] Integrar push em withdrawal controllers

### Mobile:

- [ ] Instalar dependências (expo-notifications, lottie-react-native)
- [ ] Criar `push-notifications.ts` helper
- [ ] Criar `notifications.store.ts` (Zustand)
- [ ] Criar `DailyCommissionsModal` component
- [ ] Criar `NotificationBanner` component
- [ ] Criar `NotificationsScreen` (histórico)
- [ ] Integrar no `App.tsx` (setup de notificações)
- [ ] Criar queries (`use-notifications-query.ts`)
- [ ] Testar em device físico (push não funciona em simulador)

### Testes:

- [ ] Testar push em iOS (device físico)
- [ ] Testar push em Android (device físico)
- [ ] Testar modal de comissões
- [ ] Testar histórico de notificações
- [ ] Testar deep links (clicar na notificação abre tela correta)

---

## 🚨 Limitações e Considerações

### Expo Push Notifications:

1. **Não funciona em simuladores** - Precisa de device físico
2. **Limite de rate:** 600 notificações/segundo
3. **Tamanho máximo:** 4 KB por notificação
4. **Grátis:** Até 1 milhão de notificações/mês

### Alternativas (Se precisar):

- **Firebase Cloud Messaging (FCM)** - Mais robusto, grátis ilimitado
- **OneSignal** - Plataforma completa, grátis até 10k usuários
- **Pusher Beams** - Alternativa paga

### Deep Links:

Para que notificações abram telas específicas, precisa configurar:

```typescript
// src/lib/push-notifications.ts
Notifications.addNotificationResponseReceivedListener((response) => {
  const data = response.notification.request.content.data

  if (data.type === 'DEPOSIT_CONFIRMED') {
    navigation.navigate('TransactionHistory')
  } else if (data.type === 'COMMISSION_RECEIVED') {
    navigation.navigate('Commissions')
  }
  // ... outros tipos
})
```

---

## 📊 Métricas para Monitorar

- **Taxa de entrega:** Quantas notificações foram entregues com sucesso
- **Taxa de abertura:** Quantos usuários clicaram na notificação
- **Taxa de conversão:** Usuários que abriram o modal de comissões
- **Tokens expirados:** Remover tokens inativos

---

## 🎯 Priorização

### Fase 1 (MVP):
1. ✅ Push quando depósito confirmado
2. ✅ Push quando comissão recebida
3. ✅ Modal de comissões diárias ao abrir app

### Fase 2 (v2.0):
4. ✅ Push quando saque aprovado/rejeitado
5. ✅ Push quando rank muda
6. ✅ Histórico de notificações (tela)

### Fase 3 (v3.0):
7. ✅ Notificações in-app (banners)
8. ✅ Deep links avançados
9. ✅ Notificações agendadas (lembretes)

---

**Pronto para começar a implementação?**

Vamos começar pelo backend (migration + endpoints) ou pelo mobile (setup de push)?
