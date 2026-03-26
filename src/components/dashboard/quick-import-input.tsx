"use client";

import { Input } from "@/components/ui/input";
import { ArrowUpRight, Link2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function QuickImportInput() {
  const router = useRouter();
  const [value, setValue] = useState("");

  function navigateToNewJob(rawValue: string) {
    const trimmedValue = rawValue.trim();

    if (!trimmedValue) {
      return;
    }

    router.push(`/jobb/new?url=${encodeURIComponent(trimmedValue)}`);
  }

  return (
    <form
      className="w-full"
      onSubmit={(event) => {
        event.preventDefault();
        navigateToNewJob(value);
      }}
    >
      <label className="block text-sm font-semibold text-app-muted" htmlFor="dashboard-quick-import-url">
        <span className="mb-2 inline-flex items-center gap-2">
          <Link2 className="size-4 text-app-primary" strokeWidth={2.1} />
          Klistra in annonslänk från Arbetsförmedlingen
        </span>
        <div className="relative">
          <Input
            autoComplete="off"
            className="mt-2 w-full rounded-2xl border border-app-stroke bg-white px-4 py-3.5 pr-12 text-base text-app-ink outline-none transition focus:border-app-primary focus:ring-2 focus:ring-app-primary/20"
            id="dashboard-quick-import-url"
            name="quickImportUrl"
            placeholder="https://arbetsformedlingen.se/platsbanken/annonser/xxxxx"
            type="url"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onPaste={(event) => {
              const pastedValue = event.clipboardData.getData("text").trim();

              if (!pastedValue) {
                return;
              }

              event.preventDefault();
              setValue(pastedValue);
              navigateToNewJob(pastedValue);
            }}
          />
        </div>
      </label>
    </form>
  );
}