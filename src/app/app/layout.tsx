import { redirect } from "next/navigation";
import { userIdFromSession } from "@/lib/session";
import { primaryOrgForUser } from "@/db/seed-org";
import { db } from "@/db";
import { SidebarNav } from "./sidebar-nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const userId = await userIdFromSession();
  if (!userId) redirect("/login");
  const org = await primaryOrgForUser(userId);
  if (!org) redirect("/login?error=noorg");

  const pendingRows = await db.query.sourceTransactions.findMany({
    where: (t, { and, eq, inArray }) =>
      and(eq(t.orgId, org.id), inArray(t.status, ["PENDING", "CATEGORISED"])),
    columns: { id: true },
  });

  return (
    <div className="app-shell flex h-screen overflow-hidden">
      <SidebarNav orgName={org.name} pendingCount={pendingRows.length} />
      <main className="flex-1 overflow-y-auto min-w-0">
        {children}
      </main>
    </div>
  );
}
