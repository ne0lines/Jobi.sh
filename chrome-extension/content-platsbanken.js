const JOBISH_OPEN_IMPORT_PAGE = "JOBISH_OPEN_IMPORT_PAGE";
const BUTTON_ID = "jobish-import-job-button";
const CONTAINER_ID = "jobish-import-job-container";
const BUTTON_SLOT_ID = "jobish-import-job-button-slot";
const QUICK_INFO_SELECTOR = "lib-pb-section-job-quick-info";
const EXTENSION_ICON_PATH = "icons/jobish-48.png";

function getJobishIconUrl() {
  return chrome.runtime.getURL(EXTENSION_ICON_PATH);
}

function setButtonContent(button, label, iconUrl) {
  button.replaceChildren();

  if (iconUrl) {
    const icon = document.createElement("img");
    icon.alt = "";
    icon.ariaHidden = "true";
    icon.src = iconUrl;
    icon.width = 48;
    icon.height = 48;
    icon.style.width = "48px";
    icon.style.height = "48px";
    icon.style.borderRadius = "14px";
    icon.style.objectFit = "cover";
    icon.style.flexShrink = "0";
    icon.style.boxShadow = "0 0 0 1px rgba(255, 255, 255, 0.18)";
    button.appendChild(icon);
  }

  const text = document.createElement("span");
  text.textContent = label;
  button.appendChild(text);
}

function createImportButton() {
  const button = document.createElement("button");
  button.id = BUTTON_ID;
  button.type = "button";
  button.style.display = "inline-flex";
  button.style.alignItems = "center";
  button.style.justifyContent = "flex-start";
  button.style.alignSelf = "center";
  button.style.gap = "8px";
  button.style.minHeight = "50px";
  button.style.width = "fit-content";
  button.style.paddingLeft = "3px";
  button.style.paddingTop = "3px";
  button.style.paddingBottom = "3px";
  button.style.paddingRight = "14px";
  button.style.marginTop = "0";
  button.style.border = "0";
  button.style.borderRadius = "16px";
  button.style.background = "#ffffff";
  button.style.boxShadow = "0 8px 22px rgba(17, 24, 39, 0.14)";
  button.style.color = "#6e33eb";
  button.style.font = "700 15px/1.2 system-ui, sans-serif";
  button.style.cursor = "pointer";
  button.style.transition = "opacity 160ms ease";
  button.style.whiteSpace = "nowrap";
  button.style.textDecoration = "none";
  return button;
}

function createButtonSlot() {
  const buttonSlot = document.createElement("div");
  buttonSlot.id = BUTTON_SLOT_ID;
  buttonSlot.style.display = "flex";
  buttonSlot.style.justifyContent = "flex-end";
  buttonSlot.style.alignItems = "center";
  buttonSlot.style.paddingRight = "0px";
  buttonSlot.style.borderRadius = "14px";
  return buttonSlot;
}

function createContainer() {
  const container = document.createElement("section");
  container.id = CONTAINER_ID;
  container.style.display = "flex";
  container.style.justifyContent = "space-between";
  container.style.flexDirection = "row";
  container.style.marginTop = "18px";
  container.style.marginBottom = "18px";
  container.style.padding = "3px";
  container.style.borderRadius = "18px";
  container.style.background = "linear-gradient(135deg, #6e33eb 0%, #8148ff 100%)";
  container.style.border = "0";
  return container;
}

function createDescription() {
  const description = document.createElement("p");
  description.textContent = "Exportera annonsen direkt till Jobi.sh och håll koll på de jobb du sökt där.";
  description.style.padding = "16px";
  description.style.margin = "0";
  description.style.minWidth = "0";
  description.style.color = "rgba(255, 255, 255, 0.92)";
  description.style.font = "500 14px/1.5 system-ui, sans-serif";
  return description;
}

function getOrCreateButton() {
  const existingButton = document.getElementById(BUTTON_ID);
  if (existingButton instanceof HTMLButtonElement) {
    return existingButton;
  }

  const button = createImportButton();
  return button;
}

function getOrCreateContainer() {
  const existingContainer = document.getElementById(CONTAINER_ID);
  if (existingContainer instanceof HTMLElement) {
    return existingContainer;
  }

  const container = createContainer();
  container.appendChild(createDescription());
  container.appendChild(createButtonSlot());
  return container;
}

function getOrCreateButtonSlot(container) {
  const existingButtonSlots = Array.from(container.querySelectorAll(`#${BUTTON_SLOT_ID}`));
  const [existingButtonSlot, ...duplicateButtonSlots] = existingButtonSlots;

  if (existingButtonSlot instanceof HTMLElement) {
    for (const duplicateButtonSlot of duplicateButtonSlots) {
      duplicateButtonSlot.remove();
    }

    return existingButtonSlot;
  }

  const buttonSlot = createButtonSlot();
  container.appendChild(buttonSlot);
  return buttonSlot;
}

function getAnchorContainer() {
  return document.querySelector(QUICK_INFO_SELECTOR);
}

function placeContainerAfterAnchor(container) {
  const anchor = getAnchorContainer();

  if (!anchor?.parentNode) {
    return false;
  }

  const nextSibling = anchor.nextSibling;

  if (nextSibling === container) {
    return true;
  }

  anchor.parentNode.insertBefore(container, nextSibling);
  return true;
}

async function handleImportClick(button) {
  const originalLabel = button.dataset.label ?? "Exportera till Jobi.sh";
  const iconUrl = button.dataset.iconUrl ?? "";
  button.disabled = true;
  button.style.opacity = "0.7";
  setButtonContent(button, "Exporterar till Jobi.sh...", iconUrl);

  try {
    const response = await chrome.runtime.sendMessage({
      type: JOBISH_OPEN_IMPORT_PAGE,
      sourceUrl: globalThis.location.href,
    });

    if (!response?.ok) {
      throw new Error(response?.error ?? "Kunde inte öppna Jobi.sh.");
    }

    setButtonContent(button, "Jobi.sh öppnades", iconUrl);
  } catch {
    setButtonContent(button, "Kunde inte öppna Jobi.sh", iconUrl);
    globalThis.setTimeout(() => {
      button.disabled = false;
      button.style.opacity = "1";
      setButtonContent(button, originalLabel, iconUrl);
    }, 1800);
    return;
  }

  globalThis.setTimeout(() => {
    button.disabled = false;
    button.style.opacity = "1";
    setButtonContent(button, originalLabel, iconUrl);
  }, 1800);
}

function mountImportButton() {
  if (!(document.body instanceof HTMLBodyElement)) {
    return;
  }

  const container = getOrCreateContainer();
  const buttonSlot = getOrCreateButtonSlot(container);
  const button = getOrCreateButton();
  const placed = placeContainerAfterAnchor(container);

  if (!placed) {
    return;
  }

  if (!buttonSlot.contains(button)) {
    buttonSlot.appendChild(button);
  }

  if (!button.dataset.iconResolved) {
    button.dataset.label = "Exportera till Jobi.sh";
    setButtonContent(button, button.dataset.label, "");
    const iconUrl = getJobishIconUrl();
    button.dataset.iconResolved = "true";
    button.dataset.iconUrl = iconUrl;
    setButtonContent(button, button.dataset.label ?? "Exportera till Jobi.sh", iconUrl);
  }

  if (button.dataset.bound === "true") {
    return;
  }

  button.dataset.bound = "true";
  button.addEventListener("click", () => {
    void handleImportClick(button);
  });
}

function observeAnchorMount() {
  const observer = new MutationObserver(() => {
    if (!getAnchorContainer()) {
      return;
    }

    mountImportButton();
    observer.disconnect();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

if (document.readyState === "loading") {
  globalThis.addEventListener("DOMContentLoaded", () => {
    mountImportButton();
    observeAnchorMount();
  }, { once: true });
} else {
  mountImportButton();
  observeAnchorMount();
}