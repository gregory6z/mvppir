import { prisma } from "@/lib/prisma"
import { injectTestDeposit } from "./inject-test-deposit"
import { faker as fakerPtBr } from "@faker-js/faker/locale/pt_BR"
import { faker as fakerEn } from "@faker-js/faker/locale/en"
import { faker as fakerEs } from "@faker-js/faker/locale/es"
import { faker as fakerFr } from "@faker-js/faker/locale/fr"
import { faker as fakerDe } from "@faker-js/faker/locale/de"
import { faker as fakerIt } from "@faker-js/faker/locale/it"

type SupportedLocale = "pt_BR" | "en" | "es" | "fr" | "de" | "it"

interface InjectTestReferralsInput {
  referrerEmail: string
  count: number // Quantidade de diretos a criar
  depositAmount?: number // Depósito inicial para cada direto (default: 100 USD)
  locale?: SupportedLocale // Locale para geração de nomes (default: pt_BR)
}

interface InjectTestReferralsOutput {
  referrerId: string
  referrerEmail: string
  createdReferrals: Array<{
    id: string
    email: string
    name: string
    depositAmount: number
    status: string
  }>
  totalDirects: number
  message: string
}

/**
 * Injeta diretos de teste (N1) para um usuário
 *
 * Fluxo:
 * 1. Busca usuário referrer por email
 * 2. Cria N usuários fake com referrerId apontando para o referrer
 * 3. Ativa cada usuário (status ACTIVE)
 * 4. Injeta depósito de teste para cada direto (>=100 USD)
 * 5. Atualiza totalDirects do referrer
 *
 * Isso permite testar:
 * - Sistema de rank (subir de RECRUIT -> BRONZE -> SILVER -> GOLD)
 * - Cálculo de comissões (N1, N2, N3)
 * - Volume da rede
 */
export async function injectTestReferrals(
  input: InjectTestReferralsInput
): Promise<InjectTestReferralsOutput> {
  const { referrerEmail, count, depositAmount = 100, locale = "pt_BR" } = input

  // Selecionar faker baseado no locale
  const fakerMap = {
    pt_BR: fakerPtBr,
    en: fakerEn,
    es: fakerEs,
    fr: fakerFr,
    de: fakerDe,
    it: fakerIt,
  }

  const faker = fakerMap[locale]

  // Validação
  if (count <= 0 || count > 100) {
    throw new Error("Count must be between 1 and 100")
  }

  if (depositAmount < 100) {
    throw new Error("Deposit amount must be at least 100 USD to activate accounts")
  }

  // 1. Buscar usuário referrer
  const referrer = await prisma.user.findUnique({
    where: { email: referrerEmail },
  })

  if (!referrer) {
    throw new Error(`Referrer with email ${referrerEmail} not found`)
  }

  console.log(`🧪 Creating ${count} test referrals for ${referrerEmail} (locale: ${locale})`)

  const createdReferrals: InjectTestReferralsOutput["createdReferrals"] = []

  // 2. Criar diretos fake
  for (let i = 0; i < count; i++) {
    // Gerar nome realista usando faker com locale selecionado
    const fakeName = faker.person.fullName()
    const fakeEmail = faker.internet.email()

    console.log(`📝 Creating referral ${i + 1}/${count}: ${fakeName} (${fakeEmail})`)

    // Criar usuário com referrerId
    const newUser = await prisma.user.create({
      data: {
        email: fakeEmail,
        name: fakeName,
        emailVerified: true,
        status: "ACTIVE", // Já ativo
        activatedAt: new Date(),
        referrerId: referrer.id, // Apontar para o referrer (direto N1)
        currentRank: "RECRUIT",
        rankStatus: "ACTIVE",
        totalDirects: 0,
        lifetimeVolume: 0,
        blockedBalance: 0,
      },
    })

    // Criar deposit address para o novo usuário
    const { Wallet } = await import("ethers")
    const { encryptPrivateKey } = await import("@/lib/encryption")

    const wallet = Wallet.createRandom()
    await prisma.depositAddress.create({
      data: {
        userId: newUser.id,
        polygonAddress: wallet.address.toLowerCase(),
        privateKey: encryptPrivateKey(wallet.privateKey),
        status: "ACTIVE",
      },
    })

    // Injetar depósito de teste para ativar e dar saldo inicial
    try {
      await injectTestDeposit({
        userEmail: fakeEmail,
        tokenSymbol: "USDC",
        amount: depositAmount,
        tokenAddress: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", // USDC on Polygon
        tokenDecimals: 6,
      })

      console.log(`✅ Deposit injected for ${fakeEmail}: ${depositAmount} USDC`)
    } catch (error) {
      console.error(`❌ Failed to inject deposit for ${fakeEmail}:`, error)
      throw error
    }

    createdReferrals.push({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      depositAmount,
      status: newUser.status,
    })
  }

  // 3. Atualizar totalDirects do referrer
  const updatedReferrer = await prisma.user.update({
    where: { id: referrer.id },
    data: {
      totalDirects: {
        increment: count,
      },
    },
  })

  console.log(`✅ Successfully created ${count} test referrals for ${referrerEmail}`)
  console.log(`📊 Referrer now has ${updatedReferrer.totalDirects} total directs`)

  // 4. Verificar automaticamente se o referrer pode subir de rank
  console.log(`🔍 Checking rank progression for ${referrerEmail}...`)

  try {
    const { autoCheckAndPromote } = await import("@/modules/mlm/use-cases/check-rank-progression")
    const wasPromoted = await autoCheckAndPromote(referrer.id)

    if (wasPromoted) {
      // Buscar rank atualizado
      const promotedUser = await prisma.user.findUnique({
        where: { id: referrer.id },
        select: { currentRank: true },
      })

      console.log(`🎉 PROMOTED! ${referrerEmail} was promoted to ${promotedUser?.currentRank}!`)
    } else {
      console.log(`ℹ️  ${referrerEmail} does not meet requirements for next rank yet`)
    }
  } catch (error) {
    console.error(`⚠️  Failed to check rank progression:`, error)
    // Não falha a operação, apenas loga o erro
  }

  return {
    referrerId: referrer.id,
    referrerEmail: referrer.email,
    createdReferrals,
    totalDirects: updatedReferrer.totalDirects,
    message: `Successfully created ${count} active test referrals with ${depositAmount} USDC each`,
  }
}
