import { Btn } from "@/components/ui/btn";
import {
  EXTENSION_INSTALL_TARGETS,
  type BrowserInstallTarget,
} from "@/lib/extension-install";
import { auth } from "@clerk/nextjs/server";
import { getTranslations } from "next-intl/server";
import { CheckCircle2, ExternalLink, Puzzle, Send } from "lucide-react";
import { redirect } from "next/navigation";

const installTargets: BrowserInstallTarget[] = [
  EXTENSION_INSTALL_TARGETS.chrome,
  EXTENSION_INSTALL_TARGETS.safari,
  EXTENSION_INSTALL_TARGETS.firefox,
];

export default async function ExtensionPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/auth");
  }

  const t = await getTranslations("extension");

  const featureHighlights = [
    {
      icon: Send,
      title: t("feature1Title"),
      body: t("feature1Body"),
    },
    {
      icon: Puzzle,
      title: t("feature2Title"),
      body: t("feature2Body"),
    },
  ];

  const browserTranslations: Record<"chrome" | "safari" | "firefox", { statusLabel: string; installLabel: string; installDescription: string }> = {
    chrome: {
      statusLabel: t("chromeStatus"),
      installLabel: t("chromeInstall"),
      installDescription: t("chromeDesc"),
    },
    safari: {
      statusLabel: t("safariStatus"),
      installLabel: t("safariInstall"),
      installDescription: t("safariDesc"),
    },
    firefox: {
      statusLabel: t("firefoxStatus"),
      installLabel: t("firefoxInstall"),
      installDescription: t("firefoxDesc"),
    },
  };

  return (
    <main className="app-page">
      <section className="mx-auto app-page-content w-full max-w-5xl md:max-w-none">
        <div className="max-w-3xl space-y-4">
          <h1 className="font-display text-4xl md:text-[2.8rem]">
            {(() => {
              const parts = t("title").split("Jobi.sh");
              return <>{parts[0]}Jobi<span className="text-app-primary">.sh</span>{parts[1]}</>;
            })()}
          </h1>
          <p className="text-lg leading-8 text-app-muted">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {featureHighlights.map((item) => (
            <article key={item.title} className="app-card">
              <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-app-primary/10 text-app-primary">
                <item.icon aria-hidden="true" size={20} strokeWidth={2.1} />
              </div>
              <h2 className="mt-4 text-xl font-semibold text-app-ink">{item.title}</h2>
              <p className="mt-2 text-base leading-7 text-app-muted">{item.body}</p>
            </article>
          ))}
        </div>

        <section className="grid gap-4 lg:grid-cols-1">
          {installTargets.map((target) => {
            const tr = browserTranslations[target.browserKey];
            return (
              <article
                id={`${target.browserKey}-store`}
                key={target.browserKey}
                className="app-card-elevated scroll-mt-8"
              >
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-2xl font-semibold text-app-ink">{target.browserLabel}</h2>
                  <span className="rounded-full bg-app-surface px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-app-primary">
                    {target.storeLabel}
                  </span>
                </div>

                <p className="mt-4 text-sm font-semibold uppercase tracking-[0.12em] text-app-primary">
                  {tr.statusLabel}
                </p>

                <p className="mt-3 text-base leading-7 text-app-muted">{tr.installDescription}</p>

                <ul className="mt-5 space-y-3 text-sm text-app-ink">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 aria-hidden="true" className="mt-0.5 shrink-0 text-app-primary" size={16} strokeWidth={2.2} />
                    <span>{t("bulletReport")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 aria-hidden="true" className="mt-0.5 shrink-0 text-app-primary" size={16} strokeWidth={2.2} />
                    <span>{t("bulletImport")}</span>
                  </li>
                </ul>

                {target.storeUrl ? (
                  <div className="mt-6">
                    <Btn
                      href={target.storeUrl}
                      target="_blank"
                      rel="noreferrer"
                      icon={{ component: ExternalLink, position: "right", size: 18 }}
                    >
                      {tr.installLabel}
                    </Btn>
                  </div>
                ) : (
                  <div className="mt-6 rounded-2xl bg-app-surface px-4 py-3 text-sm leading-6 text-app-muted">
                    {t("comingSoon", { browser: target.browserLabel })}
                  </div>
                )}
              </article>
            );
          })}
        </section>
      </section>
    </main>
  );
}
