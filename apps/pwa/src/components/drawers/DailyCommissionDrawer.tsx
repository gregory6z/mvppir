import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"

interface CommissionBreakdown {
  level: number // 0, 1, 2, 3
  levelName: string // "N0", "N1", "N2", "N3"
  amount: number
  percentage: number
  count: number // Number of network users at this level
}

interface DailyCommissionDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  totalAmount: number
  tokenSymbol: string
  rank: "RECRUIT" | "BRONZE" | "SILVER" | "GOLD"
  breakdown?: CommissionBreakdown[]
  date: string // ISO date string
}

const RANK_LABELS: Record<string, string> = {
  RECRUIT: "Recruta",
  BRONZE: "Bronze",
  SILVER: "Prata",
  GOLD: "Ouro",
}

const RANK_COLORS: Record<string, string> = {
  RECRUIT: "text-zinc-400",
  BRONZE: "text-orange-500",
  SILVER: "text-gray-300",
  GOLD: "text-yellow-400",
}

const LEVEL_LABELS: Record<number, string> = {
  0: "Comissão Principal (N0)",
  1: "Diretos (N1)",
  2: "Nível 2 (N2)",
  3: "Nível 3 (N3)",
}

export function DailyCommissionDrawer({
  open,
  onOpenChange,
  totalAmount,
  tokenSymbol,
  rank,
  breakdown = [],
  date,
}: DailyCommissionDrawerProps) {
  const formattedDate = new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        {/* Header - Gradient Background */}
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-6 text-center border-b border-zinc-800">
          <div className="text-4xl mb-2">💰</div>
          <h2 className="text-white text-2xl font-bold">
            Comissão Diária Recebida!
          </h2>
          <p className="text-white/80 text-sm mt-1">{formattedDate}</p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Total Amount */}
          <div className="p-6 text-center border-b border-zinc-800">
            <p className="text-zinc-400 text-sm mb-1">Você recebeu</p>
            <p className="text-white text-4xl font-bold">
              {totalAmount.toFixed(2)}{" "}
              <span className="text-2xl">{tokenSymbol}</span>
            </p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              <p className={`text-sm font-semibold ${RANK_COLORS[rank]}`}>
                Rank: {RANK_LABELS[rank]}
              </p>
            </div>
          </div>

          {/* Breakdown */}
          {breakdown.length > 0 && (
            <div className="px-6 py-4">
              <p className="text-zinc-400 text-xs font-semibold uppercase mb-3">
                Detalhamento por Nível
              </p>

              {breakdown.map((item) => (
                <div
                  key={item.level}
                  className="flex items-center justify-between py-3 border-b border-zinc-800/50 last:border-b-0"
                >
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">
                      {LEVEL_LABELS[item.level]}
                    </p>
                    <p className="text-zinc-500 text-xs mt-0.5">
                      {item.percentage}% · {item.count}{" "}
                      {item.count === 1 ? "pessoa" : "pessoas"}
                    </p>
                  </div>
                  <p className="text-green-500 text-sm font-bold">
                    +{item.amount.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <DrawerFooter className="px-6 py-4 border-t border-zinc-800">
          <DrawerClose asChild>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base py-4 rounded-xl">
              Entendi
            </Button>
          </DrawerClose>
          <p className="text-zinc-500 text-xs text-center mt-4">
            As comissões já foram creditadas no seu saldo disponível
          </p>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
