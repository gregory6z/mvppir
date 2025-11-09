# 🔐 Global Wallet Setup Guide

Guia completo para criar e configurar a Global Wallet do MVPPIR.

## O que é a Global Wallet?

A **Global Wallet** é a carteira centralizada que:
- Recebe todos os depósitos dos usuários (via batch transfer)
- Executa saques quando aprovados pelo admin
- Paga taxas de gas (MATIC) para transações

**Importante:** A private key é armazenada **CRIPTOGRAFADA** no banco de dados usando AES-256-GCM.

## 📋 Pré-requisitos

1. ✅ PostgreSQL rodando e acessível
2. ✅ Migrations do Prisma aplicadas
3. ✅ Variável `ENCRYPTION_KEY` configurada no .env

## 🔄 Importar Carteira Existente

Se você **já tem uma carteira** e quer apenas importá-la:

```bash
cd apps/server

# Opção 1: Via variável de ambiente (mais segura)
PRIVATE_KEY="0x..." npx tsx scripts/import-global-wallet.ts

# Opção 2: Via argumento
npx tsx scripts/import-global-wallet.ts 0x...

# Opção 3: Script interativo (não salva no histórico)
cd ../../infra/scripts
./import-global-wallet.sh
```

**O que acontece:**
1. ✅ Valida a private key
2. ✅ Criptografa com AES-256-GCM
3. ✅ Salva no banco (tabela `global_wallets`)
4. ✅ Preserva o endereço original

**Importante:** Certifique-se de que a carteira já tem MATIC para pagar gas fees!

## 🆕 Criar Nova Carteira

Se você **NÃO tem uma carteira** ainda:

## 🚀 Método 1: Script Automatizado (Recomendado)

### Passo 1: Gerar ENCRYPTION_KEY

Se ainda não tem uma `ENCRYPTION_KEY`:

```bash
# Gerar chave de 32 bytes (64 caracteres hex)
openssl rand -hex 32
```

Adicione ao `.env`:

```bash
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
```

### Passo 2: Executar Script

```bash
cd apps/server

# Criar global wallet
npx tsx scripts/create-global-wallet.ts
```

**Output esperado:**

```
🔐 Criando Global Wallet...

✅ Carteira gerada:
   Address: 0x1234567890123456789012345678901234567890
   Private Key: 0xabcdef...

✅ Global Wallet salva no banco:
   ID: clxxxxx
   Address: 0x1234567890123456789012345678901234567890

🎯 PRÓXIMOS PASSOS:

1. Consiga MATIC testnet (gratuito):
   → https://faucet.polygon.technology/
   ...
```

### Passo 3: Adicionar MATIC

Para que a Global Wallet possa pagar gas fees:

#### **Testnet (Polygon Amoy)**

1. Acesse: https://faucet.polygon.technology/
2. Selecione "Polygon Amoy"
3. Cole o endereço da Global Wallet
4. Aguarde ~30 segundos

#### **Mainnet (Polygon)**

Envie MATIC manualmente para o endereço da Global Wallet.

**Valor recomendado:**
- Testnet: 1-5 MATIC (grátis do faucet)
- Mainnet: 10-50 MATIC (dependendo do volume de transações)

## 🛠️ Método 2: Manual (Node.js)

Se preferir criar manualmente:

```javascript
// create-wallet.js
const { Wallet } = require('ethers');
const crypto = require('crypto');

// 1. Gerar ENCRYPTION_KEY
const encryptionKey = crypto.randomBytes(32).toString('hex');
console.log('ENCRYPTION_KEY:', encryptionKey);

// 2. Gerar wallet
const wallet = Wallet.createRandom();
console.log('\nAddress:', wallet.address);
console.log('Private Key:', wallet.privateKey);

// 3. Criptografar private key
const key = Buffer.from(encryptionKey, 'hex');
const iv = crypto.randomBytes(16);
const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

let encrypted = cipher.update(wallet.privateKey, 'utf8', 'hex');
encrypted += cipher.final('hex');
const authTag = cipher.getAuthTag();

const encryptedData = `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
console.log('\nEncrypted Private Key:', encryptedData);

// 4. Copiar para SQL
console.log('\n--- SQL MANUAL ---');
console.log(`
INSERT INTO global_wallets (id, polygon_address, private_key, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '${wallet.address.toLowerCase()}',
  '${encryptedData}',
  NOW(),
  NOW()
);
`);
```

Execute:

```bash
node create-wallet.js
```

Copie o SQL gerado e execute no seu banco.

## 🔍 Verificar Global Wallet

### Opção 1: Script de verificação

```bash
cd apps/server
npx tsx scripts/check-db-gw.ts
```

### Opção 2: SQL direto

```sql
SELECT
  id,
  polygon_address,
  substring(private_key, 1, 20) || '...' as encrypted_key_preview,
  created_at
FROM global_wallets
ORDER BY created_at DESC
LIMIT 1;
```

### Opção 3: Prisma Studio

```bash
npx prisma studio
# Navegue até "GlobalWallet"
```

## 🔐 Segurança da Private Key

### Como funciona a criptografia?

1. **Algoritmo**: AES-256-GCM (autenticado)
2. **Chave**: 32 bytes (64 hex chars) via `ENCRYPTION_KEY`
3. **IV**: 16 bytes aleatórios por criptografia
4. **Auth Tag**: 16 bytes para verificar integridade

**Formato armazenado:**
```
iv:authTag:encrypted
```

Exemplo:
```
a1b2c3d4e5f6:7g8h9i0j1k2l:m3n4o5p6q7r8...
```

### Descriptografia

O sistema descriptografa automaticamente quando necessário:

```typescript
import { getGlobalWallet } from "@/modules/wallet/use-cases/get-global-wallet";

// Retorna wallet pronta para usar
const { wallet, address } = await getGlobalWallet();

// Enviar transação
const tx = await wallet.sendTransaction({...});
```

## 🚨 Troubleshooting

### Erro: "ENCRYPTION_KEY must be 64 hex characters"

```bash
# Gere uma nova
openssl rand -hex 32

# Adicione ao .env
ENCRYPTION_KEY=<chave-gerada>
```

### Erro: "Global Wallet já existe no banco"

Se você quer substituir:

```sql
-- ⚠️ CUIDADO: Isso apaga a wallet antiga!
DELETE FROM global_wallets;
```

Depois rode o script novamente.

### Erro: "GLOBAL_WALLET_NOT_FOUND"

Significa que a tabela `global_wallets` está vazia:

```bash
# Criar nova wallet
npx tsx scripts/create-global-wallet.ts
```

### Wallet sem MATIC (transações falhando)

Verifique saldo:

```bash
npx tsx scripts/check-global-wallet-balance.ts
```

Adicione MATIC via faucet (testnet) ou envio manual (mainnet).

## 📊 Monitoramento

### Ver saldo da Global Wallet

```bash
cd apps/server
npx tsx scripts/check-global-wallet-balance.ts
```

### Ver no Polygonscan

**Testnet (Amoy):**
```
https://amoy.polygonscan.com/address/0x...
```

**Mainnet:**
```
https://polygonscan.com/address/0x...
```

## ⚠️ Importante: Variáveis de Ambiente Legado

O arquivo `src/config/env.ts` ainda requer:

```bash
GLOBAL_WALLET_ADDRESS=0x...
GLOBAL_WALLET_PRIVATE_KEY=...
```

**Essas variáveis NÃO são usadas** (código usa banco de dados).

**Solução temporária:** Use placeholders

```bash
# .env
GLOBAL_WALLET_ADDRESS=0x0000000000000000000000000000000000000000
GLOBAL_WALLET_PRIVATE_KEY=placeholder
```

**TODO:** Remover essas variáveis do env.ts (já não são necessárias).

## 🔄 Backup da Global Wallet

### Exportar private key descriptografada

```bash
cd apps/server

# Script para exportar (CUIDADO: Sensível!)
npx tsx -e "
import { getGlobalWallet } from './src/modules/wallet/use-cases/get-global-wallet.ts';

(async () => {
  const gw = await getGlobalWallet();
  console.log('Address:', gw.address);
  console.log('Private Key:', gw.wallet.privateKey);
})();
"
```

**⚠️ NUNCA compartilhe essa private key ou commite ao Git!**

### Backup do ENCRYPTION_KEY

Guarde o `ENCRYPTION_KEY` em local seguro:
- Password manager (1Password, Bitwarden)
- Vault (HashiCorp Vault)
- Secrets manager (AWS Secrets Manager, Railway Variables)

Sem o `ENCRYPTION_KEY`, você **NÃO consegue** descriptografar a wallet do banco.

## 📚 Referências

- Código de criptografia: `apps/server/src/lib/encryption.ts`
- Script de criação: `apps/server/scripts/create-global-wallet.ts`
- Use case: `apps/server/src/modules/wallet/use-cases/get-global-wallet.ts`

---

**Última atualização**: 2025-01-09
