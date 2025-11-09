# 📱 Como Funcionam Push Notifications

Explicação técnica completa do sistema de notificações push em apps mobile.

---

## 🎯 O Que São Push Notifications?

**Push notifications** são mensagens que aparecem no celular do usuário **mesmo quando o app está fechado**.

**Exemplos:**
- WhatsApp: "Maria te enviou uma mensagem"
- Instagram: "João curtiu sua foto"
- Uber: "Seu motorista chegou"
- **MVPPIR:** "Você recebeu 100 USDC"

---

## 🏗️ Arquitetura Completa

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   Backend    │       │ Push Service │       │   Device     │       │  Mobile App  │
│   (Server)   │──────▶│  (Expo/FCM)  │──────▶│    (iOS/     │──────▶│  (Running    │
│              │       │              │       │   Android)   │       │  or Closed)  │
└──────────────┘       └──────────────┘       └──────────────┘       └──────────────┘
```

### Componentes:

1. **Backend (Seu servidor)** - Onde você decide QUANDO enviar
2. **Push Service (Expo/Firebase)** - Serviço que entrega a notificação
3. **Device (Celular)** - Sistema operacional (iOS/Android)
4. **Mobile App** - Seu aplicativo

---

## 🔄 Fluxo Completo - Passo a Passo

### 1️⃣ Usuário Instala o App

Quando o usuário instala e abre o app pela primeira vez:

```
Mobile App                    Device (iOS/Android)           Backend
    │                               │                          │
    ├─ Solicita permissão ─────────>│                          │
    │                               ├─ Usuário aceita          │
    │<─ Permissão concedida ─────────┤                          │
    │                               │                          │
    ├─ Gera Expo Push Token ────────>│                          │
    │<─ Token: ExponentPushToken[xxx]┤                          │
    │                               │                          │
    ├─ Envia token para backend ───────────────────────────────>│
    │                               │                          ├─ Salva na tabela
    │                               │                          │   push_tokens
```

**O que é o Expo Push Token?**

É um código único que identifica:
- Qual app
- Qual dispositivo
- Qual usuário

Exemplo:
```
ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
```

### 2️⃣ Backend Envia Notificação

Quando acontece algo (ex: depósito confirmado):

```
Backend                    Expo Push Service              Device (iOS/Android)
   │                              │                              │
   ├─ Evento acontece             │                              │
   │  (depósito confirmado)       │                              │
   │                              │                              │
   ├─ Busca push token do user    │                              │
   ├─ Monta notificação           │                              │
   │                              │                              │
   ├─ POST /push/send ────────────>│                              │
   │  {                           │                              │
   │    to: "ExponentPushToken[]" │                              │
   │    title: "Depósito!"        │                              │
   │    body: "100 USDC"          │                              │
   │  }                           │                              │
   │                              │                              │
   │<─ 200 OK ───────────────────┤                              │
   │                              │                              │
   │                              ├─ Envia para device ─────────>│
   │                              │                              ├─ Mostra notificação
```

### 3️⃣ Usuário Vê e Clica

```
Device                    Mobile App                    Backend
   │                         │                            │
   ├─ Mostra notificação     │                            │
   │  "💰 Depósito!"          │                            │
   │  "Você recebeu 100 USDC" │                            │
   │                         │                            │
   ├─ Usuário clica ─────────>│                            │
   │                         ├─ App abre                  │
   │                         ├─ Navega para tela correta  │
   │                         │                            │
   │                         ├─ Marca como "opened" ──────>│
   │                         │                            ├─ Atualiza estatísticas
```

---

## 🔐 Permissões

### iOS (iPhone/iPad):

Quando o app pede permissão, aparece:

```
┌─────────────────────────────────┐
│  "MVPPIR" Quer Enviar           │
│  Notificações                   │
│                                 │
│  As notificações podem incluir  │
│  alertas, sons e ícones.        │
│                                 │
│  [ Não Permitir ]  [ Permitir ] │
└─────────────────────────────────┘
```

### Android:

Android geralmente permite por padrão, mas usuário pode desativar depois em:
**Configurações → Apps → MVPPIR → Notificações**

---

## 📦 Tipos de Notificação

### 1. Notificação Simples

```json
{
  "to": "ExponentPushToken[xxx]",
  "title": "💰 Depósito Confirmado!",
  "body": "Você recebeu 100 USDC"
}
```

Aparece assim:

```
┌──────────────────────────┐
│ MVPPIR          agora    │
├──────────────────────────┤
│ 💰 Depósito Confirmado! │
│ Você recebeu 100 USDC   │
└──────────────────────────┘
```

### 2. Notificação com Som

```json
{
  "to": "ExponentPushToken[xxx]",
  "title": "💸 Nova Comissão!",
  "body": "Você ganhou $50 hoje",
  "sound": "default"  // Toca som
}
```

### 3. Notificação com Badge (iOS)

```json
{
  "to": "ExponentPushToken[xxx]",
  "title": "5 novas notificações",
  "body": "Veja suas atualizações",
  "badge": 5  // Número vermelho no ícone do app
}
```

Aparece assim no iPhone:

```
┌─────────┐
│  (5)    │  ← Badge vermelho
│  MVPPIR │
└─────────┘
```

### 4. Notificação com Dados Customizados

```json
{
  "to": "ExponentPushToken[xxx]",
  "title": "💰 Depósito!",
  "body": "100 USDC",
  "data": {
    "type": "DEPOSIT_CONFIRMED",
    "amount": "100",
    "tokenSymbol": "USDC",
    "txHash": "0x123...",
    "screen": "TransactionHistory"  // Qual tela abrir
  }
}
```

Quando usuário clica, o app pode:
- Abrir tela específica (TransactionHistory)
- Mostrar detalhes (txHash)
- Fazer ação (atualizar saldo)

---

## ⚡ Estados do App

### App Fechado (Terminated)

```
Backend ──> Push Service ──> Device ──> [🔔 Notificação]

Usuário clica ──> App inicia ──> Processa notificação
```

### App em Background (Minimizado)

```
Backend ──> Push Service ──> Device ──> [🔔 Notificação]

Usuário clica ──> App volta ao foreground ──> Processa notificação
```

### App em Foreground (Aberto)

```
Backend ──> Push Service ──> Device ──> App recebe silenciosamente

App decide:
- Mostrar banner interno (in-app)
- Atualizar dados silenciosamente
- Ignorar (se já está na tela correta)
```

---

## 🌍 Serviços de Push

### 1. Expo Push Notifications (Recomendado)

**Vantagens:**
- ✅ Fácil de usar
- ✅ Funciona em iOS e Android
- ✅ Grátis até 1 milhão/mês
- ✅ Setup rápido (5 minutos)

**Como funciona:**

```typescript
// Backend
import { Expo } from 'expo-server-sdk'

const expo = new Expo()

const messages = [{
  to: 'ExponentPushToken[xxx]',
  sound: 'default',
  title: 'Hello!',
  body: 'World',
}]

await expo.sendPushNotificationsAsync(messages)
```

### 2. Firebase Cloud Messaging (FCM)

**Vantagens:**
- ✅ Grátis ilimitado
- ✅ Mais robusto
- ✅ Mais features (topics, groups)

**Desvantagens:**
- ❌ Setup mais complexo
- ❌ Precisa configurar iOS e Android separadamente

### 3. OneSignal

**Vantagens:**
- ✅ Interface visual completa
- ✅ A/B testing
- ✅ Segmentação avançada

**Desvantagens:**
- ❌ Pago após 10k usuários
- ❌ Dependência de terceiros

---

## 🔒 Segurança e Privacidade

### O Que Expo/Firebase Sabem:

1. **Conteúdo da notificação** (título + mensagem)
2. **Token do dispositivo**
3. **Quando foi entregue**
4. **Se foi aberta**

### O Que Eles NÃO Sabem:

- ❌ Quem é o usuário (nome, email)
- ❌ O que tem no app
- ❌ Dados sensíveis (senhas, saldo)

**Recomendação:**
- ✅ Não envie informações sensíveis no título/mensagem
- ✅ Use IDs genéricos nos dados customizados

**Exemplo Ruim:**
```json
{
  "title": "Saque aprovado",
  "body": "João Silva - CPF 123.456.789-00 - Conta 12345",
  "data": { "password": "senha123" }  // NUNCA FAÇA ISSO
}
```

**Exemplo Bom:**
```json
{
  "title": "Saque aprovado",
  "body": "Seu saque foi processado com sucesso",
  "data": { "withdrawalId": "uuid-xxx" }  // App busca detalhes no backend
}
```

---

## 📊 Limitações

### Expo Push Notifications:

| Limite | Valor |
|--------|-------|
| **Max tamanho** | 4 KB por notificação |
| **Max rate** | 600 notificações/segundo |
| **Plano Free** | 1 milhão/mês |
| **Plano Paid** | Ilimitado ($299/mês) |

### iOS (Apple):

- ✅ Notificações funcionam sempre
- ❌ Precisa de Apple Developer Account ($99/ano) para produção

### Android (Google):

- ✅ Notificações funcionam sempre
- ✅ Não precisa de conta paga

---

## 🛠️ Como Implementar (Resumo)

### Mobile (React Native + Expo):

```typescript
import * as Notifications from 'expo-notifications'

// 1. Pedir permissão
const { status } = await Notifications.requestPermissionsAsync()

// 2. Obter token
const token = await Notifications.getExpoPushTokenAsync({
  projectId: 'seu-project-id'
})

// 3. Enviar token para backend
await fetch('https://api.mvppir.com/notifications/register', {
  method: 'POST',
  body: JSON.stringify({ token: token.data })
})

// 4. Escutar quando notificação chega
Notifications.addNotificationReceivedListener((notification) => {
  console.log('Notificação recebida:', notification)
})

// 5. Escutar quando usuário clica
Notifications.addNotificationResponseReceivedListener((response) => {
  const data = response.notification.request.content.data

  // Navegar para tela correta
  if (data.screen === 'TransactionHistory') {
    navigation.navigate('TransactionHistory')
  }
})
```

### Backend (Node.js + Expo):

```typescript
import { Expo } from 'expo-server-sdk'

const expo = new Expo()

async function sendNotification(userId: string, notification: any) {
  // 1. Buscar tokens do usuário
  const tokens = await prisma.pushToken.findMany({
    where: { userId, active: true }
  })

  // 2. Preparar mensagens
  const messages = tokens.map(t => ({
    to: t.token,
    sound: 'default',
    title: notification.title,
    body: notification.body,
    data: notification.data,
  }))

  // 3. Enviar (em chunks de 100)
  const chunks = expo.chunkPushNotifications(messages)

  for (const chunk of chunks) {
    try {
      await expo.sendPushNotificationsAsync(chunk)
    } catch (error) {
      console.error('Failed to send:', error)
    }
  }
}

// Usar:
await sendNotification('user-123', {
  title: '💰 Depósito Confirmado!',
  body: 'Você recebeu 100 USDC',
  data: { type: 'DEPOSIT', amount: '100' }
})
```

---

## 🎯 Quando Usar Cada Tipo

### Push Notifications (App Fechado):

- ✅ Eventos importantes (depósito, saque)
- ✅ Ações que requerem atenção (rank mudou)
- ✅ Updates importantes (nova versão)

### In-App Notifications (App Aberto):

- ✅ Updates em tempo real (novo depósito enquanto usa o app)
- ✅ Feedback de ações (transação processada)
- ✅ Banners não-intrusivos

### Notificações Locais (Não requer backend):

- ✅ Lembretes (sacar comissões)
- ✅ Alarmes
- ✅ Agendamentos offline

---

## 📱 Diferenças iOS vs Android

| Aspecto | iOS | Android |
|---------|-----|---------|
| **Permissão** | Obrigatória perguntar | Permitido por padrão |
| **Som** | Limitado aos do sistema | Custom sounds |
| **Badge** | Suportado | Não padrão |
| **Agrupamento** | Automático por app | Manual |
| **Actions** | Até 4 botões | Ilimitado (prático ~3) |

---

## 🚨 Troubleshooting

### "Notificação não apareceu"

**Possíveis causas:**
1. ❌ Usuário negou permissão
2. ❌ Token expirado/inválido
3. ❌ App em modo "Não Perturbe" (iOS)
4. ❌ Bateria em modo economia (Android)
5. ❌ Push service offline (raro)

**Como debugar:**
```typescript
// Ver se tem permissão
const { status } = await Notifications.getPermissionsAsync()
console.log('Permission:', status)

// Ver se token é válido
const token = await Notifications.getExpoPushTokenAsync()
console.log('Token:', token)

// Testar envio direto
await Notifications.scheduleNotificationAsync({
  content: {
    title: "Teste Local",
    body: "Se aparecer, o problema é no backend"
  },
  trigger: null  // Enviar agora
})
```

### "Notificação funciona no simulador mas não no device"

**Causa:** Push notifications **NÃO funcionam em simuladores**.

**Solução:** Testar sempre em device físico.

---

## 📚 Recursos

- **Expo Docs:** https://docs.expo.dev/push-notifications/overview/
- **Tester:** https://expo.dev/notifications (enviar teste sem código)
- **FCM Docs:** https://firebase.google.com/docs/cloud-messaging

---

**Resumo:**

1. 📱 User instala app → App pede permissão → Gera token → Envia para backend
2. 🔔 Backend detecta evento → Envia para Expo Push Service → Expo entrega no device
3. 👆 User clica → App abre → Navega para tela correta

**É isso! Simples e poderoso.** 🚀
