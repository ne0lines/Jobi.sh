"use client";

import { useSignIn, useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function AuthPageClient() {
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [code, setCode] = React.useState("");
  const [verifying, setVerifying] = React.useState(false);
  const [feedback, setFeedBack] = useState("");
  const [loading, setLoading] = useState<"submit" | "verify" | "resend" | null>(null);

  const navigate = (decorateUrl: (url: string) => string) => {
    const url = decorateUrl("/");
    if (url.startsWith("http")) {
      window.location.href = url;
    } else {
      router.push(url);
    }
  };

  const finalizeSignIn = async () => {
    await signIn.finalize({
      navigate: ({ decorateUrl }) => navigate(decorateUrl),
    });
  };

  const finalizeSignUp = async () => {
    await signUp.finalize({
      navigate: ({ decorateUrl }) => navigate(decorateUrl),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedBack("");
    setLoading("submit");
    try {
      const { error: createError } = await signIn.create({
        identifier: emailAddress,
        signUpIfMissing: true,
      });
      if (createError) {
        setFeedBack("Något gick fel. Försök igen.");
        return;
      }

      const { error: sendError } = await signIn.emailCode.sendCode();
      if (sendError) {
        setFeedBack("Kunde inte skicka koden. Försök igen.");
        return;
      }

      setVerifying(true);
    } finally {
      setLoading(null);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedBack("");
    setLoading("verify");
    const { error } = await signIn.emailCode.verifyCode({ code });

    if (error) {
      if (error.errors[0]?.code === "sign_up_if_missing_transfer") {
        await handleTransfer();
        return;
      }

      const clerkCode = error.errors[0]?.code;
      if (clerkCode === "form_code_incorrect") {
        setFeedBack("Felaktig kod. Kontrollera och försök igen.");
      } else if (clerkCode === "verification_expired") {
        setFeedBack("Koden har gått ut. Begär en ny kod.");
      } else {
        setFeedBack("Något gick fel. Försök igen.");
      }
      return;
    }

    // The user exists and verification succeeded
    if (signIn.status === "complete") {
      await finalizeSignIn();
    } else if (signIn.status === "needs_client_trust") {
      const emailCodeFactor = signIn.supportedSecondFactors.find(
        (factor) => factor.strategy === "email_code",
      );

      if (emailCodeFactor) {
        await signIn.mfa.sendEmailCode();
      }
    } else {
      setFeedBack("Något gick fel. Försök igen.");
    }
    setLoading(null);
  };

  const handleTransfer = async () => {
    const { error } = await signUp.create({ transfer: true });
    if (error) {
      setFeedBack("Något gick fel vid registrering. Försök igen.");
      return;
    }

    if (signUp.status === "complete") {
      await finalizeSignUp();
    } else {
      setFeedBack("Något gick fel. Försök igen.");
    }
  };

  if (verifying || signIn.status === "needs_client_trust") {
    return (
      <main className="min-h-dvh px-4">
        <h1 className="font-display text-4xl leading-none">
          Jobi<span className="text-app-primary">.sh</span>
        </h1>
        <section className="mx-auto flex min-h-dvh w-full flex-col gap-4">
          <div className="flex flex-col w-full flex-1 gap-4 items-center justify-center">
            <h2 className="text-2xl">Verifiera epost</h2>
            <p>
              Vi har skickat en virifikations kod till:{" "}
              <strong>{emailAddress}</strong>
            </p>
            <form
              onSubmit={handleVerify}
              className="space-y-4 w-full rounded-2xl border border-app-stroke bg-app-card p-4"
            >
              <div>
                <label htmlFor="code">Ange verifikations kod</label>
                <input
                  className="mt-2 w-full rounded-2xl border border-app-stroke bg-white px-4 py-3.5 text-base text-app-ink outline-none transition focus:border-app-primary focus:ring-2 focus:ring-app-primary/20"
                  id="code"
                  name="code"
                  type="text"
                  placeholder="XXXXXX"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
                {feedback && (
                  <p className="mt-2 text-sm text-red-500">{feedback}</p>
                )}
              </div>
              <Btn className="w-full" disabled={loading !== null} type="submit">
                {loading === "verify" ? "Verifierar..." : "Fortsätt"}
              </Btn>
              <div className="flex items-center gap-4 justify-center">
                <Btn
                  type="button"
                  disabled={loading !== null}
                  onClick={async () => {
                    setFeedBack("");
                    setLoading("resend");
                    await signIn.emailCode.sendCode();
                    setLoading(null);
                  }}
                  variant="secondary"
                >
                  {loading === "resend" ? "Skickar..." : "Skicka ny kod"}
                </Btn>
                <Btn
                  type="button"
                  disabled={loading !== null}
                  onClick={() => {
                    signIn.reset();
                    setVerifying(false);
                    setFeedBack("");
                    setLoading(null);
                  }}
                  variant="red"
                >
                  Börja om
                </Btn>
              </div>
            </form>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-svh px-4">
      <section className="mx-auto flex min-h-svh w-full flex-col gap-4">
        <div className="space-y-2">
            <h1 className="font-display text-4xl leading-none">Jobi<span className="text-app-primary">.sh</span></h1>
        </div>
        <div className="flex flex-col w-full flex-1 gap-4 items-center justify-center">
          <h2 className="text-2xl">Logga In eller Skapa Konto</h2>
          <form
            onSubmit={handleSubmit}
            className="space-y-4 w-full rounded-2xl border border-app-stroke bg-app-card p-4"
          >
            <label className="block font-semibold text-app-muted">
              <span className="block">E-postadress</span>
              <input
                className="mt-2 w-full rounded-2xl border border-app-stroke bg-white px-4 py-3.5 text-base text-app-ink outline-none transition focus:border-app-primary focus:ring-2 focus:ring-app-primary/20"
                id="email"
                name="email"
                type="email"
                placeholder="namn@epost.se"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                required
              />
            </label>

            {feedback ? (
              <p className="rounded-2xl border border-app-stroke bg-white px-4 py-3 text-sm text-app-muted">
                {feedback}
              </p>
            ) : null}

            <Btn className="w-full" disabled={loading !== null} type="submit">
              {loading === "submit" ? "Loggar in..." : "Fortsätt"}
            </Btn>
          </form>
        </div>
        <div id="clerk-captcha" />
      </section>
    </main>
  );
}
