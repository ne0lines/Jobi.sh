"use client";

import type { HeroHighlight } from "@/lib/job-insights";
import jobSearchTips from "@/data/job-search-tips.json";
import jobSearchTipsEn from "@/data/job-search-tips.en.json";
import jobSearchTipsUk from "@/data/job-search-tips.uk.json";
import { Dialog } from "@base-ui/react/dialog";
import { useEffect, useState } from "react";
import { Btn } from "@/components/ui/btn";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  BriefcaseBusiness,
  MousePointerClick,
  Pause,
  Play,
  Puzzle,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

type Testimonial = {
  quote: string;
  name: string;
  role: string;
  summary: string;
};

const testimonialRotationMs = 10000;

type JobSearchTip = {
  body: string;
  id: string;
  title: string;
  url?: string;
};

function getRandomTipId(tips: readonly JobSearchTip[], previousTipId?: string | null) {
  if (tips.length === 0) {
    return null;
  }

  const eligibleTips = previousTipId
    ? tips.filter((tip) => tip.id !== previousTipId)
    : tips;
  const tipPool = eligibleTips.length > 0 ? eligibleTips : tips;
  const randomIndex = Math.floor(Math.random() * tipPool.length);

  return tipPool[randomIndex]?.id ?? null;
}

function getLocalizedJobSearchTips(locale: string): readonly JobSearchTip[] {
  if (locale === "en") {
    return jobSearchTipsEn;
  }

  if (locale === "uk") {
    return jobSearchTipsUk;
  }

  return jobSearchTips;
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

function getHeroHighlightLabel(
  label: HeroHighlight["label"],
  tLanding: ReturnType<typeof useTranslations>,
): string {
  if (label === "sparade") {
    return tLanding("statsSaved");
  }

  if (label === "ansökningar") {
    return tLanding("statsApplications");
  }

  if (label === "pågår") {
    return tLanding("statsInProgress");
  }

  return tLanding("statsInterviews");
}

const mainContentId = "landing-main-content";
const testimonialsDescriptionId = "landing-testimonials-description";
const testimonialPanelId = "landing-testimonial-panel";

const focusRingClassName =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-950";
const primaryNavLinkClassName = `${focusRingClassName} rounded-md text-sm font-medium text-app-muted transition hover:text-app-primary`;
const roundIconButtonClassName = `${focusRingClassName} inline-flex size-11 items-center justify-center rounded-full border border-app-stroke bg-white/78 text-app-ink transition hover:border-app-primary/30 hover:text-app-primary dark:bg-white/8`;

type TestimonialChangeOptions = {
  announce?: boolean;
  pauseAutoRotation?: boolean;
};

type TestimonialIndexUpdater = number | ((currentIndex: number) => number);

type LandingPageProps = {
  heroHighlights: readonly HeroHighlight[];
  signedIn: boolean;
};

function hasLocaleCookie(): boolean {
  if (globalThis.document === undefined) {
    return false;
  }

  return document.cookie
    .split(";")
    .some((cookiePart) => cookiePart.trim().startsWith("locale="));
}

export function LandingPage({ heroHighlights, signedIn }: Readonly<LandingPageProps>) {
  const router = useRouter();
  const locale = useLocale();
  const tNav = useTranslations("nav");
  const tLanding = useTranslations("landing");
  const tLanguage = useTranslations("language");
  const primaryCtaHref = signedIn ? "/dashboard" : "/auth";
  const heroPrimaryCtaLabel = signedIn ? tLanding("goToApp") : tLanding("heroPrimaryCta");
  const headerCtaLabel = signedIn ? tLanding("goToApp") : tLanding("headerSignInCta");
  const logoHref = "/";
  const featureCards = [
    {
      icon: BriefcaseBusiness,
      title: tLanding("featurePipelineTitle"),
      description: tLanding("featurePipelineDescription"),
      cardClassName: "bg-app-sky text-app-ink",
      iconClassName: "bg-white/75 text-app-primary",
      headingClassName: "text-app-primary",
      hasExtensionLink: false,
    },
    {
      icon: BarChart3,
      title: tLanding("featureStatisticsTitle"),
      description: tLanding("featureStatisticsDescription"),
      cardClassName: "bg-app-sand text-app-ink md:translate-y-8",
      iconClassName: "bg-white/75 text-app-sand-strong",
      headingClassName: "text-app-sand-strong",
      hasExtensionLink: false,
    },
    {
      icon: Puzzle,
      title: tLanding("featureExtensionTitle"),
      description: tLanding("featureExtensionDescription"),
      cardClassName: "bg-app-green text-app-ink",
      iconClassName: "bg-white/75 text-app-green-strong",
      headingClassName: "text-app-green-strong",
      hasExtensionLink: true,
    },
  ] as const;
  const steps = [
    {
      icon: Search,
      title: tLanding("step1Title"),
      description: tLanding("step1Description"),
    },
    {
      icon: MousePointerClick,
      title: tLanding("step2Title"),
      description: tLanding("step2Description"),
    },
    {
      icon: BadgeCheck,
      title: tLanding("step3Title"),
      description: tLanding("step3Description"),
    },
  ] as const;
  const testimonials: readonly Testimonial[] = [
    {
      quote: tLanding("testimonial1Quote"),
      name: "Sofia A.",
      role: tLanding("testimonial1Role"),
      summary: tLanding("testimonial1Summary"),
    },
    {
      quote: tLanding("testimonial2Quote"),
      name: "Erik L.",
      role: tLanding("testimonial2Role"),
      summary: tLanding("testimonial2Summary"),
    },
    {
      quote: tLanding("testimonial3Quote"),
      name: "Nadia K.",
      role: tLanding("testimonial3Role"),
      summary: tLanding("testimonial3Summary"),
    },
    {
      quote: tLanding("testimonial4Quote"),
      name: "Oskar S.",
      role: tLanding("testimonial4Role"),
      summary: tLanding("testimonial4Summary"),
    },
    {
      quote: tLanding("testimonial5Quote"),
      name: "Anna L.",
      role: tLanding("testimonial5Role"),
      summary: tLanding("testimonial5Summary"),
    },
  ] as const;
  const footerLinks = [
    { href: "/privacy", label: tLanding("footerPrivacy") },
    { href: "/terms", label: tLanding("footerTerms") },
    { href: "/gdpr", label: tLanding("footerGdpr") },
  ] as const;
  const localizedJobSearchTips = getLocalizedJobSearchTips(locale);
  const [activeTestimonialIndex, setActiveTestimonialIndex] = useState(0);
  const [isTestimonialAutoRotationEnabled, setIsTestimonialAutoRotationEnabled] = useState(
    testimonials.length > 1,
  );
  const [announceActiveTestimonial, setAnnounceActiveTestimonial] = useState(false);
  const [activeTipId, setActiveTipId] = useState<string | null>(() =>
    getRandomTipId(localizedJobSearchTips),
  );
  const [isLanguagePromptOpen, setIsLanguagePromptOpen] = useState(false);
  const activeTestimonial = testimonials[activeTestimonialIndex];
  const activeTip = localizedJobSearchTips.find((tip) => tip.id === activeTipId) ?? null;

  useEffect(() => {
    if (!hasLocaleCookie()) {
      const animationFrameId = globalThis.requestAnimationFrame(() => {
        setIsLanguagePromptOpen(true);
      });

      return () => {
        globalThis.cancelAnimationFrame(animationFrameId);
      };
    }

    return undefined;
  }, []);

  useEffect(() => {
    if (!isTestimonialAutoRotationEnabled || testimonials.length < 2) {
      return;
    }

    const intervalId = globalThis.setInterval(() => {
      setAnnounceActiveTestimonial(false);
      setActiveTestimonialIndex((currentIndex) =>
        currentIndex === testimonials.length - 1 ? 0 : currentIndex + 1,
      );
    }, testimonialRotationMs);

    return () => {
      globalThis.clearInterval(intervalId);
    };
  }, [isTestimonialAutoRotationEnabled, testimonials.length]);

  const updateActiveTestimonial = (
    nextIndex: TestimonialIndexUpdater,
    { announce = false, pauseAutoRotation = false }: TestimonialChangeOptions = {},
  ) => {
    if (pauseAutoRotation) {
      setIsTestimonialAutoRotationEnabled(false);
    }

    setAnnounceActiveTestimonial(announce);
    setActiveTestimonialIndex((currentIndex) =>
      typeof nextIndex === "function" ? nextIndex(currentIndex) : nextIndex,
    );
  };

  const showAnotherTip = () => {
    setActiveTipId((currentTipId) => getRandomTipId(localizedJobSearchTips, currentTipId));
  };

  const goToPreviousTestimonial = () => {
    updateActiveTestimonial(
      (currentIndex) => (currentIndex === 0 ? testimonials.length - 1 : currentIndex - 1),
      { announce: true, pauseAutoRotation: true },
    );
  };

  const goToNextTestimonial = () => {
    updateActiveTestimonial(
      (currentIndex) => (currentIndex === testimonials.length - 1 ? 0 : currentIndex + 1),
      { announce: true, pauseAutoRotation: true },
    );
  };

  const toggleTestimonialAutoRotation = () => {
    setAnnounceActiveTestimonial(false);
    setIsTestimonialAutoRotationEnabled((currentValue) => !currentValue);
  };

  const applyLanguageChoice = (nextLocale: "sv" | "en" | "uk") => {
    document.cookie = `locale=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
    setIsLanguagePromptOpen(false);
    router.refresh();
  };

  return (
    <div className="min-h-svh w-full pb-0 md:mx-auto md:max-w-270 md:px-4">
      <Dialog.Root
        open={isLanguagePromptOpen}
        onOpenChange={(open) => {
          if (!open && !hasLocaleCookie()) {
            return;
          }

          setIsLanguagePromptOpen(open);
        }}
      >
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-9998 bg-black/45 backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
          <Dialog.Popup className="fixed inset-0 z-9999 flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-3xl border border-app-stroke bg-white p-6 shadow-xl data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 dark:bg-zinc-900">
              <Dialog.Title className="font-display text-2xl text-app-ink">
                {tLanding("languagePromptTitle")}
              </Dialog.Title>
              <Dialog.Description className="mt-2 text-base leading-7 text-app-muted">
                {tLanding("languagePromptDescription")}
              </Dialog.Description>

              <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => applyLanguageChoice("sv")}
                  className={`${focusRingClassName} min-h-12 rounded-2xl border border-app-stroke bg-white px-4 text-sm font-semibold text-app-ink transition hover:border-app-primary/35 hover:text-app-primary dark:bg-white/8`}
                >
                  {tLanguage("sv")}
                </button>
                <button
                  type="button"
                  onClick={() => applyLanguageChoice("en")}
                  className={`${focusRingClassName} min-h-12 rounded-2xl border border-app-stroke bg-white px-4 text-sm font-semibold text-app-ink transition hover:border-app-primary/35 hover:text-app-primary dark:bg-white/8`}
                >
                  {tLanguage("en")}
                </button>
                <button
                  type="button"
                  onClick={() => applyLanguageChoice("uk")}
                  className={`${focusRingClassName} min-h-12 rounded-2xl border border-app-stroke bg-white px-4 text-sm font-semibold text-app-ink transition hover:border-app-primary/35 hover:text-app-primary dark:bg-white/8`}
                >
                  {tLanguage("uk")}
                </button>
              </div>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>

      <a
        href={`#${mainContentId}`}
        className={`sr-only z-30 rounded-md bg-app-ink px-4 py-3 text-sm font-semibold text-white ${focusRingClassName} focus:not-sr-only focus:absolute focus:left-4 focus:top-4`}
      >
        {tLanding("skipToContent")}
      </a>

      <div className="relative isolate overflow-hidden rounded-[2rem] flex flex-col gap-14 bg-[radial-gradient(circle_at_top_left,rgba(110,51,235,0.16),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(14,107,140,0.10),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(243,244,248,0.92))] shadow-[0_24px_80px_rgba(17,23,40,0.08)] ring-1 ring-black/5 dark:bg-[radial-gradient(circle_at_top_left,rgba(110,51,235,0.24),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(14,107,140,0.14),transparent_24%),linear-gradient(180deg,rgba(24,24,27,0.96),rgba(9,9,9,0.98))] dark:ring-white/10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[linear-gradient(180deg,rgba(255,255,255,0.55),transparent)] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent)]"
        />

        <header className="sticky top-3 z-20 px-4 pt-4 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 rounded-[1.6rem] border border-white/70 bg-white/80 px-4 py-3 shadow-[0_16px_40px_rgba(17,23,40,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/7 sm:px-6">
            <Link
              href={logoHref}
              aria-label={tLanding("homeLinkAria")}
              className={`${focusRingClassName} rounded-md text-5xl font-display font-bold leading-none tracking-[-0.05em]`}
            >
              Jobi<span className="text-app-primary">.sh</span>
            </Link>

            <nav aria-label={tNav("primaryNav")} className="hidden md:ml-auto md:block">
              <ul className="flex items-center gap-6">
                <li>
                  <Link href="/#funktioner" className={primaryNavLinkClassName}>
                    {tLanding("navFeatures")}
                  </Link>
                </li>
                <li>
                  <Link href="/#sa-funkar-det" className={primaryNavLinkClassName}>
                    {tLanding("navHowItWorks")}
                  </Link>
                </li>
                <li>
                  <Link href="/#vara-anvandare" className={primaryNavLinkClassName}>
                    {tLanding("navTestimonials")}
                  </Link>
                </li>
                <li>
                  <Link href="/company" className={`${primaryNavLinkClassName} font-semibold text-app-ink`}>
                    För företag
                  </Link>
                </li>
              </ul>
            </nav>

            <Btn href={primaryCtaHref} className="min-h-11 px-4 text-sm" icon={{ component: ArrowRight, position: "right", size: 16 }}>
              {headerCtaLabel}
            </Btn>
          </div>
        </header>

        <main id={mainContentId} tabIndex={-1} className="flex flex-col gap-14 pb-0">
          <section aria-labelledby="landing-hero-heading" className="px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-8xl">
              <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_13rem] lg:gap-12">
                <div className="max-w-3xl">
                  <h1 id="landing-hero-heading" className="mt-6 max-w-xl font-display text-5xl leading-[0.95] tracking-[-0.05em] text-app-ink sm:text-6xl lg:text-7xl">
                    {tLanding("heroTitle")}
                  </h1>

                  <p className="mt-6 max-w-xl text-lg leading-8 text-app-muted text-pretty sm:text-xl">
                    {tLanding("heroDescription")}
                  </p>

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Btn href={primaryCtaHref} className="px-6" icon={{ component: ArrowRight, position: "right" }}>
                      {heroPrimaryCtaLabel}
                    </Btn>
                    <Btn href="/#sa-funkar-det" variant="secondary" className="px-6">
                      {tLanding("heroSecondaryCta")}
                    </Btn>
                  </div>
                </div>

                <aside aria-labelledby="landing-hero-highlights-heading" className="lg:pt-6">
                  <h2 id="landing-hero-highlights-heading" className="sr-only">
                    {tLanding("heroHighlightsHeading")}
                  </h2>

                  <dl className="grid gap-3">
                    {heroHighlights.map((item) => {
                      const styles = heroHighlightStyles[item.label];

                      return (
                        <div
                          key={item.label}
                          className={`flex flex-col rounded-[1.4rem] border px-4 py-4 shadow-[0_12px_30px_rgba(17,23,40,0.06)] ${styles.cardClassName}`}
                        >
                          <dt className={`order-2 mt-2 text-sm ${styles.labelClassName}`}>
                            {getHeroHighlightLabel(item.label, tLanding)}
                          </dt>
                          <dd className={`order-1 font-display text-3xl leading-none ${styles.valueClassName}`}>
                            {item.value}
                          </dd>
                        </div>
                      );
                    })}
                  </dl>
                </aside>
              </div>
            </div>
          </section>

          <section aria-labelledby="landing-daily-tips-heading" className="scroll-mt-28 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-4">
                <div className="lg:w-2/3">
                  <h2 id="landing-daily-tips-heading" className="font-display text-3xl leading-tight text-app-ink sm:text-3xl">
                    {tLanding("dailyTipsTitle")}
                  </h2>
                  <p className="mt-2 text-lg leading-8 text-app-muted text-pretty">
                    {tLanding("dailyTipsDescription")}
                  </p>
                </div>

                <aside className="lg:w-1/3">
                  <div className="flex h-full flex-col items-start gap-3">
                    {activeTip ? (
                      <article
                        key={activeTip.id}
                        aria-live="polite"
                        aria-atomic="true"
                        className="animate-in fade-in-0 slide-in-from-bottom-2 rounded-[1.2rem] bg-app-card px-4 py-4 shadow-[0_10px_26px_rgba(17,23,40,0.04)] ring-1 ring-black/4 duration-500 dark:ring-white/8 sm:px-5 sm:py-5"
                      >
                        <h3 className="text-sm font-semibold leading-5 text-app-ink sm:text-base">{activeTip.title}</h3>
                        <p className="mt-2 text-xs leading-5 text-app-muted text-pretty sm:text-sm sm:leading-6">
                          {activeTip.body}
                        </p>
                      </article>
                    ) : null}

                    {localizedJobSearchTips.length > 1 ? (
                      <button
                        type="button"
                        onClick={showAnotherTip}
                        className={`${focusRingClassName} inline-flex min-h-11 items-center gap-2 rounded-full border border-app-stroke bg-white/70 px-4 py-2 text-sm font-semibold text-app-ink transition hover:border-app-primary/30 hover:text-app-primary dark:bg-white/8`}
                      >
                        {tLanding("showAnotherTip")}
                        <ArrowRight aria-hidden="true" className="size-4" strokeWidth={2.2} />
                      </button>
                    ) : null}
                  </div>
                </aside>
              </div>
            </div>
          </section>

          <section id="funktioner" aria-labelledby="landing-features-heading" className="scroll-mt-28 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <h2 id="landing-features-heading" className="sr-only">
                {tLanding("featuresHeading")}
              </h2>

              <ul className="grid gap-5 md:grid-cols-3 md:items-stretch">
                {featureCards.map((feature) => {
                  const Icon = feature.icon;

                  return (
                    <li
                      key={feature.title}
                      className={`${feature.cardClassName} flex min-h-72 flex-col justify-between rounded-[2rem] p-6 shadow-[0_18px_48px_rgba(17,23,40,0.08)] transition duration-200 hover:-translate-y-1`}
                    >
                      <div>
                        <div className={`inline-flex size-12 items-center justify-center rounded-2xl ${feature.iconClassName}`}>
                          <Icon aria-hidden="true" className="size-5" strokeWidth={2.2} />
                        </div>
                        <h3 className={`mt-5 font-display text-2xl leading-tight ${feature.headingClassName}`}>
                          {feature.title}
                        </h3>
                        <p className="mt-3 text-base leading-7 text-app-muted text-pretty">
                          {feature.description}
                        </p>
                      </div>

                      {feature.hasExtensionLink ? (
                        <div className="mt-6">
                          <Link
                            href="/extension"
                            className={`${focusRingClassName} inline-flex items-center gap-2 rounded-md text-sm font-semibold text-app-muted transition hover:text-app-primary`}
                          >
                            {tLanding("extensionLinkLabel")}
                            <ArrowRight aria-hidden="true" className="size-4" strokeWidth={2.2} />
                          </Link>
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>

          <section id="sa-funkar-det" aria-labelledby="landing-steps-heading" className="scroll-mt-28 mt-4 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl rounded-[2.2rem] border border-app-stroke/70 bg-white/70 px-6 py-10 shadow-[0_18px_50px_rgba(17,23,40,0.06)] backdrop-blur dark:bg-white/5 sm:px-8 lg:px-12 lg:py-14">
              <div className="mx-auto max-w-2xl text-center">
                <h2 id="landing-steps-heading" className="font-display text-4xl leading-tight text-app-ink sm:text-5xl">
                  {tLanding("howItWorksTitle")}
                </h2>
                <p className="mt-4 text-md leading-8 text-app-muted">
                  {tLanding("howItWorksDescription")}
                </p>
              </div>

              <ol className="mt-10 grid gap-5 md:grid-cols-3">
                {steps.map((step, index) => {
                  const Icon = step.icon;

                  return (
                    <li
                      key={step.title}
                      className="rounded-[1.8rem] bg-app-card px-5 py-6 text-center shadow-[0_12px_30px_rgba(17,23,40,0.05)] ring-1 ring-black/4 dark:ring-white/8"
                    >
                      <div className="mx-auto inline-flex size-14 items-center justify-center rounded-full bg-app-primary/12 text-app-primary">
                        <Icon aria-hidden="true" className="size-6" strokeWidth={2.2} />
                      </div>
                      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">
                        {tLanding("stepLabel", { number: index + 1 })}
                      </p>
                      <h3 className="mt-2 font-display text-2xl text-app-ink">{step.title}</h3>
                      <p className="mt-3 text-base leading-7 text-app-muted text-pretty">{step.description}</p>
                    </li>
                  );
                })}
              </ol>
            </div>
          </section>

          <section
            id="vara-anvandare"
            aria-labelledby="landing-testimonials-heading"
            aria-describedby={testimonials.length > 1 ? testimonialsDescriptionId : undefined}
            className="px-4 sm:px-6 lg:px-8"
            onFocusCapture={() => setIsTestimonialAutoRotationEnabled(false)}
          >
            <div className="mx-auto max-w-5xl rounded-[2.5rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.7),rgba(255,255,255,0.42))] px-6 py-10 text-center shadow-[0_18px_60px_rgba(17,23,40,0.07)] ring-1 ring-black/5 backdrop-blur dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] dark:ring-white/10 sm:px-10 lg:px-14 lg:py-16">
              <div className="flex flex-col gap-6 text-left sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 id="landing-testimonials-heading" className="font-display text-3xl leading-tight text-app-ink sm:text-4xl">
                    {tLanding("testimonialsTitle")}
                  </h2>
                  {testimonials.length > 1 ? (
                    <p id={testimonialsDescriptionId} className="sr-only">
                      {tLanding("testimonialsRegionDescription")}
                    </p>
                  ) : null}
                </div>

                {testimonials.length > 1 ? (
                  <div className="flex items-center gap-2 self-start" aria-label={tLanding("testimonialControlsLabel")}>
                    <button
                      type="button"
                      onClick={goToPreviousTestimonial}
                      aria-label={tLanding("previousTestimonialAria")}
                      className={roundIconButtonClassName}
                    >
                      <ChevronLeft aria-hidden="true" className="size-5" strokeWidth={2.2} />
                    </button>
                    <button
                      type="button"
                      onClick={goToNextTestimonial}
                      aria-label={tLanding("nextTestimonialAria")}
                      className={roundIconButtonClassName}
                    >
                      <ChevronRight aria-hidden="true" className="size-5" strokeWidth={2.2} />
                    </button>
                    <button
                      type="button"
                      onClick={toggleTestimonialAutoRotation}
                      aria-label={
                        isTestimonialAutoRotationEnabled
                          ? tLanding("pauseTestimonialRotation")
                          : tLanding("resumeTestimonialRotation")
                      }
                      aria-pressed={!isTestimonialAutoRotationEnabled}
                      className={roundIconButtonClassName}
                    >
                      {isTestimonialAutoRotationEnabled ? (
                        <Pause aria-hidden="true" className="size-5" strokeWidth={2.2} />
                      ) : (
                        <Play aria-hidden="true" className="size-5" strokeWidth={2.2} />
                      )}
                    </button>
                  </div>
                ) : null}
              </div>

              <div className="mt-8">
                <figure
                  id={testimonialPanelId}
                  aria-live={announceActiveTestimonial ? "polite" : "off"}
                  aria-atomic="true"
                  aria-label={
                    testimonials.length > 1
                      ? tLanding("testimonialPosition", {
                          current: activeTestimonialIndex + 1,
                          total: testimonials.length,
                        })
                      : undefined
                  }
                  className="mx-auto max-w-4xl rounded-[2rem] bg-white/86 p-6 text-left shadow-[0_18px_44px_rgba(17,23,40,0.06)] ring-1 ring-black/5 backdrop-blur dark:bg-white/6 dark:ring-white/10 sm:p-8"
                >
                  <div key={activeTestimonial.name} className="animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
                    <blockquote className="-mt-4 max-w-3xl pt-4 font-display text-3xl leading-tight text-app-ink text-pretty sm:text-4xl">
                      <span aria-hidden="true" className="text-5xl leading-none text-app-primary">
                        ”
                      </span>
                      {activeTestimonial.quote}
                      <span aria-hidden="true" className="text-5xl leading-none text-app-primary">
                        ”
                      </span>
                    </blockquote>
                    <figcaption className="mt-8 flex flex-wrap items-center gap-4">
                      <div aria-hidden="true" className="inline-flex size-12 items-center justify-center rounded-full bg-app-primary/12 font-display text-lg text-app-primary">
                        {activeTestimonial.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-base font-semibold text-app-ink">{activeTestimonial.name}</p>
                        <p className="text-sm text-app-muted">{activeTestimonial.role}</p>
                      </div>
                    </figcaption>
                  </div>
                </figure>
              </div>

              {testimonials.length > 1 ? (
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-left">
                  <ul className="flex items-center gap-2" aria-label={tLanding("testimonialPaginationLabel")}>
                    {testimonials.map((testimonial, index) => {
                      const isActive = index === activeTestimonialIndex;

                      return (
                        <li key={testimonial.name}>
                          <button
                            type="button"
                            onClick={() =>
                              updateActiveTestimonial(index, {
                                announce: true,
                                pauseAutoRotation: true,
                              })
                            }
                            aria-label={tLanding("testimonialAria", {
                              number: index + 1,
                              summary: testimonial.summary,
                            })}
                            aria-controls={testimonialPanelId}
                            aria-current={isActive ? "true" : undefined}
                            className={`${focusRingClassName} h-2.5 rounded-full transition-all ${
                              isActive ? "w-8 bg-app-primary" : "w-2.5 bg-app-stroke"
                            }`}
                          />
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : null}
            </div>
          </section>

          <section aria-labelledby="landing-benefits-heading" className="sm:px-6 lg:px-8">
            <h2 id="landing-benefits-heading" className="sr-only">
              {tLanding("benefitsHeading")}
            </h2>

            <ul className="grid gap-3 text-left sm:grid-cols-3">
              <li className="rounded-[1.4rem] bg-app-card px-4 py-4">
                <BadgeCheck aria-hidden="true" className="size-5 text-app-primary" strokeWidth={2.2} />
                <p className="mt-3 text-sm leading-6 text-app-muted text-pretty">{tLanding("benefit1")}</p>
              </li>
              <li className="rounded-[1.4rem] bg-app-card px-4 py-4">
                <BadgeCheck aria-hidden="true" className="size-5 text-app-primary" strokeWidth={2.2} />
                <p className="mt-3 text-sm leading-6 text-app-muted text-pretty">{tLanding("benefit2")}</p>
              </li>
              <li className="rounded-[1.4rem] bg-app-card px-4 py-4">
                <BadgeCheck aria-hidden="true" className="size-5 text-app-primary" strokeWidth={2.2} />
                <p className="mt-3 text-sm leading-6 text-app-muted text-pretty">{tLanding("benefit3")}</p>
              </li>
            </ul>
          </section>

          <section aria-labelledby="landing-cta-heading" className="px-4 pb-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] bg-[linear-gradient(135deg,#6e33eb_0%,#8148ff_100%)] px-6 py-12 text-center shadow-[0_26px_60px_rgba(110,51,235,0.28)] sm:px-10 lg:px-14 lg:py-16">
              <div className="mx-auto max-w-3xl">
                <h2 id="landing-cta-heading" className="font-display text-4xl leading-[0.95] text-white sm:text-5xl lg:text-5xl">
                  {tLanding("ctaTitle")}
                </h2>
                <p className="mt-5 text-lg leading-8 text-white/82">
                  {tLanding("ctaDescription")}
                </p>
                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Btn href={primaryCtaHref} hex="#ffffff" className="px-6" icon={{ component: ArrowRight, position: "right" }}>
                    {heroPrimaryCtaLabel}
                  </Btn>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="mx-4 py-8 sm:mx-6 lg:mx-8 border-t border-black/6 dark:border-white/8">
          <div className="mx-auto max-w-7xl md:grid md:grid-cols-3 md:items-center md:gap-6">
            <div>
              <Link
                href={logoHref}
                aria-label={tLanding("homeLinkAria")}
                className={`${focusRingClassName} rounded-md text-[1.45rem] font-display font-bold leading-none tracking-[-0.05em]`}
              >
                Jobi<span className="text-app-primary">.sh</span>
              </Link>
              <p className="mt-3 text-sm text-app-muted">{tLanding("footerTagline")}</p>
            </div>

            <div className="mt-6 flex w-full justify-center md:mt-0 md:justify-center">
              <div className="w-full max-w-72">
                <LanguageSwitcher />
              </div>
            </div>

            <nav aria-label={tNav("footerNav")} className="mt-6 md:mt-0 md:justify-self-end"> 
              <ul className="flex flex-wrap gap-4 text-sm text-app-muted">
                {footerLinks.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className={`${focusRingClassName} rounded-md transition hover:text-app-primary`}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </footer>
      </div>
    </div>
  );
}