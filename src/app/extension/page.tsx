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

  const titleParts = t("title").split("Jobi.sh");
  const installCopyByBrowser: Record<BrowserInstallTarget["browserKey"], { installLabel: string }> = {
    chrome: {
      installLabel: t("chromeInstall"),
    },
    firefox: {
      installLabel: t("firefoxInstall"),
    },
  };

  return (
    <main className="app-page">
      <section className="mx-auto app-page-content w-full max-w-5xl md:max-w-none">
        <div className="max-w-3xl space-y-4">
          <h1 className="font-display text-4xl md:text-[2.8rem]">
            {titleParts[0]}Jobi<span className="text-app-primary">.sh</span>{titleParts[1] ?? ""}
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

        <section className="app-card-elevated">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-app-primary">
              {t("installEyebrow")}
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-app-ink">{t("installTitle")}</h2>
            <p className="mt-3 text-base leading-7 text-app-muted">{t("installBody")}</p>
          </div>

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

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {installTargets.map((target) => (
              <Btn
                key={target.browserKey}
                href={target.installUrl}
                target="_blank"
                rel="noreferrer"
              >
                <span className="inline-flex items-center gap-2">
                  <span>{installCopyByBrowser[target.browserKey].installLabel}</span>
                  <ExternalLink aria-hidden="true" size={18} strokeWidth={2.2} />
                </span>
              </Btn>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
