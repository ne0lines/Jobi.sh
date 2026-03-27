export type BrowserInstallTarget = {
  browserKey: "chrome" | "safari" | "firefox";
  browserLabel: string;
  storeLabel: string;
  statusLabel: string;
  installLabel: string;
  installUrl: string;
  installDescription: string;
  storeUrl?: string;
};

export const EXTENSION_INSTALL_TARGETS: Record<
  "chrome" | "safari" | "firefox",
  BrowserInstallTarget
> = {
  chrome: {
    browserKey: "chrome",
    browserLabel: "Chrome",
    storeLabel: "Chrome Web Store",
    statusLabel: "Publiceras i Chrome Web Store",
    installLabel: "Se Chrome Extension",
    installUrl: "/extension#chrome-store",
    installDescription:
      "Chrome-versionen kommer att publiceras i Chrome Web Store. När listningen är live hittar du butikslänken här.",
  },
  safari: {
    browserKey: "safari",
    browserLabel: "Safari",
    storeLabel: "App Store",
    statusLabel: "Publiceras i App Store för Safari",
    installLabel: "Se Safari Extension",
    installUrl: "/extension#safari-store",
    installDescription:
      "Safari-versionen kommer att publiceras i App Store. När listningen är live hittar du butikslänken här.",
  },
  firefox: {
    browserKey: "firefox",
    browserLabel: "Firefox",
    storeLabel: "Firefox Add-ons",
    statusLabel: "Publiceras i Firefox Add-ons",
    installLabel: "Se Firefox Extension",
    installUrl: "/extension#firefox-store",
    installDescription:
      "Firefox-versionen kommer att publiceras i Firefox Add-ons. När listningen är live hittar du butikslänken här.",
  },
};

export function getBrowserInstallTarget(userAgent?: string): BrowserInstallTarget {
  const resolvedUserAgent = userAgent ?? (typeof navigator === "undefined" ? "" : navigator.userAgent);
  const isFirefox = /Firefox\//.test(resolvedUserAgent);
  const isSafari = /Safari\//.test(resolvedUserAgent) && !/Chrome\/|CriOS|Edg\/|OPR\//.test(resolvedUserAgent);

  if (isFirefox) {
    return EXTENSION_INSTALL_TARGETS.firefox;
  }

  if (isSafari) {
    return EXTENSION_INSTALL_TARGETS.safari;
  }

  return EXTENSION_INSTALL_TARGETS.chrome;
}