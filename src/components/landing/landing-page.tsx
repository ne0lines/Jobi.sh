"use client";

import type { HeroHighlight } from "@/lib/job-insights";
import jobSearchTips from "@/data/job-search-tips.json";
import { useEffect, useState } from "react";
import { Btn } from "@/components/ui/btn";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  BriefcaseBusiness,
  MousePointerClick,
  Puzzle,
  Search,
} from "lucide-react";
import Link from "next/link";

const featureCards = [
  {
    icon: BriefcaseBusiness,
    title: "Pipeline-översikt",
    description:
      "Samla jobb i en vy som visar vad som krävs härnäst. Tydligt och enkelt att följa upp utan att behöva hålla reda på egna anteckningar eller kalkylark.",
    cardClassName: "bg-app-sky text-app-ink",
    iconClassName: "bg-white/75 text-app-primary",
    headingClassName: "text-app-primary",
  },
  {
    icon: BarChart3,
    title: "Statistik som motiverar",
    description:
      "Få en snabb bild av dina ansökningar, intervjuer och erbjudanden utan kalkylark eller manuell summering.",
    cardClassName: "bg-app-sand text-app-ink md:translate-y-8",
    iconClassName: "bg-white/75 text-app-sand-strong",
    headingClassName: "text-app-sand-strong",
  },
  {
    icon: Puzzle,
    title: "Webbläsartillägg i vardagen",
    description:
      "Importera jobbannonserna direkt från Platsbanken. Aktivitetsrapportera med bara ett klick när du loggar in på Arbetsförmedlingen.",
    cardClassName: "bg-app-green text-app-ink",
    iconClassName: "bg-white/75 text-app-green-strong",
    headingClassName: "text-app-green-strong",
  },
] as const;

const steps = [
  {
    icon: Search,
    title: "Hitta jobb",
    description: "Fortsätt söka där du redan letar efter roller som passar dig.",
  },
  {
    icon: MousePointerClick,
    title: "Spara med ett klick",
    description:
      "Spara jobbannonser i Jobi.sh med ett klick, med hjälp av vårt webbläsartillägg.",
  },
  {
    icon: BadgeCheck,
    title: "Håll ihop processen",
    description:
      "Se status, nästa uppföljning och vad som faktiskt leder vidare till intervju.",
  },
] as const;

type Testimonial = {
  quote: string;
  name: string;
  role: string;
  summary: string;
};

// Lägg till fler testimonials här. Rotatorn plockar upp nya poster automatiskt.
const testimonials: readonly Testimonial[] = [
  {
    quote: "Jag fick direkt bättre koll på vilka ansökningar som behövde följas upp.",
    name: "Sofia A.",
    role: "UX-designer",
    summary: "Bättre överblick",
  },
  {
    quote: "Jag sparar annonsen direkt och ser hela processen på ett ställe.",
    name: "Erik L.",
    role: "Projektledare",
    summary: "Sparar tid",
  },
  {
    quote: "Aktivitetsrapporteringen går mycket snabbare och blir lätt att komma ihåg.",
    name: "Nadia K.",
    role: "Sjuksköterska",
    summary: "Snabbare rapportering",
  },
  {
    quote: "Jag ser snabbare vilka ansökningar som faktiskt leder vidare.",
    name: "Oskar S.",
    role: "Systemutvecklare",
    summary: "Tydligare fokus",
  },
  {
    quote: "Allt finns samlat på ett ställe, vilket gör jobbsökandet lugnare.",
    name: "Anna L.",
    role: "Marknadsförare",
    summary: "Mer ordning, mindre stress",
  }
] as const;

const testimonialRotationMs = 10000;
const tipRotationMs = 15000;

type JobSearchTip = (typeof jobSearchTips)[number];

function getRandomTip(previousTipId?: string) {
  if (jobSearchTips.length === 0) {
    return null;
  }

  const eligibleTips = previousTipId
    ? jobSearchTips.filter((tip) => tip.id !== previousTipId)
    : jobSearchTips;
  const tipPool = eligibleTips.length > 0 ? eligibleTips : jobSearchTips;
  const randomIndex = Math.floor(Math.random() * tipPool.length);

  return tipPool[randomIndex] ?? null;
}

const heroHighlightStyles: Record<HeroHighlight["label"], {
  cardClassName: string;
  labelClassName: string;
  valueClassName: string;
}> = {
  sparade: {
    cardClassName: "border-app-stroke bg-app-card dark:bg-app-card",
    labelClassName: "text-app-muted",
    valueClassName: "text-app-ink",
  },
  ansökningar: {
    cardClassName: "border-transparent bg-blue-100 dark:bg-[#123348]",
    labelClassName: "text-[#295a99]/78 dark:text-[#9bc2ff]/82",
    valueClassName: "text-[#295a99] dark:text-[#9bc2ff]",
  },
  pågår: {
    cardClassName: "border-transparent bg-[#e8cb72] dark:bg-[#3a2a0f]",
    labelClassName: "text-[#7a4b00]/78 dark:text-[#ffd38a]/82",
    valueClassName: "text-[#7a4b00] dark:text-[#ffd38a]",
  },
  intervjuer: {
    cardClassName: "border-transparent bg-cyan-100 dark:bg-[#123348]",
    labelClassName: "text-app-cyan-strong/78 dark:text-[#8edcff]/82",
    valueClassName: "text-app-cyan-strong dark:text-[#8edcff]",
  },
};

const footerLinks = [
  { href: "/privacy", label: "Integritet" },
  { href: "/terms", label: "Villkor" },
  { href: "/gdpr", label: "GDPR" },
] as const;

type LandingPageProps = {
  heroHighlights: readonly HeroHighlight[];
  signedIn: boolean;
};

export function LandingPage({ heroHighlights, signedIn }: Readonly<LandingPageProps>) {
  const primaryCtaHref = signedIn ? "/dashboard" : "/auth";
  const primaryCtaLabel = signedIn ? "Till appen" : "Skapa konto gratis";
  const logoHref = "/";
  const [activeTestimonialIndex, setActiveTestimonialIndex] = useState(0);
  const [activeTip, setActiveTip] = useState<JobSearchTip | null>(() => getRandomTip());
  const activeTestimonial = testimonials[activeTestimonialIndex];

  useEffect(() => {
    if (testimonials.length < 2) {
      return;
    }

    const intervalId = globalThis.setInterval(() => {
      setActiveTestimonialIndex((currentIndex) =>
        currentIndex === testimonials.length - 1 ? 0 : currentIndex + 1,
      );
    }, testimonialRotationMs);

    return () => {
      globalThis.clearInterval(intervalId);
    };
  }, [activeTestimonialIndex]);

  useEffect(() => {
    if (jobSearchTips.length < 2) {
      return;
    }

    const intervalId = globalThis.setInterval(() => {
      setActiveTip((currentTip) => getRandomTip(currentTip?.id) ?? currentTip);
    }, tipRotationMs);

    return () => {
      globalThis.clearInterval(intervalId);
    };
  }, []);

  const goToPreviousTestimonial = () => {
    setActiveTestimonialIndex((currentIndex) =>
      currentIndex === 0 ? testimonials.length - 1 : currentIndex - 1,
    );
  };

  const goToNextTestimonial = () => {
    setActiveTestimonialIndex((currentIndex) =>
      currentIndex === testimonials.length - 1 ? 0 : currentIndex + 1,
    );
  };

  return (
    <main className="min-h-svh w-full pb-0 md:mx-auto md:max-w-270 md:px-4">
      <div className="flex flex-col gap-14 relative isolate overflow-hidden rounded-[2rem] bg-[radial-gradient(circle_at_top_left,rgba(110,51,235,0.16),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(14,107,140,0.10),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(243,244,248,0.92))] shadow-[0_24px_80px_rgba(17,23,40,0.08)] ring-1 ring-black/5 dark:bg-[radial-gradient(circle_at_top_left,rgba(110,51,235,0.24),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(14,107,140,0.14),transparent_24%),linear-gradient(180deg,rgba(24,24,27,0.96),rgba(9,9,9,0.98))] dark:ring-white/10">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[linear-gradient(180deg,rgba(255,255,255,0.55),transparent)] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent)]" />

        <header className="sticky top-3 z-20 px-4 pt-4 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-[1.6rem] border border-white/70 bg-white/80 px-4 py-3 shadow-[0_16px_40px_rgba(17,23,40,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/7 sm:px-6">
            <Link href={logoHref} className="text-5xl font-display font-bold leading-none tracking-[-0.05em]">
              Jobi<span className="text-app-primary">.sh</span>
            </Link>

            <nav aria-label="Landing navigation" className="hidden items-center gap-6 md:flex">
              <Link href="/#funktioner" className="text-sm font-medium text-app-muted transition hover:text-app-primary">
                Funktioner
              </Link>
              <Link href="/#sa-funkar-det" className="text-sm font-medium text-app-muted transition hover:text-app-primary">
                Så funkar det
              </Link>
              <Link href="/#vara-anvandare" className="text-sm font-medium text-app-muted transition hover:text-app-primary">
                Våra användare
              </Link>
            </nav>

            <Btn href={primaryCtaHref} className="min-h-11 px-4 text-sm" icon={{ component: ArrowRight, position: "right", size: 16 }}>
              {signedIn ? "Till appen" : "Logga in"}
            </Btn>
          </div>
        </header>

        <section className="px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-8xl">
            <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_13rem] lg:gap-12">
              <div className="max-w-3xl">

                <h1 className="mt-6 max-w-xl font-display text-5xl leading-[0.95] tracking-[-0.05em] text-app-ink sm:text-6xl lg:text-7xl">
                  Organisera ditt jobbsökande som ett proffs.
                </h1>

                <p className="mt-6 max-w-xl text-lg leading-8 text-app-muted text-pretty sm:text-xl">
                  Jobi.sh hjälper dig att hålla koll på ansökningar, intervjuer och erbjudanden på ett och samma ställe.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Btn href={primaryCtaHref} className="px-6" icon={{ component: ArrowRight, position: "right" }}>
                    {primaryCtaLabel}
                  </Btn>
                  <Btn href="/#sa-funkar-det" variant="secondary" className="px-6">
                    Se hur det funkar
                  </Btn>
                </div>
              </div>

              <div className="grid gap-3 lg:pt-6">
                {heroHighlights.map((item) => {
                  const styles = heroHighlightStyles[item.label];

                  return (
                    <article
                      key={item.label}
                      className={`rounded-[1.4rem] border px-4 py-4 shadow-[0_12px_30px_rgba(17,23,40,0.06)] ${styles.cardClassName}`}
                    >
                      <strong className={`block font-display text-3xl leading-none ${styles.valueClassName}`}>
                        {item.value}
                      </strong>
                      <span className={`mt-2 block text-sm ${styles.labelClassName}`}>
                        {item.label}
                      </span>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="scroll-mt-28 px-4 sm:px-6 lg:px-8 ">
          <div className="mx-auto max-w-7xl">
            <div className="flex gap-4">
              <div className="w-2/3">
                <h2 className="font-display text-3xl leading-tight text-app-ink sm:text-3xl">
                  Få nya jobbsökartips varje dag
                </h2>
                <p className="mt-2 text-lg leading-8 text-app-muted text-pretty">
                  Aktivera pushnotiser för små, konkreta tips som hjälper dig optimera ditt jobbsökande, hålla igång rutinen och få nya idéer kring nästa steg. Du väljer själv när tipsnotiserna ska vara på och använder dem när de faktiskt hjälper dig.
                </p>
              </div>
              <div className="w-1/3 flex items-start">
              {activeTip ? (
                    <article
                      key={activeTip.id}
                      className="animate-in fade-in-0 my-auto slide-in-from-bottom-2 rounded-[1.2rem] bg-app-card px-4 py-4 shadow-[0_10px_26px_rgba(17,23,40,0.04)] ring-1 ring-black/4 duration-500 dark:ring-white/8 sm:px-5 sm:py-5"
                    >
                      <h3 className="text-sm font-semibold leading-5 text-app-ink sm:text-base">{activeTip.title}</h3>
                      <p className="mt-2 text-xs leading-5 text-app-muted text-pretty sm:text-sm sm:leading-6">
                        {activeTip.body}
                      </p>
                    </article>
              ) : null}
              </div>
            </div>
          </div>
        </section>
        <section id="funktioner" className="scroll-mt-28 px-4 sm:px-6 lg:px-8 ">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-5 md:grid-cols-3 md:items-stretch">
              {featureCards.map((feature) => {
                const Icon = feature.icon;

                return (
                  <article
                    key={feature.title}
                    className={`${feature.cardClassName} flex min-h-72 flex-col justify-between rounded-[2rem] p-6 shadow-[0_18px_48px_rgba(17,23,40,0.08)] transition duration-200 hover:-translate-y-1`}
                  >
                    <div>
                      <div className={`inline-flex size-12 items-center justify-center rounded-2xl ${feature.iconClassName}`}>
                        <Icon className="size-5" strokeWidth={2.2} />
                      </div>
                      <h3 className={`mt-5 font-display text-2xl leading-tight ${feature.headingClassName}`}>
                        {feature.title}
                      </h3>
                      <p className="mt-3 text-base leading-7 text-app-muted text-pretty">
                        {feature.description}
                      </p>
                    </div>

                    {feature.title === "Webbläsartillägg i vardagen" ? (
                      <div className="mt-6">
                        <Link href="/extension" className="inline-flex items-center gap-2 text-sm font-semibold text-app-muted transition hover:text-app-primary">
                          Läs mer om extension
                          <ArrowRight className="size-4" strokeWidth={2.2} />
                        </Link>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="sa-funkar-det" className="scroll-mt-28 mt-4 px-4 sm:px-6 lg:px-8 ">
          <div className="mx-auto max-w-6xl rounded-[2.2rem] border border-app-stroke/70 bg-white/70 px-6 py-10 shadow-[0_18px_50px_rgba(17,23,40,0.06)] backdrop-blur dark:bg-white/5 sm:px-8 lg:px-12 lg:py-14">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-4xl leading-tight text-app-ink sm:text-5xl">
                Så funkar det
              </h2>
              <p className="mt-4 text-md leading-8 text-app-muted">
                Tre enkla steg för att få ordning på ditt jobbsökande utan att bygga ett eget system runt det.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {steps.map((step, index) => {
                const Icon = step.icon;

                return (
                  <article
                    key={step.title}
                    className="rounded-[1.8rem] bg-app-card px-5 py-6 text-center shadow-[0_12px_30px_rgba(17,23,40,0.05)] ring-1 ring-black/4 dark:ring-white/8"
                  >
                    <div className="mx-auto inline-flex size-14 items-center justify-center rounded-full bg-app-primary/12 text-app-primary">
                      <Icon className="size-6" strokeWidth={2.2} />
                    </div>
                    <span className="mt-5 block text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">
                      Steg {index + 1}
                    </span>
                    <h3 className="mt-2 font-display text-2xl text-app-ink">{step.title}</h3>
                    <p className="mt-3 text-base leading-7 text-app-muted text-pretty">{step.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="vara-anvandare" className="px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl rounded-[2.5rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.7),rgba(255,255,255,0.42))] px-6 py-10 text-center shadow-[0_18px_60px_rgba(17,23,40,0.07)] ring-1 ring-black/5 backdrop-blur dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] dark:ring-white/10 sm:px-10 lg:px-14 lg:py-16">
            <div className="flex flex-col gap-6 text-left sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="font-display text-3xl leading-tight text-app-ink sm:text-4xl">
                  Våra användares perspektiv
                </h2>
              </div>

              {testimonials.length > 1 ? (
                <div className="flex items-center gap-2 self-start">
                  <button
                    type="button"
                    onClick={goToPreviousTestimonial}
                    aria-label="Visa föregående testimonial"
                    className="inline-flex size-11 items-center justify-center rounded-full border border-app-stroke bg-white/78 text-app-ink transition hover:border-app-primary/30 hover:text-app-primary dark:bg-white/8"
                  >
                    <ChevronLeft className="size-5" strokeWidth={2.2} />
                  </button>
                  <button
                    type="button"
                    onClick={goToNextTestimonial}
                    aria-label="Visa nästa testimonial"
                    className="inline-flex size-11 items-center justify-center rounded-full border border-app-stroke bg-white/78 text-app-ink transition hover:border-app-primary/30 hover:text-app-primary dark:bg-white/8"
                  >
                    <ChevronRight className="size-5" strokeWidth={2.2} />
                  </button>
                </div>
              ) : null}
            </div>

            <div className="mt-8">
              <article
                aria-live="polite"
                className="mx-auto max-w-4xl rounded-[2rem] bg-white/86 p-6 text-left shadow-[0_18px_44px_rgba(17,23,40,0.06)] ring-1 ring-black/5 backdrop-blur dark:bg-white/6 dark:ring-white/10 sm:p-8"
              >
                <div key={activeTestimonial.name} className="animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
                  <blockquote className="-mt-4 max-w-3xl font-display text-3xl leading-tight text-app-ink sm:text-4xl pt-4 text-pretty">
                  <span className="text-5xl leading-none text-app-primary">”</span>
                    {activeTestimonial.quote}
                  <span className="text-5xl leading-none text-app-primary">”</span>
                  </blockquote>
                  <div className="mt-8 flex flex-wrap items-center gap-4">
                    <div className="inline-flex size-12 items-center justify-center rounded-full bg-app-primary/12 font-display text-lg text-app-primary">
                      {activeTestimonial.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-base font-semibold text-app-ink">
                        {activeTestimonial.name}
                      </p>
                      <p className="text-sm text-app-muted">{activeTestimonial.role}</p>
                    </div>
                  </div>
                </div>
              </article>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-2">
                {testimonials.map((testimonial, index) => {
                  const isActive = index === activeTestimonialIndex;

                  return (
                    <button
                      key={testimonial.name}
                      type="button"
                      onClick={() => setActiveTestimonialIndex(index)}
                      aria-label={`Visa testimonial ${index + 1}`}
                      className={`h-2.5 rounded-full transition-all ${
                        isActive ? "w-8 bg-app-primary" : "w-2.5 bg-app-stroke"
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </section>
        <section className="sm:px-6 lg:px-8">
          <div className="grid gap-3 text-left sm:grid-cols-3">
            <div className="rounded-[1.4rem] bg-app-card px-4 py-4">
              <BadgeCheck className="size-5 text-app-primary" strokeWidth={2.2} />
              <p className="mt-3 text-sm leading-6 text-app-muted text-pretty">All jobbdata på ett ställe i stället för utspridda anteckningar.</p>
            </div>
            <div className="rounded-[1.4rem] bg-app-card px-4 py-4">
              <BadgeCheck className="size-5 text-app-primary" strokeWidth={2.2} />
              <p className="mt-3 text-sm leading-6 text-app-muted text-pretty">Snabb översikt över hur många processer som faktiskt rör på sig.</p>
            </div>
            <div className="rounded-[1.4rem] bg-app-card px-4 py-4">
              <BadgeCheck className="size-5 text-app-primary" strokeWidth={2.2} />
              <p className="mt-3 text-sm leading-6 text-app-muted text-pretty">Mindre friktion mellan jobbletande, uppföljning och aktivitetsrapportering.</p>
            </div>
          </div>
        </section>
        <section className="px-4 pb-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] bg-[linear-gradient(135deg,#6e33eb_0%,#8148ff_100%)] px-6 py-12 text-center shadow-[0_26px_60px_rgba(110,51,235,0.28)] sm:px-10 lg:px-14 lg:py-16">
            <div className="mx-auto max-w-3xl">
              <h2 className="font-display text-4xl leading-[0.95] text-white sm:text-5xl lg:text-5xl">
                Redo att landa ditt nästa jobb?
              </h2>
              <p className="mt-5 text-lg leading-8 text-white/82">
                Öppna Jobi.sh och samla ditt jobbsökande i ett flöde som är byggt för att användas varje dag.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Btn href={primaryCtaHref} hex="#ffffff" className="px-6" icon={{ component: ArrowRight, position: "right" }}>
                  {primaryCtaLabel}
                </Btn>
              </div>
            </div>
          </div>
        </section>

        <footer className="px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 border-t border-black/6 pt-8 dark:border-white/8 md:flex-row md:items-end md:justify-between">
            <div>
              <Link href={logoHref} className="text-[1.45rem] font-display font-bold leading-none tracking-[-0.05em]">
                Jobi<span className="text-app-primary">.sh</span>
              </Link>
              <p className="mt-3 text-sm text-app-muted">
                Lite mindre jobbigt. Mer jobi.sh.
              </p>
            </div>

            <nav aria-label="Footer navigation" className="flex flex-wrap gap-4 text-sm text-app-muted">
              {footerLinks.map((item) => (
                <Link key={item.href} href={item.href} className="transition hover:text-app-primary">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </footer>
      </div>
    </main>
  );
}