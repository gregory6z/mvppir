import { prisma } from "@/lib/prisma"
import { Decimal } from "@prisma/client/runtime/library"

interface UpdateNetworkVolumeInput {
  userId: string
  amount: Decimal // Valor do depósito em USD
}

/**
 * Atualiza o lifetimeVolume do usuário e de toda sua rede ascendente
 *
 * Quando um usuário faz um depósito:
 * - Incrementa seu próprio lifetimeVolume
 * - Incrementa o lifetimeVolume do patrocinador (N1)
 * - Incrementa o lifetimeVolume do patrocinador do patrocinador (N2)
 * - Incrementa o lifetimeVolume do patrocinador N3
 *
 * Isso permite:
 * - Requisitos de rank baseados em volume da rede
 * - Cálculo de comissões baseado em volume
 */
export async function updateNetworkVolume(input: UpdateNetworkVolumeInput) {
  const { userId, amount } = input

  // 1. Atualiza o volume do próprio usuário
  await prisma.user.update({
    where: { id: userId },
    data: {
      lifetimeVolume: { increment: amount },
    },
  })

  console.log(`📊 Volume atualizado para usuário ${userId}: +${amount.toFixed(2)} USD`)

  // 2. Busca a rede ascendente (até 3 níveis)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      referrerId: true,
      referrer: {
        select: {
          id: true,
          referrerId: true,
          referrer: {
            select: {
              id: true,
              referrerId: true,
              referrer: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!user?.referrer) {
    console.log(`ℹ️  Usuário ${userId} não tem patrocinador (sem rede ascendente)`)
    return
  }

  // 3. Atualiza N1 (patrocinador direto)
  await prisma.user.update({
    where: { id: user.referrer.id },
    data: {
      lifetimeVolume: { increment: amount },
    },
  })

  console.log(`📊 Volume atualizado para N1 (${user.referrer.id}): +${amount.toFixed(2)} USD`)

  // 4. Atualiza N2 (se existir)
  if (user.referrer.referrer) {
    await prisma.user.update({
      where: { id: user.referrer.referrer.id },
      data: {
        lifetimeVolume: { increment: amount },
      },
    })

    console.log(`📊 Volume atualizado para N2 (${user.referrer.referrer.id}): +${amount.toFixed(2)} USD`)

    // 5. Atualiza N3 (se existir)
    if (user.referrer.referrer.referrer) {
      await prisma.user.update({
        where: { id: user.referrer.referrer.referrer.id },
        data: {
          lifetimeVolume: { increment: amount },
        },
      })

      console.log(`📊 Volume atualizado para N3 (${user.referrer.referrer.referrer.id}): +${amount.toFixed(2)} USD`)
    }
  }

  console.log(`✅ Network volume atualizado para usuário ${userId} e toda rede ascendente`)
}
