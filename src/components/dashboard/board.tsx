import { Job } from "@/app/types";
import { cn } from "@/lib/utils";
import Link from "next/link";

type BoardProps = Readonly<{
  jobs: Job[];
  label: string;
  className?: string;
  borderColor?: string;
  bgColor?: string;
  itemBgColor?: string;
  titleClassName?: string;
}>;

export default function Board({
  jobs,
  label,
  className,
  borderColor = "border-app-stroke",
  bgColor = "bg-app-card",
  itemBgColor = "bg-app-surface dark:bg-app-card",
  titleClassName = "text-app-ink",
}: BoardProps) {
  return (
    <div className={cn(className, bgColor, borderColor, "min-w-0 rounded-3xl border p-5 md:p-6")}>
      <h3 className={cn("mb-4 text-xl font-display", titleClassName)}>{label}</h3>
      <ul className="space-y-3">
        {jobs.map((j) => (
          <li key={`saved-${j.id}`}>
            <Link
              href={`/jobb/${j.id}`}
              className={cn(
                borderColor,
                itemBgColor,
                "block min-w-0 rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:shadow-sm md:p-5",
              )}
            >
              <strong className="block min-w-0 truncate whitespace-nowrap text-base leading-snug text-app-ink sm:text-lg">
                {j.title}
              </strong>
              <span className="mt-1 block min-w-0 truncate text-sm text-app-muted sm:text-base">
                {j.company}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
