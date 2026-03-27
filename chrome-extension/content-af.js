const JOBISH_GET_REPORT_JOB = "JOBISH_GET_REPORT_JOB";
const JOBISH_CLEAR_REPORT_JOB = "JOBISH_CLEAR_REPORT_JOB";
const JOBISH_FILL_PENDING_REPORT_JOB = "JOBISH_FILL_PENDING_REPORT_JOB";
const SUCCESS_BANNER_ID = "jobish-af-autofill-banner";

function normalizeText(value) {
  return (value ?? "")
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replaceAll(/[\u0300-\u036f]/g, "");
}

function dispatchFieldEvents(element) {
  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
  element.dispatchEvent(new Event("blur", { bubbles: true }));
}

function setNativeValue(element, value) {
  const prototype = element instanceof HTMLTextAreaElement
    ? HTMLTextAreaElement.prototype
    : HTMLInputElement.prototype;
  const descriptor = Object.getOwnPropertyDescriptor(prototype, "value");

  if (descriptor?.set) {
    descriptor.set.call(element, value);
  } else {
    element.value = value;
  }

  dispatchFieldEvents(element);
}

function setInputValue(element, value) {
  if (!element || typeof value !== "string" || !value.trim()) {
    return false;
  }

  element.focus();
  setNativeValue(element, value.trim());
  return true;
}

function setTextInputBySelector(selector, value) {
  const field = document.querySelector(selector);

  if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) {
    return false;
  }

  return setInputValue(field, value);
}

function getRadioLabelText(input) {
  const wrapperLabel = input.closest("label");
  if (wrapperLabel?.textContent?.trim()) {
    return wrapperLabel.textContent;
  }

  if (input.id) {
    const linkedLabel = document.querySelector(`label[for='${input.id}']`);
    if (linkedLabel?.textContent?.trim()) {
      return linkedLabel.textContent;
    }
  }

  return input.getAttribute("aria-label") ?? "";
}

function setRadioByName(name, candidateValues) {
  const radios = Array.from(document.querySelectorAll(`input[type='radio'][name='${name}']`));

  for (const radio of radios) {
    if (!(radio instanceof HTMLInputElement)) {
      continue;
    }

    const radioValue = normalizeText(radio.value);
    const radioLabel = normalizeText(getRadioLabelText(radio));
    const matches = candidateValues.some((candidate) => {
      const normalizedCandidate = normalizeText(candidate);
      return radioValue === normalizedCandidate || radioLabel.includes(normalizedCandidate);
    });

    if (!matches) {
      continue;
    }

    radio.click();
    radio.checked = true;
    dispatchFieldEvents(radio);
    return true;
  }

  return false;
}

function toIsoDateFromSwedish(value) {
  const monthMap = {
    jan: 1,
    januari: 1,
    feb: 2,
    februari: 2,
    mar: 3,
    mars: 3,
    apr: 4,
    april: 4,
    maj: 5,
    jun: 6,
    juni: 6,
    jul: 7,
    juli: 7,
    aug: 8,
    augusti: 8,
    sep: 9,
    sept: 9,
    september: 9,
    okt: 10,
    oktober: 10,
    nov: 11,
    november: 11,
    dec: 12,
    december: 12,
  };
  const match = /^(\d{1,2})\s+([^\s]+)\s+(\d{4})$/i.exec((value ?? "").trim());

  if (!match) {
    return "";
  }

  const day = match[1].padStart(2, "0");
  const month = monthMap[normalizeText(match[2]).replaceAll(".", "")];
  const year = match[3];

  if (!month) {
    return "";
  }

  return `${year}-${String(month).padStart(2, "0")}-${day}`;
}

function mapWorkloadToAfValue(workload) {
  const normalizedWorkload = normalizeText(workload);

  if (normalizedWorkload.includes("heltid")) {
    return "HELTID";
  }

  if (normalizedWorkload.includes("deltid")) {
    return "DELTID";
  }

  if (normalizedWorkload.includes("tim") || normalizedWorkload.includes("extra")) {
    return "NAGRA_TIMMAR";
  }

  return "";
}

function mapCountryToAfValue(location) {
  const normalizedLocation = normalizeText(location);

  if (
    normalizedLocation.includes("utomlands") ||
    normalizedLocation.includes("obestamd") ||
    normalizedLocation.includes("remote")
  ) {
    return "Obestämd ort eller Utomlands";
  }

  return "SVERIGE";
}

function showBanner(message, isError = false) {
  const existing = document.getElementById(SUCCESS_BANNER_ID);
  existing?.remove();

  const banner = document.createElement("div");
  banner.id = SUCCESS_BANNER_ID;
  banner.textContent = message;
  banner.style.position = "fixed";
  banner.style.right = "16px";
  banner.style.bottom = "16px";
  banner.style.zIndex = "2147483647";
  banner.style.maxWidth = "360px";
  banner.style.padding = "12px 14px";
  banner.style.borderRadius = "12px";
  banner.style.font = "600 14px/1.4 system-ui, sans-serif";
  banner.style.color = "#ffffff";
  banner.style.background = isError ? "#b42318" : "#117a37";
  banner.style.boxShadow = "0 10px 30px rgba(17, 24, 39, 0.22)";
  document.body.appendChild(banner);

  globalThis.setTimeout(() => banner.remove(), 5000);
}

async function fillActivityReportForm(job) {
  const isoDate = toIsoDateFromSwedish(job.applicationDate);
  const workloadValue = mapWorkloadToAfValue(job.workload);
  const countryValue = mapCountryToAfValue(job.location);
  const fieldResults = [
    setTextInputBySelector("#soktjobb-soktTjanst-search", job.title),
    setTextInputBySelector("#soktjobb-arbetsgivare", job.company),
    workloadValue ? setRadioByName("soktjobb-omfattning", [workloadValue]) : false,
    setRadioByName("soktjobb", [countryValue]),
    setTextInputBySelector("#soktjobb-ort", job.location),
    setRadioByName("typ", ["soktjobb"]),
    setTextInputBySelector("#soktjobb-aktivitetsdatum", isoDate),
  ];

  return fieldResults.some(Boolean);
}

async function waitForFormAndFill(job) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < 20000) {
    const hasKnownField = document.querySelector("#soktjobb-soktTjanst-search, #soktjobb-arbetsgivare, #soktjobb-aktivitetsdatum");
    if (hasKnownField) {
      const filled = await fillActivityReportForm(job);
      if (filled) {
        return true;
      }
    }

    await new Promise((resolve) => globalThis.setTimeout(resolve, 400));
  }

  return false;
}

async function getPendingJob() {
  const response = await chrome.runtime.sendMessage({ type: JOBISH_GET_REPORT_JOB });
  return response?.ok ? response.job : null;
}

async function clearPendingJob() {
  await chrome.runtime.sendMessage({ type: JOBISH_CLEAR_REPORT_JOB });
}

async function maybeAutofill() {
  const job = await getPendingJob();

  if (!job) {
    return;
  }

  const filled = await waitForFormAndFill(job);

  if (filled) {
    await clearPendingJob();
    showBanner("Jobi.sh fyllde i aktivitetsrapporten. Kontrollera uppgifterna innan du sparar.");
    return;
  }

  showBanner("Jobi.sh hittade inte alla fält automatiskt. Oppna extensionen och prova igen pa den aktiva fliken.", true);
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== JOBISH_FILL_PENDING_REPORT_JOB) {
    return undefined;
  }

  void maybeAutofill().then(() => sendResponse({ ok: true }));
  return true;
});