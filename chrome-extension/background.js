const JOBISH_STORE_REPORT_JOB = "JOBISH_STORE_REPORT_JOB";
const JOBISH_GET_REPORT_JOB = "JOBISH_GET_REPORT_JOB";
const JOBISH_CLEAR_REPORT_JOB = "JOBISH_CLEAR_REPORT_JOB";
const JOBISH_OPEN_AF_REPORT_PAGE = "JOBISH_OPEN_AF_REPORT_PAGE";
const JOBISH_FILL_PENDING_REPORT_JOB = "JOBISH_FILL_PENDING_REPORT_JOB";
const JOBISH_REGISTER_ORIGIN = "JOBISH_REGISTER_ORIGIN";
const JOBISH_OPEN_IMPORT_PAGE = "JOBISH_OPEN_IMPORT_PAGE";
const JOBISH_GET_PREFERRED_ORIGIN = "JOBISH_GET_PREFERRED_ORIGIN";
const PENDING_JOB_STORAGE_KEY = "jobishPendingActivityReportJob";
const PREFERRED_JOBISH_ORIGIN_KEY = "jobishPreferredOrigin";
const AF_REPORT_URL = "https://arbetsformedlingen.se/for-arbetssokande/mina-sidor/aktivitetsrapportera/lagg-till-aktivitet";
const DEFAULT_JOBISH_ORIGIN = "https://jobi.sh";
const IMPORT_CONTEXT_MENU_ID = "jobish-import-platsbanken-link";
const JOBISH_URL_PATTERNS = [
  "https://jobi.sh/*",
  "https://*.jobi.sh/*",
];
const PLATSBANKEN_AD_URL_PATTERNS = [
  "https://arbetsformedlingen.se/platsbanken/annonser/*",
];

async function setPendingJob(payload) {
  await chrome.storage.local.set({
    [PENDING_JOB_STORAGE_KEY]: {
      ...payload,
      storedAt: Date.now(),
    },
  });
}

async function getPendingJob() {
  const result = await chrome.storage.local.get(PENDING_JOB_STORAGE_KEY);
  return result[PENDING_JOB_STORAGE_KEY] ?? null;
}

async function clearPendingJob() {
  await chrome.storage.local.remove(PENDING_JOB_STORAGE_KEY);
}

async function setPreferredJobishOrigin(origin) {
  await chrome.storage.local.set({
    [PREFERRED_JOBISH_ORIGIN_KEY]: origin,
  });
}

async function getPreferredJobishOrigin() {
  const result = await chrome.storage.local.get(PREFERRED_JOBISH_ORIGIN_KEY);
  return result[PREFERRED_JOBISH_ORIGIN_KEY] ?? null;
}

function getOriginFromUrl(url) {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

function isSupportedImportUrl(url) {
  if (typeof url !== "string" || !url) {
    return false;
  }

  try {
    const parsedUrl = new URL(url);
    return (
      parsedUrl.origin === "https://arbetsformedlingen.se" &&
      parsedUrl.pathname.startsWith("/platsbanken/annonser/")
    );
  } catch {
    return false;
  }
}

async function ensureContextMenus() {
  await chrome.contextMenus.removeAll();

  chrome.contextMenus.create({
    id: IMPORT_CONTEXT_MENU_ID,
    title: "Spara jobbannons i Jobi.sh",
    contexts: ["link"],
    documentUrlPatterns: ["https://arbetsformedlingen.se/*"],
    targetUrlPatterns: PLATSBANKEN_AD_URL_PATTERNS,
  });
}

async function resolveJobishOrigin() {
  const tabs = await chrome.tabs.query({ url: JOBISH_URL_PATTERNS });
  const activeTab = tabs.find((tab) => tab.active) ?? tabs[0];
  const tabOrigin = activeTab?.url ? getOriginFromUrl(activeTab.url) : null;

  if (tabOrigin) {
    await setPreferredJobishOrigin(tabOrigin);
    return tabOrigin;
  }

  return (await getPreferredJobishOrigin()) ?? DEFAULT_JOBISH_ORIGIN;
}

async function openJobImportPage(sourceUrl) {
  if (!isSupportedImportUrl(sourceUrl)) {
    throw new Error("Kan bara importera länkar till jobbannonser från Platsbanken.");
  }

  const origin = await resolveJobishOrigin();
  const importUrl = new URL("/jobs/new", origin);
  importUrl.searchParams.set("url", sourceUrl);

  const matchingTabs = await chrome.tabs.query({ url: `${origin}/*` });
  const matchingTab = matchingTabs.find((tab) => tab.id);

  if (matchingTab?.id) {
    await chrome.tabs.update(matchingTab.id, { active: true, url: importUrl.toString() });
    if (matchingTab.windowId) {
      await chrome.windows.update(matchingTab.windowId, { focused: true });
    }
    return matchingTab;
  }

  return await chrome.tabs.create({ url: importUrl.toString(), active: true });
}

chrome.runtime.onInstalled.addListener(() => {
  void ensureContextMenus();
});

chrome.runtime.onStartup.addListener(() => {
  void ensureContextMenus();
});

async function openAfReportPage() {
  const existingTabs = await chrome.tabs.query({ url: `${AF_REPORT_URL}*` });
  const existingTab = existingTabs[0];

  if (existingTab?.id) {
    await chrome.tabs.update(existingTab.id, { active: true, url: AF_REPORT_URL });
    if (existingTab.windowId) {
      await chrome.windows.update(existingTab.windowId, { focused: true });
    }
    return existingTab;
  }

  return await chrome.tabs.create({ url: AF_REPORT_URL, active: true });
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete" || !tab.url?.startsWith(AF_REPORT_URL)) {
    return;
  }

  chrome.tabs.sendMessage(tabId, { type: JOBISH_FILL_PENDING_REPORT_JOB }).catch(() => {
    return undefined;
  });
});

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId !== IMPORT_CONTEXT_MENU_ID || !isSupportedImportUrl(info.linkUrl)) {
    return;
  }

  openJobImportPage(info.linkUrl).catch(() => undefined);
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message?.type) {
    return undefined;
  }

  void (async () => {
    try {
      switch (message.type) {
        case JOBISH_STORE_REPORT_JOB:
          await setPendingJob(message.payload);
          await openAfReportPage();
          sendResponse({ ok: true });
          return;
        case JOBISH_GET_REPORT_JOB:
          sendResponse({ ok: true, job: await getPendingJob() });
          return;
        case JOBISH_CLEAR_REPORT_JOB:
          await clearPendingJob();
          sendResponse({ ok: true });
          return;
        case JOBISH_REGISTER_ORIGIN:
          if (typeof message.origin === "string" && message.origin) {
            await setPreferredJobishOrigin(message.origin);
          }
          sendResponse({ ok: true });
          return;
        case JOBISH_GET_PREFERRED_ORIGIN:
          sendResponse({ ok: true, origin: await resolveJobishOrigin() });
          return;
        case JOBISH_OPEN_AF_REPORT_PAGE:
          await openAfReportPage();
          sendResponse({ ok: true });
          return;
        case JOBISH_OPEN_IMPORT_PAGE:
          await openJobImportPage(message.sourceUrl);
          sendResponse({ ok: true });
          return;
        default:
          sendResponse({ ok: false, error: `Unknown message type: ${message.type}` });
      }
    } catch (error) {
      sendResponse({
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  })();

  return true;
});