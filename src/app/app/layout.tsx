import { redirect } from "next/navigation";
import { userIdFromSession } from "@/lib/auth";
import { GlobalTopBar } from "./global-top-bar";
import { SidebarNav } from "./sidebar-nav";
import { MiniHeader } from "./mini-header";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const userId = await userIdFromSession();
  if (!userId) redirect("/login");

  return (
    <div className="app-shell flex h-screen flex-col overflow-hidden">
      {/* Row 1: global bar spans full width above everything */}
      <GlobalTopBar />

      {/* Row 2: mini header spans full width above sidebar + content */}
      <MiniHeader />

      {/* Row 3: sidebar + content column side by side */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <SidebarNav />

        <main className="flex-1 overflow-y-auto">
          <div className="p-14 pr-40">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
