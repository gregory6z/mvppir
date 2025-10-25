# 🪙 Deploy de Tokens de Teste (TestUSDC)

Guia completo para criar tokens ERC20 falsos para testar depósitos/saques com USD fake.

---

## 🚀 Passo a Passo Completo

### 1. Abra Remix IDE
👉 https://remix.ethereum.org/

### 2. Crie o contrato

No Remix, crie arquivo `TestUSDC.sol` e cole:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TestUSDC {
    string public name = "Test USDC";
    string public symbol = "USDC";
    uint8 public decimals = 6;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor() {
        uint256 initialSupply = 1_000_000 * (10 ** uint256(decimals));
        totalSupply = initialSupply;
        balanceOf[msg.sender] = initialSupply;
        emit Transfer(address(0), msg.sender, initialSupply);
    }

    function transfer(address to, uint256 value) public returns (bool) {
        require(balanceOf[msg.sender] >= value);
        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;
        emit Transfer(msg.sender, to, value);
        return true;
    }

    function approve(address spender, uint256 value) public returns (bool) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) public returns (bool) {
        require(value <= balanceOf[from]);
        require(value <= allowance[from][msg.sender]);
        balanceOf[from] -= value;
        balanceOf[to] += value;
        allowance[from][msg.sender] -= value;
        emit Transfer(from, to, value);
        return true;
    }

    // Função para criar tokens de teste (PÚBLICA!)
    function mint(address to, uint256 amount) public returns (bool) {
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
        return true;
    }

    // Helper: mintar com valor humano (ex: 100 = 100 USDC)
    function mintHuman(address to, uint256 amountHuman) public returns (bool) {
        uint256 amount = amountHuman * (10 ** uint256(decimals));
        return mint(to, amount);
    }
}
```

### 3. Compile
- Aba "Solidity Compiler"
- Versão: 0.8.20+
- Clique "Compile TestUSDC.sol"

### 4. Deploy no Amoy
1. Aba "Deploy & Run Transactions"
2. Environment: **"Injected Provider - MetaMask"**
3. Conecte MetaMask na **Polygon Amoy**
4. Contract: `TestUSDC`
5. Clique "Deploy"
6. Confirme no MetaMask

### 5. Copie o endereço do contrato

Depois do deploy, aparece:
```
TESTUSDC AT 0x1234...5678
```

**COPIE ESSE ENDEREÇO!** Exemplo: `0x1234567890abcdef1234567890abcdef12345678`

### 6. Minte tokens para você

No Remix, em "Deployed Contracts":
1. Função `mintHuman`
2. Preencha:
   - **to:** Seu endereço MetaMask
   - **amountHuman:** `10000` (= 10.000 USDC)
3. "transact" → Confirme MetaMask

---

## 🔧 Configure no Sistema

### Adicione o token em `src/lib/tokens.ts`

Edite o arquivo e adicione seu TestUSDC:

```typescript
export const KNOWN_TOKENS = {
  // TestUSDC na Amoy (ADICIONE AQUI!)
  "0xSEU_ENDERECO_DO_CONTRATO_AQUI": {
    symbol: "USDC",
    decimals: 6,
    name: "Test USD Coin",
  },

  // USDC Real (Polygon Mainnet)
  "0x2791bca1f2de4661ed88a30c99a7a9449aa84174": {
    symbol: "USDC",
    decimals: 6,
    name: "USD Coin",
  },

  // MATIC (nativo)
  NATIVE: {
    symbol: "MATIC",
    decimals: 18,
    name: "Polygon",
  },
} as const;
```

**⚠️ IMPORTANTE:** Substitua `0xSEU_ENDERECO_DO_CONTRATO_AQUI` pelo endereço REAL que você copiou no passo 5!

---

## 🧪 Testar Depósito com TestUSDC

### Método 1: Via Script

```bash
# Envie 100 USDC fake para um deposit address
npx tsx -e "
import {Wallet, Contract, JsonRpcProvider, parseUnits} from 'ethers';
import {decryptPrivateKey} from './src/lib/encryption';
import {prisma} from './src/lib/prisma';
import {env} from './src/config/env';

async function send() {
  // Busca Global Wallet
  const gw = await prisma.globalWallet.findFirst();
  const pk = decryptPrivateKey(gw.privateKey);

  const provider = new JsonRpcProvider(env.POLYGON_RPC_URL);
  const wallet = new Wallet(pk, provider);

  // Endereço do TestUSDC (SUBSTITUA!)
  const tokenAddress = '0xSEU_TESTUSDC_ADDRESS';

  // Endereço de depósito do usuário (obtenha via API ou banco)
  const userDepositAddress = '0xUSER_DEPOSIT_ADDRESS';

  const abi = ['function transfer(address to, uint256 amount) returns (bool)'];
  const token = new Contract(tokenAddress, abi, wallet);

  const amount = parseUnits('100', 6); // 100 USDC
  const tx = await token.transfer(userDepositAddress, amount);

  console.log('TX:', tx.hash);
  await tx.wait();
  console.log('✅ 100 USDC enviado!');
}

send();
"
```

### Método 2: Via MetaMask

1. Adicione TestUSDC como token customizado no MetaMask:
   - Address: Endereço do seu contrato
   - Symbol: USDC
   - Decimals: 6

2. Envie tokens para o deposit address do usuário

3. Moralis detecta → Webhook chega → Balance atualiza! 🎉

---

## ✅ Checklist Final

- [ ] TestUSDC deployed na Amoy
- [ ] Endereço do contrato copiado
- [ ] 10.000 USDC mintado para você
- [ ] Token adicionado em `src/lib/tokens.ts`
- [ ] Servidor rodando com ngrok
- [ ] Moralis Stream configurado
- [ ] Teste de deposit realizado
- [ ] Webhook recebido
- [ ] Balance atualizado no banco

---

## 🎉 Pronto!

Agora você pode testar depósitos/saques com USDC fake ilimitado!

**Vantagens:**
- ✅ Tokens infinitos (função `mint` pública)
- ✅ Sem precisar de faucet
- ✅ Teste completo do fluxo USD
- ✅ Simula USDC real perfeitamente

**Ver seu TestUSDC no Explorer:**
```
https://amoy.polygonscan.com/address/SEU_CONTRACT_ADDRESS
```
