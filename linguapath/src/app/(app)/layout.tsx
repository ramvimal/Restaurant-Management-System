import { Sidebar, MobileNav } from "@/components/nav";
import { Topbar } from "@/components/topbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-6xl">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 pb-28 md:pb-10">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
