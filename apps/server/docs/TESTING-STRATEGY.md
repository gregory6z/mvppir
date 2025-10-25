# Estratégia de Testes - MVP PIR
## Como Testar Tudo Sem Usar Dinheiro Real

**Versão:** 1.0
**Data:** 21 de Outubro de 2025
**Objetivo:** Garantir que o sistema funciona 100% antes de ir para produção

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Ambientes de Teste](#ambientes-de-teste)
3. [Testes por Funcionalidade](#testes-por-funcionalidade)
4. [Testes Automatizados](#testes-automatizados)
5. [Checklist Final](#checklist-final)

---

## 🎯 Visão Geral

### Princípios
- ✅ **NUNCA usar dinheiro real** em testes
- ✅ Usar **Polygon Mumbai Testnet** (tokens de teste)
- ✅ Mockar APIs externas quando possível
- ✅ Ter ambiente de staging idêntico a produção
- ✅ Testes automatizados para regressão

### Tipos de Teste

| Tipo | Objetivo | Ferramentas |
|------|----------|-------------|
| **Unitário** | Testar funções isoladas | Jest/Vitest |
| **Integração** | Testar fluxos completos | Supertest |
| **E2E** | Testar como usuário real | Playwright |
| **Manual** | Verificar UI/UX | Checklist |

---

## 🌍 Ambientes de Teste

### 1. Local Development
```bash
# .env.development
DATABASE_URL="postgresql://localhost:5432/mvppir_dev"
POLYGON_RPC_URL="https://rpc-mumbai.maticvigil.com"  # Testnet
POLYGON_CHAIN_ID="80001"  # Mumbai
MORALIS_API_KEY="test_key"
AUTH_SECRET="test_secret_32_chars_minimum"

# Wallet de teste (NUNCA use em produção)
GLOBAL_WALLET_ADDRESS="0x..."
GLOBAL_WALLET_PRIVATE_KEY="0x..."
```

### 2. Staging (Pré-Produção)
- Cópia idêntica da produção
- Usa **Polygon Mumbai Testnet**
- Dados mockados/anônimos
- URL: `https://staging.seu-dominio.com`

### 3. Production
- **Polygon Mainnet** (dinheiro real)
- Dados reais de clientes
- Só deploy após 100% de testes passarem

---

## 🧪 Testes por Funcionalidade

### F1: Autenticação (Better Auth)

#### Teste Manual
```bash
# 1. Criar conta
curl -X POST http://localhost:3333/api/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "password": "Test123!",
    "name": "Usuário Teste"
  }'

# Verificar:
# ✅ Status 200
# ✅ Conta criada com status INACTIVE
# ✅ Email único (não pode criar 2x com mesmo email)
```

#### Teste Automatizado
```typescript
// tests/auth.test.ts
describe('Authentication', () => {
  it('should create new user account', async () => {
    const response = await request(app)
      .post('/api/auth/sign-up')
      .send({
        email: 'test@example.com',
        password: 'Test123!',
        name: 'Test User'
      });

    expect(response.status).toBe(200);
    expect(response.body.user.status).toBe('INACTIVE');
  });

  it('should not allow duplicate emails', async () => {
    // Criar primeira conta
    await createUser('test@example.com');

    // Tentar criar segunda
    const response = await request(app)
      .post('/api/auth/sign-up')
      .send({ email: 'test@example.com', ... });

    expect(response.status).toBe(400);
  });
});
```

---

### F2: Endereço de Depósito

#### Teste Manual
```bash
# 1. Login
curl -X POST http://localhost:3333/api/auth/sign-in \
  -c cookies.txt \
  -d '{"email":"teste@example.com","password":"Test123!"}'

# 2. Obter endereço
curl -X GET http://localhost:3333/deposit/address \
  -b cookies.txt

# Verificar:
# ✅ Retorna endereço Polygon (0x...)
# ✅ Mesmo endereço na segunda chamada (FIXO)
# ✅ QR Code gerado
# ✅ Private key NÃO é retornada
```

#### Teste Automatizado
```typescript
describe('Deposit Address', () => {
  it('should generate fixed polygon address', async () => {
    const user = await createAuthenticatedUser();

    const response1 = await request(app)
      .get('/deposit/address')
      .set('Cookie', user.sessionCookie);

    const response2 = await request(app)
      .get('/deposit/address')
      .set('Cookie', user.sessionCookie);

    // Deve retornar SEMPRE o mesmo endereço
    expect(response1.body.polygonAddress).toBe(response2.body.polygonAddress);
    expect(response1.body.polygonAddress).toMatch(/^0x[a-fA-F0-9]{40}$/);

    // Private key NÃO deve ser retornada
    expect(response1.body.privateKey).toBeUndefined();
  });

  it('should add address to Moralis Stream', async () => {
    const mockMoralis = jest.spyOn(moralisService, 'addAddressToStream');

    await request(app)
      .get('/deposit/address')
      .set('Cookie', sessionCookie);

    expect(mockMoralis).toHaveBeenCalledWith(expect.stringMatching(/^0x/));
  });
});
```

---

### F3: Detecção de Depósitos (CRÍTICO - Mock Moralis)

#### Setup de Mock
```typescript
// tests/mocks/moralis-webhook.mock.ts
export function createMockMoralisWebhook(overrides = {}) {
  return {
    confirmed: true,
    chainId: "80001", // Mumbai testnet
    txHash: `0x${randomBytes(32).toString('hex')}`,
    to: "0xUSER_DEPOSIT_ADDRESS",
    from: "0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199",
    value: "100000000", // 100 USDC (6 decimals)
    tokenAddress: "0x...", // USDC Mumbai
    tokenSymbol: "USDC",
    tokenDecimals: "6",
    block: {
      number: "12345678",
      timestamp: Math.floor(Date.now() / 1000).toString(),
    },
    ...overrides
  };
}

export function signMoralisWebhook(payload: any) {
  const secret = process.env.MORALIS_STREAM_SECRET;
  return keccak256(Buffer.from(JSON.stringify(payload) + secret));
}
```

#### Teste Manual
```bash
# Simular webhook do Moralis
curl -X POST http://localhost:3333/webhooks/moralis \
  -H "Content-Type: application/json" \
  -H "x-signature: SIGNATURE_HERE" \
  -d '{
    "confirmed": true,
    "chainId": "80001",
    "txHash": "0x123...",
    "to": "0xENDERECO_DO_USUARIO",
    "value": "100000000",
    "tokenAddress": "0x...",
    "tokenSymbol": "USDC",
    "tokenDecimals": "6"
  }'

# Verificar:
# ✅ Transação salva no banco
# ✅ Status: PENDING
# ✅ Valor convertido corretamente (100 USDC)
```

#### Teste Automatizado
```typescript
describe('Deposit Detection', () => {
  it('should process USDC deposit webhook', async () => {
    const user = await createUser();
    const depositAddress = await getDepositAddress(user.id);

    const webhook = createMockMoralisWebhook({
      to: depositAddress.polygonAddress,
      value: "100000000", // 100 USDC
      tokenSymbol: "USDC",
    });

    const signature = signMoralisWebhook(webhook);

    const response = await request(app)
      .post('/webhooks/moralis')
      .set('x-signature', signature)
      .send(webhook);

    expect(response.status).toBe(200);

    // Verificar no banco
    const transaction = await prisma.walletTransaction.findUnique({
      where: { txHash: webhook.txHash }
    });

    expect(transaction.amount.toNumber()).toBe(100);
    expect(transaction.tokenSymbol).toBe('USDC');
    expect(transaction.status).toBe('PENDING');
  });

  it('should reject invalid signature', async () => {
    const webhook = createMockMoralisWebhook();

    const response = await request(app)
      .post('/webhooks/moralis')
      .set('x-signature', 'INVALID_SIGNATURE')
      .send(webhook);

    expect(response.status).toBe(401);
  });

  it('should detect any ERC20 token', async () => {
    const webhook = createMockMoralisWebhook({
      tokenSymbol: "SHIB",
      tokenAddress: "0x...",
      tokenDecimals: "18",
      value: "1000000000000000000", // 1 SHIB
    });

    const response = await request(app)
      .post('/webhooks/moralis')
      .set('x-signature', signMoralisWebhook(webhook))
      .send(webhook);

    expect(response.status).toBe(200);

    const transaction = await getLastTransaction();
    expect(transaction.tokenSymbol).toBe('SHIB');
  });
});
```

---

### F4: Conversão de Preços (Mock CoinGecko)

#### Setup de Mock
```typescript
// tests/mocks/coingecko.mock.ts
export function mockCoinGeckoAPI() {
  nock('https://api.coingecko.com')
    .get('/api/v3/simple/price')
    .query({ ids: 'matic-network', vs_currencies: 'usd' })
    .reply(200, {
      'matic-network': { usd: 0.75 }
    });
}
```

#### Teste Automatizado
```typescript
describe('Price Conversion', () => {
  beforeEach(() => {
    mockCoinGeckoAPI();
  });

  it('should convert USDC to USD (always $1)', async () => {
    const usd = await convertToUSD('USDC', 100);
    expect(usd).toBe(100);
  });

  it('should convert MATIC to USD using API', async () => {
    const usd = await convertToUSD('MATIC', 10);
    expect(usd).toBe(7.5); // 10 * 0.75
  });

  it('should cache prices for 5 minutes', async () => {
    await getTokenPriceUSD('MATIC');

    // Segunda chamada não deve chamar API
    nock.cleanAll(); // Remove mock

    const price = await getTokenPriceUSD('MATIC');
    expect(price).toBe(0.75); // Do cache
  });
});
```

---

### F5: Ativação de Conta

#### Teste de Fluxo Completo
```typescript
describe('Account Activation', () => {
  it('should activate account after $100 USD deposit', async () => {
    const user = await createUser();
    const depositAddress = await getDepositAddress(user.id);

    // Mock: Preço do USDC = $1
    mockCoinGeckoAPI();

    // Simular depósito de 50 USDC
    await simulateDeposit({
      to: depositAddress.polygonAddress,
      amount: "50000000", // 50 USDC
      tokenSymbol: "USDC",
    });

    let userStatus = await getUserStatus(user.id);
    expect(userStatus.status).toBe('INACTIVE');
    expect(userStatus.currentTotalUSD).toBe(50);
    expect(userStatus.missingUSD).toBe(50);

    // Simular segundo depósito de 60 USDC
    await simulateDeposit({
      to: depositAddress.polygonAddress,
      amount: "60000000", // 60 USDC
      tokenSymbol: "USDC",
    });

    // Agora deve ativar (50 + 60 = 110 USD)
    userStatus = await getUserStatus(user.id);
    expect(userStatus.status).toBe('ACTIVE');
    expect(userStatus.activated).toBe(true);
    expect(userStatus.activatedAt).toBeDefined();
  });

  it('should activate with mixed tokens', async () => {
    // 90 USDC + 5 MATIC (5 * $0.75 = $3.75) = $93.75 (não ativa)
    // Depois + 10 USDC = $103.75 (ativa!)

    await simulateDeposit({ tokenSymbol: "USDC", amount: "90000000" });
    expect((await getUser()).status).toBe('INACTIVE');

    await simulateDeposit({ tokenSymbol: "MATIC", amount: "5000000000000000000" });
    expect((await getUser()).status).toBe('INACTIVE');

    await simulateDeposit({ tokenSymbol: "USDC", amount: "10000000" });
    expect((await getUser()).status).toBe('ACTIVE');
  });
});
```

---

## 🤖 Testes Automatizados

### Setup do Ambiente de Testes

```typescript
// tests/setup.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_TEST
    }
  }
});

beforeAll(async () => {
  // Limpa banco de teste
  await prisma.$executeRawUnsafe('TRUNCATE TABLE users CASCADE');
});

afterEach(async () => {
  // Limpa dados após cada teste
  await prisma.walletTransaction.deleteMany();
  await prisma.depositAddress.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});
```

### Scripts de Teste

```json
// package.json
{
  "scripts": {
    "test": "NODE_ENV=test vitest",
    "test:unit": "NODE_ENV=test vitest run tests/unit",
    "test:integration": "NODE_ENV=test vitest run tests/integration",
    "test:e2e": "NODE_ENV=test playwright test",
    "test:coverage": "NODE_ENV=test vitest --coverage",
    "test:watch": "NODE_ENV=test vitest --watch"
  }
}
```

### Estrutura de Testes

```
tests/
├─ unit/                    # Testes unitários
│  ├─ services/
│  │  ├─ price.service.test.ts
│  │  └─ moralis-stream.service.test.ts
│  └─ use-cases/
│     ├─ check-account-activation.test.ts
│     └─ get-or-create-deposit-address.test.ts
│
├─ integration/             # Testes de integração
│  ├─ auth-flow.test.ts
│  ├─ deposit-flow.test.ts
│  └─ webhook-flow.test.ts
│
├─ e2e/                     # Testes end-to-end
│  └─ complete-user-journey.spec.ts
│
├─ mocks/                   # Mocks de serviços externos
│  ├─ moralis.mock.ts
│  ├─ coingecko.mock.ts
│  └─ better-auth.mock.ts
│
└─ helpers/                 # Helpers de teste
   ├─ create-user.ts
   ├─ simulate-deposit.ts
   └─ setup.ts
```

---

## 🌐 Testes com Polygon Mumbai Testnet

### Setup
```bash
# 1. Obter MATIC de teste
https://faucet.polygon.technology/

# 2. Obter USDC de teste (Mumbai)
https://mumbaifaucet.com/

# 3. Configurar .env.test
POLYGON_RPC_URL="https://rpc-mumbai.maticvigil.com"
POLYGON_CHAIN_ID="80001"
MORALIS_API_KEY="sua_api_key"
```

### Teste Real na Testnet

```typescript
describe('Real Testnet Integration', () => {
  // Só roda se ENV = testnet
  const TESTNET_ONLY = process.env.RUN_TESTNET_TESTS === 'true';

  it.skipIf(!TESTNET_ONLY)('should detect real testnet deposit', async () => {
    const user = await createUser();
    const depositAddress = await getDepositAddress(user.id);

    console.log(`
      🧪 TESTE MANUAL NECESSÁRIO:

      1. Acesse: https://mumbai.polygonscan.com
      2. Conecte MetaMask na Mumbai Testnet
      3. Envie 1 USDC para: ${depositAddress.polygonAddress}
      4. Aguarde 12 confirmações (~30 segundos)
      5. Sistema deve detectar automaticamente
    `);

    // Aguarda 2 minutos
    await waitForWebhook(depositAddress.polygonAddress, 120000);

    // Verifica se transação foi registrada
    const transaction = await prisma.walletTransaction.findFirst({
      where: {
        userId: user.id,
        tokenSymbol: 'USDC'
      }
    });

    expect(transaction).toBeDefined();
    expect(transaction.status).toBe('PENDING');
  });
});
```

---

## ✅ Checklist Final Antes de Produção

### Testes Funcionais
- [ ] Criar conta funciona
- [ ] Login funciona
- [ ] Logout funciona
- [ ] Endereço de depósito é gerado
- [ ] Endereço é FIXO (não muda)
- [ ] Webhook detecta USDC
- [ ] Webhook detecta USDT
- [ ] Webhook detecta MATIC
- [ ] Webhook detecta tokens desconhecidos
- [ ] Assinatura de webhook é validada
- [ ] Assinatura inválida é rejeitada
- [ ] Preço de stablecoins = $1
- [ ] Preço de MATIC é buscado da API
- [ ] Cache de preços funciona
- [ ] Conta ativa com $100 USD
- [ ] Conta não ativa com < $100 USD
- [ ] Múltiplos tokens somam para ativar
- [ ] Saldo é calculado corretamente
- [ ] Histórico de transações funciona
- [ ] Notificação de ativação aparece

### Testes de Segurança
- [ ] Private keys são criptografadas
- [ ] Private keys NÃO aparecem nas APIs
- [ ] Webhook sem assinatura é rejeitado
- [ ] Webhook com assinatura errada é rejeitado
- [ ] Usuário não vê dados de outro usuário
- [ ] Session expira após tempo correto
- [ ] CORS está configurado
- [ ] SQL injection prevenido (Prisma)
- [ ] XSS prevenido

### Testes de Performance
- [ ] API responde em < 500ms (p95)
- [ ] Webhook processa em < 5s
- [ ] 100 usuários simultâneos sem erro
- [ ] Banco aguenta carga

### Testes de Confiabilidade
- [ ] Sistema recupera de erro de rede
- [ ] Sistema recupera de queda do Moralis
- [ ] Sistema recupera de queda do CoinGecko
- [ ] Transação duplicada é ignorada
- [ ] txHash duplicado gera erro

---

## 🚀 Executando Todos os Testes

```bash
# 1. Preparar ambiente
cp .env.example .env.test
npx prisma migrate deploy

# 2. Rodar testes unitários
npm run test:unit

# 3. Rodar testes de integração
npm run test:integration

# 4. Rodar testes E2E
npm run test:e2e

# 5. Ver cobertura
npm run test:coverage

# 6. Se tudo passou, pode fazer deploy!
npm run deploy
```

---

## 📊 Cobertura Mínima Requerida

| Módulo | Cobertura Mínima |
|--------|------------------|
| Auth | 90% |
| Deposit | 95% |
| Webhook | 95% |
| Price Service | 90% |
| User | 90% |
| **TOTAL** | **≥ 90%** |

---

**Última atualização:** 21/10/2025
**Próxima revisão:** Antes do deploy em produção
