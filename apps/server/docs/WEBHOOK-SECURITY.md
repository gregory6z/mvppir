# Webhook Security Architecture

## Overview

O endpoint `/webhooks/moralis` implementa segurança em múltiplas camadas para proteger contra ataques enquanto permite testes legítimos do Moralis.

## Arquitetura de Segurança (3 Camadas)

### Camada 1: Middleware de Segurança

**Arquivo:** `src/middlewares/webhook-security.middleware.ts`

**Proteções:**
1. **User-Agent Validation** - Bloqueia requests de origens suspeitas
2. **Rate Limiting** - Máximo de 100 requests/minuto por IP
3. **IP Monitoring** - Logs de todas origens

**Comportamento:**
- ✅ **COM signature**: Passa direto (webhook real do Moralis)
- ⚠️ **SEM signature + User-Agent suspeito**: `403 Forbidden`
- ⚠️ **Rate limit excedido**: `429 Too Many Requests`
- ✅ **SEM signature + User-Agent válido**: Continua (teste do Moralis)

### Camada 2: Validação de Signature

**Arquivo:** `src/lib/webhook-signature.ts`

**Algoritmo:** HMAC Keccak256 (não SHA256!)

```typescript
expectedSignature = keccak256(rawBody + MORALIS_STREAM_SECRET)
```

**Comportamento:**
- ✅ **Signature válida**: Processa webhook normalmente
- ❌ **Signature inválida**: `401 Unauthorized` + logs de segurança
- ⚠️ **SEM signature**: `200 OK` mas **NÃO processa dados**

### Camada 3: Controller (Lógica de Negócio)

**Arquivo:** `src/modules/webhook/controllers/moralis-webhook-controller.ts`

**Regras Críticas:**

```typescript
if (!signature) {
  // ⚠️ NUNCA processa dados sem signature
  // ⚠️ NUNCA cria transações
  // ⚠️ NUNCA credita saldos
  // ⚠️ NUNCA modifica banco de dados
  return 200 OK (apenas para teste do Moralis)
}
```

## Fluxo de Segurança

### Webhook Real (Produção)

```
1. Request chega → Middleware verifica rate limit → ✅ OK
2. Tem signature? → ✅ Sim
3. Valida signature → ✅ Válida
4. Processa webhook → ✅ Cria transação no banco
```

### Webhook de Teste (Moralis Stream Creation)

```
1. Request chega → Middleware verifica User-Agent → ✅ Moralis
2. Tem signature? → ❌ Não
3. Retorna 200 OK → ⚠️ NÃO processa dados
4. Moralis recebe 200 → ✅ Validação OK
```

### Ataque Malicioso

```
1. Request chega → Middleware verifica User-Agent → ❌ Suspeito
2. Bloqueia → 403 Forbidden
```

OU

```
1. Request chega → User-Agent válido (spoofed)
2. Tem signature? → ❌ Não
3. Retorna 200 OK → ⚠️ NÃO processa dados
4. Atacante recebe 200 mas nada acontece → ✅ Sistema seguro
```

## Vetores de Ataque Bloqueados

### ❌ 1. Injection de Transações Falsas
**Ataque:** Enviar POST com dados de depósito falso
**Proteção:** Sem signature válida = dados ignorados
**Resultado:** 200 OK, mas nada é criado no banco

### ❌ 2. DDoS
**Ataque:** Milhões de requests para derrubar servidor
**Proteção:** Rate limiting (100 req/min por IP)
**Resultado:** 429 Too Many Requests após limite

### ❌ 3. Fingerprinting
**Ataque:** Descobrir tecnologias usadas
**Proteção:** Mensagens genéricas, sem stack traces
**Resultado:** Atacante não consegue informações úteis

### ❌ 4. Replay Attack
**Ataque:** Reenviar webhook legítimo múltiplas vezes
**Proteção:** `txHash` único no banco (constraint UNIQUE)
**Resultado:** Primeira vez processa, demais ignoradas

## Configuração de Produção

### Variáveis de Ambiente Obrigatórias

```bash
# CRÍTICO: Secret usado para validar signatures
MORALIS_STREAM_SECRET="senha-forte-minimo-32-caracteres"

# ID do Stream configurado no Moralis
POLYGON_USDC_STREAM_ID="stream-id-do-moralis"
```

### Modo de Teste (Desenvolvimento)

```bash
# Desabilita validação de User-Agent (útil para testes locais)
WEBHOOK_TEST_MODE="true"
```

**⚠️ NUNCA use `WEBHOOK_TEST_MODE=true` em produção!**

## Monitoramento

### Logs de Segurança

Todos eventos são logados:

```typescript
// Webhook sem signature aceito (teste)
"⚠️ Webhook sem signature detectado - retornando 200 mas SEM processar dados"

// Webhook com signature inválida (ataque?)
"Invalid Moralis webhook signature"

// Rate limit excedido
"Rate limit excedido para webhook"

// User-Agent suspeito bloqueado
"Webhook sem signature de origem suspeita bloqueado"
```

### Métricas Recomendadas

1. **Webhooks sem signature por hora** - Deve ser ~0 em produção
2. **Rate limits atingidos** - Indica possível ataque
3. **Signatures inválidas** - Configuração errada ou ataque

## Teste de Segurança

### Teste 1: Webhook Sem Signature

```bash
curl -X POST https://api.mvppir.com/webhooks/moralis \
  -H "Content-Type: application/json" \
  -d '{"fake":"data"}'

# Esperado: 200 OK (mas dados NÃO processados)
```

### Teste 2: Webhook Com Signature Inválida

```bash
curl -X POST https://api.mvppir.com/webhooks/moralis \
  -H "Content-Type: application/json" \
  -H "x-signature: 0xfakesignature" \
  -d '{"fake":"data"}'

# Esperado: 401 Unauthorized
```

### Teste 3: Rate Limiting

```bash
# Enviar 101 requests em 1 minuto
for i in {1..101}; do
  curl -X POST https://api.mvppir.com/webhooks/moralis \
    -H "Content-Type: application/json" \
    -d '{}'
done

# Esperado: Primeiras 100 = 200 OK, depois = 429 Too Many Requests
```

## Checklist de Segurança

Antes de ir para produção, verificar:

- [ ] `MORALIS_STREAM_SECRET` configurado (mínimo 32 chars)
- [ ] `WEBHOOK_TEST_MODE` desabilitado (`false` ou removido)
- [ ] Rate limiting ativado (padrão: 100 req/min)
- [ ] Logs de segurança sendo monitorados
- [ ] Constraint UNIQUE em `txHash` no banco
- [ ] SSL/HTTPS ativado (Railway faz isso automaticamente)

## Referências

- [Moralis Webhook Security](https://docs.moralis.io/streams-api/webhooks#webhook-security)
- [Keccak256 vs SHA256](https://ethereum.stackexchange.com/questions/550/which-cryptographic-hash-function-does-ethereum-use)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
