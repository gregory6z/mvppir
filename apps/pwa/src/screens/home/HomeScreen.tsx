import { useNavigate } from "react-router-dom"
import { useUserAccount } from "@/api/user/queries/use-user-account"
import { useUserBalance } from "@/api/user/queries/use-user-balance"
import { useUnifiedTransactions } from "@/api/user/queries/use-unified-transactions"
import { useUIStore } from "@/stores/ui.store"
import { Header } from "@/components/home/Header"
import { BalanceCard } from "@/components/home/BalanceCard"
import { QuickActions } from "@/components/home/QuickActions"
import { RecentActivity } from "@/components/home/RecentActivity"
import { BottomNavigation } from "@/components/navigation/BottomNavigation"
import { HomeScreenSkeleton } from "@/components/skeletons/HomeScreenSkeleton"

export function HomeScreen() {
  const navigate = useNavigate()
  const { isBalanceVisible, toggleBalanceVisibility } = useUIStore()

  // Fetch user data
  const { data: account, isLoading: accountLoading } = useUserAccount()
  const { data: balance, isLoading: balanceLoading } = useUserBalance()
  const { data: transactions, isLoading: transactionsLoading } = useUnifiedTransactions({
    limit: 10,
  })

  // Navigation handlers
  const handleAvatarPress = () => {
    navigate("/profile")
  }

  const handleNotificationPress = () => {
    navigate("/notifications")
  }

  const handleDepositPress = () => {
    navigate("/deposit")
  }

  const handleWithdrawPress = () => {
    navigate("/withdraw")
  }

  const handleReferPress = () => {
    navigate("/refer")
  }

  const handleViewAllTransactions = () => {
    navigate("/transactions")
  }

  const handleTransactionPress = (id: string) => {
    navigate(`/transactions/${id}`)
  }

  // Loading state or error state - show skeleton
  if (accountLoading || balanceLoading || transactionsLoading || !account || !balance || !transactions) {
    return <HomeScreenSkeleton />
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      {/* Header */}
      <Header
        userName={account.name}
        notificationCount={0} // TODO: Implement notifications count
        onAvatarPress={handleAvatarPress}
        onNotificationPress={handleNotificationPress}
      />

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        {/* Balance Card */}
        <BalanceCard
          totalBalance={balance.totalUSD}
          percentChange={balance.monthlyYieldPercentage}
          period="month"
          isBalanceVisible={isBalanceVisible}
          onToggleVisibility={toggleBalanceVisibility}
        />

        {/* Quick Actions */}
        <QuickActions
          onDepositPress={handleDepositPress}
          onWithdrawPress={handleWithdrawPress}
          onReferPress={handleReferPress}
        />

        {/* Recent Activity */}
        <RecentActivity
          transactions={transactions.transactions}
          maxItems={4}
          onViewAll={handleViewAllTransactions}
          onTransactionPress={handleTransactionPress}
          isBalanceVisible={isBalanceVisible}
        />
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}
