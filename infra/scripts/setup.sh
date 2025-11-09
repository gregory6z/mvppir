#!/bin/bash
set -e

echo "🚀 MVPPIR Infrastructure Setup"
echo "================================"
echo ""

# Check if we're in the right directory
if [ ! -f "../../apps/server/package.json" ]; then
    echo "❌ Error: Run this script from infra/scripts/"
    exit 1
fi

# Detect environment
if [ "$1" == "railway" ]; then
    ENV="railway"
    STACK="railway"
elif [ "$1" == "prod" ]; then
    ENV="production"
    STACK="prod"
else
    echo "Usage: ./setup.sh [railway|prod]"
    echo ""
    echo "  railway - Setup Railway deployment (testing/staging)"
    echo "  prod    - Setup Njalla VPS deployment (production)"
    exit 1
fi

echo "Environment: $ENV"
echo "Stack: $STACK"
echo ""

# Railway Setup
if [ "$ENV" == "railway" ]; then
    echo "📦 Railway Setup"
    echo "----------------"
    echo ""
    echo "Railway doesn't have official Pulumi provider yet."
    echo "This setup provides configuration and validation tools."
    echo ""
    echo "Manual steps required:"
    echo "1. Install Railway CLI: npm i -g @railway/cli"
    echo "2. Login: railway login"
    echo "3. Link project: railway link"
    echo "4. Add PostgreSQL: railway add --database postgres"
    echo "5. Add Redis: railway add --database redis"
    echo ""
    echo "Then run: ./deploy.sh railway"
fi

# Njalla VPS Setup
if [ "$ENV" == "production" ]; then
    echo "🖥️  Njalla VPS Setup"
    echo "-------------------"
    echo ""

    # Check if Docker Compose exists
    cd ../docker

    if [ ! -f ".env" ]; then
        echo "⚠️  Creating .env file from template..."
        cp .env.example .env
        echo "✅ .env created"
        echo ""
        echo "🔐 IMPORTANT: Edit infra/docker/.env and fill in your secrets!"
        echo ""
    else
        echo "✅ .env already exists"
    fi

    echo "Next steps:"
    echo "1. Edit infra/docker/.env with your secrets"
    echo "2. Run: ./deploy.sh prod"
fi

echo ""
echo "✅ Setup complete!"
