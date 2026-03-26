"use client";

import { Btn } from "@/components/ui/btn";
import { Input } from "@/components/ui/input";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";

type FormState = {
  name: string;
  profession: string;
};

export default function CreateProfilePage() {
  const { user } = useUser();
  const router = useRouter();

  const email = user?.emailAddresses[0]?.emailAddress ?? "";

  const [form, setForm] = useState<FormState>({ name: "", profession: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");

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
        body: JSON.stringify({ name: form.name, profession: form.profession }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setFeedback(data.error ?? "Kunde inte skapa profilen just nu.");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setFeedback("Kunde inte skapa profilen just nu.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleSubmit: React.ComponentProps<"form">["onSubmit"] = (e) => {
    e.preventDefault();
    void submitProfile();
  };

  return (
    <main className="min-h-dvh pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <h1 className="font-display text-4xl leading-none">
        Jobi<span className="text-app-primary">.sh</span>
      </h1>
      <section className="mx-auto flex min-h-dvh w-full flex-col gap-4">
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <div className="w-full text-center">
            <h2 className="text-2xl">Skapa profil</h2>
            <p className="mt-2 text-base text-app-muted">
              Fyll i dina uppgifter för att komma igång.
            </p>
            {feedback ? (
              <p className="mt-4 rounded-2xl border border-app-stroke bg-app-card px-4 py-3 text-sm text-red-500">
                {feedback}
              </p>
            ) : null}
          </div>

          <form className="flex w-full flex-col gap-4" onSubmit={handleSubmit}>
            <label className="block font-semibold text-app-muted">
              <span className="block">E-postadress</span>
              <Input
                className="mt-2 w-full rounded-2xl border border-app-stroke bg-app-card px-4 py-3.5 text-base text-app-muted outline-none"
                type="email"
                value={email}
                disabled
              />
            </label>

            <label className="block font-semibold text-app-muted">
              <span className="block">Namn</span>
              <Input
                className="mt-2 w-full rounded-2xl border border-app-stroke bg-white px-4 py-3.5 text-base text-app-ink outline-none transition focus:border-app-primary focus:ring-2 focus:ring-app-primary/20"
                name="name"
                placeholder="t.ex. Anna Berg"
                type="text"
                value={form.name}
                required
                onChange={(e) => updateField("name", e.target.value)}
              />
            </label>

            <label className="block font-semibold text-app-muted">
              <span className="block">Yrke</span>
              <Input
                className="mt-2 w-full rounded-2xl border border-app-stroke bg-white px-4 py-3.5 text-base text-app-ink outline-none transition focus:border-app-primary focus:ring-2 focus:ring-app-primary/20"
                name="profession"
                placeholder="t.ex. Frontend-utvecklare"
                type="text"
                value={form.profession}
                required
                onChange={(e) => updateField("profession", e.target.value)}
              />
            </label>

            <Btn disabled={isSubmitting} type="submit" className="w-full">
              {isSubmitting ? "Skapar profil..." : "Skapa profil"}
            </Btn>
          </form>
        </div>
      </section>
    </main>
  );
}
