import { RmDashboard } from "@/components/rm/rm-dashboard";
import { requireRmAccess } from "@/lib/auth/requireRmAccess";
import { getRmPanelData } from "@/lib/rm";

export const dynamic = "force-dynamic";

export default async function RmPage() {
  await requireRmAccess();
  const data = await getRmPanelData();

  return (
    <main className="min-h-svh">
      <div className="w-full">
        <RmDashboard initialData={data} />
      </div>
    </main>
  );
}