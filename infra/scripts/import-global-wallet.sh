#!/bin/bash
set -e

echo "🔐 Import Global Wallet"
echo "======================"
echo ""

# Check if we're in the right directory
if [ ! -f "../../apps/server/package.json" ]; then
    echo "❌ Error: Run this script from infra/scripts/"
    exit 1
fi

echo "Este script irá:"
echo "1. Validar sua private key existente"
echo "2. Criptografar usando AES-256-GCM"
echo "3. Salvar no banco de dados (tabela global_wallets)"
echo ""

# Check if ENCRYPTION_KEY is set
if [ -z "$ENCRYPTION_KEY" ]; then
    echo "⚠️  ENCRYPTION_KEY não encontrada nas variáveis de ambiente"
    echo ""
    echo "Certifique-se de que ENCRYPTION_KEY está configurada no .env"
    echo ""
    echo "Se não tiver, gere uma:"
    NEW_KEY=$(openssl rand -hex 32)
    echo "   ENCRYPTION_KEY=$NEW_KEY"
    echo ""
    echo "Adicione ao .env e rode este script novamente."
    exit 1
fi

echo "✅ ENCRYPTION_KEY encontrada"
echo ""

# Check if database is accessible
echo "Verificando conexão com banco de dados..."
cd ../../apps/server

if ! npx prisma db execute --stdin <<< "SELECT 1" &>/dev/null; then
    echo "❌ Não foi possível conectar ao banco de dados"
    echo ""
    echo "Verifique se:"
    echo "1. O banco PostgreSQL está rodando"
    echo "2. DATABASE_URL está configurada corretamente no .env"
    echo "3. As migrations foram executadas: npx prisma migrate deploy"
    exit 1
fi

echo "✅ Banco de dados acessível"
echo ""

# Prompt for private key (won't be visible in shell history)
echo "Digite sua private key (não será exibida):"
read -s PRIVATE_KEY
echo ""

if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ Private key não pode estar vazia"
    exit 1
fi

# Run the import script
echo "🚀 Importando Global Wallet..."
echo ""

PRIVATE_KEY="$PRIVATE_KEY" npx tsx scripts/import-global-wallet.ts

echo ""
echo "✅ Script concluído!"
