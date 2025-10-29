# PRD - Home Screen v1.0

**Project:** Stakly Mobile App
**Feature:** Home Screen (Modern Banking Experience)
**Version:** 1.0
**Status:** Draft
**Last Updated:** 2025-10-27
**Author:** Product Team

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [User Stories](#user-stories)
3. [UI/UX Design](#uiux-design)
4. [Component Breakdown](#component-breakdown)
5. [Business Rules](#business-rules)
6. [Technical Requirements](#technical-requirements)
7. [Navigation Flow](#navigation-flow)
8. [API Integration](#api-integration)
9. [Accessibility](#accessibility)
10. [Future Enhancements](#future-enhancements)

---

## Overview

### Purpose
The Home Screen is the **balance-focused entry point** of the Stakly mobile app. Following modern banking app patterns (Nubank, Revolut, Cash App), the Home displays a **single, prominent total balance in USD** without dividing by individual tokens. This creates a clean, minimalist experience that prioritizes the most important information: "How much money do I have?"

### Design Philosophy
**Simplicity Above All:**
- **ONE big number** - Total balance in USD
- **THREE quick actions** - Deposit, Withdraw, Refer
- **PREVIEW of activity** - Last 3-5 transactions
- **Tab Bar navigation** - Horizontal tabs (iOS style) to separate features

Other details (transaction history, MLM stats, token breakdown) live in their dedicated tabs.

### Goals
- Display total balance in USD (sum of all tokens converted)
- Provide quick access to essential actions
- Show recent activity preview
- Enable horizontal Tab Bar navigation to other sections

### Tab Bar Architecture (Horizontal Tabs)

The app uses a **horizontal Tab Bar** at the bottom (iOS style) with **4 main tabs**, each focused on a specific purpose:

| Tab | Icon | Purpose | Main Content |
|-----|------|---------|--------------|
| 🏠 **Home** | `House` | **Balance focus** | Total USD balance, Quick actions, Recent activity preview (3-5 items) |
| 💰 **Wallet** | `Wallet` | **Transactions** | Full transaction history, Filters, Search, Token breakdown |
| 👥 **Referrals** | `Users` | **MLM Dashboard** | Total earned, Active referrals, Commission history, Referral tree |
| 👤 **Profile** | `UserCircle` | **Settings** | Account info, Security, Notifications, Language, Support |

**Key Principle:** Each tab handles ONE main responsibility. Home = Balance.

### Target Users
- Active users who have completed registration and made deposits
- Users checking their balance frequently
- Users performing deposits/withdrawals
- Users tracking MLM earnings (via Referrals tab)

### Success Metrics
- **Balance check frequency** - How often users open the app to check balance
- **Quick action usage** - CTR on Deposit/Withdraw/Refer buttons
- **Tab engagement** - Distribution of time across tabs
- **Session duration** - Average time spent on Home vs other tabs

---

## User Stories

### Epic: Dashboard Overview

**US-01: View Total Balance**
```
AS A user
I WANT TO see my total balance in USD across all tokens
SO THAT I can quickly understand my financial position
```

**Acceptance Criteria:**
- Display total balance in large, prominent typography
- Show balance in USD (converted from all tokens)
- Include "hide/show balance" toggle for privacy
- Update balance in real-time when transactions occur

---

**US-02: View Recent Activity Preview**
```
AS A user
I WANT TO see my recent transaction history
SO THAT I can track my financial activity
```

**Acceptance Criteria:**
- Display last 3-5 transactions as preview
- Show transaction type (deposit, withdrawal)
- Include amount, date, and status (pending, confirmed)
- Provide "View All in Wallet Tab" link
- **Note:** Full history with filters lives in Wallet tab

---

**US-03: Quick Actions**
```
AS A user
I WANT TO access deposit, withdraw, and referral features quickly
SO THAT I can perform common tasks efficiently
```

**Acceptance Criteria:**
- Display 3 primary action buttons (Deposit, Withdraw, Refer)
- Use clear icons and labels
- Buttons should be easily tappable (min 44pt touch target)
- Navigate to respective screens on tap

---

### Epic: Header & Notifications

**US-04: Header with Avatar and Notifications**
```
AS A user
I WANT TO see my profile avatar and notification bell in the header
SO THAT I can access my profile and stay updated on important events
```

**Acceptance Criteria:**
- Display user avatar (or initials fallback) on the left
- Show greeting with user name ("Hello, João")
- Display bell icon on the right
- Show badge count on bell if unread notifications exist
- Tap avatar to navigate to Profile tab
- Tap bell to open notifications screen

---

### Epic: Tab Bar Navigation

**US-05: Horizontal Tab Bar**
```
AS A user
I WANT TO navigate between main app sections using a horizontal tab bar
SO THAT I can quickly switch between balance, transactions, referrals, and settings
```

**Acceptance Criteria:**
- Display 4 tabs horizontally: Home, Wallet, Referrals, Profile
- Highlight active tab with accent color (`#8b5cf6`)
- Use phosphor icons (House, Wallet, Users, UserCircle)
- Show labels below icons
- Support i18n for all labels
- iOS-style Tab Bar (tabs side by side, not vertically)

---

## UI/UX Design

### Screen Layout (Mobile-First - Simplified)

```
┌───────────────────────────────────────┐
│  Header (60px)                        │
│  [👤] Hello, João           [🔔]     │
├───────────────────────────────────────┤
│  Content (Scrollable)                 │
│                                       │
│  ┌─────────────────────────────────┐ │
│  │   Total Balance            [👁]  │ │
│  │                                  │ │
│  │        $1,234.56                 │ │  ← BIG NUMBER
│  │          USD                     │ │
│  │                                  │ │
│  │   ▲ +12.5% this month           │ │
│  └─────────────────────────────────┘ │
│                                       │
│  ┌─────────────────────────────────┐ │
│  │      Quick Actions              │ │
│  │  ┌─────────┐ ┌─────────┐       │ │
│  │  │    ↓    │ │    ↑    │       │ │
│  │  │ Deposit │ │Withdraw │       │ │
│  │  └─────────┘ └─────────┘       │ │
│  │  ┌─────────────────────┐       │ │
│  │  │        👥           │       │ │
│  │  │   Refer Friends     │       │ │
│  │  └─────────────────────┘       │ │
│  └─────────────────────────────────┘ │
│                                       │
│  ┌─────────────────────────────────┐ │
│  │  Recent Activity                │ │
│  │  ┌─────────────────────────────┐│ │
│  │  │ ↓ Deposit                   ││ │
│  │  │ +$100.00 · Today 14:23      ││ │
│  │  │ ✓ Confirmed                 ││ │
│  │  └─────────────────────────────┘│ │
│  │  ┌─────────────────────────────┐│ │
│  │  │ ↑ Withdrawal                ││ │
│  │  │ -$50.00 · Yesterday         ││ │
│  │  │ ⏳ Pending                  ││ │
│  │  └─────────────────────────────┘│ │
│  │  ┌─────────────────────────────┐│ │
│  │  │ ↓ Deposit                   ││ │
│  │  │ +$200.00 · 2 days ago       ││ │
│  │  │ ✓ Confirmed                 ││ │
│  │  └─────────────────────────────┘│ │
│  │                                  │ │
│  │  [View All in Wallet Tab →]     │ │
│  └─────────────────────────────────┘ │
│                                       │
├───────────────────────────────────────┤
│  Tab Bar (70px) - Horizontal         │
│  [🏠]  [💰]  [👥]  [👤]             │
│  Home  Wallet Refer Profile          │
│   ●                                   │  ← Active indicator
└───────────────────────────────────────┘
```

**Key Changes:**
- ❌ **Removed "My Assets"** - No USDC/USDT/MATIC breakdown (goes to Wallet tab)
- ❌ **Removed "MLM Performance"** - No commission stats (goes to Referrals tab)
- ✅ **Focus on ONE big balance** in USD
- ✅ **Preview of 3 recent transactions** (link to Wallet tab for full history)
- ✅ **Horizontal Tab Bar** at bottom (iOS style)

### Design Tokens (Stakly Theme)

**Colors (matching Web Admin):**
- **Accent/Primary:** `#8b5cf6` (Purple-500) - Main brand color
- **Accent Hover:** `#7c3aed` (Purple-600) - Active states
- **Background:** `#09090b` (Zinc-950) - App background
- **Card Background:** `#18181b` (Zinc-900) - Card/section backgrounds
- **Border:** `#27272a` (Zinc-800) - Subtle borders
- **Text Primary:** `#ffffff` (White) - Main text
- **Text Secondary:** `#a1a1aa` (Zinc-400) - Secondary text
- **Text Muted:** `#71717a` (Zinc-500) - Tertiary text
- **Success:** `#10b981` (Green-500) - Positive changes
- **Warning:** `#f59e0b` (Orange-500) - Warnings
- **Danger:** `#ef4444` (Red-500) - Errors/negative changes

**Typography:**
- Display (Balance): 32-40px, Bold
- Heading: 20-24px, Semibold
- Body: 14-16px, Regular
- Caption: 12-14px, Regular

**Spacing:**
- Screen Padding: 16px horizontal
- Section Gap: 24px
- Card Padding: 16px
- Component Gap: 12px

**Shadows:**
- Card: `0 4px 12px rgba(0, 0, 0, 0.5)`
- Button: `0 2px 8px rgba(59, 130, 246, 0.3)`

---

## Component Breakdown

### 1. Header Component

**File:** `src/components/home/Header.tsx`

**Props:**
```typescript
interface HeaderProps {
  userName: string;
  avatarUrl?: string;
  notificationCount: number;
  onAvatarPress: () => void;
  onNotificationPress: () => void;
}
```

**Features:**
- User avatar (or initials fallback in colored circle)
- Greeting with user name ("Hello, João")
- Notification bell icon (`Bell` from `phosphor-react-native`)
- Badge count on bell if `notificationCount > 0`
- Safe area handling (iOS notch) using `useSafeAreaInsets()`
- Time-based greeting (Good morning, Good afternoon, Good evening)

---

### 2. BalanceCard Component

**File:** `src/components/home/BalanceCard.tsx`

**Props:**
```typescript
interface BalanceCardProps {
  totalBalance: number; // USD from API
  percentChange: number; // -100 to +100 (calculated client-side)
  period: "day" | "week" | "month"; // User selectable
  isBalanceVisible: boolean;
  onToggleVisibility: () => void;
}
```

**Features:**
- Large balance display ($1,234.56 USD)
- Eye icon (`Eye` / `EyeSlash` from phosphor) to hide/show balance
- When hidden, show "****" instead of amount
- Percentage change indicator:
  - Green (`#10b981`) with `▲` if positive
  - Red (`#ef4444`) with `▼` if negative
  - Gray if zero
- Animated number transitions using `react-native-reanimated`
- Card background: Zinc-900 (`#18181b`)

---

### 3. QuickActions Component

**File:** `src/components/home/QuickActions.tsx`

**Props:**
```typescript
import { IconProps } from "phosphor-react-native"

interface Action {
  id: "deposit" | "withdraw" | "refer";
  label: string;
  icon: React.ComponentType<IconProps>; // From phosphor-react-native
  onPress: () => void;
}

interface QuickActionsProps {
  actions: Action[];
}
```

**Features:**
- 3 primary action buttons
- Phosphor icons (e.g., `ArrowDown`, `ArrowUp`, `UserPlus`)
- Icon + label layout
- Ripple effect on press (Android)
- Scale animation on press (iOS)

**Example Icons:**
```tsx
import { ArrowDown, ArrowUp, UserPlus } from "phosphor-react-native"

const actions = [
  { id: "deposit", icon: ArrowDown, label: "Deposit" },
  { id: "withdraw", icon: ArrowUp, label: "Withdraw" },
  { id: "refer", icon: UserPlus, label: "Refer Friends" },
]
```

---

### 4. RecentActivity Component

**File:** `src/components/home/RecentActivity.tsx`

**Props:**
```typescript
interface Transaction {
  id: string;
  type: "DEPOSIT" | "WITHDRAWAL"; // From API (no COMMISSION type yet)
  tokenSymbol: string;
  tokenAddress: string | null;
  amount: string; // Decimal as string
  txHash: string | null;
  transferTxHash: string | null;
  status: "PENDING" | "CONFIRMED" | "SENT_TO_GLOBAL";
  createdAt: string; // ISO 8601 date string
}

interface RecentActivityProps {
  transactions: Transaction[];
  maxItems?: number; // Default: 3, Max: 5
  onViewAll: () => void;
  onTransactionPress: (id: string) => void;
}
```

**Features:**
- **Preview only** - Shows last 3-5 transactions
- FlatList with limited items (not full history)
- Phosphor icon based on type:
  - `ArrowDown` (DEPOSIT)
  - `ArrowUp` (WITHDRAWAL)
  - `Star` (COMMISSION - future)
- Status badge with colors:
  - PENDING: Orange (`#f59e0b`)
  - CONFIRMED: Green (`#10b981`)
  - SENT_TO_GLOBAL: Blue (`#8b5cf6`)
- Relative time formatting ("Today 14:23", "Yesterday", "2 days ago")
- **"View All in Wallet Tab →"** link (navigates to Wallet tab)
- Empty state: "No transactions yet"

**Note:** Full transaction history with filters, search, and pagination lives in the **Wallet tab**.

---

### 5. TabBar Component

**File:** `src/components/navigation/BottomNavigation.tsx`

**Props:**
```typescript
import { IconProps } from "phosphor-react-native"

interface NavItem {
  id: "home" | "wallet" | "referrals" | "profile";
  label: string;
  icon: React.ComponentType<IconProps>; // Regular weight
  activeIcon: React.ComponentType<IconProps>; // Fill/Duotone weight
}

interface BottomNavigationProps {
  activeScreen: string;
  items: NavItem[];
  onNavigate: (screen: string) => void;
}
```

**Features:**
- 4 navigation items
- Active state highlighting (accent color `#8b5cf6`)
- Icon + label layout
- Safe area bottom padding (iOS) using `useSafeAreaInsets()`
- Smooth weight transition (regular → fill when active)

**Example Icons:**
```tsx
import { House, Wallet, Users, UserCircle } from "phosphor-react-native"

const navItems = [
  { id: "home", icon: House, activeIcon: House, label: "Home" },
  { id: "wallet", icon: Wallet, activeIcon: Wallet, label: "Wallet" },
  { id: "referrals", icon: Users, activeIcon: Users, label: "Referrals" },
  { id: "profile", icon: UserCircle, activeIcon: UserCircle, label: "Profile" },
]
```

---

## Business Rules

### BR-01: Balance Visibility
- Default: Balance is visible
- Persisted: User preference saved in AsyncStorage
- Scope: Affects total balance and individual token balances

### BR-02: Balance Calculation
- Formula: `Total Balance = Σ(token_amount × token_usd_price)`
- Update Frequency: Real-time via WebSocket (if available) or polling every 30s
- Includes: Confirmed deposits only (status = CONFIRMED)
- Excludes: Pending withdrawals (locked balance)

### BR-03: Percent Change
- Formula: `((current - previous) / previous) × 100`
- Period: Last 24h, 7d, or 30d (user selectable)
- Color: Green if positive, Red if negative, Gray if zero

### BR-04: Transaction History Limits
- Home Screen: Last 5-10 transactions
- Types: Deposits, Withdrawals, Commissions
- Sorting: Newest first (descending timestamp)

### BR-05: Commission Calculation (MLM)
- Level 1 (Direct Referral): 10% of deposit
- Level 2 (Indirect Referral): 5% of deposit
- Level 3 (Indirect Referral): 2.5% of deposit
- Only from confirmed deposits ($100+ USD)

### BR-06: Quick Actions Availability
- **Deposit:** Always available for active users
- **Withdraw:** Requires available balance > minimum ($10 USD)
- **Refer:** Always available, generates unique referral link

---

## Technical Requirements

### Icon Library

**phosphor-react-native** will be used for all icons throughout the app.

**Installation:**
```bash
pnpm add phosphor-react-native
# Dependencies (already installed):
# react-native-svg
```

**Usage:**
```tsx
import { House, Bell, Wallet, ArrowDown, ArrowUp, Users } from "phosphor-react-native"

// Regular icon
<House size={24} color="#8b5cf6" />

// With weight
<House size={24} color="#8b5cf6" weight="duotone" />

// Available weights: thin, light, regular (default), bold, fill, duotone
```

**Key Icons for Home Screen:**
- Header: `Bell` (notifications), `UserCircle` (profile)
- Quick Actions: `ArrowDown` (deposit), `ArrowUp` (withdraw), `UserPlus` (refer)
- Transactions: `ArrowDown` (deposit), `ArrowUp` (withdrawal), `Star` (commission)
- Bottom Nav: `House`, `Wallet`, `Users`, `UserCircle`
- Balance Card: `Eye`, `EyeSlash` (hide/show balance)

---

### State Management

**Store:** `src/stores/home.store.ts`

```typescript
interface HomeState {
  // Balance
  totalBalance: number;
  balanceChangePercent: number;
  isBalanceVisible: boolean;

  // Assets
  assets: Asset[];

  // MLM
  mlmStats: {
    totalEarned: number;
    activeReferrals: number;
  };

  // Transactions
  recentTransactions: Transaction[];

  // UI
  isRefreshing: boolean;
  lastUpdated: Date;

  // Actions
  toggleBalanceVisibility: () => void;
  refreshData: () => Promise<void>;
}
```

### API Endpoints (Verified)

**GET /api/user/balance**
```typescript
// Response
{
  balances: [
    {
      tokenSymbol: "USDC",
      tokenAddress: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174" | null,
      available: "100.500000", // Decimal
      locked: "0.000000",      // Decimal
      total: "100.500000"      // Decimal (available + locked)
    }
  ],
  totalUSD: 100.50 // Number
}
```
- Auth: Required (Better Auth session)
- Cache: 30s
- Uses Balance table for O(1) performance

**GET /api/user/transactions**
```typescript
// Query params
?limit=50&offset=0

// Response
{
  transactions: [
    {
      id: "uuid",
      type: "DEPOSIT" | "WITHDRAWAL",
      tokenSymbol: "USDC",
      tokenAddress: "0x..." | null,
      amount: "100.500000", // Decimal
      txHash: "0x..." | null,
      transferTxHash: "0x..." | null,
      status: "PENDING" | "CONFIRMED" | "SENT_TO_GLOBAL",
      createdAt: "2025-10-27T14:23:00.000Z"
    }
  ],
  pagination: {
    total: 150,
    limit: 50,
    offset: 0,
    hasMore: true
  }
}
```
- Auth: Required
- Cache: 10s
- Default limit: 50, max: 100

**GET /api/user/mlm/stats** _(Future - v2.0)_
```typescript
// Response (planned)
{
  totalEarned: 456.78,
  activeReferrals: 12,
  recentCommissions: [...]
}
```
- Auth: Required
- Cache: 60s
- **Note:** MLM system not yet implemented on backend

**GET /api/user/profile** _(Future - v2.0)_
```typescript
// Response (planned)
{
  id: "uuid",
  name: "João Silva",
  email: "joao@example.com",
  avatarUrl: "https://...",
  status: "ACTIVE" | "INACTIVE" | "BLOCKED",
  role: "user"
}
```
- Auth: Required
- Cache: 5min
- **Note:** Endpoint to be created

### Real-Time Updates

**WebSocket Events:**
- `transaction:confirmed` - New transaction confirmed
- `commission:earned` - New commission received
- `balance:updated` - Balance changed

**Polling Fallback:**
- If WebSocket unavailable, poll every 30s
- Use exponential backoff on errors

### Performance Optimization

**Loading Strategy:**
- Skeleton screens for initial load
- Cached data shown first (stale-while-revalidate)
- Lazy load transaction details

**Images:**
- Token icons: Local assets (no network requests)
- User avatars: Cached with react-query

**Animations:**
- Use `react-native-reanimated` for smooth 60fps
- Avoid re-renders with `React.memo`

---

## Navigation Flow

### From Home Screen

```
Home Screen
  ├─> Deposit Screen (Quick Action)
  ├─> Withdraw Screen (Quick Action)
  ├─> Referral Screen (Quick Action)
  ├─> Profile Screen (Avatar tap)
  ├─> Notifications Screen (Bell icon)
  ├─> Transaction Details (Transaction tap)
  ├─> All Transactions (View All link)
  ├─> MLM Dashboard (View Details link)
  ├─> Wallet Screen (Bottom nav)
  └─> Referrals Screen (Bottom nav)
```

### Navigation Props

```typescript
// React Navigation Stack
type HomeStackParamList = {
  Home: undefined;
  TransactionDetails: { transactionId: string };
  AllTransactions: { type?: "deposit" | "withdrawal" | "commission" };
  MLMDashboard: undefined;
  Notifications: undefined;
};
```

---

## API Integration

### TanStack Query Hooks

**File:** `src/api/queries/use-home-data.ts`

```typescript
export function useHomeData() {
  return useQuery({
    queryKey: ["home", "dashboard"],
    queryFn: async () => {
      const [balance, transactions, mlmStats, profile] = await Promise.all([
        getUserBalance(),
        getUserTransactions({ limit: 10 }),
        getMLMStats(),
        getUserProfile(),
      ]);

      return { balance, transactions, mlmStats, profile };
    },
    staleTime: 30 * 1000, // 30s
    refetchInterval: 30 * 1000, // Auto-refresh every 30s
  });
}
```

**File:** `src/api/queries/use-balance.ts`

```typescript
export function useBalance() {
  return useQuery({
    queryKey: ["user", "balance"],
    queryFn: getUserBalance,
    staleTime: 30 * 1000,
  });
}
```

---

## Accessibility

### Screen Reader Support

- All interactive elements have `accessibilityLabel`
- Balance has `accessibilityHint`: "Double tap to hide balance"
- Transactions have semantic labels: "Deposit confirmed, $100, Today at 2:23 PM"

### Touch Targets

- Minimum size: 44pt × 44pt (iOS), 48dp × 48dp (Android)
- Spacing between tappable elements: 8pt minimum

### Color Contrast

- Text on background: WCAG AA compliant (4.5:1)
- Status indicators: Use icons + text (not color alone)

### Dynamic Type

- Support iOS Dynamic Type (up to accessibility sizes)
- Android: Scale with system font size

---

## Future Enhancements (v2.0+)

### Phase 2 Features

1. **Charts & Analytics**
   - Balance history chart (7d, 30d, 1y)
   - Commission earnings chart
   - Asset allocation pie chart

2. **Notifications Center**
   - In-app notification list
   - Push notification settings
   - Mark as read/unread

3. **Widgets (iOS/Android)**
   - Balance widget
   - Recent transactions widget
   - Commission earnings widget

4. **Customization**
   - Reorder quick actions
   - Hide/show sections (MLM, Assets)
   - Theme selection (light/dark/auto)

5. **Social Features**
   - Referral leaderboard on home
   - Share achievements (milestones)

6. **Advanced Filtering**
   - Filter transactions by type, date, status
   - Search transactions by hash, amount

---

## Design References

### Inspiration (Modern Banking Apps)

1. **Nubank** (Brazil)
   - Clean, minimalist design
   - Purple accent color
   - Large balance display
   - Card-based layout

2. **Revolut** (Europe)
   - Asset list with icons
   - Quick actions prominently displayed
   - Transaction categorization

3. **Cash App** (USA)
   - Simple, bold typography
   - One-tap quick actions
   - Balance visibility toggle

4. **Inter** (Brazil)
   - Bottom sheet for actions
   - Performance metrics
   - Commission tracking

### Mobile Design Patterns

- **Pull-to-refresh** for data updates
- **Skeleton screens** during loading
- **Empty states** with illustrations
- **Error states** with retry button
- **Haptic feedback** on important actions

---

## Internationalization (i18n)

### Translation Keys

**File:** `src/locales/{lang}/features/home.json`

```json
{
  "header": {
    "greeting": "Hello, {{name}}",
    "goodMorning": "Good morning",
    "goodAfternoon": "Good afternoon",
    "goodEvening": "Good evening"
  },
  "balance": {
    "total": "Total Balance",
    "hide": "Hide balance",
    "show": "Show balance",
    "change": "{{percent}}% this {{period}}"
  },
  "assets": {
    "title": "My Assets",
    "viewAll": "View all"
  },
  "quickActions": {
    "deposit": "Deposit",
    "withdraw": "Withdraw",
    "refer": "Refer Friends"
  },
  "mlm": {
    "title": "MLM Performance",
    "totalEarned": "Total Earned",
    "activeReferrals": "Active Referrals",
    "viewDetails": "View Details"
  },
  "recentActivity": {
    "title": "Recent Activity",
    "viewAll": "View All",
    "empty": "No transactions yet",
    "types": {
      "deposit": "Deposit",
      "withdrawal": "Withdrawal",
      "commission": "Commission"
    },
    "status": {
      "pending": "Pending",
      "confirmed": "Confirmed",
      "failed": "Failed"
    }
  },
  "bottomNav": {
    "home": "Home",
    "wallet": "Wallet",
    "referrals": "Referrals",
    "profile": "Profile"
  }
}
```

---

## Success Criteria

### MVP Launch Checklist

- [ ] Display total balance (USD)
- [ ] Show individual token balances (USDC, USDT, MATIC)
- [ ] List recent transactions (5-10)
- [ ] Display MLM performance metrics
- [ ] Implement quick actions (Deposit, Withdraw, Refer)
- [ ] Header with user avatar and notifications
- [ ] Bottom navigation (4 screens)
- [ ] Pull-to-refresh functionality
- [ ] Skeleton loading states
- [ ] Error handling with retry
- [ ] i18n support (PT, EN, ES, FR)
- [ ] TypeScript strict mode compliance
- [ ] Accessibility labels for screen readers
- [ ] Responsive layout (phones & tablets)

### Performance Targets

- Initial load: < 2s (3G connection)
- Balance update: < 500ms (after API response)
- Animation FPS: 60fps
- Memory usage: < 100MB (baseline)

---

## Open Questions

1. **Balance Refresh Frequency:** Should we use WebSocket for real-time updates or polling?
2. **Token Icons:** Store locally or fetch from CDN?
3. **Transaction Pagination:** Infinite scroll or "Load More" button?
4. **Empty State:** What should users see if they have zero balance and no transactions?
5. **Onboarding:** Should we show a tutorial overlay on first visit?

---

## Appendix

### Wireframes
- See Figma: [Link to Figma designs]

### API Documentation
- Swagger: `http://localhost:3333/docs`

### Related PRDs
- PRD-AUTH-v1.md (Authentication Flow)
- PRD-DEPOSIT-v1.md (Deposit Screen)
- PRD-WITHDRAWAL-v1.md (Withdrawal Screen)
- PRD-MLM-v1.md (MLM Dashboard)

---

## Implementation Notes (Verified 2025-10-27)

### ✅ Backend APIs Ready
- **GET /api/user/balance** - Returns balance with `available`, `locked`, and `total` per token
- **GET /api/user/transactions** - Returns paginated transactions with full details
- Both endpoints verified and documented above with exact TypeScript types

### ⏳ Backend APIs Needed (v2.0)
- **GET /api/user/profile** - User name, email, avatar, status
- **GET /api/user/mlm/stats** - Total earned commissions, active referrals
- **GET /api/notifications** - Notification list with unread count
- **WebSocket support** - Real-time balance and transaction updates

### 🎨 Design System Confirmed
- All colors match Web Admin exactly (verified from `apps/web/src/app/globals.css`)
- Accent: `#8b5cf6` (Purple-500)
- Background: Zinc-950, Cards: Zinc-900, Borders: Zinc-800
- Modern banking app aesthetic (not dashboard terminology)

### 📦 Icon Library
- **phosphor-react-native** confirmed to work with React Native
- Installation: `pnpm add phosphor-react-native`
- All icons documented in Technical Requirements section

### 🚀 MVP v1.0 Scope (Simplified)

**Home Screen Components:**
1. **Header** - Avatar + greeting + notification bell
2. **Balance Card** - ONE big USD total (no token breakdown)
3. **Quick Actions** - 3 buttons (Deposit, Withdraw, Refer)
4. **Recent Activity** - Preview of 3-5 transactions
5. **Tab Bar** - Horizontal tabs (Home, Wallet, Referrals, Profile)

**What's NOT on Home:**
- ❌ Individual token breakdown (USDC, USDT, MATIC) → Goes to **Wallet tab**
- ❌ MLM Performance metrics → Goes to **Referrals tab**
- ❌ Full transaction history → Goes to **Wallet tab**

**Home = Balance Focus Only**

---

**Document Status:** ✅ Complete - Ready for Development
**Backend:** ✅ APIs verified and documented
**Design:** ✅ Colors confirmed from Web Admin
**Icons:** ✅ phosphor-react-native selected
**Next Steps:** Install phosphor-react-native → Create components → Integrate APIs
