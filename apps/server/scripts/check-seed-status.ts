#!/usr/bin/env tsx
/**
 * Verifica se o seed foi executado no banco Railway
 *
 * USO:
 *   railway run npx tsx scripts/check-seed-status.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Verificando status do seed no Railway...\n')

  try {
    // 1. Verificar Global Wallet
    const globalWallet = await prisma.globalWallet.findFirst()
    console.log('🔐 Global Wallet:')
    if (globalWallet) {
      console.log(`   ✅ Existe: ${globalWallet.polygonAddress}`)
      console.log(`   Created: ${globalWallet.createdAt}`)
    } else {
      console.log('   ❌ Não encontrada - execute o seed!')
    }

    // 2. Verificar Admins
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: {
        email: true,
        name: true,
        status: true,
        createdAt: true,
      },
    })

    console.log('\n👥 Admins cadastrados:')
    if (admins.length === 0) {
      console.log('   ❌ Nenhum admin encontrado - execute o seed!')
    } else {
      admins.forEach((admin) => {
        console.log(`   ✅ ${admin.email} (${admin.name}) - ${admin.status}`)
      })
    }

    // 3. Resumo
    console.log('\n📊 Resumo:')
    console.log(`   Global Wallet: ${globalWallet ? '✅ OK' : '❌ FALTANDO'}`)
    console.log(`   Admins: ${admins.length > 0 ? `✅ ${admins.length} cadastrados` : '❌ FALTANDO'}`)

    if (globalWallet && admins.length > 0) {
      console.log('\n✅ Seed executado com sucesso!')
    } else {
      console.log('\n⚠️  Execute: railway run npm run prisma:seed')
    }

  } catch (error: any) {
    console.error('❌ Erro ao verificar seed:', error.message)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
