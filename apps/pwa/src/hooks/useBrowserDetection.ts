import { useMemo } from "react"

export interface BrowserInfo {
  isSafari: boolean
  isChrome: boolean
  isFirefox: boolean
  isEdge: boolean
  isOpera: boolean
  isSamsungBrowser: boolean
  browserName: string
  isInAppBrowser: boolean // Instagram, Facebook, etc.
}

export function useBrowserDetection(): BrowserInfo {
  return useMemo(() => {
    const userAgent = navigator.userAgent.toLowerCase()

    // Detect iOS
    const isIOS = /iphone|ipad|ipod/.test(userAgent)

    // Detect in-app browsers first (Instagram, Facebook, TikTok, etc.)
    const isInAppBrowser =
      /instagram|fbav|fban|twitter|line|kakaotalk|tiktok/.test(userAgent)

    // Detect Chrome on iOS (CriOS)
    const isChromeiOS = /crios/.test(userAgent)

    // Detect Firefox on iOS (FxiOS)
    const isFirefoxiOS = /fxios/.test(userAgent)

    // Detect Safari (excluding Chrome, Edge, and other browsers that have Safari in UA)
    // On iOS, Safari is the only browser without a custom identifier
    const isSafari = isIOS
      ? !isInAppBrowser && !isChromeiOS && !isFirefoxiOS && /safari/.test(userAgent)
      : /safari/.test(userAgent) &&
        !/chrome/.test(userAgent) &&
        !/chromium/.test(userAgent) &&
        !/edg/.test(userAgent)

    // Detect other browsers
    const isChrome = /chrome/.test(userAgent) && !/edg/.test(userAgent)
    const isFirefox = /firefox/.test(userAgent)
    const isEdge = /edg/.test(userAgent)
    const isOpera = /opr/.test(userAgent) || /opera/.test(userAgent)
    const isSamsungBrowser = /samsungbrowser/.test(userAgent)

    // Determine browser name
    let browserName = "Unknown"
    if (isInAppBrowser) browserName = "In-App Browser"
    else if (isSafari) browserName = "Safari"
    else if (isChromeiOS) browserName = "Chrome (iOS)"
    else if (isFirefoxiOS) browserName = "Firefox (iOS)"
    else if (isChrome) browserName = "Chrome"
    else if (isFirefox) browserName = "Firefox"
    else if (isEdge) browserName = "Edge"
    else if (isOpera) browserName = "Opera"
    else if (isSamsungBrowser) browserName = "Samsung Internet"

    return {
      isSafari,
      isChrome,
      isFirefox,
      isEdge,
      isOpera,
      isSamsungBrowser,
      browserName,
      isInAppBrowser,
    }
  }, [])
}
