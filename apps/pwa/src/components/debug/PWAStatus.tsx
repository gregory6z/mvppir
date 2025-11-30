import { usePWAInstallStatus } from "@/hooks/usePWAInstallStatus"

export function PWAStatus() {
  const status = usePWAInstallStatus()

  // Só mostrar em desenvolvimento
  if (import.meta.env.PROD) {
    return null
  }

  return (
    <div className="fixed bottom-24 left-[calc(var(--app-left)+16px)] bg-zinc-900/95 border border-zinc-700 rounded-lg p-4 text-xs text-white z-50 max-w-xs">
      <h3 className="font-bold mb-2 text-purple-400">PWA Status (Dev Only)</h3>
      <div className="space-y-1">
        <div>
          <span className="text-zinc-400">Instalado:</span>{" "}
          <span className={status.isInstalled ? "text-green-400" : "text-red-400"}>
            {status.isInstalled ? "✅ Sim" : "❌ Não"}
          </span>
        </div>
        <div>
          <span className="text-zinc-400">Plataforma:</span>{" "}
          {status.isIOS && "📱 iOS"}
          {status.isAndroid && "🤖 Android"}
          {!status.isIOS && !status.isAndroid && "💻 Desktop"}
        </div>
        <div>
          <span className="text-zinc-400">Modo:</span>{" "}
          <span className="text-cyan-400">{status.displayMode}</span>
        </div>
        {status.installedAt && (
          <div>
            <span className="text-zinc-400">Instalado em:</span>{" "}
            <span className="text-yellow-400">
              {new Date(status.installedAt).toLocaleDateString("pt-BR")}
            </span>
          </div>
        )}
        {status.isFirstLaunch && (
          <div className="mt-2 text-green-400 font-semibold">
            🎉 Primeiro acesso após instalação!
          </div>
        )}
      </div>
    </div>
  )
}
