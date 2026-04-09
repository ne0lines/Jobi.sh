// This file has been replaced with a clean implementation.
"use client";

import type { ReportJobEntry, ReportOption } from "@/app/report/report-page-data";
import { Btn } from "@/components/ui/btn";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getBrowserInstallTarget } from "@/lib/extension-install";
import { ExternalLink, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type ReportPageClientProps = {
  jobs: ReportJobEntry[];
  options: ReportOption[];
};

type ActivityReportBridgePayload = {
  jobId: string;
  title: string;
  company: string;
  location: string;
  workload: string;
  applicationDate: string;
  sourceUrl: string;
};

const JOBISH_REPORT_MESSAGE_TYPE = "JOBISH_REPORT_JOB";
const JOBISH_REPORT_ACK_TYPE = "JOBISH_EXTENSION_ACK";
const JOBISH_EXTENSION_PING_TYPE = "JOBISH_EXTENSION_PING";
const JOBISH_EXTENSION_PONG_TYPE = "JOBISH_EXTENSION_PONG";

async function detectActivityReportExtension() {
  const currentWindow = globalThis.window;

  return await new Promise<boolean>((resolve) => {
    let resolved = false;

    const cleanup = (value: boolean) => {
      if (resolved) {
        return;
      }

      resolved = true;
      globalThis.clearTimeout(timeoutId);
      currentWindow.removeEventListener("message", handleMessage);
      resolve(value);
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.source !== currentWindow || event.origin !== currentWindow.location.origin) {
        return;
      }

      if (event.data?.type !== JOBISH_EXTENSION_PONG_TYPE) {
        return;
      }

      cleanup(true);
    };

    const timeoutId = currentWindow.setTimeout(() => cleanup(false), 900);

    currentWindow.addEventListener("message", handleMessage);
    currentWindow.postMessage({ type: JOBISH_EXTENSION_PING_TYPE }, currentWindow.location.origin);
  });
}

function buildActivityReportPayload(job: ReportJobEntry): ActivityReportBridgePayload {
  return {
    jobId: job.id,
    title: job.title,
    company: job.company,
    location: job.location,
    workload: job.workload,
    applicationDate: job.applicationDate,
    sourceUrl: globalThis.location.href,
  };
}

async function sendJobToActivityReportExtension(payload: ActivityReportBridgePayload) {
  const currentWindow = globalThis.window;

  return await new Promise<boolean>((resolve) => {
    let resolved = false;

    const cleanup = (value: boolean) => {
      if (resolved) {
        return;
      }

      resolved = true;
      globalThis.clearTimeout(timeoutId);
      globalThis.removeEventListener("message", handleMessage);
      resolve(value);
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.source !== currentWindow || event.origin !== currentWindow.location.origin) {
        return;
      }

      if (event.data?.type !== JOBISH_REPORT_ACK_TYPE) {
        return;
      }

      cleanup(event.data.status === "ok");
    };

    const timeoutId = currentWindow.setTimeout(() => cleanup(false), 1200);

    currentWindow.addEventListener("message", handleMessage);
    currentWindow.postMessage(
      {
        type: JOBISH_REPORT_MESSAGE_TYPE,
        payload,
      },
      currentWindow.location.origin,
    );
  });
}

export function ReportPageClient({ jobs, options }: Readonly<ReportPageClientProps>) {
  const [selectedMonth, setSelectedMonth] = useState(options[0]?.key ?? "");
  const [pendingJobId, setPendingJobId] = useState<string | null>(null);
  const [isExtensionInstalled, setIsExtensionInstalled] = useState<boolean | null>(null);
  const [isInstallDrawerOpen, setIsInstallDrawerOpen] = useState(false);
  const installTarget = useMemo(() => getBrowserInstallTarget(), []);

  const filteredJobs = useMemo(
    () => jobs.filter((job) => job.monthKey === selectedMonth),
    [jobs, selectedMonth],
  );

  useEffect(() => {
    let isCancelled = false;

    void detectActivityReportExtension().then((installed) => {
      if (isCancelled) {
        return;
      }

      setIsExtensionInstalled(installed);
      setIsInstallDrawerOpen(!installed);
    });

    return () => {
      isCancelled = true;
    };
  }, []);

  function dismissInstallDrawer() {
    setIsInstallDrawerOpen(false);
  }

  async function handleReportClick(job: ReportJobEntry) {
    if (isExtensionInstalled === false) {
      setIsInstallDrawerOpen(true);
      return;
    }

    setPendingJobId(job.id);

    const delivered = await sendJobToActivityReportExtension(buildActivityReportPayload(job));

    setPendingJobId((currentJobId) => (currentJobId === job.id ? null : currentJobId));

    if (delivered) {
      setIsExtensionInstalled(true);
      toast.success("Jobbet skickades till extensionen och AF-sidan öppnas.");
      return;
    }

    setIsExtensionInstalled(false);
    setIsInstallDrawerOpen(true);
    toast.error("Extensionen svarade inte. Öppna extensionsidan och installera rätt version för din webbläsare.");
  }

  if (options.length === 0) {
    return (
      <main className="app-page">
        <section className="mx-auto app-page-content w-full max-w-3xl md:max-w-none">
          <h1 className="font-display text-4xl md:text-[2.4rem]">Aktivitetsrapport</h1>
          <p className="text-lg text-app-muted">
            Det finns inga registrerade ansökningsdatum att rapportera ännu.
          </p>
          <Btn href="/" variant="secondary">
            Tillbaka
          </Btn>
        </section>
      </main>
    );
  }

  return (
    <>
      <main className="app-page">
        <section className="mx-auto app-page-content-compact w-full max-w-3xl md:max-w-none">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="app-heading-stack-tight">
              <h1 className="font-display text-4xl md:text-[2.4rem]">Aktivitetsrapport</h1>
              <p className="text-lg text-app-muted">
                Välj månad för att se vilka jobb du sökte under perioden.
              </p>
            </div>

            <label className="flex w-full flex-col gap-2 sm:max-w-xs">
              <Select value={selectedMonth} onValueChange={(value) => setSelectedMonth(value ?? "")}>
                <SelectTrigger className="h-12 w-full rounded-2xl border-app-stroke bg-white px-4 text-base text-app-ink focus-visible:border-app-primary focus-visible:ring-app-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {options.map((option) => (
                    <SelectItem key={option.key} value={option.key}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
          </div>

          <div className="flex flex-col gap-4">
            {filteredJobs.map((job) => (
              <article
                key={job.id}
                className="flex flex-col overflow-hidden rounded-3xl border border-app-stroke bg-white shadow-[0_12px_28px_rgba(17,23,40,0.05)] md:flex-row md:items-stretch"
              >
                <div className="min-w-0 flex-1 px-5 py-5 md:px-6">
                  <div className="flex h-full flex-col justify-center gap-3 md:flex-row md:items-center md:justify-between md:gap-5">
                    <div className="min-w-0 flex-1 app-card-stack">
                      <span className="font-bold">{job.title}</span> hos <span className="font-bold">{job.company}</span>
                      <div className="flex flex-col gap-1.5 text-sm text-app-muted sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8">
                        <p className="whitespace-nowrap">
                          <strong className="text-app-ink">Ort:</strong> {job.location}
                        </p>
                        <p className="whitespace-nowrap">
                          <strong className="text-app-ink">Omfattning:</strong> {job.workload}
                        </p>
                        <p className="whitespace-nowrap">
                          <strong className="text-app-ink">Sökt:</strong> {job.applicationDate}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center px-5 pb-5 md:w-auto md:shrink-0 md:px-6 md:pb-0">
                  <button
                    type="button"
                    className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-[linear-gradient(90deg,#6e33eb_0%,#8a4bff_100%)] px-5 py-3 text-center text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto md:min-w-52 md:px-6 md:text-base"
                    disabled={pendingJobId === job.id}
                    onClick={() => void handleReportClick(job)}
                  >
                    {pendingJobId === job.id ? "Aktivitetsrapporterar..." : "Aktivitetsrapportera"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <Drawer
        open={isInstallDrawerOpen && isExtensionInstalled === false}
        onOpenChange={(open: boolean) => {
          if (!open) {
            dismissInstallDrawer();
            return;
          }

          setIsInstallDrawerOpen(true);
        }}
      >
        <DrawerContent>
          <DrawerTitle className="sr-only">Installera Jobi.sh Extensionen</DrawerTitle>
          <div className="mx-auto flex w-full max-w-[75vw] flex-col gap-6">
            <div className="flex items-start justify-between gap-4">
              <DrawerHeader className="min-w-0 gap-1">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-app-primary">
                  {installTarget.browserLabel} Extension
                </p>
                <DrawerTitle id="extension-drawer-title" className="mt-2">
                  Installera Jobi.sh Extensionen
                </DrawerTitle>
                <DrawerDescription className="mt-3 leading-6">
                  För att skicka jobb direkt till Arbetsförmedlingen från den här sidan behöver du ha
                  Jobi.sh Extensionen installerad i {installTarget.browserLabel}.
                </DrawerDescription>
              </DrawerHeader>

              <DrawerClose asChild>
                <button
                  type="button"
                  aria-label="Stäng drawer"
                  className="inline-flex size-11 items-center justify-center rounded-2xl border border-app-stroke bg-white text-app-muted transition hover:text-app-ink"
                >
                  <X aria-hidden="true" size={18} strokeWidth={2.1} />
                </button>
              </DrawerClose>
            </div>

            <div className="rounded-3xl bg-app-surface p-5 text-sm leading-6 text-app-muted md:p-6">
              {installTarget.installDescription}
            </div>

            <DrawerFooter>
              <DrawerClose asChild>
                <button
                  type="button"
                  className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-app-stroke bg-white px-5 text-base font-semibold text-app-ink transition hover:border-app-primary/35 hover:text-app-primary"
                >
                  Inte nu
                </button>
              </DrawerClose>

              <Btn
                href={installTarget.installUrl}
                target="_blank"
                rel="noreferrer"
                icon={{ component: ExternalLink, position: "right", size: 18 }}
                track="install_extension_click"
              >
                {installTarget.installLabel}
              </Btn>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}