#!/bin/bash

# ===================================================================
# Testes Manuais via cURL - MVP PIR
# ===================================================================
#
# Como usar:
# 1. Inicie o servidor: npm run dev
# 2. Execute este script: bash tests/manual-curl-tests.sh
# 3. Ou copie e cole os comandos individualmente
#
# ===================================================================

API_BASE_URL="http://localhost:3333"
EMAIL="test-$(date +%s)@example.com"
PASSWORD="Test123456!"
NAME="Test User"

echo "🚀 Testes Manuais do MVP PIR"
echo "=============================="
echo ""

# -------------------------------------------------------------------
# 1. CRIAR CONTA
# -------------------------------------------------------------------
echo "📝 1. Criando conta..."
SIGNUP_RESPONSE=$(curl -s -X POST "${API_BASE_URL}/api/auth/sign-up" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${EMAIL}\",
    \"password\": \"${PASSWORD}\",
    \"name\": \"${NAME}\"
  }")

echo "Response: ${SIGNUP_RESPONSE}"
echo ""

# -------------------------------------------------------------------
# 2. FAZER LOGIN
# -------------------------------------------------------------------
echo "🔐 2. Fazendo login..."
SIGNIN_RESPONSE=$(curl -s -X POST "${API_BASE_URL}/api/auth/sign-in" \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d "{
    \"email\": \"${EMAIL}\",
    \"password\": \"${PASSWORD}\"
  }")

echo "Response: ${SIGNIN_RESPONSE}"
echo ""

# -------------------------------------------------------------------
# 3. OBTER SESSÃO
# -------------------------------------------------------------------
echo "👤 3. Verificando sessão..."
SESSION_RESPONSE=$(curl -s -X GET "${API_BASE_URL}/api/auth/session" \
  -b cookies.txt)

echo "Response: ${SESSION_RESPONSE}"
echo ""

# -------------------------------------------------------------------
# 4. OBTER ENDEREÇO DE DEPÓSITO
# -------------------------------------------------------------------
echo "💳 4. Obtendo endereço de depósito..."
DEPOSIT_RESPONSE=$(curl -s -X GET "${API_BASE_URL}/deposit/address" \
  -b cookies.txt)

echo "Response: ${DEPOSIT_RESPONSE}"

# Extrai o endereço do JSON usando grep/sed
DEPOSIT_ADDRESS=$(echo "${DEPOSIT_RESPONSE}" | grep -o '"polygonAddress":"[^"]*"' | cut -d'"' -f4)
echo "Endereço de depósito: ${DEPOSIT_ADDRESS}"
echo ""

# -------------------------------------------------------------------
# 5. SIMULAR WEBHOOK MORALIS (USDC)
# -------------------------------------------------------------------
echo "💰 5. Simulando depósito de USDC via webhook..."

# Carrega MORALIS_STREAM_SECRET do .env
source .env 2>/dev/null || true

if [ -z "$MORALIS_STREAM_SECRET" ]; then
  echo "⚠️  MORALIS_STREAM_SECRET não encontrado no .env"
  echo "⚠️  Execute: export MORALIS_STREAM_SECRET='seu-secret-aqui'"
  echo ""
else
  # Payload do webhook
  WEBHOOK_PAYLOAD=$(cat <<EOF
{
  "confirmed": true,
  "chainId": "0x89",
  "txHash": "0x$(openssl rand -hex 32)",
  "to": "${DEPOSIT_ADDRESS}",
  "from": "0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199",
  "value": "5000000",
  "tokenAddress": "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
  "tokenName": "USD Coin",
  "tokenSymbol": "USDC",
  "tokenDecimals": "6",
  "block": {
    "number": "12345678",
    "timestamp": "$(date +%s)"
  }
}
EOF
)

  # Gera signature usando Node.js (requer ethers instalado)
  SIGNATURE=$(node -e "
    const { keccak256 } = require('ethers');
    const payload = ${WEBHOOK_PAYLOAD};
    const secret = '${MORALIS_STREAM_SECRET}';
    const data = JSON.stringify(payload) + secret;
    console.log(keccak256(Buffer.from(data)));
  ")

  echo "Signature: ${SIGNATURE}"

  WEBHOOK_RESPONSE=$(curl -s -X POST "${API_BASE_URL}/webhooks/moralis" \
    -H "Content-Type: application/json" \
    -H "x-signature: ${SIGNATURE}" \
    -d "${WEBHOOK_PAYLOAD}")

  echo "Response: ${WEBHOOK_RESPONSE}"
  echo ""
fi

# -------------------------------------------------------------------
# 6. OBTER TRANSAÇÕES
# -------------------------------------------------------------------
echo "📋 6. Obtendo transações..."
TRANSACTIONS_RESPONSE=$(curl -s -X GET "${API_BASE_URL}/user/transactions" \
  -b cookies.txt)

echo "Response: ${TRANSACTIONS_RESPONSE}"
echo ""

# -------------------------------------------------------------------
# 7. OBTER SALDO
# -------------------------------------------------------------------
echo "💰 7. Obtendo saldo..."
BALANCE_RESPONSE=$(curl -s -X GET "${API_BASE_URL}/user/balance" \
  -b cookies.txt)

echo "Response: ${BALANCE_RESPONSE}"
echo ""

# -------------------------------------------------------------------
# 8. OBTER CONTA
# -------------------------------------------------------------------
echo "👤 8. Obtendo informações da conta..."
ACCOUNT_RESPONSE=$(curl -s -X GET "${API_BASE_URL}/user/account" \
  -b cookies.txt)

echo "Response: ${ACCOUNT_RESPONSE}"
echo ""

# Cleanup
rm -f cookies.txt

echo "=============================="
echo "✅ Testes concluídos!"
echo "=============================="
