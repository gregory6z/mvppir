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

    // Detect Safari (excluding Chrome, which also has Safari in UA)
    const isSafari =
      /safari/.test(userAgent) &&
      !/chrome/.test(userAgent) &&
      !/chromium/.test(userAgent) &&
      !/edg/.test(userAgent)

    // Detect other browsers
    const isChrome = /chrome/.test(userAgent) && !/edg/.test(userAgent)
    const isFirefox = /firefox/.test(userAgent)
    const isEdge = /edg/.test(userAgent)
    const isOpera = /opr/.test(userAgent) || /opera/.test(userAgent)
    const isSamsungBrowser = /samsungbrowser/.test(userAgent)

    // Detect in-app browsers (Instagram, Facebook, TikTok, etc.)
    const isInAppBrowser =
      /instagram|fbav|fban|twitter|line|kakaotalk|tiktok/.test(userAgent)

    // Determine browser name
    let browserName = "Unknown"
    if (isSafari) browserName = "Safari"
    else if (isChrome) browserName = "Chrome"
    else if (isFirefox) browserName = "Firefox"
    else if (isEdge) browserName = "Edge"
    else if (isOpera) browserName = "Opera"
    else if (isSamsungBrowser) browserName = "Samsung Internet"
    else if (isInAppBrowser) browserName = "In-App Browser"

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
