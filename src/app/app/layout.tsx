import { redirect } from "next/navigation";
import { userIdFromSession } from "@/lib/auth";
import { TopNav } from "./top-nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const userId = await userIdFromSession();
  if (!userId) redirect("/login");

  return (
    <div className="app-shell flex min-h-screen flex-col">
      <TopNav />
      <main className="mx-auto w-full max-w-[1080px] flex-1 px-6">{children}</main>
    </div>
  );
}
