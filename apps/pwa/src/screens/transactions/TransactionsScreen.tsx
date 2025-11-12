import { BottomNavigation } from "@/components/navigation/BottomNavigation"
import { Header } from "@/components/home/Header"
import { useNavigate } from "react-router-dom"
import { useUserAccount } from "@/api/user/queries/use-user-account"
import { useUnifiedTransactions } from "@/api/user/queries/use-unified-transactions"
import { RecentActivity } from "@/components/home/RecentActivity"
import { useUIStore } from "@/stores/ui.store"

export function TransactionsScreen() {
  const navigate = useNavigate()
  const { data: account } = useUserAccount()
  const { data: transactions, isLoading } = useUnifiedTransactions({ limit: 50 })
  const { isBalanceVisible } = useUIStore()

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-zinc-950">
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-zinc-400">Carregando transações...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      <Header
        userName={account?.name || "User"}
        notificationCount={0}
        onAvatarPress={() => navigate("/profile")}
        onNotificationPress={() => navigate("/notifications")}
      />

      <div className="flex-1 overflow-y-auto pb-24">
        {transactions && (
          <RecentActivity
            transactions={transactions.transactions}
            maxItems={50}
            onViewAll={() => {}}
            onTransactionPress={(id) => navigate(`/transactions/${id}`)}
            isBalanceVisible={isBalanceVisible}
          />
        )}
      </div>

      <BottomNavigation />
    </div>
  )
}
