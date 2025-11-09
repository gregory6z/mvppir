import * as pulumi from "@pulumi/pulumi";
import * as docker from "@pulumi/docker";
import * as command from "@pulumi/command";

/**
 * Pulumi Infrastructure for MVPPIR - Njalla VPS (Production)
 *
 * This stack deploys the MVPPIR backend to a Njalla VPS using Docker Compose.
 * Railway deployment is handled separately via Railway CLI and railway.json.
 */

// Load configuration
const config = new pulumi.Config();
const environment = config.require("environment");
const appName = config.get("appName") || "mvpserver";

// Docker configuration
const dockerfilePath = config.get("dockerfilePath") || "../../apps/server/Dockerfile";
const dockerContext = config.get("dockerContext") || "../../apps/server";

// VPS Configuration
const vpsHost = config.require("vpsHost");
const vpsUser = config.get("vpsUser") || "deploy";
const sshKeyPath = config.get("sshKeyPath") || "~/.ssh/id_rsa";

// Export stack information
export const stackEnvironment = environment;
export const stackVpsHost = vpsHost;

/**
 * Njalla VPS Production Deployment
 *
 * Deploys full stack using Docker Compose on VPS:
 * - PostgreSQL 16 container
 * - Redis 7 container
 * - MVPPIR backend container
 * - Nginx reverse proxy (optional, profile: production)
 */

pulumi.log.info("🚀 Njalla VPS deployment configuration");
pulumi.log.info(`Environment: ${environment}`);
pulumi.log.info(`VPS Host: ${vpsHost}`);

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

// Export VPS deployment info
export const vpsDeployment = {
  host: vpsHost,
  user: vpsUser,
  imageName: image.imageName,
  deploymentStatus: deploy.stdout,
};

pulumi.log.info("✅ VPS deployment configured");
pulumi.log.info(`SSH: ${vpsUser}@${vpsHost}`);
