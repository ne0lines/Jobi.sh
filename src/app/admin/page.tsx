import type { AdminRmOrganizationSummary, AdminRmUserSummary } from "@/app/types";
import { UserRole as AppUserRole } from "@/app/types";
import { AdminRmManager } from "@/components/admin/admin-rm-manager";
import { StatCard } from "@/components/ui/stat-card";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import prisma from "@/lib/prisma";
import { ColorScheme, UserRole } from "@/app/generated/prisma/enums";

export default async function AdminPage() {
  await requireAdmin();

  const [
    totalUsers,
    totalAdmins,
    totalRmAccounts,
    totalActiveRmOrganizations,
    totalArchivedRmOrganizations,
    totalApplications,
    todoNotifEnabled,
    tipNotifEnabled,
    onboardingDismissed,
    pipelineExplored,
    reportViewed,
    colorSchemeDark,
    users,
    rmOrganizations,
  ] = await prisma.$transaction([
    prisma.user.count(),
    prisma.user.count({ where: { role: UserRole.admin } }),
    prisma.user.count({ where: { role: UserRole.rm } }),
    prisma.rmOrganization.count({ where: { archivedAt: null } }),
    prisma.rmOrganization.count({ where: { archivedAt: { not: null } } }),
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
        rmOrganizationId: true,
        rmOrganization: {
          select: {
            name: true,
          },
        },
        complete: true,
        createdAt: true,
      },
    }),
    prisma.rmOrganization.findMany({
      orderBy: [{ archivedAt: "asc" }, { name: "asc" }],
      select: {
        archivedAt: true,
        billingAddressLine1: true,
        billingAddressLine2: true,
        billingCity: true,
        billingCountry: true,
        billingEmail: true,
        billingName: true,
        billingOrganizationNumber: true,
        billingPostalCode: true,
        billingReference: true,
        billingVatNumber: true,
        id: true,
        name: true,
        slug: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            connectionRequests: true,
            connections: true,
            invitations: true,
            members: true,
          },
        },
      },
    }),
  ]);

  const roleSortOrder: Record<AppUserRole, number> = {
    [AppUserRole.ADMIN]: 0,
    [AppUserRole.RM]: 1,
    [AppUserRole.USER]: 2,
  };

  const adminRmUsers: AdminRmUserSummary[] = users
    .map((user) => ({
      complete: user.complete,
      createdAt: user.createdAt.toISOString(),
      email: user.email,
      id: user.id,
      name: user.name,
      rmOrganizationId: user.rmOrganizationId,
      rmOrganizationName: user.rmOrganization?.name ?? null,
      role: user.role as AdminRmUserSummary["role"],
    }))
    .sort((firstUser, secondUser) => {
      const roleDelta = roleSortOrder[firstUser.role] - roleSortOrder[secondUser.role];

      if (roleDelta !== 0) {
        return roleDelta;
      }

      return (firstUser.name || firstUser.email).localeCompare(secondUser.name || secondUser.email, "sv");
    });

  const adminRmOrganizations: AdminRmOrganizationSummary[] = rmOrganizations.map((organization) => ({
    archivedAt: organization.archivedAt?.toISOString() ?? null,
    billingAddressLine1: organization.billingAddressLine1,
    billingAddressLine2: organization.billingAddressLine2,
    billingCity: organization.billingCity,
    billingCountry: organization.billingCountry,
    billingEmail: organization.billingEmail,
    billingName: organization.billingName,
    billingOrganizationNumber: organization.billingOrganizationNumber,
    billingPostalCode: organization.billingPostalCode,
    billingReference: organization.billingReference,
    billingVatNumber: organization.billingVatNumber,
    connectionRequestCount: organization._count.connectionRequests,
    createdAt: organization.createdAt.toISOString(),
    id: organization.id,
    invitationCount: organization._count.invitations,
    linkedUserCount: organization._count.connections,
    memberCount: organization._count.members,
    name: organization.name,
    slug: organization.slug,
    updatedAt: organization.updatedAt.toISOString(),
  }));

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
    <main className="min-h-svh">
      <div className="w-full">
        <div className="app-page-content">
          <AdminRmManager
            initialOrganizations={adminRmOrganizations}
            initialUsers={adminRmUsers}
          />

          <section className="app-card app-card-stack">
            <div className="app-heading-stack-tight">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-app-muted">
                User preferences
              </h2>
              <p className="text-base text-app-muted">
                Snabb överblick över vilka funktioner och inställningar som faktiskt används.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {prefRows.map((row) => (
                <StatCard key={row.label} label={row.label} meta={`${pct(row.count)}%`} value={row.count} />
              ))}
            </div>
          </section>

          <section className="app-card app-card-stack">
            <div className="app-heading-stack-tight">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-app-muted">
                System statistics
              </h2>
              <p className="text-base text-app-muted">
                Nyckeltal för användare, RM-konton, företag och ansökningar.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <StatCard label="Total users" value={totalUsers} />
              <StatCard label="Admins" value={totalAdmins} />
              <StatCard label="RM accounts" value={totalRmAccounts} />
              <StatCard label="Active RM companies" value={totalActiveRmOrganizations} />
              <StatCard label="Archived RM companies" value={totalArchivedRmOrganizations} />
              <StatCard label="Total applications" value={totalApplications} />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
