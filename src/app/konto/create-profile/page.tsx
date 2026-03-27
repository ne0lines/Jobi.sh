"use client";

import { Btn } from "@/components/ui/btn";
import { Input } from "@/components/ui/input";
import { TERMS_VERSION } from "@/lib/legal";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type FormState = {
  name: string;
  profession: string;
};

type ExistingProfile = {
  name: string;
  profession: string;
  termsVersion: string | null;
};

export default function CreateProfilePage() {
  const { user } = useUser();
  const router = useRouter();

  const email = user?.emailAddresses[0]?.emailAddress ?? "";

  const [form, setForm] = useState<FormState>({ name: "", profession: "" });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [existingProfile, setExistingProfile] =
    useState<ExistingProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/user");
        if (res.ok) {
          const data = (await res.json()) as ExistingProfile;
          setExistingProfile(data);
          setForm({ name: data.name, profession: data.profession });
        }
      } catch {
        // No existing profile, proceed with empty form
      } finally {
        setIsLoadingProfile(false);
      }
    }
    void fetchProfile();
  }, []);

  const needsTermsUpdate =
    existingProfile !== null &&
    existingProfile.termsVersion !== TERMS_VERSION;

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function submitProfile() {
    setIsSubmitting(true);
    setFeedback("");

    try {
      const res = await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          profession: form.profession,
          termsAccepted,
          termsVersion: TERMS_VERSION,
        }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setFeedback(data.error ?? "Kunde inte spara profilen.");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setFeedback("Kunde inte spara profilen.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleSubmit: React.ComponentProps<"form">["onSubmit"] = (e) => {
    e.preventDefault();
    void submitProfile();
  };

  if (isLoadingProfile) {
    return (
      <main className="min-h-dvh px-4 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
        <h1 className="font-display text-4xl leading-none">
          Jobi<span className="text-app-primary">.sh</span>
        </h1>
      </main>
    );
  }

  return (
    <main className="min-h-dvh px-4 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <h1 className="font-display text-4xl leading-none">
        Jobi<span className="text-app-primary">.sh</span>
      </h1>
      <section className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col gap-4">
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <div className="w-full text-center">
            {needsTermsUpdate ? (
              <>
                <h2 className="text-2xl">Uppdaterade användarvillkor</h2>
                <p className="mt-2 text-base text-app-muted">
                  Vi har uppdaterat våra användarvillkor. Du behöver godkänna
                  dem för att fortsätta använda Jobi.sh.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-2xl">Skapa profil</h2>
                <p className="mt-2 text-base text-app-muted">
                  Fyll i dina uppgifter för att komma igång.
                </p>
              </>
            )}
            {feedback ? (
              <p className="mt-4 rounded-2xl border border-app-stroke bg-app-card px-4 py-3 text-sm text-red-500">
                {feedback}
              </p>
            ) : null}
          </div>

          {needsTermsUpdate && (
            <div className="w-full rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Dina uppgifter är ifyllda nedan. Granska dem och godkänn de
              uppdaterade villkoren för att fortsätta.
            </div>
          )}

          <form className="flex w-full flex-col gap-4" onSubmit={handleSubmit}>
            <label className="block font-semibold text-app-muted">
              <span className="block">E-postadress</span>
              <Input
                className="mt-2 w-full rounded-2xl border border-app-stroke bg-app-card px-4 py-3.5 text-base text-app-muted outline-none"
                disabled
                type="email"
                value={email}
              />
            </label>

            <label className="block font-semibold text-app-muted">
              <span className="block">Namn</span>
              <Input
                className="mt-2 w-full rounded-2xl border border-app-stroke bg-white px-4 py-3.5 text-base text-app-ink outline-none transition focus:border-app-primary focus:ring-2 focus:ring-app-primary/20"
                name="name"
                placeholder="t.ex. Anna Berg"
                required
                type="text"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
              />
            </label>

            <label className="block font-semibold text-app-muted">
              <span className="block">Yrke</span>
              <Input
                className="mt-2 w-full rounded-2xl border border-app-stroke bg-white px-4 py-3.5 text-base text-app-ink outline-none transition focus:border-app-primary focus:ring-2 focus:ring-app-primary/20"
                name="profession"
                placeholder="t.ex. Frontend-utvecklare"
                required
                type="text"
                value={form.profession}
                onChange={(e) => updateField("profession", e.target.value)}
              />
            </label>

            <label className="flex items-start gap-3 rounded-2xl border border-app-stroke bg-app-card px-4 py-4 text-sm text-app-muted">
              <input
                checked={termsAccepted}
                className="mt-0.5 h-4 w-4 rounded border border-app-stroke accent-app-primary"
                name="termsAccepted"
                required
                type="checkbox"
                onChange={(e) => setTermsAccepted(e.target.checked)}
              />
              <span>
                Jag godkänner{" "}
                <Link
                  className="font-semibold text-app-primary underline underline-offset-2"
                  href="/terms"
                  rel="noreferrer"
                  target="_blank"
                >
                  användarvillkoren
                </Link>{" "}
                för Jobi.sh.
              </span>
            </label>

            <Btn className="w-full" disabled={isSubmitting} type="submit">
              {isSubmitting
                ? "Sparar..."
                : needsTermsUpdate
                  ? "Godkänn och fortsätt"
                  : "Skapa profil"}
            </Btn>
          </form>
        </div>
      </section>
    </main>
  );
}
