"use client";

import { useAuth, useSignIn, useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Btn } from "@/components/ui/btn";

type AuthMode = "login" | "register";

type ClerkError = { errors?: Array<{ message: string }> };

export function OldAuthPageClient({
  initialNextPath = "/",
}: Readonly<{ initialNextPath?: string }>) {
  const router = useRouter();

  const { signIn, errors: signInErros } = useSignIn();
  const { signUp, errors: signUpErros, fetchStatus } = useSignUp();

  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleEmailSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback("");

    if (mode === "login") {
      console.log("login");
      return;
    } else {
      const { error } = await signUp.create({ emailAddress: email });
      if (error) {
        console.error(JSON.stringify(error, null, 2));
        return;
      } else {
        await signUp.verifications.sendEmailCode();
      }
    }

    setIsSubmitting(false);
  }

  return (
    <main className="min-h-dvh px-4">
      <section className="mx-auto flex min-h-dvh w-full flex-col gap-4">
        <div className="space-y-2">
          <h1 className="font-display text-4xl leading-none">
            Jobi<span className="text-app-primary">.sh</span>
          </h1>
        </div>

        <div className="flex flex-col w-full flex-1 gap-4 items-center justify-center">
          <div className="grid w-full grid-cols-2 gap-3 rounded-2xl border border-app-stroke bg-app-card p-2">
            <button
              className={`rounded-xl px-4 py-3 text-base font-semibold cursor-pointer ${mode === "login"
                  ? "bg-app-primary text-white"
                  : "text-app-muted"
                }`}
              type="button"
              onClick={() => setMode("login")}
            >
              Logga in
            </button>
            <button
              className={`rounded-xl px-4 py-3 text-base font-semibold cursor-pointer ${mode === "register"
                  ? "bg-app-primary text-white"
                  : "text-app-muted"
                }`}
              type="button"
              onClick={() => setMode("register")}
            >
              Skapa konto
            </button>
          </div>

          <form
            className="space-y-4 w-full rounded-2xl border border-app-stroke bg-app-card p-4"
            onSubmit={(e) => void handleEmailSubmit(e)}
          >
            <label className="block font-semibold text-app-muted">
              <span className="block">E-postadress</span>
              <input
                className="mt-2 w-full rounded-2xl border border-app-stroke bg-white px-4 py-3.5 text-base text-app-ink outline-none transition focus:border-app-primary focus:ring-2 focus:ring-app-primary/20"
                placeholder="namn@epost.se"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            {feedback ? (
              <p className="rounded-2xl border border-app-stroke bg-white px-4 py-3 text-sm text-app-muted">
                {feedback}
              </p>
            ) : null}

            <Btn className="w-full" disabled={isSubmitting} type="submit">
              {isSubmitting
                ? mode === "login"
                  ? "Loggar in..."
                  : "Skapar konto..."
                : mode === "login"
                  ? "Logga in"
                  : "Skapa konto"}
            </Btn>
          </form>
        </div>
      </section>
    </main>
  );
}
