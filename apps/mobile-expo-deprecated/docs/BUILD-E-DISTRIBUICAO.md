# 🚀 Build e Distribuição do App Mobile

Guia para gerar APK e distribuir para usuários sem usar Google Play.

---

## 📋 Pré-requisitos

1. Conta na Expo (grátis)
2. Node.js instalado
3. Acesso ao código do mobile

---

## 🔧 Primeira Vez - Configuração

### 1. Instalar EAS CLI

```bash
npm install -g eas-cli
```

### 2. Fazer login na Expo

```bash
cd apps/mobile
npx eas login
```

Se não tiver conta, crie em: https://expo.dev/signup

### 3. Configurar projeto

```bash
npx eas build:configure
```

Isso cria/atualiza o `eas.json` automaticamente.

---

## 📦 Gerar APK (Build)

### Comando:

```bash
cd apps/mobile
npx eas build --profile preview --platform android
```

### O que acontece:

1. EAS envia o código para a nuvem
2. Compila o app (~15-20 minutos)
3. Retorna um link para download

**Exemplo de output:**

```
✔ Build complete!

APK: https://expo.dev/artifacts/eas/xxxxxxxxxxx.apk

Share this URL with your team to install the app.
```

---

## 📤 Distribuir para Usuários

### Opção 1: Link Direto (Mais Simples)

Compartilhe o link do Expo diretamente:

```
https://expo.dev/artifacts/eas/xxxxxxxxxxx.apk
```

**Onde compartilhar:**
- WhatsApp
- Telegram
- Email
- Google Drive

### Opção 2: QR Code

Gere um QR Code do link:
- Vá em: https://qr.io
- Cole o link do APK
- Baixe a imagem do QR Code
- Compartilhe a imagem

### Opção 3: Página de Download

Crie uma página simples no Vercel:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Baixar MVPPIR</title>
</head>
<body>
  <h1>📱 MVPPIR App</h1>
  <a href="LINK_DO_APK" download>
    <button>Baixar APK (Android)</button>
  </a>
  <p>Versão: 1.0.0</p>
</body>
</html>
```

Deploy no Vercel e compartilhe o domínio.

---

## 🔄 Atualizar o App (Nova Versão)

### 1. Fazer mudanças no código

```bash
cd apps/mobile
# ... faz alterações no código ...
```

### 2. Atualizar versão (opcional mas recomendado)

Edite `app.json`:

```json
{
  "expo": {
    "version": "1.0.1",  // Incrementa aqui
    "android": {
      "versionCode": 2   // Incrementa aqui também
    }
  }
}
```

### 3. Fazer novo build

```bash
npx eas build --profile preview --platform android
```

### 4. Compartilhar novo link

Usuários vão baixar e instalar por cima (mantém os dados).

---

## 💡 Dicas Importantes

### Cache de Build

Se fizer várias builds seguidas, EAS usa cache:
- Builds subsequentes são mais rápidas (~5-10 min)

### Expiração dos Links

- Links da Expo **não expiram**
- Você pode compartilhar o mesmo link múltiplas vezes

### Builds Simultâneos

Plano grátis:
- 1 build por vez
- Builds entram em fila se você disparar vários

### Verificar Builds Anteriores

```bash
npx eas build:list
```

Lista todos os builds que você já fez.

---

## 🔐 Segurança

### Variáveis de Ambiente

Certifique-se que `.env.production` está configurado:

```bash
EXPO_PUBLIC_API_URL=https://mvppir-production.up.railway.app
EXPO_PUBLIC_ENV=production
```

### Não Commitar Secrets

Arquivos ignorados no `.gitignore`:
- `.env`
- `.env.development`
- `.env.production`

Apenas `.env.example` vai para o Git.

---

## 📊 Monitorar Instalações

### Expo Dashboard

Acesse: https://expo.dev/accounts/[seu-usuario]/projects/mobile

Você consegue ver:
- Quantos builds foram feitos
- Quantos downloads do APK
- Crashes (se houver)

### Analytics (Opcional)

Para saber quantos usuários usam o app:
- Adicione Google Analytics
- Adicione Mixpanel
- Ou use Expo Analytics (pago)

---

## ❌ Troubleshooting

### Build falhou

**Erro comum:** Versão duplicada

```bash
# Incrementa versionCode no app.json
"versionCode": 3  // Muda aqui
```

### Build muito lento

- Plano grátis tem fila
- Upgrade para EAS paid ($29/mês) = builds prioritários

### Usuário não consegue instalar

- Veja `docs/INSTALACAO-USUARIOS.md`
- Certifique-se que ele permitiu "Fontes desconhecidas"

---

## 📞 Suporte EAS

- Docs: https://docs.expo.dev/build/introduction/
- Discord: https://chat.expo.dev/
- Forum: https://forums.expo.dev/

---

## 🎯 Checklist - Primeira Distribuição

- [ ] Login na Expo (`npx eas login`)
- [ ] Configurar `.env.production` com URL real
- [ ] Fazer build (`npx eas build --profile preview --platform android`)
- [ ] Aguardar ~20 minutos
- [ ] Copiar link do APK
- [ ] Compartilhar link com usuários
- [ ] Enviar `docs/INSTALACAO-USUARIOS.md` para eles
- [ ] Testar instalação em pelo menos 1 celular Android

---

**Pronto para fazer o primeiro build? Rode:**

```bash
cd apps/mobile
npx eas login
npx eas build --profile preview --platform android
```
