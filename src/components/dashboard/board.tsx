import { Job, JobStatus } from "@/app/types";
import Link from "next/link";

export default function({
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
      className={`${className} ${bgColor} ${borderColor} rounded-2xl border p-4 lg:min-w-40`}
    >
      <h3 className="mb-2 text-xl font-display">{label}</h3>
      <ul className="space-y-4">
        {jobs.map((j) => (
          <li key={`saved-${j.title.split(" ").join("-")}`}>
            <Link
              href={`/jobb/${j.id}`}
              className={`${borderColor} block rounded-2xl border bg-white p-4`}
            >
              <strong className="text-lg">{j.title}</strong>
              <span className="mt-1 block text-base text-app-muted">
                {j.company}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
