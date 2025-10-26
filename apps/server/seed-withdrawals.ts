/**
 * Seed script for Withdrawals (Pending + History)
 *
 * Creates:
 * - Test users with balances
 * - Pending withdrawal requests (PENDING_APPROVAL)
 * - Withdrawal history (COMPLETED, REJECTED, FAILED)
 * - Admin user for approvals
 *
 * Run: npx tsx seed-withdrawals.ts
 */

import { PrismaClient } from "@prisma/client"
import { Decimal } from "@prisma/client/runtime/library"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting withdrawals seed...")

  // 1. Buscar ou criar admin de teste
  let adminUser = await prisma.user.findFirst({
    where: { role: "admin", email: "admin@mvppir.com" },
  })

  if (!adminUser) {
    console.log("📝 Creating admin user...")
    adminUser = await prisma.user.create({
      data: {
        email: "admin@mvppir.com",
        name: "Admin Sistema",
        role: "admin",
        status: "ACTIVE",
      },
    })
    console.log(`✅ Admin created: ${adminUser.email}`)
  } else {
    console.log(`✅ Admin found: ${adminUser.email}`)
  }

  // 2. Criar usuários de teste com balances
  const testUsers = [
    {
      email: "user.withdrawal1@test.com",
      name: "João Silva",
      balances: [
        { tokenSymbol: "USDC", amount: "1500.50" },
        { tokenSymbol: "USDT", amount: "850.25" },
      ],
    },
    {
      email: "user.withdrawal2@test.com",
      name: "Maria Santos",
      balances: [
        { tokenSymbol: "USDC", amount: "3200.00" },
        { tokenSymbol: "MATIC", amount: "500.75" },
      ],
    },
    {
      email: "user.withdrawal3@test.com",
      name: "Pedro Oliveira",
      balances: [
        { tokenSymbol: "USDT", amount: "750.00" },
      ],
    },
    {
      email: "user.withdrawal4@test.com",
      name: "Ana Costa",
      balances: [
        { tokenSymbol: "USDC", amount: "5000.00" },
      ],
    },
  ]

  const createdUsers = []
  for (const userData of testUsers) {
    let user = await prisma.user.findUnique({
      where: { email: userData.email },
    })

    if (!user) {
      console.log(`📝 Creating user: ${userData.name}...`)
      user = await prisma.user.create({
        data: {
          email: userData.email,
          name: userData.name,
          role: "user",
          status: "ACTIVE",
        },
      })

      // Create balances for user
      for (const balance of userData.balances) {
        await prisma.balance.create({
          data: {
            userId: user.id,
            tokenSymbol: balance.tokenSymbol,
            availableBalance: new Decimal(balance.amount),
            lockedBalance: new Decimal(0),
          },
        })
      }

      console.log(`✅ User created: ${user.name} with ${userData.balances.length} balances`)
    } else {
      console.log(`✅ User found: ${user.name}`)
    }

    createdUsers.push(user)
  }

  // 3. Criar saques PENDENTES (para aprovação)
  console.log("\n📝 Creating PENDING withdrawals...")

  const pendingWithdrawals = [
    {
      user: createdUsers[0], // João Silva
      tokenSymbol: "USDC",
      amount: "500.00",
      destinationAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      fee: "40.00", // 8% base fee
    },
    {
      user: createdUsers[1], // Maria Santos
      tokenSymbol: "USDC",
      amount: "1000.00",
      destinationAddress: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
      fee: "80.00",
    },
    {
      user: createdUsers[2], // Pedro Oliveira
      tokenSymbol: "USDT",
      amount: "300.00",
      destinationAddress: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
      fee: "24.00",
    },
  ]

  for (const withdrawal of pendingWithdrawals) {
    await prisma.withdrawal.create({
      data: {
        userId: withdrawal.user.id,
        tokenSymbol: withdrawal.tokenSymbol,
        amount: new Decimal(withdrawal.amount),
        destinationAddress: withdrawal.destinationAddress,
        fee: new Decimal(withdrawal.fee),
        status: "PENDING_APPROVAL",
        baseFee: new Decimal(8.0),
        progressiveFee: new Decimal(0),
        loyaltyDiscount: new Decimal(0),
        gasFee: new Decimal(0.5),
        netAmount: new Decimal(withdrawal.amount).sub(new Decimal(withdrawal.fee)),
        createdAt: new Date(Date.now() - Math.random() * 3600000 * 24), // Last 24 hours
      },
    })
    console.log(`✅ PENDING withdrawal created: ${withdrawal.user.name} - ${withdrawal.amount} ${withdrawal.tokenSymbol}`)
  }

  // 4. Criar saques COMPLETADOS (histórico)
  console.log("\n📝 Creating COMPLETED withdrawals (history)...")

  const completedWithdrawals = [
    {
      user: createdUsers[0],
      tokenSymbol: "USDC",
      amount: "800.00",
      fee: "64.00",
      txHash: "0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890",
      daysAgo: 2,
    },
    {
      user: createdUsers[1],
      tokenSymbol: "USDT",
      amount: "1500.00",
      fee: "120.00",
      txHash: "0x2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567891",
      daysAgo: 5,
    },
    {
      user: createdUsers[3],
      tokenSymbol: "USDC",
      amount: "2000.00",
      fee: "160.00",
      txHash: "0x3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567892",
      daysAgo: 7,
    },
    {
      user: createdUsers[2],
      tokenSymbol: "USDT",
      amount: "450.00",
      fee: "36.00",
      txHash: "0x4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567893",
      daysAgo: 10,
    },
  ]

  for (const withdrawal of completedWithdrawals) {
    const createdAt = new Date(Date.now() - withdrawal.daysAgo * 24 * 3600000)
    const approvedAt = new Date(createdAt.getTime() + 2 * 3600000) // 2h after request
    const processedAt = new Date(approvedAt.getTime() + 1 * 3600000) // 1h after approval

    await prisma.withdrawal.create({
      data: {
        userId: withdrawal.user.id,
        tokenSymbol: withdrawal.tokenSymbol,
        amount: new Decimal(withdrawal.amount),
        destinationAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
        fee: new Decimal(withdrawal.fee),
        status: "COMPLETED",
        txHash: withdrawal.txHash,
        approvedBy: adminUser.id,
        approvedAt,
        processedAt,
        baseFee: new Decimal(8.0),
        progressiveFee: new Decimal(0),
        loyaltyDiscount: new Decimal(0),
        gasFee: new Decimal(0.5),
        netAmount: new Decimal(withdrawal.amount).sub(new Decimal(withdrawal.fee)),
        createdAt,
      },
    })
    console.log(`✅ COMPLETED withdrawal created: ${withdrawal.user.name} - ${withdrawal.amount} ${withdrawal.tokenSymbol} (${withdrawal.daysAgo} days ago)`)
  }

  // 5. Criar saques REJEITADOS
  console.log("\n📝 Creating REJECTED withdrawals (history)...")

  const rejectedWithdrawals = [
    {
      user: createdUsers[1],
      tokenSymbol: "USDC",
      amount: "5000.00",
      fee: "400.00",
      reason: "Saldo insuficiente na Global Wallet",
      daysAgo: 3,
    },
    {
      user: createdUsers[0],
      tokenSymbol: "USDT",
      amount: "1200.00",
      fee: "96.00",
      reason: "Endereço de destino inválido",
      daysAgo: 6,
    },
  ]

  for (const withdrawal of rejectedWithdrawals) {
    const createdAt = new Date(Date.now() - withdrawal.daysAgo * 24 * 3600000)
    const approvedAt = new Date(createdAt.getTime() + 3 * 3600000) // 3h after request

    await prisma.withdrawal.create({
      data: {
        userId: withdrawal.user.id,
        tokenSymbol: withdrawal.tokenSymbol,
        amount: new Decimal(withdrawal.amount),
        destinationAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
        fee: new Decimal(withdrawal.fee),
        status: "REJECTED",
        approvedBy: adminUser.id,
        approvedAt,
        rejectedReason: withdrawal.reason,
        baseFee: new Decimal(8.0),
        progressiveFee: new Decimal(0),
        loyaltyDiscount: new Decimal(0),
        gasFee: new Decimal(0.5),
        netAmount: new Decimal(withdrawal.amount).sub(new Decimal(withdrawal.fee)),
        createdAt,
      },
    })
    console.log(`✅ REJECTED withdrawal created: ${withdrawal.user.name} - ${withdrawal.amount} ${withdrawal.tokenSymbol} (Reason: ${withdrawal.reason})`)
  }

  // 6. Criar saques FALHADOS
  console.log("\n📝 Creating FAILED withdrawals (history)...")

  const failedWithdrawals = [
    {
      user: createdUsers[2],
      tokenSymbol: "USDC",
      amount: "600.00",
      fee: "48.00",
      daysAgo: 4,
    },
  ]

  for (const withdrawal of failedWithdrawals) {
    const createdAt = new Date(Date.now() - withdrawal.daysAgo * 24 * 3600000)
    const approvedAt = new Date(createdAt.getTime() + 2 * 3600000)
    const processedAt = new Date(approvedAt.getTime() + 1 * 3600000)

    await prisma.withdrawal.create({
      data: {
        userId: withdrawal.user.id,
        tokenSymbol: withdrawal.tokenSymbol,
        amount: new Decimal(withdrawal.amount),
        destinationAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
        fee: new Decimal(withdrawal.fee),
        status: "FAILED",
        approvedBy: adminUser.id,
        approvedAt,
        processedAt,
        baseFee: new Decimal(8.0),
        progressiveFee: new Decimal(0),
        loyaltyDiscount: new Decimal(0),
        gasFee: new Decimal(0.5),
        netAmount: new Decimal(withdrawal.amount).sub(new Decimal(withdrawal.fee)),
        createdAt,
      },
    })
    console.log(`✅ FAILED withdrawal created: ${withdrawal.user.name} - ${withdrawal.amount} ${withdrawal.tokenSymbol}`)
  }

  console.log("\n✅ Withdrawals seed completed!")
  console.log("\n📊 Summary:")
  console.log(`   - ${pendingWithdrawals.length} PENDING withdrawals`)
  console.log(`   - ${completedWithdrawals.length} COMPLETED withdrawals`)
  console.log(`   - ${rejectedWithdrawals.length} REJECTED withdrawals`)
  console.log(`   - ${failedWithdrawals.length} FAILED withdrawals`)
  console.log(`   - Total: ${pendingWithdrawals.length + completedWithdrawals.length + rejectedWithdrawals.length + failedWithdrawals.length} withdrawals`)
}

main()
  .catch((e) => {
    console.error("❌ Error seeding withdrawals:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
