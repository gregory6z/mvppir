import { useEffect } from 'react'
import '@khmyznikov/pwa-install'

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
