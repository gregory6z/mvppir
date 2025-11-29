#!/bin/bash
set -e

echo "🧹 Limpeza para Produção"
echo "========================"
echo ""

# Verificar se está na pasta correta
if [ ! -f "package.json" ] || [ ! -d "apps" ]; then
    echo "❌ Execute este script na raiz do projeto mvppir"
    exit 1
fi

# Criar pasta de produção
PROD_DIR="../mvppir-prod"
echo "📁 Criando cópia em $PROD_DIR..."
rm -rf "$PROD_DIR"
cp -r . "$PROD_DIR"
cd "$PROD_DIR"

echo ""
echo "🗑️  Removendo histórico Git..."
rm -rf .git .gitignore .gitattributes

echo ""
echo "🗑️  Removendo projetos deprecated..."
rm -rf apps/web-nextjs-deprecated
rm -rf apps/mobile-expo-deprecated

echo ""
echo "🗑️  Removendo node_modules e cache..."
rm -rf node_modules .turbo
rm -rf apps/*/node_modules
rm -rf apps/*/.turbo
rm -rf apps/*/dist
rm -rf apps/*/.next

echo ""
echo "🗑️  Removendo arquivos de desenvolvimento..."
rm -rf .claude .cursor .vscode .idea
rm -rf docs
rm -rf CLAUDE.md apps/*/CLAUDE.md
rm -rf CHECKLIST-PROD.md
rm -rf infra/pulumi
rm -rf *.md

echo ""
echo "🗑️  Removendo arquivos .env (secrets)..."
rm -rf apps/*/.env
rm -rf apps/*/.env.*
rm -rf infra/docker/.env

echo ""
echo "🔍 Verificando secrets hardcoded..."
SECRETS_FOUND=$(grep -r "e001153a\|password.*=.*['\"]" . --include="*.ts" --include="*.tsx" --include="*.js" 2>/dev/null | grep -v node_modules || true)
if [ -n "$SECRETS_FOUND" ]; then
    echo "⚠️  Possíveis secrets encontrados:"
    echo "$SECRETS_FOUND"
    echo ""
    read -p "Continuar mesmo assim? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Abortado"
        exit 1
    fi
else
    echo "✅ Nenhum secret hardcoded encontrado"
fi

echo ""
echo "📦 Compactando..."
cd ..
tar -czvf mvppir-prod.tar.gz mvppir-prod

echo ""
echo "✅ Pacote criado: ../mvppir-prod.tar.gz"
echo ""
echo "📤 Para enviar para VPS:"
echo "   scp ../mvppir-prod.tar.gz user@vps:/opt/"
echo ""
echo "🖥️  Na VPS:"
echo "   cd /opt"
echo "   tar -xzvf mvppir-prod.tar.gz"
echo "   mv mvppir-prod mvppir"
echo "   cd mvppir/infra/docker"
echo "   nano .env  # Configurar secrets"
echo "   cd ../scripts && ./deploy.sh prod"
