# 🚀 Quick Start - Primeiro Build

Guia rápido para fazer seu primeiro build APK com EAS.

---

## ✅ Configuração Pronta

Já está tudo configurado:

- ✅ Package name: `com.mvppir.app` (genérico)
- ✅ Nome do app: `MVPPIR`
- ✅ Versão: `1.0.0`
- ✅ EAS config: `eas.json` (perfil preview)
- ✅ Environment: `.env.production` (Railway)

---

## 📋 Passo a Passo

### 1. Instalar EAS CLI (uma vez)

```bash
npm install -g eas-cli
```

### 2. Fazer Login na Expo

```bash
cd apps/mobile
npx eas login
```

**Dica de Privacidade (Opcional):**
- Use email anônimo: [ProtonMail](https://proton.me) ou [Tutanota](https://tutanota.com)
- Não use seu email pessoal/empresarial

### 3. Configurar Projeto (primeira vez)

```bash
npx eas build:configure
```

Isso vai:
- Gerar um `projectId` único
- Atualizar `app.json` automaticamente

**Responda:**
- "Platform?" → **Android**
- "Create new project?" → **Yes**

### 4. Fazer o Build

```bash
npx eas build --profile preview --platform android
```

**O que acontece:**
- ✅ Código enviado para Expo
- ✅ Compilação na nuvem (~15-20 min)
- ✅ Você recebe um link do APK

**Exemplo de output:**

```
✔ Build complete!

APK: https://expo.dev/artifacts/eas/abc123xyz.apk

Share this URL to install the app.
```

### 5. Testar o APK

**Opção A: Testar no seu celular**

1. Copie o link do APK
2. Abra no navegador do celular
3. Baixe e instale

**Opção B: Baixar para re-hospedar**

1. Clique no link no computador
2. Salve o APK
3. Faça upload em:
   - Google Drive
   - Mega.nz (anônimo)
   - File.io (autodestrói)
   - Seu servidor

---

## 🔐 Dicas de Privacidade

### Após Receber o Link:

**Para máxima privacidade:**

1. **Baixe o APK** localmente:
   ```bash
   curl -O https://expo.dev/artifacts/eas/abc123.apk
   ```

2. **Re-hospede em serviço anônimo:**
   - [Mega.nz](https://mega.nz) - Anônimo, sem limite
   - [AnonFiles](https://anonfiles.com) - Anônimo, rápido
   - [IPFS](https://ipfs.io) - Descentralizado

3. **Distribua o novo link** (não o da Expo)

### Conta Anônima:

Se criar conta Expo com email anônimo:
- Use ProtonMail ou Tutanota
- Não vincule cartão de crédito
- Use VPN (opcional)

---

## 🔄 Atualizar o App

Quando fizer mudanças:

### 1. Incrementar versão em `app.json`:

```json
{
  "version": "1.0.1",
  "android": {
    "versionCode": 2
  }
}
```

### 2. Fazer novo build:

```bash
npx eas build --profile preview --platform android
```

### 3. Compartilhar novo link

Usuários instalam por cima (dados preservados).

---

## ⚡ Comandos Úteis

### Ver builds anteriores:

```bash
npx eas build:list
```

### Cancelar build em andamento:

```bash
npx eas build:cancel
```

### Ver detalhes de um build:

```bash
npx eas build:view [build-id]
```

---

## ❌ Troubleshooting

### "Error: No project found"

**Solução:** Rode `npx eas build:configure` primeiro

### "Error: Duplicate version code"

**Solução:** Incremente `versionCode` no `app.json`

### Build muito lento (>30 min)

**Causa:** Fila de builds (plano grátis)

**Soluções:**
- Aguarde (pode demorar até 1 hora em horários de pico)
- Upgrade para EAS paid ($29/mês) = prioridade

### APK não instala no celular

**Soluções:**
- Permitir "Fontes desconhecidas" (Android pede isso)
- Verificar se Android é 5.0+ (API level 21+)
- Desinstalar versão anterior se houver

---

## 💰 Custos

**Plano Grátis (suficiente para você):**
- ✅ Builds ilimitados
- ✅ 15 GB storage
- ❌ Fila (pode demorar)

**Plano Paid ($29/mês - opcional):**
- ✅ Builds prioritários (mais rápidos)
- ✅ 1 TB storage
- ✅ Suporte premium

---

## 📦 Resultado Final

Você vai receber:

```
Nome do App: MVPPIR
Package: com.mvppir.app
Versão: 1.0.0
Tamanho: ~30-50 MB (aprox.)
Plataforma: Android 5.0+
Permissões: Internet, Storage

Link: https://expo.dev/artifacts/eas/[id].apk
```

---

## ✅ Checklist - Primeiro Build

- [ ] Instalar EAS CLI: `npm install -g eas-cli`
- [ ] Login: `npx eas login`
- [ ] Configurar: `npx eas build:configure`
- [ ] Build: `npx eas build --profile preview --platform android`
- [ ] Aguardar ~20 min
- [ ] Copiar link do APK
- [ ] Testar no celular
- [ ] (Opcional) Re-hospedar em serviço anônimo
- [ ] Compartilhar com usuários

---

**Pronto para começar?** 🎯

```bash
cd apps/mobile
npx eas login
npx eas build --profile preview --platform android
```

Qualquer dúvida durante o build, me avise!
