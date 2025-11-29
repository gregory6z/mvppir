# 📚 Documentação Mobile

## Guias Disponíveis

### Para Desenvolvedores

- **[BUILD-E-DISTRIBUICAO.md](./BUILD-E-DISTRIBUICAO.md)** - Como fazer build do APK e distribuir para usuários

### Para Usuários Finais

- **[INSTALACAO-USUARIOS.md](./INSTALACAO-USUARIOS.md)** - Guia de instalação do APK (compartilhe com usuários)

---

## 📱 Estratégia de Distribuição

### Distribuição Direta (APK)

Este projeto NÃO usa Google Play Store ou Apple App Store.

**Distribuição via:**
- Link direto do APK (Expo)
- QR Code
- Página de download personalizada

**Vantagens:**
- ✅ Grátis
- ✅ Sem burocracia
- ✅ Controle total

**Desvantagens:**
- ❌ Apenas Android
- ❌ Usuários precisam permitir "Fontes desconhecidas"
- ❌ Sem atualizações automáticas

---

## 🚀 Quick Start

**Fazer primeiro build:**

```bash
cd apps/mobile
npx eas login
npx eas build --profile preview --platform android
```

**Compartilhar APK:**

1. Copie o link gerado pela Expo
2. Compartilhe via WhatsApp/Telegram/Email
3. Envie o guia `INSTALACAO-USUARIOS.md` junto

---

## 🔄 Workflow de Atualização

1. Fazer mudanças no código
2. Incrementar versão em `app.json`
3. Fazer novo build: `npx eas build --profile preview --platform android`
4. Compartilhar novo link com usuários
5. Usuários instalam por cima (dados preservados)

---

## 📞 Suporte

- Problemas com build? Veja `BUILD-E-DISTRIBUICAO.md`
- Usuários com problema? Veja `INSTALACAO-USUARIOS.md`
