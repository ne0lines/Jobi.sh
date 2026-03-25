"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Btn } from "@/components/ui/btn";

type AuthMode = "login" | "register";

type AuthResponse = {
  error?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getSubmitLabel(mode: AuthMode, isSubmitting: boolean): string {
  if (isSubmitting) {
    return mode === "login" ? "Loggar in..." : "Skapar konto...";
  }

  return mode === "login" ? "Logga in" : "Skapa konto";
}

function validateRegisterInput(email: string, password: string): string | null {
  const normalizedEmail = email.trim().toLowerCase();

  if (!emailPattern.test(normalizedEmail)) {
    return "Ange en giltig e-postadress.";
  }

  if (password.length < 8) {
    return "Lösenordet måste vara minst 8 tecken.";
  }

  if (!/[A-Z]/.test(password)) {
    return "Lösenordet måste innehålla minst en stor bokstav.";
  }

  if (!/[a-z]/.test(password)) {
    return "Lösenordet måste innehålla minst en liten bokstav.";
  }

  if (!/\d/.test(password)) {
    return "Lösenordet måste innehålla minst en siffra.";
  }

  return null;
}

type FormSubmitEvent = Parameters<NonNullable<React.ComponentProps<"form">["onSubmit"]>>[0];

export function AuthPageClient({ initialNextPath = "/" }: Readonly<{ initialNextPath?: string }>) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitLabel = getSubmitLabel(mode, isSubmitting);

  async function submitForm(event: FormSubmitEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback("");

    if (mode === "register") {
      const validationError = validateRegisterInput(email, password);

      if (validationError) {
        setFeedback(validationError);
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = (await response.json()) as AuthResponse;
        throw new Error(data.error ?? "Kunde inte logga in just nu.");
      }

      router.push(initialNextPath);
      router.refresh();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Något gick fel.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleSubmit: React.ComponentProps<"form">["onSubmit"] = (event) => {
    void submitForm(event);
  };

  return (
    <main className="min-h-svh px-4">
      <section className="mx-auto flex min-h-svh w-full flex-col gap-4">
        <div className="space-y-2">
            <h1 className="font-display text-4xl leading-none">Jobi<span className="text-app-primary">.sh</span></h1>
        </div>
        <div className="flex flex-col w-full flex-1 gap-4 items-center justify-center">
            <div className="grid w-full grid-cols-2 gap-3 rounded-2xl border border-app-stroke bg-app-card p-2">
            <button
                className={`rounded-xl px-4 py-3 text-base font-semibold ${
                mode === "login" ? "bg-app-primary text-white" : "text-app-muted"
                }`}
                type="button"
                onClick={() => setMode("login")}
            >
                Logga in
            </button>
            <button
                className={`rounded-xl px-4 py-3 text-base font-semibold ${
                mode === "register" ? "bg-app-primary text-white" : "text-app-muted"
                }`}
                type="button"
                onClick={() => setMode("register")}
            >
                Skapa konto
            </button>
            </div>

            <form className="space-y-4 w-full rounded-2xl border border-app-stroke bg-app-card p-4" onSubmit={handleSubmit}>
            <label className="block font-semibold text-app-muted">
                <span className="block">E-postadress</span>
                <input
                className="mt-2 w-full rounded-2xl border border-app-stroke bg-white px-4 py-3.5 text-base text-app-ink outline-none transition focus:border-app-primary focus:ring-2 focus:ring-app-primary/20"
                placeholder="namn@epost.se"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                />
            </label>

            <label className="block font-semibold text-app-muted">
                <span className="block">Lösenord</span>
                <input
                className="mt-2 w-full rounded-2xl border border-app-stroke bg-white px-4 py-3.5 text-base text-app-ink outline-none transition focus:border-app-primary focus:ring-2 focus:ring-app-primary/20"
                placeholder="Minst 8 tecken"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                />
                {mode === "register" ? (
                  <span className="mt-2 block text-sm text-app-muted">
                    Minst 8 tecken, en stor bokstav, en liten bokstav och en siffra.
                  </span>
                ) : null}
            </label>

            {feedback ? (
                <p className="rounded-2xl border border-app-stroke bg-white px-4 py-3 text-sm text-app-muted">
                {feedback}
                </p>
            ) : null}

            <Btn className="w-full" disabled={isSubmitting} type="submit">{submitLabel}</Btn>
            </form>
        </div>
      </section>
    </main>
  );
}