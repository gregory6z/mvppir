# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the frontend of the mvppir project.

## How to Use This Document

This is a **living document** that defines conventions, patterns, and critical knowledge for working on the frontend application. Claude Code automatically loads this file into context at the start of every session.

**What's in here:**
- Development workflow and best practices
- Next.js 16 + React 19 patterns and conventions
- Tailwind v4 configuration and usage
- Component architecture and routing
- Code style conventions (Biome)
- Security rules and common gotchas

**Quick Navigation:**
- New to frontend? Read: [Project Overview](#project-overview), [Development Workflow](#development-workflow), [Architecture](#architecture)
- Starting a task? Review: [Key Patterns](#key-patterns), [Important Rules (Do NOT)](#important-rules-do-not)
- Debugging? Check: [Common Gotchas](#common-gotchas)

**Updating this file:**
- Press `#` key in Claude Code to add instructions automatically
- Keep it concise - only include what Claude needs to know to do the work
- Commit changes to Git (this is the single source of truth for the team)

**What to include/exclude:**
- ✅ Include: UI/UX patterns, component conventions, routing rules, gotchas
- ✅ Include: Next.js-specific behaviors, Tailwind v4 patterns, accessibility requirements
- ❌ Exclude: Complete component API docs (link to shadcn/ui instead)
- ❌ Exclude: Exhaustive prop definitions (refer to component code)
- ❌ Exclude: Implementation details already clear in code

**Rule of thumb:** If it's not essential for Claude to complete tasks correctly, it doesn't belong here. Brevity saves context space for actual code.

## Project Overview

This is the **frontend application** of mvppir, a Next.js-based admin dashboard and landing page for managing cryptocurrency deposits, withdrawals, and MLM operations.

**Tech Stack:**
- **Framework:** Next.js 16.0.0 (App Router with Turbopack)
- **UI Framework:** React 19.0.0
- **Styling:** Tailwind CSS v4.1.16
- **Components:** shadcn/ui (to be installed)
- **State Management:** TanStack Query (React Query) v5.90.5
- **Form Handling:** React Hook Form v7.65.0 + Zod validation
- **Linter/Formatter:** Biome v1.9.4
- **Icons:** Lucide React
- **TypeScript:** v5 (strict mode)

## Development Workflow

When working on this frontend, follow this systematic approach:

1. **Analysis Phase**
   - First, think about the UI/UX requirements from PRD
   - Check API endpoints documentation (`docs/API-ENDPOINTS.md`)
   - Review existing components and patterns
   - Identify reusable shadcn/ui components
   - Review related documentation and design mockups

2. **Planning**
   - Create a mental plan with clear component breakdown
   - Track tasks using TodoWrite for complex multi-step UI work
   - Break down UI into components (atomic design)
   - Plan routing structure (App Router)
   - Define data fetching strategy (server components vs React Query)
   - Consider mobile-first responsive design
   - Identify potential accessibility challenges

3. **Validation**
   - Before starting significant UI changes, contact the user to validate approach
   - Discuss component architecture decisions that impact multiple pages
   - Confirm breaking changes to existing UI patterns
   - Validate design decisions with user when unclear

4. **Implementation**
   - Work on components systematically, one at a time
   - Mark tasks as completed in TodoWrite as progress is made
   - Use shadcn/ui components as foundation
   - Follow Tailwind v4 @theme conventions
   - Implement React Query for client-side server state
   - Use React Hook Form + Zod for complex forms
   - Keep components small and focused
   - Follow existing code patterns and conventions

5. **Documentation**
   - At each step, provide detailed explanations of UI changes made
   - Document reasoning behind component architecture decisions
   - Update relevant documentation (CLAUDE.md, component README, etc.)
   - Add JSDoc comments for complex component props or logic
   - Document accessibility features and keyboard interactions

6. **Simplicity**
   - Make each component and code change as simple as possible
   - Avoid massive or complex components - break them down
   - Each change should impact the codebase minimally
   - Prefer incremental improvements over rewrites
   - Prefer server components (default in App Router)
   - Only use 'use client' when necessary (interactivity, hooks)
   - Keep component hierarchy shallow
   - Avoid premature abstraction
   - **Everything comes down to simplicity**

7. **Review**
   - Provide comprehensive summary of UI changes made
   - Highlight any relevant accessibility or UX considerations
   - Verify TypeScript types and Biome checks pass
   - Test in browser (localhost:3000)
   - Verify responsive design (mobile, tablet, desktop)
   - Check accessibility (a11y) - keyboard navigation, screen readers
   - Ensure components are well-documented

## Development Commands

```bash
# Development with Turbopack (ultra-fast)
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start

# Linting with Biome
pnpm lint
pnpm lint:fix

# Formatting
pnpm format

# Type checking
pnpm type-check

# Clean build artifacts
pnpm clean
```

## Architecture

### App Router Structure

```
src/app/
├── (admin)/              # Admin dashboard (protected routes)
│   ├── layout.tsx        # Admin layout with sidebar
│   ├── dashboard/        # Dashboard home
│   ├── global-wallet/    # Global Wallet management
│   ├── batch-collect/    # Batch collect operations
│   ├── matic/            # MATIC monitoring
│   └── withdrawals/      # Withdrawal management
├── (landing)/            # Public landing page
│   ├── layout.tsx        # Landing layout
│   └── page.tsx          # Homepage
├── login/                # Admin login page
├── layout.tsx            # Root layout
├── globals.css           # Global styles (Tailwind v4)
└── not-found.tsx         # 404 page
```

### Component Structure

```
src/components/
├── ui/                   # shadcn/ui components (auto-generated)
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   └── ...
├── layout/               # Layout components
│   ├── header.tsx
│   ├── sidebar.tsx
│   └── footer.tsx
├── dashboard/            # Dashboard-specific components
│   ├── wallet-balance-card.tsx
│   ├── matic-status-widget.tsx
│   └── ...
└── landing/              # Landing page components
    ├── hero.tsx
    └── features.tsx
```

### Lib Structure

```
src/lib/
├── api/                  # API client (fetch wrapper + React Query)
│   ├── client.ts         # Base fetch client
│   ├── queries.ts        # React Query hooks
│   └── mutations.ts      # React Query mutations
├── utils.ts              # Utility functions (cn, etc)
└── constants.ts          # App-wide constants
```

## Key Patterns

### 1. Server Components by Default

Next.js 16 App Router uses **server components by default**. Only add `'use client'` when you need:
- Event handlers (onClick, onChange, etc)
- React hooks (useState, useEffect, etc)
- Browser APIs (localStorage, window, etc)

```tsx
// ✅ Server Component (default)
export default async function DashboardPage() {
  const data = await fetch('http://localhost:3333/admin/global-wallet/balance')
  return <div>{/* render */}</div>
}

// ✅ Client Component (only when needed)
'use client'

export function InteractiveButton() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

### 2. Data Fetching with React Query

Use React Query for client-side data fetching (polling, mutations, cache management):

```tsx
'use client'

import { useQuery } from '@tanstack/react-query'

export function MaticStatusWidget() {
  const { data, isLoading } = useQuery({
    queryKey: ['matic-status'],
    queryFn: async () => {
      const res = await fetch('http://localhost:3333/admin/matic/status')
      return res.json()
    },
    refetchInterval: 30000, // Poll every 30s
  })

  if (isLoading) return <Skeleton />
  return <MaticCard status={data.status} balance={data.balance} />
}
```

### 3. Forms with React Hook Form + Zod

```tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  amount: z.string().min(1),
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
})

export function WithdrawalForm() {
  const { register, handleSubmit } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = (data) => {
    // Handle form submission
  }

  return <form onSubmit={handleSubmit(onSubmit)}>{/* fields */}</form>
}
```

### 4. Styling with Tailwind v4

Use the new `@theme` variables and custom utilities:

```tsx
export function GradientText({ children }) {
  return <h1 className="text-gradient text-4xl font-bold">{children}</h1>
}

// Dark mode
export function Card() {
  return <div className="bg-white dark:bg-gray-950">{/* content */}</div>
}

// Custom colors from @theme
export function PrimaryButton() {
  return <button className="bg-[--color-primary] text-white">{/* ... */}</button>
}
```

## Tailwind v4 Configuration

Configuration is now in **CSS** (`src/app/globals.css`), not `tailwind.config.ts`:

```css
@import "tailwindcss";
@import "tw-animate-css";

@source "../../**/*.{js,ts,jsx,tsx}";

@theme {
  /* Custom theme variables */
  --color-primary: #3b82f6;
  --color-accent: #8b5cf6;
}

@utility text-gradient {
  background: linear-gradient(to right, theme("colors.primary"), theme("colors.accent"));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

## shadcn/ui Integration

Install components as needed:

```bash
# Initialize shadcn/ui (if not done)
npx shadcn@latest init

# Add components
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add table
```

Components are added to `src/components/ui/` and can be customized.

## Routing

### Protected Routes (Admin)

Use middleware or layout-level auth checks:

```tsx
// src/app/(admin)/layout.tsx
export default async function AdminLayout({ children }) {
  const session = await getSession() // Better Auth

  if (!session || session.role !== 'admin') {
    redirect('/login')
  }

  return <AdminSidebar>{children}</AdminSidebar>
}
```

### Route Groups

- `(admin)` - Admin dashboard (protected)
- `(landing)` - Public landing page
- No prefix in URL (parentheses = route group)

## API Integration

Base URL: `http://localhost:3333` (backend server)

**Important:** Use environment variables for API URL:

```typescript
// .env.local
NEXT_PUBLIC_API_URL=http://localhost:3333

// src/lib/api/client.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'
```

## Code Style Conventions (Biome)

1. **No semicolons** (Biome default)
2. **Double quotes** for strings
3. **2 spaces** indentation
4. **100 characters** line width
5. **Import type** for TypeScript types
6. **Arrow functions** for components

```tsx
// ✅ Good
import type { User } from "./types"

export const UserCard = ({ user }: { user: User }) => {
  return <div className="p-4">{user.name}</div>
}

// ❌ Bad
import { User } from "./types"; // semicolon

export function UserCard(props: { user: User }) { // function declaration
  return <div className='p-4'>{props.user.name}</div>; // single quotes, semicolon
}
```

## Important Rules (Do NOT)

**NEVER do these things in this codebase:**

1. **DO NOT use `any` type** - Always use proper TypeScript types or `unknown` with type guards
2. **DO NOT fetch in client components without React Query** - Use server components or React Query
3. **DO NOT hardcode API URLs** - Use environment variables (`NEXT_PUBLIC_API_URL`)
4. **DO NOT use `'use client'` unnecessarily** - Server components are faster and better for SEO
5. **DO NOT install Prettier or ESLint** - We use Biome for linting and formatting
6. **DO NOT create `tailwind.config.ts`** - Config is in CSS (globals.css) for Tailwind v4
7. **DO NOT use inline styles** - Use Tailwind classes exclusively
8. **DO NOT commit `.env.local`** - Use `.env.example` for templates
9. **DO NOT use deprecated Next.js APIs** - Check Next.js 16 docs for current patterns
10. **DO NOT skip loading/error states** - Always handle loading, error, and empty states

**Additional Security & Quality Rules:**

- **DO NOT expose sensitive data** in client components (API keys, secrets, tokens)
- **DO NOT trust user input** - Always validate with Zod before sending to backend
- **DO NOT use dangerouslySetInnerHTML** - Sanitize HTML or avoid it entirely
- **DO NOT skip CSRF protection** - Better Auth handles this, don't disable it
- **DO NOT store sensitive data** in localStorage/sessionStorage (use HTTP-only cookies)
- **DO NOT disable TypeScript strict mode** - All files must pass strict type checking
- **DO NOT skip accessibility** - Every interactive element needs keyboard support
- **DO NOT use <img> tags** - Always use next/image for optimization
- **DO NOT create massive components** - Break down into smaller, focused components
- **DO NOT mix server and client logic** - Respect the server/client boundary

## Performance Best Practices

1. **Use Server Components** - Default, faster, SEO-friendly
2. **Lazy load client components** - `next/dynamic` for heavy components
3. **Optimize images** - `next/image` with proper sizes
4. **Code splitting** - Route-based automatic splitting
5. **React Query caching** - Configure staleTime appropriately
6. **Avoid unnecessary re-renders** - Use React.memo sparingly, prefer composition

## Accessibility (a11y)

1. **Semantic HTML** - Use proper tags (`<button>`, `<nav>`, `<main>`)
2. **Keyboard navigation** - All interactive elements accessible via keyboard
3. **ARIA labels** - Use when semantic HTML isn't enough
4. **Color contrast** - Follow WCAG AA standards (Biome checks this)
5. **Focus indicators** - Visible focus states for all interactive elements

## Common Gotchas

1. **Hydration errors** - Ensure server/client HTML matches (no `window` in server components)
2. **'use client' boundary** - Client components can't import server components
3. **Async components** - Only server components can be async
4. **Metadata** - Use `generateMetadata` in server components, not client
5. **Environment variables** - Prefix with `NEXT_PUBLIC_` for client-side access
6. **React Query with Server Components** - Don't use React Query in server components (use native fetch)
7. **Form actions** - Server Actions must be in separate files or use 'use server' directive
8. **Dynamic imports** - Use next/dynamic for client components to reduce bundle size
9. **Image optimization** - Always use next/image, never <img> tag
10. **Route handlers** - Don't confuse with API routes (different in App Router)

## Roadmap Context

### MVP v1.0 (Frontend - In Progress)
- ⏳ Landing page with Launch UI design
- ⏳ Admin login page (Better Auth integration)
- ⏳ Admin dashboard layout with sidebar
- ⏳ shadcn/ui component library setup

### MVP v2.0 (Admin Dashboard Features)
- ⏳ Global Wallet balance display
- ⏳ Batch collect operations UI
- ⏳ MATIC monitoring dashboard
- ⏳ Withdrawal management interface
- ⏳ User management (view, block, activate)
- ⏳ Transaction history table with filters

### MVP v3.0+ (Future)
- MLM dashboard (commissions, referrals, genealogy tree)
- User-facing deposit/withdrawal portal
- Multi-language support (i18n)
- Mobile app (React Native)

## Testing Strategy

The frontend uses **manual browser testing** during development. Future automated testing will be added.

**Current Testing Approach:**

1. **Browser Testing** (Primary)
   - Test in Chrome DevTools (localhost:3000)
   - Verify responsive design using device emulation
   - Test in Firefox and Safari for cross-browser compatibility
   - Use Lighthouse for performance and accessibility audits

2. **TypeScript Validation**
   - Run `pnpm type-check` before commits
   - Ensure no TypeScript errors in components

3. **Biome Linting**
   - Run `pnpm lint` to catch common issues
   - Run `pnpm lint:fix` to auto-fix formatting

4. **Accessibility Testing**
   - Use browser accessibility inspector (Chrome DevTools)
   - Test keyboard navigation (Tab, Enter, Escape)
   - Use screen reader (macOS VoiceOver) for critical flows
   - Check color contrast with Biome's a11y rules

**Future Testing (v3.0+):**
- Vitest for component unit tests
- Playwright for E2E testing
- Visual regression testing with Percy or Chromatic

**When Testing Components:**
- Always test loading states
- Always test error states
- Verify form validation works
- Test responsive breakpoints (mobile, tablet, desktop)
- Ensure keyboard accessibility
- Check dark mode appearance

## Design System (Launch UI Inspired)

**Color Palette:**
- Primary: `#3b82f6` (Blue)
- Accent: `#8b5cf6` (Purple)
- Success: `#10b981` (Green)
- Warning: `#f59e0b` (Orange)
- Danger: `#ef4444` (Red)

**Typography:**
- Headings: Bold, large sizes (text-4xl, text-3xl, text-2xl)
- Body: Regular, readable (text-base, text-sm)
- Code: Monospace font

**Spacing:**
- Consistent spacing scale (4, 8, 16, 24, 32px)
- Generous whitespace for readability

**Effects:**
- Glowing effects (`--shadow-glow`)
- Smooth transitions (tw-animate-css)
- Gradient text for emphasis

## Key Files Reference

**Core App:**
- `src/app/layout.tsx` - Root layout (fonts, providers)
- `src/app/globals.css` - Global styles + Tailwind config
- `src/lib/api/client.ts` - API client wrapper
- `src/lib/utils.ts` - Utility functions (cn, etc)

**Configuration:**
- `next.config.ts` - Next.js configuration
- `biome.json` - Linter/formatter config
- `postcss.config.mjs` - PostCSS + Tailwind v4
- `tsconfig.json` - TypeScript configuration

**Documentation:**
- `docs/API-ENDPOINTS.md` - Backend API reference
- `docs/PRD-ADMIN-v1.md` - Product requirements
- `docs/FOLDER-STRUCTURE.md` - Folder organization

## Related Backend

- **Backend URL:** http://localhost:3333
- **Backend CLAUDE.md:** `/Users/gregoryrag/mvppir/apps/server/CLAUDE.md`
- **Backend Routes:** See `apps/server/src/app.ts`
- **API Documentation:** `docs/API-ENDPOINTS.md`

## Related Documentation

- **API Endpoints:** `docs/API-ENDPOINTS.md` - Complete backend API reference
- **Product Requirements:** `docs/PRD-ADMIN-v1.md` - Admin dashboard features
- **Backend Architecture:** `apps/server/CLAUDE.md` - Server-side patterns and conventions
- **Monorepo Guide:** `/CLAUDE.md` - Workspace commands and deployment

---

**Last Updated:** 2025-10-26
**Stack Version:** Next.js 16, Tailwind v4, Biome, React 19
**Claude Code Version:** Optimized for claude-sonnet-4-5
