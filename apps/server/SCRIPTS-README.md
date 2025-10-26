# Scripts de Seed e Limpeza - Batch Collect

Este diretório contém scripts para popular e limpar dados de teste relacionados ao Batch Collect.

## 📋 Scripts Disponíveis

### 1. `seed-batch-collect-preview.ts`

**Propósito:** Criar dados de preview para testar a funcionalidade de Batch Collect.

**O que cria:**
- 3 usuários de teste (`test.batch1@example.com`, `test.batch2@example.com`, `test.batch3@example.com`)
- Deposit addresses para cada usuário (carteiras Polygon)
- Transações CONFIRMED simuladas (USDC, USDT, MATIC, etc.)

**Como executar:**
```bash
npx tsx seed-batch-collect-preview.ts
```

**Resultado esperado:**
- Preview de Batch Collect mostrará tokens disponíveis para coletar
- Você verá transações confirmadas aguardando transferência

---

### 2. `seed-matic-balance.ts`

**Propósito:** Adicionar saldo de MATIC na Global Wallet para permitir execução do Batch Collect.

**O que cria/atualiza:**
- Saldo de 500 MATIC na Global Wallet (para gas fees)

**Como executar:**
```bash
npx tsx seed-matic-balance.ts
```

**Resultado esperado:**
- `canExecute: true` no preview (MATIC suficiente para gas)
- Botão de executar batch collect ficará habilitado

---

### 3. `seed-batch-collect-history.ts`

**Propósito:** Criar histórico de batch collects executados anteriormente.

**O que cria:**
- 1 admin de teste (`admin@mvppir.com`) se não existir
- 7 registros de batch collects com diferentes:
  - Tokens (USDC, USDT, MATIC, WETH, DAI)
  - Status (COMPLETED, PARTIAL, FAILED)
  - Datas variadas (últimos 2 dias)
  - Admin executor associado

**Como executar:**
```bash
npx tsx seed-batch-collect-history.ts
```

**Resultado esperado:**
- Histórico de coletas aparecerá na tabela com informações do admin executor
- Diferentes status mostrados com cores (verde, amarelo, vermelho)

---

### 4. `clean-all-mocks.ts` ⚠️

**Propósito:** Remover TODOS os dados de teste/mock do banco de dados.

**O que remove:**
- Todos os usuários de teste (`test.batch*`)
- Admin de teste (`admin@mvppir.com`)
- Todas as transações de teste
- Todos os deposit addresses de teste
- Todo o histórico de batch collects criado pelos scripts
- Balances dos usuários de teste

**⚠️ ATENÇÃO:** Este script é DESTRUTIVO e remove dados permanentemente!

**Como executar:**
```bash
npx tsx clean-all-mocks.ts
```

**Resultado esperado:**
- Banco de dados limpo de todos os dados de teste
- Preview de Batch Collect estará vazio
- Histórico estará vazio
- Usuários de teste removidos

---

## 🎯 Fluxo Recomendado de Testes

### Para testar Batch Collect Preview:
```bash
# 1. Popular dados de preview
npx tsx seed-batch-collect-preview.ts

# 2. Adicionar MATIC para gas fees
npx tsx seed-matic-balance.ts

# 3. Acessar /admin/batch-collect
# Você verá tokens disponíveis para coletar e pode executar
```

### Para testar Histórico:
```bash
# Popular histórico
npx tsx seed-batch-collect-history.ts

# Acessar /admin/batch-collect
# Você verá o histórico na tabela inferior
```

### Para limpar tudo:
```bash
# Remover todos os dados de teste
npx tsx clean-all-mocks.ts
```

---

## 📊 Estrutura de Dados Criados

### Usuários de Teste
```
test.batch1@example.com (Test Batch User 1)
test.batch2@example.com (Test Batch User 2)
test.batch3@example.com (Test Batch User 3)
```

### Admin de Teste
```
admin@mvppir.com (Admin Sistema)
- Role: admin
- Status: ACTIVE
```

### Tokens nos Mocks
- **USDC** (6 decimals)
- **USDT** (6 decimals)
- **MATIC** (18 decimals)
- **WETH** (opcional)
- **DAI** (opcional)

### Status de Batch Collects
- **COMPLETED** - Coleta concluída com sucesso (verde)
- **PARTIAL** - Coleta parcialmente concluída (amarelo)
- **FAILED** - Coleta falhou (vermelho)

---

## 🔧 Troubleshooting

### "Global Wallet não encontrada"
Execute primeiro:
```bash
npx tsx create-global-wallet.ts
```

### "MATIC insuficiente"
Execute:
```bash
npx tsx seed-matic-balance.ts
```

### "Nenhum token para coletar"
Execute:
```bash
npx tsx seed-batch-collect-preview.ts
```

### Resetar tudo
```bash
# Limpar mocks
npx tsx clean-all-mocks.ts

# Recriar do zero
npx tsx seed-batch-collect-preview.ts
npx tsx seed-matic-balance.ts
npx tsx seed-batch-collect-history.ts
```

---

## 📝 Notas Importantes

1. **Ambiente de Desenvolvimento:** Estes scripts são apenas para desenvolvimento/teste
2. **Não usar em Produção:** NUNCA execute em ambiente de produção
3. **Dados Simulados:** Todas as transações e endereços são simulados
4. **Private Keys:** As private keys são geradas aleatoriamente e criptografadas
5. **Timestamps:** As datas são relativas à execução do script (Date.now())

---

## 🔐 Segurança

- Os scripts usam a mesma encryption key do `.env`
- Private keys são criptografadas antes de salvar no banco
- Admin de teste não tem senha (criado manualmente no banco)
- TxHashes são gerados aleatoriamente (não são reais)

---

**Última atualização:** 2025-01-26
