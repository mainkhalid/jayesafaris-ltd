import { Outlet, useLocation, useNavigate } from "react-router-dom";
import SideBar from "../components/shared/SideBar";
import { Bell, Search } from "lucide-react";
import { useAdminData } from "../context/AdminDataContext";

const BREADCRUMBS = {
  "/admin/dashboard":     "Dashboard",
  "/admin/inquiries":     "Inquiries",
  "/admin/bookings":      "Bookings",
  "/admin/custom-quotes": "Custom Quotes",
  "/admin/departures":    "Departures",
  "/admin/users":         "Users",
  "/admin/settings":      "Settings",
  "/admin/analytics":     "Analytics",
  "/admin/activity":      "Activity Log",
};

export default function AdminDashboard() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { inquiryStats, bookingStats, customQuoteStats } = useAdminData();

  const pageTitle = BREADCRUMBS[pathname]
    || (pathname.startsWith("/admin/country/")
        ? `${pathname.split("/").pop().charAt(0).toUpperCase() + pathname.split("/").pop().slice(1)} Packages`
        : "Admin");

  const totalAlerts =
    (inquiryStats?.new || 0) +
    (bookingStats?.pending || 0) +
    (customQuoteStats?.new || 0);

  return (
    <div className="flex min-h-screen bg-stone-50">
      <SideBar />

      {/* Main area — offset by sidebar width */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden pl-[72px] md:pl-64 transition-all duration-300">

        {/* ── Top Header ── */}
        <header className="sticky top-0 z-40 bg-white border-b border-stone-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.04)] h-[60px] flex items-center px-6 gap-4 shrink-0">
          {/* Page title / breadcrumb */}
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-[0.18em] leading-none">
              Admin
            </p>
            <h2 className="text-[15px] font-bold text-stone-900 leading-tight mt-0.5 truncate">
              {pageTitle}
            </h2>
          </div>

          {/* Search */}
          <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-[12px] text-stone-400 w-52 hover:border-amber-300 transition-colors cursor-pointer">
            <Search size={13} className="shrink-0 text-stone-300" />
            <span>Search…</span>
            <span className="ml-auto text-[10px] bg-stone-100 px-1.5 py-0.5 rounded font-mono text-stone-400">⌘K</span>
          </div>

          {/* Notification bell */}
          <button
            onClick={() => navigate("/admin/activity")}
            className="relative w-9 h-9 flex items-center justify-center rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-500 hover:text-stone-800 transition-all shadow-sm"
          >
            <Bell size={15} />
            {totalAlerts > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                {totalAlerts > 99 ? "99+" : totalAlerts}
              </span>
            )}
          </button>
        </header>

        {/* ── Page content ── */}
        <main className="flex-1 overflow-y-auto p-5 md:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}