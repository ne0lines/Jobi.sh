import { Btn } from "@/components/ui/btn";
import {
  EXTENSION_INSTALL_TARGETS,
  type BrowserInstallTarget,
} from "@/lib/extension-install";
import { auth } from "@clerk/nextjs/server";
import { CheckCircle2, ExternalLink, Puzzle, Send } from "lucide-react";
import { redirect } from "next/navigation";

const installTargets: BrowserInstallTarget[] = [
  EXTENSION_INSTALL_TARGETS.chrome,
  EXTENSION_INSTALL_TARGETS.safari,
  EXTENSION_INSTALL_TARGETS.firefox,
];

const featureHighlights = [
  {
    icon: Send,
    title: "Aktivitetsrapportera hos AF direkt från Jobi.sh",
    body: "Skicka jobb från Jobi.sh och fyll i Arbetsförmedlingens aktivitetsrapport utan att kopiera varje fält manuellt.",
  },
  {
    icon: Puzzle,
    title: "Lägg till jobb från Platsbanken",
    body: "På platsannonser i Platsbanken får du en egen Jobi.sh-knapp som automatiskt importerar annonsen till Jobi.sh.",
  },
];

export default async function ExtensionPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/auth");
  }

  return (
    <main className="min-h-svh pt-4">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 md:max-w-none">
        <div className="">
          <div className="max-w-3xl">
            <h1 className="mt-2 font-display text-4xl md:text-[2.8rem]">
              Koppla ihop Jobi<span className="text-app-primary">.sh</span> med Arbetsförmedlingen
            </h1>
            <p className="mt-4 text-lg leading-8 text-app-muted">
              Här samlar vi butikslänkarna för Chrome, Safari och Firefox när respektive extension är
              publicerad i sin store.
            </p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {featureHighlights.map((item) => (
            <article key={item.title} className="rounded-3xl border border-app-stroke bg-app-card p-5">
              <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-app-primary/10 text-app-primary">
                <item.icon aria-hidden="true" size={20} strokeWidth={2.1} />
              </div>
              <h2 className="mt-4 text-xl font-semibold text-app-ink">{item.title}</h2>
              <p className="mt-2 text-base leading-7 text-app-muted">{item.body}</p>
            </article>
          ))}
        </div>

        <section className="grid gap-4 lg:grid-cols-1">
          {installTargets.map((target) => (
            <article
              id={`${target.browserKey}-store`}
              key={target.browserKey}
              className="scroll-mt-8 rounded-3xl border border-app-stroke bg-white p-5 shadow-[0_14px_32px_rgba(17,23,40,0.06)]"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-2xl font-semibold text-app-ink">{target.browserLabel}</h2>
                <span className="rounded-full bg-app-surface px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-app-primary">
                  {target.storeLabel}
                </span>
              </div>

              <p className="mt-4 text-sm font-semibold uppercase tracking-[0.12em] text-app-primary">
                {target.statusLabel}
              </p>

              <p className="mt-3 text-base leading-7 text-app-muted">{target.installDescription}</p>

              <ul className="mt-5 space-y-3 text-sm text-app-ink">
                <li className="flex items-start gap-2">
                  <CheckCircle2 aria-hidden="true" className="mt-0.5 shrink-0 text-app-primary" size={16} strokeWidth={2.2} />
                  <span>Rapportera jobb till Arbetsförmedlingen från aktivitetsrapporten.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 aria-hidden="true" className="mt-0.5 shrink-0 text-app-primary" size={16} strokeWidth={2.2} />
                  <span>Importera annonser från Platsbanken till Jobi.sh.</span>
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
                    {target.installLabel}
                  </Btn>
                </div>
              ) : (
                <div className="mt-6 rounded-2xl bg-app-surface px-4 py-3 text-sm leading-6 text-app-muted">
                  Store-länken läggs in här så snart {target.browserLabel}-versionen är publicerad.
                </div>
              )}
            </article>
          ))}
        </section>
      </section>
    </main>
  );
}