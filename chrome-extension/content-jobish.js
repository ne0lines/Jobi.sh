const JOBISH_REPORT_MESSAGE_TYPE = "JOBISH_REPORT_JOB";
const JOBISH_REPORT_ACK_TYPE = "JOBISH_EXTENSION_ACK";
const JOBISH_EXTENSION_PING_TYPE = "JOBISH_EXTENSION_PING";
const JOBISH_EXTENSION_PONG_TYPE = "JOBISH_EXTENSION_PONG";
const JOBISH_STORE_REPORT_JOB = "JOBISH_STORE_REPORT_JOB";
const JOBISH_REGISTER_ORIGIN = "JOBISH_REGISTER_ORIGIN";

chrome.runtime.sendMessage({
  type: JOBISH_REGISTER_ORIGIN,
  origin: globalThis.location.origin,
});

globalThis.addEventListener("message", async (event) => {
  if (event.origin !== globalThis.location.origin) {
    return;
  }

  if (event.data?.type === JOBISH_EXTENSION_PING_TYPE) {
    globalThis.postMessage(
      {
        type: JOBISH_EXTENSION_PONG_TYPE,
      },
      globalThis.location.origin,
    );
    return;
  }

  if (event.data?.type !== JOBISH_REPORT_MESSAGE_TYPE || !event.data.payload) {
    return;
  }

  try {
    const response = await chrome.runtime.sendMessage({
      type: JOBISH_STORE_REPORT_JOB,
      payload: event.data.payload,
    });

    globalThis.postMessage(
      {
        type: JOBISH_REPORT_ACK_TYPE,
        status: response?.ok ? "ok" : "error",
        error: response?.error ?? null,
      },
      globalThis.location.origin,
    );
  } catch (error) {
    globalThis.postMessage(
      {
        type: JOBISH_REPORT_ACK_TYPE,
        status: "error",
        error: error instanceof Error ? error.message : String(error),
      },
      globalThis.location.origin,
    );
  }
});