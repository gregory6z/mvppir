# 🧪 Testnet Setup - Guia Completo para Testes Reais

Este guia mostra como configurar e testar o sistema completo usando **Polygon Amoy Testnet** (blockchain de teste gratuita).

## 📋 Pré-requisitos

- Node.js instalado
- MetaMask ou outra wallet compatível
- Conta no Moralis (gratuita)

## 🔧 Passo 1: Configure sua Wallet de Teste

### 1.1. Crie uma nova wallet (ou use existente)

**Opção A: Via MetaMask**
1. Abra MetaMask
2. Clique em "Create Account" ou use conta existente
3. Copie o endereço (ex: `0x123...`)
4. Exporte a private key: Settings → Security & Privacy → Reveal Private Key

**Opção B: Via Node.js (programaticamente)**

```bash
# No diretório do projeto
npx tsx -e "import {Wallet} from 'ethers'; const w = Wallet.createRandom(); console.log('Address:', w.address); console.log('Private Key:', w.privateKey);"
```

Salve o output:
```
Address: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEbB
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

⚠️ **IMPORTANTE:** Esta é uma wallet de **teste**. NUNCA use em produção ou envie fundos reais!

### 1.2. Adicione Amoy Testnet na MetaMask

**Configuração Manual:**
- **Network Name:** Polygon Amoy Testnet
- **RPC URL:** `https://rpc-amoy.polygon.technology`
- **Chain ID:** 80002
- **Currency Symbol:** MATIC
- **Block Explorer:** https://amoy.polygonscan.com/

**Ou use:** https://chainlist.org/?search=amoy (conecta automaticamente)

## 💰 Passo 2: Consiga MATIC de Teste (Gratuito)

Você precisa de MATIC testnet para pagar gas fees.

### Faucets Disponíveis:

**1. Polygon Faucet Oficial** (Recomendado)
- URL: https://faucet.polygon.technology/
- Selecione "Polygon Amoy"
- Cole seu endereço
- Receba **0.5 MATIC** gratuito
- Limite: 1x por dia

**2. Alchemy Faucet**
- URL: https://www.alchemy.com/faucets/polygon-amoy
- Login com GitHub/Google
- Receba até **0.5 MATIC/dia**

**3. QuickNode Faucet**
- URL: https://faucet.quicknode.com/polygon/amoy
- Receba MATIC testnet

### Verificar saldo:

```bash
# Via RPC
curl https://rpc-amoy.polygon.technology \
  -X POST \
  -H "Content-Type: application/json" \
  --data '{"method":"eth_getBalance","params":["0xSEU_ENDERECO","latest"],"id":1,"jsonrpc":"2.0"}'

# Ou visite: https://amoy.polygonscan.com/address/0xSEU_ENDERECO
```

## 🪙 Passo 3: Consiga Tokens ERC20 de Teste (USDC/USDT)

### Opção A: Deploy seu próprio token de teste (Recomendado)

**1. Via Remix IDE (mais fácil):**

1. Acesse: https://remix.ethereum.org/
2. Crie novo arquivo: `TestUSDC.sol`
3. Cole o código:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TestUSDC is ERC20, Ownable {
    constructor() ERC20("Test USDC", "USDC") Ownable(msg.sender) {
        _mint(msg.sender, 1000000 * 10 ** decimals()); // 1 milhão de USDC
    }

    function decimals() public pure override returns (uint8) {
        return 6; // USDC tem 6 decimals
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
```

4. Compile: Compiler tab → Compile
5. Deploy:
   - Deploy tab
   - Environment: "Injected Provider - MetaMask"
   - Selecione "Amoy Testnet" na MetaMask
   - Deploy contract
   - Confirme transação

6. Copie o endereço do contrato deployado (ex: `0xABC...`)

**2. Atualize `src/lib/tokens.ts`:**

```typescript
export const KNOWN_TOKENS: Record<string, TokenInfo> = {
  // USDC Amoy Testnet (seu contrato)
  "0xABC...": {
    symbol: "USDC",
    decimals: 6,
    name: "Test USDC",
  },
  // MATIC nativo
  "native": {
    symbol: "MATIC",
    decimals: 18,
    name: "Polygon",
  },
};
```

### Opção B: Use token de teste existente

Algumas testnets disponibilizam tokens ERC20 de teste. Verifique:
- https://amoy.polygonscan.com/tokens

## ⚙️ Passo 4: Configure o `.env`

Crie `.env.testnet`:

```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mvppir_testnet?schema=public"
PORT=3333
NODE_ENV=development

# Authentication
AUTH_SECRET="testnet-secret-key-min-32-chars-long"
API_BASE_URL="http://localhost:3333"
FRONTEND_URL="http://localhost:3000"

# Moralis (configure stream para Amoy)
MORALIS_API_KEY="SUA_CHAVE_MORALIS"
MORALIS_STREAM_SECRET="SEU_STREAM_SECRET"

# Encryption
ENCRYPTION_KEY="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"

# 🔥 POLYGON AMOY TESTNET
POLYGON_RPC_URL="https://rpc-amoy.polygon.technology"
POLYGON_CHAIN_ID="80002"

# Global Wallet (sua wallet de teste criada no Passo 1)
GLOBAL_WALLET_ADDRESS="0xSUA_WALLET_ADDRESS"
GLOBAL_WALLET_PRIVATE_KEY="0xSUA_PRIVATE_KEY"

# Disable test mode (queremos blockchain real agora!)
SKIP_BLOCKCHAIN_PROCESSING=false
```

## 🌊 Passo 5: Configure Moralis Stream para Amoy

1. Acesse: https://admin.moralis.io/streams
2. Create New Stream
3. Configure:
   - **Webhook URL:** `http://SEU_IP_PUBLICO:3333/webhooks/moralis`
   - **Description:** MVP PIR Testnet
   - **Network:** Polygon Amoy (80002)
   - **Address:** (deixe vazio - será preenchido automaticamente quando usuário criar deposit address)
   - **Topic:** Transfer event
   - **ABI:**
   ```json
   [{
     "anonymous": false,
     "inputs": [
       {"indexed": true, "name": "from", "type": "address"},
       {"indexed": true, "name": "to", "type": "address"},
       {"indexed": false, "name": "value", "type": "uint256"}
     ],
     "name": "Transfer",
     "type": "event"
   }]
   ```

4. Copie o **Stream Secret** e adicione ao `.env.testnet`

## 🚀 Passo 6: Inicie o Sistema

```bash
# Carrega .env.testnet
cp .env.testnet .env

# Aplica migrations
npm run prisma:migrate

# Cria Global Wallet no banco
npx tsx scripts/setup-global-wallet.ts

# Inicia servidor
npm run dev
```

## 🧪 Passo 7: Teste o Fluxo Completo

### 7.1. Crie usuário e obtenha deposit address

```bash
# Signup
curl -X POST http://localhost:3333/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "password": "Senha123!",
    "name": "Usuário Teste"
  }'

# Login
curl -X POST http://localhost:3333/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "password": "Senha123!"
  }' \
  -c cookies.txt

# Obter deposit address
curl -X GET http://localhost:3333/user/deposit/address \
  -b cookies.txt
```

Copie o `address` retornado (ex: `0xDEF...`)

### 7.2. Envie tokens de teste para o deposit address

**Via MetaMask:**
1. Abra MetaMask (conectada na Amoy Testnet)
2. Adicione o token customizado (endereço do TestUSDC que você deployou)
3. Envie 100 USDC para o deposit address do usuário (`0xDEF...`)
4. Confirme transação

**Via Node.js:**

```bash
npx tsx -e "
import {Wallet, Contract, parseUnits, JsonRpcProvider} from 'ethers';

const provider = new JsonRpcProvider('https://rpc-amoy.polygon.technology');
const wallet = new Wallet('0xSUA_PRIVATE_KEY', provider);
const tokenAddress = '0xTOKEN_ADDRESS';
const depositAddress = '0xDEPOSIT_ADDRESS_DO_USUARIO';

const abi = ['function transfer(address to, uint256 amount) returns (bool)'];
const token = new Contract(tokenAddress, abi, wallet);

async function send() {
  const amount = parseUnits('100', 6); // 100 USDC (6 decimals)
  const tx = await token.transfer(depositAddress, amount);
  console.log('TX Hash:', tx.hash);
  await tx.wait();
  console.log('✅ Confirmado!');
}

send();
"
```

### 7.3. Verifique webhook recebido

Aguarde ~30 segundos. O Moralis detectará a transferência e enviará webhook para sua API.

Logs esperados:
```
🔔 Webhook Moralis recebido
✅ Transação confirmada pela blockchain
✅ Ativando conta [...] - Depósito mínimo atingido!
```

### 7.4. Verifique saldo do usuário

```bash
curl -X GET http://localhost:3333/user/balance \
  -b cookies.txt
```

Deve retornar:
```json
{
  "balances": [
    {
      "tokenSymbol": "USDC",
      "availableBalance": "100",
      "lockedBalance": "0"
    }
  ]
}
```

### 7.5. Teste withdrawal flow

**Request withdrawal:**
```bash
curl -X POST http://localhost:3333/user/withdrawals/request \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "tokenSymbol": "USDC",
    "amount": "50",
    "destinationAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEbB"
  }'
```

**Admin approve:**
```bash
# Primeiro, promova usuário para admin no banco
psql $DATABASE_URL -c "UPDATE users SET role = 'admin' WHERE email = 'teste@example.com';"

# Liste pending withdrawals
curl -X GET "http://localhost:3333/admin/withdrawals?status=PENDING_APPROVAL" \
  -b cookies.txt

# Approve withdrawal (copie o ID do withdrawal)
curl -X POST http://localhost:3333/admin/withdrawals/WITHDRAWAL_ID/approve \
  -b cookies.txt
```

**Verifique transação na blockchain:**
- Acesse: https://amoy.polygonscan.com/
- Procure pelo endereço da Global Wallet
- Veja a transação de withdrawal sendo processada

## 🎯 Checklist de Testes

- [ ] Usuário cria conta
- [ ] Usuário obtém deposit address
- [ ] Moralis Stream detecta transferência
- [ ] Webhook processa corretamente
- [ ] Saldo atualiza no banco
- [ ] Conta ativa após $100 USD
- [ ] Withdrawal request funciona
- [ ] Admin aprova withdrawal
- [ ] Transação blockchain enviada com sucesso
- [ ] Saldo atualiza corretamente (locked → debitado)
- [ ] Batch transfer funciona (consolidação de fundos)

## 🔍 Troubleshooting

### Webhook não chega:
- Verifique URL pública exposta (use ngrok se local)
- Confirme Stream Secret correto
- Veja logs do Moralis: https://admin.moralis.io/streams → Logs

### Transaction failed:
- Verifique saldo MATIC na Global Wallet (precisa de gas)
- Confirme RPC URL correto
- Veja erro detalhado nos logs da aplicação

### Token não aparece no balance:
- Confirme token está em `src/lib/tokens.ts`
- Verifique webhook processado com sucesso
- Confirme transaction CONFIRMED no banco

## 📚 Recursos Adicionais

- Polygon Amoy Faucet: https://faucet.polygon.technology/
- Amoy Explorer: https://amoy.polygonscan.com/
- Moralis Docs: https://docs.moralis.io/streams-api/
- OpenZeppelin Contracts: https://docs.openzeppelin.com/contracts/

---

**Feito! Agora você tem um ambiente completo de testes com blockchain real (testnet) sem gastar dinheiro! 🎉**
