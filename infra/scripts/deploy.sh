#!/bin/bash
set -e

echo "🚀 MVPPIR Deployment"
echo "===================="
echo ""

# Check environment argument
if [ "$1" == "railway" ]; then
    ENV="railway"
elif [ "$1" == "prod" ]; then
    ENV="production"
else
    echo "Usage: ./deploy.sh [railway|prod]"
    exit 1
fi

echo "Environment: $ENV"
echo ""

# Railway Deployment
if [ "$ENV" == "railway" ]; then
    echo "🚂 Deploying to Railway..."
    echo ""

    # Check if Railway CLI is installed
    if ! command -v railway &> /dev/null; then
        echo "❌ Railway CLI not found"
        echo "Install: npm i -g @railway/cli"
        exit 1
    fi

    # Check if logged in
    if ! railway whoami &> /dev/null; then
        echo "❌ Not logged in to Railway"
        echo "Run: railway login"
        exit 1
    fi

    echo "📋 Current Railway configuration:"
    railway status
    echo ""

    echo "🔧 Setting environment variables..."
    cd ../pulumi

    # Read secrets from Pulumi config (if set)
    if [ -f "Pulumi.railway.yaml" ]; then
        echo "✅ Found Pulumi railway config"
        echo "⚠️  Make sure you've set secrets with: pulumi config set --secret <key> <value>"
    fi

    echo ""
    echo "🚀 Deploying to Railway..."
    cd ../../apps/server
    railway up

    echo ""
    echo "✅ Railway deployment complete!"
    echo "Check status: railway status"
    echo "View logs: railway logs"
fi

# Njalla VPS Deployment
if [ "$ENV" == "production" ]; then
    echo "🖥️  Deploying to Njalla VPS..."
    echo ""

    cd ../docker

    # Check if .env exists
    if [ ! -f ".env" ]; then
        echo "❌ .env file not found"
        echo "Run: ./setup.sh prod"
        exit 1
    fi

    # Validate required secrets
    source .env
    REQUIRED_VARS=(
        "POSTGRES_PASSWORD"
        "AUTH_SECRET"
        "ENCRYPTION_KEY"
        "MORALIS_API_KEY"
        "MORALIS_STREAM_SECRET"
        "POLYGON_RPC_URL"
        "GLOBAL_WALLET_ADDRESS"
        "GLOBAL_WALLET_PRIVATE_KEY"
    )

    for var in "${REQUIRED_VARS[@]}"; do
        if [ -z "${!var}" ]; then
            echo "❌ Missing required variable: $var"
            echo "Edit infra/docker/.env and set $var"
            exit 1
        fi
    done

    echo "✅ Environment variables validated"
    echo ""

    echo "🐳 Building Docker images..."
    docker-compose build --no-cache

    echo ""
    echo "🚀 Starting services..."
    docker-compose up -d

    echo ""
    echo "⏳ Waiting for services to be healthy..."
    sleep 10

    echo ""
    echo "📊 Service status:"
    docker-compose ps

    echo ""
    echo "🔍 Health check:"
    curl -f http://localhost:4000/health || echo "⚠️  Health check failed"

    echo ""
    echo "✅ Deployment complete!"
    echo ""
    echo "Useful commands:"
    echo "  View logs:    docker-compose logs -f"
    echo "  Stop:         docker-compose down"
    echo "  Restart:      docker-compose restart backend"
    echo "  Shell:        docker-compose exec backend sh"
fi
