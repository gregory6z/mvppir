/**
 * Design System for MVPPIR PWA
 *
 * Based on:
 * - iOS Human Interface Guidelines
 * - Material Design 3
 * - Mobile UX Best Practices 2025
 */

/**
 * SPACING SYSTEM (8pt Grid)
 * Uses multiples of 8 for consistent spacing
 */
export const spacing = {
  /** 4px - Extra small spacing */
  xs: 4,
  /** 8px - Small spacing */
  sm: 8,
  /** 12px - Small-medium spacing */
  smd: 12,
  /** 16px - Medium spacing (default for screen edges) */
  md: 16,
  /** 20px - Medium-large spacing */
  mlg: 20,
  /** 24px - Large spacing */
  lg: 24,
  /** 32px - Extra large spacing */
  xl: 32,
  /** 40px - 2X large spacing */
  "2xl": 40,
  /** 48px - 3X large spacing */
  "3xl": 48,
  /** 64px - 4X large spacing */
  "4xl": 64,
} as const

/**
 * TOUCH TARGET SIZES
 * Minimum tappable areas for accessibility
 */
export const touchTarget = {
  /** Minimum touch target (Apple HIG) */
  min: 44,
  /** Recommended touch target (Material Design) */
  recommended: 48,
  /** Icon size within touch target */
  icon: 24,
} as const

/**
 * FORM SPACING
 * Specific spacing for form elements
 */
export const formSpacing = {
  /** Vertical spacing between form fields */
  fieldGap: spacing.lg, // 24px
  /** Spacing between label and input */
  labelToInput: spacing.sm, // 8px
  /** Spacing between input and error message */
  inputToError: spacing.xs, // 4px
  /** Spacing between form sections */
  sectionGap: spacing.xl, // 32px
} as const

/**
 * SCREEN PADDING
 * Default padding for screens
 */
export const screenPadding = {
  /** Horizontal padding for screens */
  horizontal: spacing.lg, // 24px
  /** Vertical padding for screens */
  vertical: spacing.mlg, // 20px
  /** Minimum distance from screen edges (safe area) */
  safeArea: spacing.md, // 16px
} as const
