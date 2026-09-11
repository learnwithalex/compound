import { redirect } from "next/navigation";
import { userIdFromSession } from "@/lib/auth";
import { SidebarNav } from "./sidebar-nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const userId = await userIdFromSession();
  if (!userId) redirect("/login");

  return (
    <div className="app-shell flex h-screen overflow-hidden">
      <SidebarNav />
      <main className="flex-1 overflow-y-auto min-w-0">{children}</main>
    </div>
  );
}
