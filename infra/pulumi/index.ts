import * as pulumi from "@pulumi/pulumi";
import * as docker from "@pulumi/docker";
import * as command from "@pulumi/command";

// Load configuration
const config = new pulumi.Config();
const environment = config.require("environment");
const platform = config.require("platform");
const nodeEnv = config.require("nodeEnv");

// Common configuration
const appName = config.get("appName") || "mvpserver";
const healthcheckPath = config.get("healthcheckPath") || "/health";
const port = config.getNumber("port") || 4000;

// Docker configuration
const dockerfilePath = config.get("dockerfilePath") || "../../apps/server/Dockerfile";
const dockerContext = config.get("dockerContext") || "../../apps/server";

// Secrets configuration (required for all environments)
const authSecret = config.requireSecret("authSecret");
const encryptionKey = config.requireSecret("encryptionKey");
const moralisApiKey = config.requireSecret("moralisApiKey");
const moralisStreamSecret = config.requireSecret("moralisStreamSecret");
const polygonRpcUrl = config.requireSecret("polygonRpcUrl");
const globalWalletPrivateKey = config.requireSecret("globalWalletPrivateKey");

// Database secrets
const postgresVersion = config.get("postgresVersion") || "16";
const redisVersion = config.get("redisVersion") || "7";

// Export stack information
export const stackEnvironment = environment;
export const stackPlatform = platform;

/**
 * Railway Deployment
 *
 * Note: Railway doesn't have official Pulumi provider yet.
 * This setup provides:
 * 1. Docker image build configuration
 * 2. Environment variables template
 * 3. Deployment validation scripts
 *
 * Manual steps required:
 * - Create PostgreSQL database in Railway UI
 * - Create Redis database in Railway UI
 * - Link DATABASE_URL and REDIS_URL to mvpserver service
 * - Deploy using Railway CLI or GitHub integration
 */
if (platform === "railway") {
  pulumi.log.info("🚂 Railway deployment configuration");
  pulumi.log.info("Platform: Railway (managed services)");
  pulumi.log.info("Databases: PostgreSQL 16 + Redis 7 (create manually in Railway UI)");

  // Build Docker image locally for validation
  const image = new docker.Image(`${appName}-image`, {
    imageName: `${appName}:${environment}`,
    build: {
      context: dockerContext,
      dockerfile: dockerfilePath,
      platform: "linux/amd64",
    },
    skipPush: true, // Don't push, Railway builds from source
  });

  // Environment variables template for Railway
  const envVars = pulumi.all([
    authSecret,
    encryptionKey,
    moralisApiKey,
    moralisStreamSecret,
    polygonRpcUrl,
    globalWalletPrivateKey,
  ]).apply(([auth, encryption, moralisKey, moralisStream, rpcUrl, walletKey]) => ({
    NODE_ENV: nodeEnv,
    PORT: port.toString(),

    // Database (use Railway magic variables)
    DATABASE_URL: "${{Postgres.DATABASE_URL}}",
    REDIS_URL: "${{Redis.REDIS_URL}}",

    // Auth & Security
    AUTH_SECRET: auth,
    ENCRYPTION_KEY: encryption,

    // Moralis (Blockchain)
    MORALIS_API_KEY: moralisKey,
    MORALIS_STREAM_SECRET: moralisStream,

    // Polygon
    POLYGON_RPC_URL: rpcUrl,
    POLYGON_CHAIN_ID: "137",

    // Wallet
    GLOBAL_WALLET_ADDRESS: config.get("globalWalletAddress") || "<set-in-railway>",
    GLOBAL_WALLET_PRIVATE_KEY: walletKey,

    // Frontend
    FRONTEND_URL: config.get("frontendUrl") || "https://mvppir.vercel.app",
  }));

  export const railwayEnvTemplate = envVars;
  export const dockerImageName = image.imageName;

  pulumi.log.warn("⚠️  Manual steps required:");
  pulumi.log.warn("1. Railway UI → Add Database → PostgreSQL");
  pulumi.log.warn("2. Railway UI → Add Database → Redis");
  pulumi.log.warn("3. Connect DATABASE_URL: ${{Postgres.DATABASE_URL}}");
  pulumi.log.warn("4. Connect REDIS_URL: ${{Redis.REDIS_URL}}");
  pulumi.log.warn("5. Copy environment variables from 'railwayEnvTemplate' output");
}

/**
 * Njalla VPS / Production Deployment
 *
 * Deploys full stack using Docker Compose on VPS:
 * - PostgreSQL container
 * - Redis container
 * - Application container
 * - Nginx reverse proxy (optional)
 */
if (platform === "njalla-vps") {
  pulumi.log.info("🚀 Njalla VPS deployment configuration");

  const vpsHost = config.require("vpsHost");
  const vpsUser = config.get("vpsUser") || "deploy";
  const sshKeyPath = config.get("sshKeyPath") || "~/.ssh/id_rsa";

  // Database configuration
  const databaseUrl = config.requireSecret("databaseUrl");
  const redisUrl = config.requireSecret("redisUrl");

  // Build Docker image
  const image = new docker.Image(`${appName}-prod-image`, {
    imageName: pulumi.interpolate`${config.get("dockerRegistry") || "mvpserver"}:${environment}`,
    build: {
      context: dockerContext,
      dockerfile: dockerfilePath,
      platform: "linux/amd64",
    },
    skipPush: !config.get("dockerRegistry"), // Push only if registry configured
  });

  // Remote command: Deploy Docker Compose
  const deploy = new command.remote.Command("deploy-to-vps", {
    connection: {
      host: vpsHost,
      user: vpsUser,
      privateKey: sshKeyPath,
    },
    create: pulumi.interpolate`
      cd /opt/mvppir && \
      docker-compose pull && \
      docker-compose up -d --remove-orphans && \
      docker-compose ps
    `,
  });

  export const vpsDeployment = {
    host: vpsHost,
    user: vpsUser,
    imageName: image.imageName,
    deploymentStatus: deploy.stdout,
  };

  pulumi.log.info("✅ VPS deployment configured");
  pulumi.log.info(`SSH: ${vpsUser}@${vpsHost}`);
}

// Export common outputs
export const outputs = {
  environment,
  platform,
  appName,
  port,
  healthcheckPath,
};
