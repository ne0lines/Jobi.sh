import { requireAdmin } from "@/lib/auth/requireAdmin";
import prisma from "@/lib/prisma";
import { ColorScheme, UserRole } from "@/app/generated/prisma/enums";

export default async function AdminPage() {
  await requireAdmin();

  const [
    totalUsers,
    totalAdmins,
    totalApplications,
    todoNotifEnabled,
    tipNotifEnabled,
    onboardingDismissed,
    pipelineExplored,
    reportViewed,
    colorSchemeDark,
    users,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: UserRole.admin } }),
    prisma.job.count(),
    prisma.user.count({ where: { todoNotificationsEnabled: true } }),
    prisma.user.count({ where: { tipNotificationsEnabled: true } }),
    prisma.user.count({ where: { onboardingDismissed: true } }),
    prisma.user.count({ where: { onboardingPipelineExplored: true } }),
    prisma.user.count({ where: { onboardingReportViewed: true } }),
    prisma.user.count({ where: { colorScheme: ColorScheme.dark } }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        complete: true,
        createdAt: true,
      },
    }),
  ]);

  function pct(count: number) {
    return totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0;
  }

  const prefRows = [
    { label: "Todo notifications on", count: todoNotifEnabled },
    { label: "Tip notifications on", count: tipNotifEnabled },
    { label: "Onboarding dismissed", count: onboardingDismissed },
    { label: "Pipeline explored", count: pipelineExplored },
    { label: "Report viewed", count: reportViewed },
    { label: "Color scheme: dark", count: colorSchemeDark },
    { label: "Color scheme: light", count: totalUsers - colorSchemeDark },
  ];

  return (
    <main className="min-h-svh bg-[var(--app-bg)] px-4 py-8 pb-24 md:px-8 md:pb-8">
      <div className="mx-auto max-w-5xl space-y-10">
        <h1 className="font-display text-3xl font-semibold text-[var(--app-ink)]">
          Admin
        </h1>

        {/* ── Summary cards ──────────────────────────────────────── */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--app-muted)]">
            Overview
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Total users" value={totalUsers} />
            <StatCard label="Admins" value={totalAdmins} />
            <StatCard label="Total applications" value={totalApplications} />
          </div>
        </section>

        {/* ── User preferences ───────────────────────────────────── */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--app-muted)]">
            User preferences
          </h2>
          <div className="overflow-hidden rounded-xl border border-[var(--app-stroke)] bg-[var(--app-card)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--app-stroke)] text-left text-xs uppercase tracking-wide text-[var(--app-muted)]">
                  <th className="px-4 py-3 font-medium">Preference</th>
                  <th className="px-4 py-3 font-medium text-right">Users</th>
                  <th className="px-4 py-3 font-medium text-right">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--app-stroke)]">
                {prefRows.map((row) => (
                  <tr key={row.label}>
                    <td className="px-4 py-3 text-[var(--app-ink)]">{row.label}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-[var(--app-ink)]">
                      {row.count}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-[var(--app-muted)]">
                      {pct(row.count)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── User list ──────────────────────────────────────────── */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--app-muted)]">
            Users ({totalUsers})
          </h2>
          <div className="overflow-hidden rounded-xl border border-[var(--app-stroke)] bg-[var(--app-card)]">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--app-stroke)] text-left text-xs uppercase tracking-wide text-[var(--app-muted)]">
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Complete</th>
                    <th className="px-4 py-3 font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--app-stroke)]">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-4 py-3 font-medium text-[var(--app-ink)]">
                        {user.name || "—"}
                      </td>
                      <td className="px-4 py-3 text-[var(--app-muted)]">
                        {user.email}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            user.role === UserRole.admin
                              ? "rounded-full bg-[var(--app-primary)] px-2 py-0.5 text-xs font-medium text-white"
                              : "rounded-full bg-[var(--app-muted-surface)] px-2 py-0.5 text-xs font-medium text-[var(--app-muted-ink)]"
                          }
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[var(--app-muted)]">
                        {user.complete ? "Yes" : "No"}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-[var(--app-muted)]">
                        {user.createdAt.toLocaleDateString("sv-SE")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-[var(--app-stroke)] bg-[var(--app-card)] px-5 py-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--app-muted)]">
        {label}
      </p>
      <p className="mt-1 font-display text-3xl font-semibold tabular-nums text-[var(--app-ink)]">
        {value}
      </p>
    </div>
  );
}
