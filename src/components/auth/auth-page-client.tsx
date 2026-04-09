"use client";

import { isClerkAPIResponseError } from "@clerk/nextjs/errors";
import { useAuth, useSignIn, useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Btn } from "../ui/btn";

const CLERK_ERROR_MESSAGES: Record<string, string> = {
  form_code_incorrect: "Felaktig kod. Kontrollera och försök igen.",
  verification_expired: "Koden har gått ut. Begär en ny kod.",
  too_many_requests: "För många försök. Vänta en stund och försök igen.",
  form_identifier_not_found: "Ingen användare hittades med den e-postadressen.",
  form_password_incorrect: "Felaktigt lösenord.",
  identifier_already_signed_in: "Du är redan inloggad.",
  session_exists: "En aktiv session finns redan.",
  verification_failed: "Verifiering misslyckades. Försök igen.",
  strategy_for_user_invalid: "Inloggningsmetoden stöds inte för det här kontot.",
  not_allowed_access: "Åtkomst nekad.",
};

function clerkErrorMessage(code: string | undefined): string {
  if (!code) return "Något gick fel. Försök igen.";
  return CLERK_ERROR_MESSAGES[code] ?? `Något gick fel. Försök igen. (${code})`;
}

export default function AuthPageClient() {
  const { isSignedIn } = useAuth();
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [feedback, setFeedBack] = useState("");
  const [loading, setLoading] = useState<"submit" | "verify" | "resend" | null>(
    null,
  );

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
        const code = isClerkAPIResponseError(createError) ? createError.errors[0]?.code : undefined;
        setFeedBack(clerkErrorMessage(code));
        return;
      }

      const { error: sendError } = await signIn.emailCode.sendCode();

      if (sendError) {
        const code = isClerkAPIResponseError(sendError) ? sendError.errors[0]?.code : undefined;
        setFeedBack(clerkErrorMessage(code));
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
    const clerkCode =
      error && isClerkAPIResponseError(error)
        ? error.errors[0]?.code
        : undefined;

    if (error) {
      if (isSignedIn) {
        router.push("/");
        return;
      }

      if (clerkCode === "sign_up_if_missing_transfer") {
        await handleTransfer();
        setLoading(null);
        return;
      }

      setFeedBack(clerkErrorMessage(clerkCode));
      setLoading(null);
      return;
    }

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
      setFeedBack(clerkErrorMessage(undefined));
    }
    setLoading(null);
  };

  const handleTransfer = async () => {
    const { error } = await signUp.create({ transfer: true });
    if (error) {
      const code = isClerkAPIResponseError(error) ? error.errors[0]?.code : undefined;
      setFeedBack(clerkErrorMessage(code));
      return;
    }

    if (signUp.status === "complete") {
      await finalizeSignUp();
    } else {
      setFeedBack(clerkErrorMessage(undefined));
    }
  };

  if (verifying || signIn.status === "needs_client_trust") {
    return (
      <main className="min-h-dvh px-4">
        <h1 className="font-display text-4xl leading-none">
          Jobi<span className="text-app-primary">.sh</span>
        </h1>
        <section className="mx-auto flex min-h-dvh w-full flex-col gap-4">
          <div className="flex w-full flex-1 flex-col items-center justify-center gap-4">
            <h2 className="text-2xl">Verifiera e-post</h2>
            <p>
              Vi har skickat en verifikationskod till:{" "}
              <strong>{emailAddress}</strong>
            </p>
            <form
              onSubmit={handleVerify}
              className="w-full space-y-4 p-4"
            >
              <div>
                <label htmlFor="code">Ange verifikationskod</label>
                <input
                  className="mt-2 w-full rounded-2xl border border-app-stroke bg-white px-4 py-3.5 text-base text-app-ink outline-none transition focus:border-app-primary focus:ring-2 focus:ring-app-primary/20"
                  id="code"
                  name="code"
                  placeholder="XXXXXX"
                  required
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
                {feedback && (
                  <p className="mt-2 text-sm text-red-500">{feedback}</p>
                )}
              </div>
              <Btn className="w-full" disabled={loading !== null} track="auth_verify_click" type="submit">
                {loading === "verify" ? "Verifierar..." : "Fortsätt"}
              </Btn>
              <div className="flex items-center justify-center gap-4">
                <Btn
                  type="button"
                  disabled={loading !== null}
                  track="auth_resend_code_click"
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
                  track="auth_reset_click"
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
    <main className="min-h-svh">
      <section className="mx-auto flex min-h-svh w-full flex-col gap-4">
        <div className="space-y-2">
          <h1 className="font-display text-4xl leading-none">
            Jobi<span className="text-app-primary">.sh</span>
          </h1>
        </div>
        <div className="flex w-full flex-1 flex-col items-center justify-center gap-4">
          <h2 className="text-2xl">Logga in eller skapa konto</h2>
          <form
            onSubmit={handleSubmit}
            className="w-full space-y-4 p-4"
          >
            <label className="block font-semibold text-app-muted">
              <span className="block">E-postadress</span>
              <input
                className="mt-2 w-full rounded-2xl border border-app-stroke bg-white px-4 py-3.5 text-base text-app-ink outline-none transition focus:border-app-primary focus:ring-2 focus:ring-app-primary/20"
                id="email"
                name="email"
                placeholder="namn@epost.se"
                required
                type="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
              />
            </label>

            {feedback ? (
              <p className="rounded-2xl border border-app-stroke bg-white px-4 py-3 text-sm text-app-muted">
                {feedback}
              </p>
            ) : null}

            <Btn className="w-full" disabled={loading !== null} track="auth_submit_click" type="submit">
              {loading === "submit" ? "Loggar in..." : "Fortsätt"}
            </Btn>
            <div id="clerk-captcha" />
          </form>
        </div>
      </section>
    </main>
  );
}
