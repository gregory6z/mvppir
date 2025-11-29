import { useEffect } from 'react'
import '@khmyznikov/pwa-install'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'pwa-install': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          'manifest-url'?: string
          'name'?: string
          'description'?: string
          'icon'?: string
        },
        HTMLElement
      >
    }
  }
}

export function PWAInstallPrompt() {
  useEffect(() => {
    // O componente web carrega automaticamente
  }, [])

  return (
    <pwa-install
      manifest-url="/manifest.json"
      name="STAKLY"
      description="Sua carteira de investimentos"
      icon="/icons/icon-512x512.png"
    />
  )
}
