/**
 * Daily Commissions Worker
 *
 * Calculates and credits daily commissions for all active users based on their network's balances.
 *
 * Schedule: 00:05 UTC daily
 * Formula: commission = networkUserBalance × commissionRate
 */

import { Worker, Job } from "bullmq";
import { redis } from "@/lib/redis";
import { QUEUE_NAMES } from "@/lib/queues";
import { prisma } from "@/lib/prisma";
import { getRankRequirements, getMaxCommissionDepth } from "@/modules/mlm/mlm-config";
import { getNetworkLevels } from "@/modules/mlm/helpers/network";
import { Decimal } from "@prisma/client/runtime/library";
import { createAndSendNotification } from "@/modules/notifications/use-cases/create-and-send-notification";

/**
 * Process daily commissions job
 */
async function processDailyCommissions(job: Job) {
  const startTime = Date.now();

  job.log("Starting daily commissions calculation...");

  // Get all active users (not RECRUIT or BLOCKED)
  const users = await prisma.user.findMany({
    where: {
      status: "ACTIVE",
      rankStatus: {
        not: "DOWNRANKED", // Don't pay commissions to downranked users
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      currentRank: true,
    },
  });

  job.log(`Found ${users.length} eligible users`);

  let totalCommissions = new Decimal(0);
  let commissionRecordsCreated = 0;
  let usersProcessed = 0;

  // Process each user
  for (const user of users) {
    try {
      await job.updateProgress((usersProcessed / users.length) * 100);

      const config = getRankRequirements(user.currentRank);
      const maxDepth = getMaxCommissionDepth(user.currentRank);

      let userTotalCommissions = new Decimal(0);

      // ===== N0: Calculate commission on own BLOCKED balance (comissão principal) =====
      // IMPORTANTE: Usa blockedBalance (investimento) ao invés de availableBalance
      // para evitar calcular comissão sobre comissões anteriores
      if (config.commissions.N0 > 0) {
        const userData = await prisma.user.findUnique({
          where: { id: user.id },
          select: { blockedBalance: true },
        });

        if (userData && userData.blockedBalance.gt(0)) {
          const baseAmount = userData.blockedBalance;
          const commissionAmount = baseAmount.mul(config.commissions.N0).div(100);

          if (commissionAmount.gt(0)) {
            // Create N0 commission record (fromUserId = próprio userId)
            await prisma.commission.create({
              data: {
                userId: user.id,
                fromUserId: user.id, // N0 = comissão sobre próprio saldo
                level: 0, // N0
                baseAmount,
                percentage: new Decimal(config.commissions.N0),
                finalAmount: commissionAmount,
                referenceDate: new Date(Date.now() - 86400000), // Yesterday
                status: "PAID", // Já começa como PAID pois o saldo será creditado imediatamente
                paidAt: new Date(),
              },
            });

            userTotalCommissions = userTotalCommissions.add(commissionAmount);
            commissionRecordsCreated++;
          }
        }
      }

      // ===== N1/N2/N3: Calculate commissions on network balances =====
      // Get network (N1, N2, N3)
      const network = await getNetworkLevels(user.id);

      // Calculate commissions for each level
      const levels = [
        { name: "N1", users: network.N1, rate: config.commissions.N1 },
        { name: "N2", users: network.N2, rate: config.commissions.N2 },
        { name: "N3", users: network.N3, rate: config.commissions.N3 },
      ];

      for (let i = 0; i < levels.length; i++) {
        const level = levels[i];
        const levelNumber = i + 1;

        // Skip if user's rank doesn't reach this level
        if (levelNumber > maxDepth) continue;

        // Skip if commission rate is 0
        if (level.rate === 0) continue;

        // Process each person in this level
        for (const networkUser of level.users) {
          // IMPORTANTE: Usa blockedBalance (investimento) ao invés de totalBalance
          // para evitar calcular comissão sobre comissões anteriores
          const baseAmount = networkUser.blockedBalance;

          // Skip if user has no balance
          if (baseAmount.lte(0)) continue;

          // Calculate commission
          const commissionAmount = baseAmount.mul(level.rate).div(100);

          if (commissionAmount.lte(0)) continue;

          // Create commission record
          await prisma.commission.create({
            data: {
              userId: user.id,
              fromUserId: networkUser.id,
              level: levelNumber,
              baseAmount,
              percentage: new Decimal(level.rate),
              finalAmount: commissionAmount,
              referenceDate: new Date(Date.now() - 86400000), // Yesterday
              status: "PAID", // Já começa como PAID pois o saldo será creditado imediatamente
              paidAt: new Date(),
            },
          });

          userTotalCommissions = userTotalCommissions.add(commissionAmount);
          commissionRecordsCreated++;
        }
      }

      // Credit commissions to user's balance (USDC)
      // Nota: Comissões não contam como investimento (blockedBalance),
      // então não precisa atualizar User.blockedBalance
      if (userTotalCommissions.gt(0)) {
        await prisma.balance.upsert({
          where: {
            userId_tokenSymbol: {
              userId: user.id,
              tokenSymbol: "USDC",
            },
          },
          create: {
            userId: user.id,
            tokenSymbol: "USDC",
            tokenAddress: null,
            availableBalance: userTotalCommissions,
            lockedBalance: 0,
          },
          update: {
            availableBalance: {
              increment: userTotalCommissions,
            },
          },
        });

        // Commissions are already created as PAID above, no need to update

        // Send push notification about daily commission
        try {
          await createAndSendNotification({
            userId: user.id,
            type: "DAILY_COMMISSION",
            title: "Comissão Diária Recebida! 💰",
            body: `Você recebeu ${userTotalCommissions.toFixed(2)} USDC em comissões hoje.`,
            data: {
              amount: parseFloat(userTotalCommissions.toString()),
              tokenSymbol: "USDC",
              rank: user.currentRank,
              date: new Date().toISOString(),
            },
          });
        } catch (error) {
          job.log(
            `Failed to send push notification to ${user.email}: ${error instanceof Error ? error.message : "Unknown"}`
          );
          // Don't fail the job if notification fails
        }

        totalCommissions = totalCommissions.add(userTotalCommissions);
      }

      usersProcessed++;

      if (usersProcessed % 100 === 0) {
        job.log(`Processed ${usersProcessed}/${users.length} users`);
      }
    } catch (error) {
      job.log(
        `Error processing user ${user.email}: ${error instanceof Error ? error.message : "Unknown error"}`
      );
      // Continue with next user
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  const summary = {
    usersProcessed,
    commissionRecordsCreated,
    totalCommissions: parseFloat(totalCommissions.toString()),
    durationSeconds: duration,
  };

  job.log(`Daily commissions completed: ${JSON.stringify(summary)}`);

  return summary;
}

/**
 * Create and start the worker
 */
export function startDailyCommissionsWorker() {
  const worker = new Worker(QUEUE_NAMES.DAILY_COMMISSIONS, processDailyCommissions, {
    connection: redis,
    concurrency: 1, // Process one job at a time (avoid race conditions)
  });

  worker.on("completed", (job) => {
    console.log(
      `✅ Daily commissions job ${job.id} completed:`,
      job.returnvalue
    );
  });

  worker.on("failed", (job, err) => {
    console.error(`❌ Daily commissions job ${job?.id} failed:`, err.message);
  });

  worker.on("error", (err) => {
    console.error("❌ Daily commissions worker error:", err);
  });

  console.log("✅ Daily commissions worker started");

  return worker;
}
