import { Job } from "@/app/types";
import Link from "next/link";

export default function Board({
  jobs,
  label,
  className,
  borderColor = "border-app-stroke",
  bgColor = "bg-app-card",
}: {
  jobs: Job[];
  label: string;
  className?: string;
  borderColor?: string;
  bgColor?: string;
}) {
  return (
    <div
      className={`${className} ${bgColor} ${borderColor} min-w-0 rounded-2xl border p-4`}
    >
      <h3 className="mb-3 text-xl font-display">{label}</h3>
      <ul className="space-y-3">
        {jobs.map((j) => (
          <li key={`saved-${j.id}`}>
            <Link
              href={`/jobb/${j.id}`}
              className={`${borderColor} block min-w-0 rounded-2xl border bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-sm`}
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
