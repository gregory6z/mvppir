import { prisma } from "@/lib/prisma";
import { addAddressToStream } from "@/providers/moralis/stream.provider";

interface RegisterPendingResult {
  total: number;
  registered: number;
  failed: number;
  errors: Array<{ address: string; error: string }>;
}

/**
 * Registra endereços de depósito que ainda não foram registrados no Moralis Stream.
 * Esta função é chamada por um cron job para garantir que todos os endereços
 * sejam eventualmente registrados, mesmo que a primeira tentativa tenha falhado.
 */
export async function registerPendingMoralisAddresses(): Promise<RegisterPendingResult> {
  const result: RegisterPendingResult = {
    total: 0,
    registered: 0,
    failed: 0,
    errors: [],
  };

  // Busca todos os endereços não registrados
  const pendingAddresses = await prisma.depositAddress.findMany({
    where: { moralisRegistered: false },
    select: {
      id: true,
      polygonAddress: true,
    },
  });

  result.total = pendingAddresses.length;

  if (pendingAddresses.length === 0) {
    console.log("✅ All deposit addresses are registered with Moralis");
    return result;
  }

  console.log(`🔄 Registering ${pendingAddresses.length} pending addresses with Moralis...`);

  for (const address of pendingAddresses) {
    try {
      await addAddressToStream(address.polygonAddress);

      await prisma.depositAddress.update({
        where: { id: address.id },
        data: { moralisRegistered: true },
      });

      result.registered++;
      console.log(`✅ Registered ${address.polygonAddress}`);
    } catch (error) {
      result.failed++;
      const errorMessage = error instanceof Error ? error.message : String(error);
      result.errors.push({
        address: address.polygonAddress,
        error: errorMessage,
      });
      console.error(`❌ Failed to register ${address.polygonAddress}:`, errorMessage);
    }
  }

  console.log(`📊 Registration complete: ${result.registered}/${result.total} successful, ${result.failed} failed`);

  return result;
}
