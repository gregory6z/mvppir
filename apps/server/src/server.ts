import { buildApp } from './app'
import { env } from './config/env'
import { initializeRepeatingJobs } from './lib/queues'
import { startDailyCommissionsWorker } from './modules/mlm/workers/daily-commissions.worker'
import { startMonthlyMaintenanceWorker } from './modules/mlm/workers/monthly-maintenance.worker'
import { startGracePeriodRecoveryWorker } from './modules/mlm/workers/grace-period-recovery.worker'
import { startBatchCollectWorker } from './modules/transfer/workers/batch-collect.worker'
import { startDepositWorker } from './modules/deposit/workers/deposit.worker'
import { startBlockchainListener, stopBlockchainListener } from './modules/deposit/listeners/blockchain-listener'

async function start() {
  const app = await buildApp()

  try {
    await app.listen({ port: env.PORT, host: '0.0.0.0' })
    app.log.info(`Server listening on http://0.0.0.0:${env.PORT}`)

    // Initialize BullMQ cron jobs
    app.log.info('Initializing BullMQ cron jobs...')
    await initializeRepeatingJobs()

    // Start workers
    app.log.info('Starting BullMQ workers...')
    startDailyCommissionsWorker()
    startMonthlyMaintenanceWorker()
    startGracePeriodRecoveryWorker()
    startBatchCollectWorker() // Manual execution (no cron)
    startDepositWorker() // Deposit processing (concurrency: 3)

    // Start blockchain listener (WebSocket direct to Polygon)
    app.log.info('Starting Blockchain WebSocket Listener...')
    await startBlockchainListener()

    app.log.info('✅ All workers and listeners started successfully')
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }

  // Graceful shutdown
  const signals = ['SIGINT', 'SIGTERM'] as const

  for (const signal of signals) {
    process.on(signal, async () => {
      app.log.info(`Received ${signal}, closing server gracefully...`)

      try {
        // Stop blockchain listener first
        stopBlockchainListener()

        await app.close()
        app.log.info('Server closed successfully')
        process.exit(0)
      } catch (err) {
        app.log.error({ err }, 'Error closing server')
        process.exit(1)
      }
    })
  }

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    app.log.error({ err }, 'Uncaught exception')
    process.exit(1)
  })

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason) => {
    app.log.error({ reason }, 'Unhandled promise rejection')
    process.exit(1)
  })
}

start()
