import NavbarMock from "@/components/navbar-mock";
import Sidebar from "@/components/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Mock data for testing - no auth required
  const apiLimitCount = 0;
  const isPro = false;

  return (
    <div className="h-full relative">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-80 bg-gray-900">
        <Sidebar isPro={isPro} apiLimitCount={apiLimitCount} />
      </div>
      <main className="md:pl-72 pb-10">
        <NavbarMock />
        {children}
      </main>
    </div>
  );
}
