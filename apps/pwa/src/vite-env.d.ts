/// <reference types="vite/client" />

import type { DetailedHTMLProps, HTMLAttributes } from 'react'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'pwa-install': DetailedHTMLProps<
        HTMLAttributes<HTMLElement> & {
          'manifest-url'?: string
          name?: string
          description?: string
          icon?: string
        },
        HTMLElement
      >
    }
  }
}
