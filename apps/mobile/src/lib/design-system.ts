/**
 * Design System for MVPPIR Mobile App
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

/**
 * TYPOGRAPHY SIZES
 * Font sizes following accessibility guidelines (minimum 16px for body)
 */
export const typography = {
  /** Extra small text (captions, hints) */
  xs: 12,
  /** Small text (secondary info) */
  sm: 14,
  /** Base text size (body text, inputs) */
  base: 16,
  /** Large text (subheadings) */
  lg: 18,
  /** Extra large text (headings) */
  xl: 20,
  /** 2X large text (page titles) */
  "2xl": 24,
  /** 3X large text (hero titles) */
  "3xl": 32,
  /** 4X large text (large displays) */
  "4xl": 40,
} as const

/**
 * INPUT HEIGHTS
 * Standard heights for form inputs
 */
export const inputHeight = {
  /** Small input height */
  sm: 40,
  /** Medium input height (default) */
  md: 48, // Matches touch target
  /** Large input height */
  lg: 56,
} as const

/**
 * BUTTON HEIGHTS
 * Standard heights for buttons (matches touch targets)
 */
export const buttonHeight = {
  /** Small button */
  sm: touchTarget.min, // 44px
  /** Medium button (default) */
  md: touchTarget.recommended, // 48px
  /** Large button */
  lg: 56,
} as const

/**
 * BORDER RADIUS
 * Consistent border radius values
 */
export const borderRadius = {
  /** Small radius */
  sm: 8,
  /** Medium radius (default for buttons/inputs) */
  md: 12,
  /** Large radius */
  lg: 16,
  /** Extra large radius */
  xl: 24,
  /** Full radius (circular) */
  full: 9999,
} as const

/**
 * CONTRAST RATIOS
 * WCAG AA compliance (4.5:1 for normal text, 3:1 for large text)
 */
export const contrast = {
  /** Minimum contrast for normal text */
  normalText: 4.5,
  /** Minimum contrast for large text (18pt+ or 14pt+ bold) */
  largeText: 3,
  /** Minimum contrast for UI components */
  uiComponents: 3,
} as const

/**
 * ANIMATION DURATIONS
 * Consistent animation timing
 */
export const duration = {
  /** Quick animations (micro-interactions) */
  fast: 150,
  /** Normal animations (most UI transitions) */
  normal: 250,
  /** Slow animations (page transitions) */
  slow: 350,
} as const

/**
 * Z-INDEX LAYERS
 * Consistent layering system
 */
export const zIndex = {
  /** Base layer */
  base: 0,
  /** Dropdowns, tooltips */
  dropdown: 1000,
  /** Sticky headers */
  sticky: 1100,
  /** Modals, dialogs */
  modal: 1200,
  /** Toasts, notifications */
  toast: 1300,
  /** Popovers */
  popover: 1400,
} as const

/**
 * KEYBOARD AVOIDING
 * Vertical offset when keyboard is open
 */
export const keyboardOffset = {
  /** iOS keyboard offset */
  ios: spacing.md, // 16px
  /** Android keyboard offset */
  android: 0,
} as const
