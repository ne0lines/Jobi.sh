export type BrowserInstallTargetKey = "chrome" | "firefox";

export type BrowserInstallTarget = {
  browserKey: BrowserInstallTargetKey;
  browserLabel: string;
  storeLabel: string;
  installUrl: string;
};

type BrowserInstallTargetDefinition = {
  browserKey: BrowserInstallTargetKey;
  browserLabel: string;
  storeLabel: string;
  installUrl: string;
};

function createBrowserInstallTarget({
  browserKey,
  browserLabel,
  storeLabel,
  installUrl,
}: BrowserInstallTargetDefinition): BrowserInstallTarget {
  return {
    browserKey,
    browserLabel,
    storeLabel,
    installUrl,
  };
}

export const EXTENSION_INSTALL_TARGETS: Record<BrowserInstallTargetKey, BrowserInstallTarget> = {
  chrome: createBrowserInstallTarget({
    browserKey: "chrome",
    browserLabel: "Chrome",
    storeLabel: "Chrome Web Store",
    installUrl: "https://chromewebstore.google.com/detail/jobish/pddmbbfnomejifgoolefkmcdbdhmdogg",
  }),
  firefox: createBrowserInstallTarget({
    browserKey: "firefox",
    browserLabel: "Firefox",
    storeLabel: "Firefox Add-ons",
    installUrl: "https://addons.mozilla.org/firefox/addon/jobish/",
  }),
};

export function getBrowserInstallTarget(userAgent?: string): BrowserInstallTarget {
  const resolvedUserAgent = userAgent ?? (typeof navigator === "undefined" ? "" : navigator.userAgent);
  const isFirefox = /Firefox\//.test(resolvedUserAgent);

  if (isFirefox) {
    return EXTENSION_INSTALL_TARGETS.firefox;
  }

  return EXTENSION_INSTALL_TARGETS.chrome;
}