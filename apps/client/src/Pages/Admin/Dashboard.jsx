import { useNavigate } from "react-router-dom";
import {
  Globe, Package, MapPin, Mail, Sparkles,
  ChevronRight, TrendingUp, ArrowUpRight,
  Users, BarChart2, CheckCircle, Clock,
  CalendarDays, Activity,
} from "lucide-react";
import { useAdminData } from "../../context/AdminDataContext";

// ─── Status Badge ─────────────────────────────────────────────────────────────
const STATUS_MAP = {
  new:       { label: "New",       cls: "bg-amber-50 text-amber-700 border-amber-200"       },
  contacted: { label: "Contacted", cls: "bg-sky-50 text-sky-700 border-sky-200"             },
  resolved:  { label: "Resolved",  cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  quoted:    { label: "Quoted",    cls: "bg-violet-50 text-violet-700 border-violet-200"     },
  pending:   { label: "Pending",   cls: "bg-orange-50 text-orange-700 border-orange-200"    },
  confirmed: { label: "Confirmed", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  cancelled: { label: "Cancelled", cls: "bg-rose-50 text-rose-700 border-rose-200"          },
};
const StatusBadge = ({ status }) => {
  const s = STATUS_MAP[status] ?? STATUS_MAP.new;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border ${s.cls}`}>
      {s.label}
    </span>
  );
};

const FLAGS = { Kenya: "🇰🇪", Tanzania: "🇹🇿", Zanzibar: "🏝️", Uganda: "🇺🇬" };

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, subtext, colorClass, bgClass, onClick }) => (
  <button
    onClick={onClick}
    className={`group relative text-left bg-white rounded-2xl p-5 border border-stone-200/60 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${onClick ? "cursor-pointer" : "cursor-default"}`}
  >
    <div className={`absolute top-0 left-0 right-0 h-0.5 ${colorClass} opacity-60`} />
    <div className="flex items-start justify-between">
      <div className={`w-10 h-10 rounded-xl ${bgClass} flex items-center justify-center shrink-0`}>
        <Icon size={18} className={colorClass.replace("bg-", "text-")} />
      </div>
      {onClick && (
        <ArrowUpRight
          size={14}
          className="text-stone-300 group-hover:text-stone-500 transition-colors mt-0.5"
        />
      )}
    </div>
    <div className="mt-4">
      <p className="text-[28px] font-bold text-stone-900 leading-none tracking-tight">
        {value ?? 0}
      </p>
      <p className="text-[11px] text-stone-400 font-semibold uppercase tracking-[0.15em] mt-1.5">
        {label}
      </p>
      {subtext && (
        <p className="text-[10px] text-stone-300 mt-1">{subtext}</p>
      )}
    </div>
  </button>
);

// ─── Section Header ───────────────────────────────────────────────────────────
const SectionHeader = ({ title, icon: Icon, iconColor, action, onAction }) => (
  <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
    <div className="flex items-center gap-2.5">
      <Icon size={15} className={iconColor} />
      <span className="text-[13px] font-semibold text-stone-700">{title}</span>
    </div>
    {action && (
      <button
        onClick={onAction}
        className="text-[11px] font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1 transition-colors"
      >
        {action} <ArrowUpRight size={11} />
      </button>
    )}
  </div>
);

// ─── Mini activity item ───────────────────────────────────────────────────────
const ActivityItem = ({ icon: Icon, iconBg, text, time }) => (
  <div className="flex items-start gap-3 px-5 py-3 hover:bg-stone-50/60 transition-colors border-b border-stone-100 last:border-0">
    <div className={`w-7 h-7 rounded-lg ${iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
      <Icon size={13} className="text-white" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[12px] text-stone-700 leading-normal">{text}</p>
      <p className="text-[10px] text-stone-300 mt-0.5">{time}</p>
    </div>
  </div>
);

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

// ─── Dashboard ────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();
  const {
    countries,
    inquiries, inquiryStats,
    bookings, bookingStats,
    customQuotes, customQuoteStats,
  } = useAdminData();

  const totalPackages = Object.values(countries).reduce(
    (a, c) => a + (c.packages?.length || 0), 0
  );

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // Build mini activity feed from last 5 events across all data types
  const activityEvents = [
    ...bookings.map((b) => ({
      ts: new Date(b.createdAt),
      icon: Package,
      bg: "bg-orange-500",
      text: `New booking from ${b.name} — ${b.packageTitle || "Unknown package"}`,
    })),
    ...inquiries.map((i) => ({
      ts: new Date(i.createdAt),
      icon: Mail,
      bg: "bg-rose-500",
      text: `New inquiry from ${i.name}`,
    })),
    ...customQuotes.map((q) => ({
      ts: new Date(q.createdAt),
      icon: Sparkles,
      bg: "bg-amber-500",
      text: `Custom quote request from ${q.name}`,
    })),
  ]
    .sort((a, b) => b.ts - a.ts)
    .slice(0, 6);

  return (
    <div className="space-y-8 pb-10">
      {/* ── Page Header ── */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[11px] font-semibold text-amber-600 uppercase tracking-[0.2em] mb-1">
            {greeting}
          </p>
          <h1 className="text-[28px] font-bold text-stone-900 leading-tight tracking-tight">
            Overview
          </h1>
          <p className="text-[13px] text-stone-400 mt-1">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-3.5 py-2 bg-white border border-stone-200 rounded-xl text-[11px] text-stone-500 font-medium shadow-sm">
          <TrendingUp size={13} className="text-emerald-500" />
          Live data
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Mail} label="New Inquiries" value={inquiryStats?.new}
          subtext={`${inquiryStats?.total ?? 0} total`}
          colorClass="bg-rose-500" bgClass="bg-rose-50"
          onClick={() => navigate("/admin/inquiries")}
        />
        <StatCard
          icon={Package} label="Pending Bookings" value={bookingStats?.pending}
          subtext={`${bookingStats?.confirmed ?? 0} confirmed`}
          colorClass="bg-orange-500" bgClass="bg-orange-50"
          onClick={() => navigate("/admin/bookings")}
        />
        <StatCard
          icon={Sparkles} label="New Quotes" value={customQuoteStats?.new}
          subtext={`${customQuoteStats?.total ?? 0} total`}
          colorClass="bg-amber-500" bgClass="bg-amber-50"
          onClick={() => navigate("/admin/custom-quotes")}
        />
        <StatCard
          icon={Globe} label="Total Packages" value={totalPackages}
          subtext={`${Object.keys(countries).length} destinations`}
          colorClass="bg-stone-700" bgClass="bg-stone-100"
        />
      </div>

      {/* ── Secondary stats row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={CheckCircle} label="Confirmed" value={bookingStats?.confirmed}
          colorClass="bg-emerald-500" bgClass="bg-emerald-50"
          onClick={() => navigate("/admin/bookings")}
        />
        <StatCard
          icon={Clock} label="Total Bookings" value={bookingStats?.total}
          colorClass="bg-sky-500" bgClass="bg-sky-50"
          onClick={() => navigate("/admin/bookings")}
        />
        <StatCard
          icon={Users} label="Total Inquiries" value={inquiryStats?.total}
          colorClass="bg-violet-500" bgClass="bg-violet-50"
          onClick={() => navigate("/admin/inquiries")}
        />
        <StatCard
          icon={BarChart2} label="Quotes Resolved" value={customQuoteStats?.resolved}
          colorClass="bg-teal-500" bgClass="bg-teal-50"
          onClick={() => navigate("/admin/analytics")}
        />
      </div>

      {/* ── Main content grid ── */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Left — Recent activity */}
        <div className="lg:col-span-2 space-y-5">
          {/* Recent Bookings */}
          <div className="bg-white rounded-2xl border border-stone-200/60 shadow-sm overflow-hidden">
            <SectionHeader
              title="Recent Bookings" icon={Clock} iconColor="text-orange-500"
              action="View all" onAction={() => navigate("/admin/bookings")}
            />
            <div>
              {bookings.length === 0 ? (
                <div className="py-14 text-center text-stone-400 text-sm">No recent bookings.</div>
              ) : (
                bookings.slice(0, 5).map((b, idx) => (
                  <div
                    key={b._id}
                    className={`px-5 py-3.5 flex items-center justify-between hover:bg-stone-50/60 transition-colors ${
                      idx !== 0 ? "border-t border-stone-100" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 font-bold text-[12px] shrink-0">
                        {b.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-stone-800 leading-tight">{b.name}</p>
                        <p className="text-[11px] text-stone-400 mt-0.5">{b.packageTitle}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={b.status} />
                      <p className="text-[10px] text-stone-300 mt-1">
                        {new Date(b.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Custom Quotes */}
          <div className="bg-white rounded-2xl border border-stone-200/60 shadow-sm overflow-hidden">
            <SectionHeader
              title="Custom Quote Requests" icon={Sparkles} iconColor="text-amber-500"
              action="View all" onAction={() => navigate("/admin/custom-quotes")}
            />
            <div>
              {customQuotes.length === 0 ? (
                <div className="py-14 text-center text-stone-400 text-sm">No quote requests.</div>
              ) : (
                customQuotes.slice(0, 5).map((q, idx) => (
                  <div
                    key={q._id}
                    className={`px-5 py-3.5 flex items-center justify-between hover:bg-stone-50/60 transition-colors ${
                      idx !== 0 ? "border-t border-stone-100" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 font-bold text-[12px] shrink-0">
                        {q.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-stone-800 leading-tight">{q.name}</p>
                        <p className="text-[11px] text-stone-400 mt-0.5">
                          {q.destinations?.join(", ") || "—"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={q.status} />
                      <p className="text-[10px] text-stone-300 mt-1">
                        {new Date(q.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Countries quick-jump */}
          <div className="bg-[#111110] rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-white/[0.06]">
              <p className="text-[11px] font-semibold text-white/30 uppercase tracking-[0.2em]">
                Destinations
              </p>
              <p className="text-[15px] font-semibold text-white mt-1">Country Pages</p>
            </div>
            <div className="p-3 space-y-1">
              {Object.entries(countries).map(([name]) => (
                <button
                  key={name}
                  onClick={() => navigate(`/admin/country/${name.toLowerCase()}`)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/10 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base leading-none">{FLAGS[name]}</span>
                    <span className="text-[13px] font-medium text-white/70 group-hover:text-white transition-colors">
                      {name}
                    </span>
                  </div>
                  <ChevronRight size={13} className="text-white/20 group-hover:text-amber-500 transition-colors" />
                </button>
              ))}
            </div>
            <div className="px-3 pb-3">
              <div className="flex items-center justify-center gap-2 py-2 opacity-30">
                <MapPin size={11} className="text-white" />
                <span className="text-[10px] text-white font-medium tracking-widest uppercase">East Africa</span>
              </div>
            </div>
          </div>

          {/* Mini Activity Feed */}
          <div className="bg-white rounded-2xl border border-stone-200/60 shadow-sm overflow-hidden">
            <SectionHeader
              title="Recent Activity" icon={Activity} iconColor="text-violet-500"
              action="View all" onAction={() => navigate("/admin/activity")}
            />
            <div>
              {activityEvents.length === 0 ? (
                <div className="py-10 text-center text-stone-400 text-[13px]">No activity yet.</div>
              ) : (
                activityEvents.map((ev, i) => (
                  <ActivityItem
                    key={i}
                    icon={ev.icon}
                    iconBg={ev.bg}
                    text={ev.text}
                    time={fmtDate(ev.ts)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-2xl border border-stone-200/60 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-stone-100">
              <p className="text-[13px] font-semibold text-stone-700">Quick Actions</p>
            </div>
            <div className="p-3 space-y-1.5">
              {[
                { label: "Add Departure",    icon: CalendarDays, path: "/admin/departures",    color: "text-sky-600",    bg: "bg-sky-50"    },
                { label: "Edit Packages",    icon: Globe,        path: "/admin/country/kenya",  color: "text-amber-600",  bg: "bg-amber-50"  },
                { label: "View Analytics",  icon: BarChart2,    path: "/admin/analytics",      color: "text-violet-600", bg: "bg-violet-50" },
                { label: "Manage Users",    icon: Users,        path: "/admin/users",          color: "text-stone-600",  bg: "bg-stone-50"  },
              ].map(({ label, icon: Icon, path, color, bg }) => (
                <button
                  key={label}
                  onClick={() => navigate(path)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-stone-50 border border-transparent hover:border-stone-100 text-left transition-all group"
                >
                  <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                    <Icon size={14} className={color} />
                  </div>
                  <span className="text-[13px] font-medium text-stone-700 group-hover:text-stone-900">{label}</span>
                  <ChevronRight size={12} className="ml-auto text-stone-200 group-hover:text-stone-400 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;