import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type StatCardProps = {
  className?: string;
  label: string;
  meta?: ReactNode;
  value: number | string;
};

export function StatCard({ className, label, meta, value }: Readonly<StatCardProps>) {
  return (
    <article className={cn("app-card-dense app-card-stack bg-app-surface", className)}>
      <p className="text-sm font-semibold uppercase tracking-wide text-app-muted">
        {label}
      </p>
      <div className="flex items-end justify-between gap-4">
        <p className="font-display text-3xl font-semibold tabular-nums text-app-ink">
          {value}
        </p>
        {meta ? <p className="text-sm font-medium text-app-muted">{meta}</p> : null}
      </div>
    </article>
  );
}