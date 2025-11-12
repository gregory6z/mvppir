import { useNavigate } from "react-router-dom"
import { useUserAccount } from "@/api/user/queries/use-user-account"
import { useUserBalance } from "@/api/user/queries/use-user-balance"
import { useUnifiedTransactions } from "@/api/user/queries/use-unified-transactions"
import { useUserStatus } from "@/api/user/queries/use-user-status"
import { useUIStore } from "@/stores/ui.store"
import { useCommissionAlert } from "@/hooks/useCommissionAlert"
import { Header } from "@/components/layout/Header"
import { BalanceCard } from "@/components/home/BalanceCard"
import { QuickActions } from "@/components/home/QuickActions"
import { RecentActivity } from "@/components/home/RecentActivity"
import { BottomNavigation } from "@/components/navigation/BottomNavigation"
import { HomeScreenSkeleton } from "@/components/skeletons/HomeScreenSkeleton"
import { InactiveAccountScreen } from "./InactiveAccountScreen"
import { CommissionDrawer } from "@/components/commission/CommissionDrawer"

export function HomeScreen() {
  const navigate = useNavigate()
  const { isBalanceVisible, toggleBalanceVisibility } = useUIStore()

  // Commission alert drawer
  const { isDrawerOpen, commissionData, closeDrawer } = useCommissionAlert()

  // Fetch user data
  const { data: account, isLoading: accountLoading } = useUserAccount()
  const { data: balance, isLoading: balanceLoading } = useUserBalance()
  const { data: transactions, isLoading: transactionsLoading } = useUnifiedTransactions({
    limit: 10,
  })
  const { data: status, isLoading: statusLoading } = useUserStatus()

  // Navigation handlers
  const handleAvatarPress = () => {
    navigate("/profile")
  }

  const handleNotificationPress = () => {
    console.log("=== Navegando para /notifications ===")
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
    navigate("/wallet")
  }

  const handleTransactionPress = (id: string) => {
    const transaction = transactions?.transactions.find(tx => tx.id === id)
    navigate(`/transactions/${id}`, { state: { transaction } })
  }

  // Loading state or error state - show skeleton
  if (accountLoading || balanceLoading || transactionsLoading || statusLoading || !account || !balance || !transactions || !status) {
    return <HomeScreenSkeleton />
  }

  // Show InactiveAccountScreen if user status is INACTIVE
  if (status.status === "INACTIVE") {
    return <InactiveAccountScreen />
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      {/* Header */}
      <Header
        userName={account.name}
        
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

      {/* Commission Alert Drawer */}
      <CommissionDrawer
        isOpen={isDrawerOpen}
        data={commissionData}
        onClose={closeDrawer}
      />
    </div>
  )
}
