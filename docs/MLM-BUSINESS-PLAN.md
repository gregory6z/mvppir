# 💎 MVP PIR - Sistema MLM Business Plan (v1.0 - MVP Inicial)

**Documento:** Plano de Negócio MLM - Versão Simplificada
**Versão:** 1.0 (MVP Inicial)
**Data:** 2025-10-23
**Tipo:** Business-Only (Sem Código)
**Status:** Versão para Implementação Inicial

> **Nota:** Esta é a versão simplificada para implementação inicial. A versão completa detalhada está em `MLM-BUSINESS-PLAN-v3.0-FULL.md`.

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Sistema de Ranks (4 Ranks Iniciais)](#sistema-de-ranks)
3. [Comissões Multi-Nível](#comissões-multi-nível)
4. [Regras de Conquista](#regras-de-conquista)
5. [Regras de Manutenção](#regras-de-manutenção)
6. [Sistema de Downrank](#sistema-de-downrank)
7. [Taxas de Saque](#taxas-de-saque)
8. [Exemplos Práticos](#exemplos-práticos)

---

## 🎯 Visão Geral

### O Que É?

**MVP PIR MLM** é um sistema de marketing multinível onde você ganha **comissões diárias** sobre o saldo mantido pela sua rede de indicados.

### Como Funciona (Resumo)

```
1. Você se cadastra + deposita $100 → Vira RECRUTA
2. Convida 5 pessoas (diretos N1) → Eles depositam
3. Você vira BRONZE → Ganha 1.05%/dia de comissão
4. Seus diretos convidam outras pessoas (netos N2)
5. Você ganha de N1 + N2 → Renda passiva!
```

### Diferenciais

✅ Comissões **DIÁRIAS** (não mensal!)
✅ Multi-Nível (N1, N2, N3)
✅ Sustentável (baseado em DeFi yield 15-20% APY)
✅ Transparente (todas as regras públicas)

---

## 🏆 Sistema de Ranks

### 4 Ranks Iniciais (MVP v1.0)

```
┌────┬──────────┬─────────────┬──────────┬───────────┬─────────────┐
│ #  │ Rank     │ Bloqueado   │ % N1     │ Diretos   │ Volume Vida │
├────┼──────────┼─────────────┼──────────┼───────────┼─────────────┤
│ 1  │ 🎖️ RECRUTA│ $100       │ 0.00%    │ 0         │ -           │
│ 2  │ 🥉 BRONZE│ $500        │ 1.05%    │ 5         │ $2,500      │
│ 3  │ 🥈 PRATA │ $2,000      │ 1.80%    │ 15        │ $30,000     │
│ 4  │ 🥇 OURO  │ $5,000      │ 2.60%    │ 30        │ $150,000    │
└────┴──────────┴─────────────┴──────────┴───────────┴─────────────┘
```

**Explicação das Colunas:**

- **Bloqueado:** Valor mínimo que você precisa manter na conta (se sacar abaixo = perde rank)
- **% N1:** Comissão diária sobre saldo dos seus diretos
- **Diretos:** Quantas pessoas você precisa convidar diretamente (lifetime)
- **Volume Vida:** Soma de TODOS os depósitos da sua rede (desde o início, nunca diminui)

---

## 💰 Comissões Multi-Nível

### Percentuais por Nível

```
┌────┬──────────┬──────┬──────┬──────┐
│ #  │ Rank     │ N1   │ N2   │ N3   │
├────┼──────────┼──────┼──────┼──────┤
│ 1  │ 🎖️ RECRUTA│ 0.00%│ -    │ -    │
│ 2  │ 🥉 BRONZE│ 1.05%│ 0.15%│ -    │
│ 3  │ 🥈 PRATA │ 1.80%│ 0.25%│ 0.10%│
│ 4  │ 🥇 OURO  │ 2.60%│ 0.40%│ 0.15%│
└────┴──────────┴──────┴──────┴──────┘
```

**O Que Significa?**

- **N1 (Diretos):** Pessoas que VOCÊ convidou
- **N2 (Netos):** Pessoas que seus DIRETOS convidaram
- **N3 (Bisnetos):** Pessoas que seus NETOS convidaram

### Exemplo de Cálculo (Bronze)

```
Ana é Bronze:
├─ 5 diretos (N1) com $500 cada = $2,500
├─ 10 netos (N2) com $200 cada = $2,000

Comissões:
├─ N1: $2,500 × 1.05% = $26.25/dia
├─ N2: $2,000 × 0.15% = $3.00/dia
└─ TOTAL: $29.25/dia = $877/mês = $10,524/ano
```

---

## 📖 Regras de Conquista

### Como Subir de Rank (Lifetime)

```
┌────┬──────────┬──────────────────────────────────────┐
│ #  │ Rank     │ Requisitos (Uma Vez na Vida)         │
├────┼──────────┼──────────────────────────────────────┤
│ 1  │ 🎖️ RECRUTA│ Cadastro + $100 depósito            │
│ 2  │ 🥉 BRONZE│ 5 diretos + $2,500 volume + $500 blq│
│ 3  │ 🥈 PRATA │ 15 diretos + $30K volume + $2K blq  │
│ 4  │ 🥇 OURO  │ 30 diretos + $150K volume + $5K blq │
└────┴──────────┴──────────────────────────────────────┘
```

**Importante:**
- **Diretos:** Total de pessoas convidadas (nunca diminui)
- **Volume Vida:** Soma de TODOS os depósitos da rede (nunca diminui)
- **Saldo Bloqueado:** Valor que você precisa depositar e manter

---

## 🔄 Regras de Manutenção

### Como Manter Rank (Todo Mês)

```
┌────┬──────────┬────────────────────────────────────┐
│ #  │ Rank     │ Requisitos Mensais                 │
├────┼──────────┼────────────────────────────────────┤
│ 1  │ 🎖️ RECRUTA│ Saldo ≥ $100                      │
│ 2  │ 🥉 BRONZE│ 3 ativos + $500/mês + $500 blq    │
│ 3  │ 🥈 PRATA │ 8 ativos + $6K/mês + $2K blq      │
│ 4  │ 🥇 OURO  │ 15 ativos + $30K/mês + $5K blq    │
└────┴──────────┴────────────────────────────────────┘
```

**Direto Ativo:**
- Fez login nos últimos 30 dias
- Tem saldo ≥ $100
- Status: ACTIVE (não bloqueado)

**Volume Mensal:**
- Soma de depósitos da rede inteira no mês
- **Reseta dia 1 de cada mês!**
- Fórmula: 20% do volume de conquista

---

## ⚠️ Sistema de Downrank

### Fluxo de 3 Meses

```
MÊS 1: AVISO
├─ Não cumpriu requisitos mensais
├─ Recebe email de aviso
├─ Grace period: 7 dias para corrigir
└─ Se corrigir → OK, se não → MÊS 2

MÊS 2: DOWNRANK TEMPORÁRIO -1
├─ Perde 1 rank temporariamente
├─ Exemplo: Prata → Bronze
├─ Pode recuperar se atingir requisitos
└─ Se não recuperar → MÊS 3

MÊS 3: DOWNRANK PERMANENTE -2
├─ Perde 2 ranks do original
├─ Exemplo: Prata → Recruta
├─ Deve reconquistar normalmente
└─ Ciclo reseta
```

### Exemplo Prático

```
Ana é Prata mas não mantém requisitos:

Janeiro: 5 ativos + $3K (falta 3 ativos + $3K) → AVISO
Fevereiro: Bronze temporário (-1 rank) → Chance recuperar
Março: Recruta permanente (-2 ranks) → Perdeu tudo!

Ana deve reconquistar Bronze → Prata do zero.
```

---

## 💸 Taxas de Saque

### Taxa Base por Rank

```
┌────┬──────────┬────────────┬──────────────────┐
│ #  │ Rank     │ Taxa Base  │ Exemplo ($1,000) │
├────┼──────────┼────────────┼──────────────────┤
│ 1  │ 🎖️ RECRUTA│ 15%       │ $150             │
│ 2  │ 🥉 BRONZE│ 12%        │ $120             │
│ 3  │ 🥈 PRATA │ 10%        │ $100             │
│ 4  │ 🥇 OURO  │ 8%         │ $80              │
└────┴──────────┴────────────┴──────────────────┘
```

### Taxa Progressiva (Frequência)

```
Primeiro saque no mês: +0%
Segundo saque: +3%
Terceiro saque: +6%
Quarto+ saque: +10%
```

### Bônus de Lealdade

```
< 30 dias: 0% (Normal)
30-90 dias: -2% (Fiel)
90-180 dias: -4% (Leal)
180+ dias: -6% (Veterano)
```

### Limites de Saque

```
┌────┬──────────┬────────────┬────────────┬──────────┐
│ #  │ Rank     │ Diário     │ Mensal     │ Cooldown │
├────┼──────────┼────────────┼────────────┼──────────┤
│ 1  │ 🎖️ RECRUTA│ $500      │ $5,000     │ 7 dias   │
│ 2  │ 🥉 BRONZE│ $1,000     │ $10,000    │ 5 dias   │
│ 3  │ 🥈 PRATA │ $2,500     │ $25,000    │ 3 dias   │
│ 4  │ 🥇 OURO  │ $5,000     │ $50,000    │ 2 dias   │
└────┴──────────┴────────────┴────────────┴──────────┘
```

### Exemplo de Cálculo

```
Situação:
- Rank: Bronze
- Saque: $500
- Segundo saque do mês
- 60 dias sem sacar (Fiel)

Cálculo:
├─ Taxa base Bronze: 12% = $60
├─ Taxa progressiva (2º): +3% = +$15
├─ Desconto loyalty (Fiel): -2% = -$10
└─ Taxa final: 13% = $65

Recebe: $500 - $65 = $435
```

---

## 📚 Exemplos Práticos

### Exemplo 1: Carlos - RECRUTA → BRONZE (1 mês)

**Semana 1:**
```
Carlos se cadastra + deposita $100
Rank: Recruta (não ganha nada ainda)
```

**Semanas 2-4:**
```
Convida 5 amigos (diretos):
├─ João: $600
├─ Maria: $500
├─ Pedro: $400
├─ Lucas: $300
└─ Sofia: $200
Total: $2,000 (atingiu $2,500 volume vida)

Deposita mais $400 ($500 total bloqueado)
→ VIRA BRONZE! 🥉
```

**Comissões como Bronze:**
```
N1: $2,000 × 1.05% = $21/dia
N2: $0 (ainda não tem netos)
TOTAL: $21/dia = $630/mês
```

---

### Exemplo 2: Ana - BRONZE → PRATA (6 meses)

**Mês 1-3: Bronze**
```
5 diretos, ganhando $25/dia
Ajuda diretos a recrutarem
Rede cresce: 5 N1 + 15 N2
```

**Mês 4-6: Expansão**
```
Convida mais 10 pessoas (total 15 diretos)
Rede profunda: 15 N1 + 45 N2 + 80 N3
Volume vida: $30,000 atingido!
Deposita $1,500 (total $2,000 bloqueado)
→ VIRA PRATA! 🥈
```

**Comissões como Prata:**
```
N1 (15 diretos): $8,000 × 1.80% = $144/dia
N2 (45 netos): $12,000 × 0.25% = $30/dia
N3 (80 bisnetos): $8,000 × 0.10% = $8/dia
TOTAL: $182/dia = $5,460/mês
```

**Comparação:**
```
Bronze: $630/mês
Prata: $5,460/mês (+766%!)
```

---

### Exemplo 3: Impacto de Depósitos

**Ana - Bronze (5 diretos)**

ANTES:
```
5 diretos com $400 médio = $2,000
Comissão: $2,000 × 1.05% = $21/dia
```

DEPOIS (cada direto adiciona +$500):
```
5 diretos com $900 médio = $4,500
Comissão: $4,500 × 1.05% = $47.25/dia

Aumento: +$26.25/dia = +$787/mês! 💰
```

**Conclusão:** Motivar seus diretos a depositarem = WIN-WIN!

---

## 💡 Sustentabilidade Financeira

### Modelo DeFi Yield

```
Fundos Depositados
↓
Investidos em DeFi (Aave, Compound) → 15-20% APY
↓
Distribuição:
├─ 70% → Comissões MLM
├─ 20% → Reserva de segurança
└─ 10% → Lucro plataforma
```

### Proteções

1. **Limite de Saques:** Máximo 5% do TVL por dia
2. **Reserve Ratio:** Mínimo 20% em stablecoins líquidas
3. **Circuit Breakers:** Pausar se TVL cair 30% em 7 dias

---

## ❓ Perguntas Frequentes

**1. Como funciona a comissão diária?**
```
Direto tem $1,000 na conta
Você é Bronze (1.05%/dia)
Você ganha: $10.50 TODO DIA
```

**2. O que é saldo bloqueado?**
```
Bronze precisa $500 bloqueados
Se sacar abaixo disso = perde rank!
```

**3. Preciso recrutar todo mês?**
```
NÃO! Recrutamento é lifetime (uma vez).
Manutenção = manter 50% dos diretos ativos.
```

**4. Posso sacar quando quiser?**
```
SIM, mas com taxas (8-15%) + limites + cooldown
Se sacar abaixo do bloqueado = perde rank
```

**5. É sustentável?**
```
SIM! Baseado em DeFi yield real (15-20% APY)
70% dos rendimentos vão para comissões
```

---

## 🎯 Estratégias de Sucesso

### 1. Foco no N1 (Diretos)
```
✅ Recrute pessoas engajadas (qualidade > quantidade)
✅ Ajude diretos a depositarem mais
✅ Ensine eles a recrutarem
```

### 2. Mantenha Requisitos Mensais
```
✅ Monitore diretos ativos (precisa 50%)
✅ Incentive depósitos todo mês
✅ Responda avisos imediatamente (7 dias!)
```

### 3. Não Saque Muito Cedo
```
✅ Deixe comissões acumularem 2-3 meses
✅ Reinvista parte para subir de rank
✅ Aproveite desconto loyalty (60+ dias)
```

### 4. Construa Rede Profunda
```
✅ Ensine seus diretos a recrutarem
✅ N2 e N3 = renda passiva
✅ Quanto mais profunda, mais sustentável
```

---

## 🚀 Roadmap MLM

### ✅ v1.0 - MVP Inicial (Esta Versão)
- 4 ranks (Recruta, Bronze, Prata, Ouro)
- Comissões multi-nível (N1, N2, N3)
- Downrank sistema (3 meses)
- Taxas de saque

### 🔄 v2.0 - Expansão (Futuro)
- +4 ranks (Platina, Diamante, Diamante Negro, Imperial)
- Gamificação (streaks, badges, leaderboards)
- Matching bonus (Ouro+)
- Pool global (Platina+)

### 🔮 v3.0+ - Avançado (Futuro Distante)
- Multi-blockchain support
- Token swap interno
- DAO governance

---

## 📌 Resumo Rápido

**Para Começar:**
1. Cadastro + $100 → Recruta
2. Convide 5 pessoas → Bronze
3. Ganha 1.05%/dia dos diretos
4. Ajude diretos a recrutarem
5. Suba para Prata ($5,460/mês!)

**Regras de Ouro:**
- ✅ Mantenha requisitos mensais (evite downrank)
- ✅ Foco no N1 (diretos pagam MUITO mais)
- ✅ Não saque muito cedo (deixe acumular)
- ✅ Ensine seus diretos (eles crescem = você cresce)

---

**Versão:** 1.0 (MVP Inicial)
**Última atualização:** 2025-10-23
**Status:** Pronto para Implementação
**Versão Completa:** Ver `MLM-BUSINESS-PLAN-v3.0-FULL.md`
