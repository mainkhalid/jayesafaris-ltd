import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard, Globe, FileText,
  Package, Sparkles, ChevronDown, Menu,
  Users, Settings, CalendarDays, BarChart2,
  Activity, X,
} from "lucide-react";
import { UserButton, useUser } from "@clerk/clerk-react";
import { useAdminData } from "../../context/AdminDataContext";
import logo from "../../assets/jayesafari.png";

const FLAGS = { Kenya: "🇰🇪", Tanzania: "🇹🇿", Zanzibar: "🏝️", Uganda: "🇺🇬" };
const COUNTRIES = ["Kenya", "Tanzania", "Zanzibar", "Uganda"];

const SideBar = () => {
  const [open, setOpen]                   = useState(true);
  const [countriesOpen, setCountriesOpen] = useState(true);
  const [mobileOpen, setMobileOpen]       = useState(false);
  const navigate    = useNavigate();
  const { pathname } = useLocation();
  const { user }    = useUser();
  const { inquiryStats, bookingStats, customQuoteStats } = useAdminData();

  // Auto-collapse to icon mode on narrow viewports
  const isActive  = (path) => pathname === path;
  const isCountry = COUNTRIES.some((c) => pathname === `/admin/country/${c.toLowerCase()}`);

  const navItems = [
    { label: "Dashboard",     path: "/admin/dashboard",     icon: LayoutDashboard },
    { label: "Inquiries",     path: "/admin/inquiries",     icon: FileText,       count: inquiryStats?.new     },
    { label: "Bookings",      path: "/admin/bookings",      icon: Package,        count: bookingStats?.pending },
    { label: "Custom Quotes", path: "/admin/custom-quotes", icon: Sparkles,       count: customQuoteStats?.new },
    { label: "Departures",    path: "/admin/departures",    icon: CalendarDays    },
    { label: "Users",         path: "/admin/users",         icon: Users           },
    { label: "Analytics",     path: "/admin/analytics",     icon: BarChart2       },
    { label: "Activity",      path: "/admin/activity",      icon: Activity        },
  ];

  const NavItem = ({ item }) => {
    const active = isActive(item.path);
    return (
      <button
        onClick={() => { navigate(item.path); setMobileOpen(false); }}
        className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl transition-all duration-150 text-left group ${
          active
            ? "bg-amber-500 text-white shadow-lg shadow-amber-900/40"
            : "text-white/40 hover:text-white hover:bg-white/[0.06]"
        }`}
      >
        <item.icon
          size={17}
          className={`shrink-0 transition-colors ${active ? "text-white" : "text-white/40 group-hover:text-white/80"}`}
        />
        {open && (
          <div className="flex items-center justify-between flex-1 min-w-0">
            <span className={`text-[13px] font-medium whitespace-nowrap tracking-[-0.01em] ${active ? "text-white" : ""}`}>
              {item.label}
            </span>
            {item.count > 0 && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 leading-none ${
                active ? "bg-white/20 text-white" : "bg-rose-500/90 text-white"
              }`}>
                {item.count}
              </span>
            )}
          </div>
        )}
      </button>
    );
  };

  const sidebarContent = (
    <>
      {/* ── Logo ── */}
      <div className="h-[60px] flex items-center px-4 shrink-0 border-b border-white/[0.06]">
        <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center font-bold text-white text-sm shrink-0 shadow-lg shadow-amber-900/50">
          <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
                <img
                  src={logo}
                  alt="Jaye Safaris"
                  className="h-16 w-16 object-contain"
                />
              </Link>
        </div>
        {open && (
          <div className="ml-3 overflow-hidden flex-1">
            <p className="text-white font-semibold text-[13px] leading-tight whitespace-nowrap tracking-wide">
              Jaye Safaris
            </p>
            <p className="text-white/30 text-[10px] whitespace-nowrap tracking-[0.15em] uppercase font-medium mt-0.5">
              Admin Console
            </p>
          </div>
        )}
        <button
          onClick={() => { setOpen(!open); setMobileOpen(false); }}
          className="ml-auto p-1.5 text-white/25 hover:text-white/70 transition-colors rounded-lg hover:bg-white/5 shrink-0"
        >
          {mobileOpen ? <X size={15} /> : <Menu size={15} />}
        </button>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-0.5">
        {open && (
          <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.22em] px-2 pb-2 pt-1">
            Navigation
          </p>
        )}

        {navItems.map((item) => <NavItem key={item.label} item={item} />)}

        {/* Divider */}
        <div className="h-px bg-white/[0.06] my-4 mx-1" />

        {/* ── Countries ── */}
        {open && (
          <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.22em] px-2 pb-2">
            Destinations
          </p>
        )}

        <div>
          <button
            onClick={() => setCountriesOpen(!countriesOpen)}
            className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl transition-all ${
              isCountry ? "text-white/80" : "text-white/40 hover:text-white hover:bg-white/[0.06]"
            }`}
          >
            <Globe size={17} className="shrink-0" />
            {open && (
              <>
                <span className="text-[13px] font-medium flex-1 text-left whitespace-nowrap tracking-[-0.01em]">
                  Countries
                </span>
                <ChevronDown
                  size={13}
                  className={`transition-transform duration-200 shrink-0 text-white/25 ${countriesOpen ? "rotate-180" : ""}`}
                />
              </>
            )}
          </button>

          {countriesOpen && open && (
            <div className="ml-3 mt-1 space-y-0.5 pl-3 border-l border-white/[0.06]">
              {COUNTRIES.map((name) => {
                const path = `/admin/country/${name.toLowerCase()}`;
                return (
                  <button
                    key={name}
                    onClick={() => { navigate(path); setMobileOpen(false); }}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all ${
                      isActive(path)
                        ? "bg-white/10 text-white"
                        : "text-white/35 hover:text-white/70 hover:bg-white/[0.04]"
                    }`}
                  >
                    <span className="text-sm leading-none">{FLAGS[name]}</span>
                    <span className="text-[12px] font-medium whitespace-nowrap">{name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      {/* ── Bottom ── */}
      <div className="shrink-0 border-t border-white/[0.06] px-3 py-3 space-y-0.5">
        <button
          onClick={() => { navigate("/admin/settings"); setMobileOpen(false); }}
          className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl transition-all text-left ${
            isActive("/admin/settings")
              ? "bg-amber-500 text-white shadow-lg shadow-amber-900/40"
              : "text-white/40 hover:text-white hover:bg-white/[0.06]"
          }`}
        >
          <Settings size={17} className="shrink-0" />
          {open && <span className="text-[13px] font-medium whitespace-nowrap tracking-[-0.01em]">Settings</span>}
        </button>

        {/* User profile row */}
        <div className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer">
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: { avatarBox: "w-7 h-7 rounded-lg" },
            }}
          />
          {open && user && (
            <div className="overflow-hidden flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-white/70 truncate leading-tight">
                {user.fullName || user.username || "Admin"}
              </p>
              <p className="text-[10px] text-white/25 truncate mt-0.5">
                {user.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar — fixed */}
      <aside
        className={`${
          open ? "w-64" : "w-[72px]"
        } transition-all duration-300 ease-in-out bg-[#111110] flex flex-col shrink-0 overflow-hidden fixed top-0 left-0 bottom-0 z-50 border-r border-white/[0.04] hidden md:flex`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile — icon-mode always-visible strip + slide-out overlay */}
      <aside className="md:hidden fixed top-0 left-0 bottom-0 z-50 w-[60px] bg-[#111110] border-r border-white/[0.04] flex flex-col">
        <div className="h-[60px] flex items-center justify-center border-b border-white/[0.06]">
          <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
                <img
                  src={logo}
                  alt="Jaye Safaris"
                  className="h-16 w-16 object-contain"
                  onClick={() => setMobileOpen(true)}
                />
              </Link>
        </div>
        <nav className="flex-1 py-4 flex flex-col items-center gap-1">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                title={item.label}
                className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all relative ${
                  active ? "bg-amber-500 text-white" : "text-white/40 hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                <item.icon size={17} />
                {item.count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-rose-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center leading-none">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
        <div className="pb-4 flex flex-col items-center gap-1">
          <button
            onClick={() => navigate("/admin/settings")}
            title="Settings"
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
              isActive("/admin/settings") ? "bg-amber-500 text-white" : "text-white/40 hover:text-white hover:bg-white/[0.06]"
            }`}
          >
            <Settings size={17} />
          </button>
        </div>
      </aside>

      {/* Mobile overlay panel */}
      {mobileOpen && (
        <>
          <div className="md:hidden fixed inset-0 z-[60] bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="md:hidden fixed top-0 left-0 bottom-0 z-[70] w-64 bg-[#111110] flex flex-col border-r border-white/[0.04]">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
};

export default SideBar;