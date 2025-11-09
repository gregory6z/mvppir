#!/bin/bash
set -e

echo "🔐 Global Wallet Setup"
echo "======================"
echo ""

# Check if we're in the right directory
if [ ! -f "../../apps/server/package.json" ]; then
    echo "❌ Error: Run this script from infra/scripts/"
    exit 1
fi

echo "Este script irá:"
echo "1. Gerar uma nova carteira Polygon aleatória"
echo "2. Criptografar a private key com AES-256-GCM"
echo "3. Salvar no banco de dados (tabela global_wallets)"
echo ""

# Check if ENCRYPTION_KEY is set
if [ -z "$ENCRYPTION_KEY" ]; then
    echo "⚠️  ENCRYPTION_KEY não encontrada nas variáveis de ambiente"
    echo ""
    echo "Gerando uma nova ENCRYPTION_KEY..."
    NEW_KEY=$(openssl rand -hex 32)
    echo ""
    echo "✅ ENCRYPTION_KEY gerada:"
    echo "   $NEW_KEY"
    echo ""
    echo "IMPORTANTE: Adicione ao seu .env:"
    echo "   ENCRYPTION_KEY=$NEW_KEY"
    echo ""
    echo "Após adicionar ao .env, rode este script novamente."
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

# Run the create-global-wallet script
echo "🚀 Criando Global Wallet..."
echo ""

npx tsx scripts/create-global-wallet.ts

echo ""
echo "✅ Script concluído!"
