import { useAdminData } from "../../context/AdminDataContext";
import { BarChart2, TrendingUp, Package, Sparkles, Mail, Globe, ArrowUpRight } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "/api";

// ── Simple bar chart using CSS ─────────────────────────────────────────────────
const BarChart = ({ data, label, color = "bg-amber-500" }) => {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div>
      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.18em] mb-4">{label}</p>
      <div className="flex items-end gap-2 h-32">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
            <span className="text-[9px] text-stone-400 font-semibold">{d.value}</span>
            <div
              className={`w-full ${color} rounded-t-md transition-all duration-500`}
              style={{ height: `${(d.value / max) * 100}%`, minHeight: d.value > 0 ? "4px" : "0" }}
            />
            <span className="text-[9px] text-stone-400 truncate w-full text-center">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Donut chart using SVG ──────────────────────────────────────────────────────
const DonutChart = ({ segments, size = 120 }) => {
  const r = 45;
  const cx = size / 2, cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const total = segments.reduce((s, g) => s + g.value, 0) || 1;

  let offset = 0;
  return (
    <svg width={size} height={size} className="-rotate-90">
      {segments.map((seg, i) => {
        const dash = (seg.value / total) * circumference;
        const el = (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth="18"
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeDashoffset={-offset}
            className="transition-all duration-700"
          />
        );
        offset += dash;
        return el;
      })}
    </svg>
  );
};

// ── Stat row ──────────────────────────────────────────────────────────────────
const MetricCard = ({ icon: Icon, label, value, color, bg }) => (
  <div className="bg-white rounded-2xl p-5 border border-stone-200/60 shadow-sm flex items-center gap-4">
    <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
      <Icon size={20} className={color} />
    </div>
    <div>
      <p className="text-[26px] font-bold text-stone-900 leading-none">{value}</p>
      <p className="text-[11px] text-stone-400 font-semibold uppercase tracking-[0.14em] mt-1">{label}</p>
    </div>
  </div>
);

const getLast6Months = () => {
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push({ label: d.toLocaleDateString("en-US", { month: "short" }), date: d });
  }
  return months;
};

const countByMonth = (items, months) =>
  months.map(({ label, date }) => ({
    label,
    value: items.filter((item) => {
      const d = new Date(item.createdAt);
      return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
    }).length,
  }));

const COUNTRY_COLORS = {
  kenya: "#f59e0b",
  tanzania: "#10b981",
  zanzibar: "#3b82f6",
  uganda: "#8b5cf6",
};

const AnalyticsPage = () => {
  const { inquiries, bookings, customQuotes, countries } = useAdminData();
  const months = getLast6Months();

  const bookingsByMonth = countByMonth(bookings, months);
  const inquiriesByMonth = countByMonth(inquiries, months);
  const quotesByMonth = countByMonth(customQuotes, months);

  const confirmedBookings = bookings.filter((b) => b.status === "confirmed").length;
  const conversionRate = bookings.length
    ? ((confirmedBookings / bookings.length) * 100).toFixed(1)
    : 0;

  // Country breakdown from bookings packageTitle
  const countryBreakdown = Object.entries(
    bookings.reduce((acc, b) => {
      const c = (b.packageTitle || "").toLowerCase().includes("kenya")   ? "kenya"
              : (b.packageTitle || "").toLowerCase().includes("tanzania") ? "tanzania"
              : (b.packageTitle || "").toLowerCase().includes("zanzibar") ? "zanzibar"
              : (b.packageTitle || "").toLowerCase().includes("uganda")   ? "uganda"
              : "other";
      acc[c] = (acc[c] || 0) + 1;
      return acc;
    }, {})
  ).map(([country, value]) => ({
    label: country.charAt(0).toUpperCase() + country.slice(1),
    value,
    color: COUNTRY_COLORS[country] || "#d1d5db",
  }));

  const totalPackages = Object.values(countries).reduce((a, c) => a + (c.packages?.length || 0), 0);

  return (
    <div className="space-y-8 pb-10">
      <div>
        <p className="text-[11px] font-semibold text-amber-600 uppercase tracking-[0.2em] mb-1">Reports</p>
        <h1 className="text-[28px] font-bold text-stone-900 leading-tight tracking-tight">Analytics</h1>
        <p className="text-[13px] text-stone-400 mt-1">Live data from MongoDB — last 6 months</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={Package}  label="Total Bookings"   value={bookings.length}     color="text-orange-600" bg="bg-orange-50" />
        <MetricCard icon={TrendingUp} label="Confirmed"      value={confirmedBookings}   color="text-emerald-600" bg="bg-emerald-50" />
        <MetricCard icon={Mail}     label="Total Inquiries"  value={inquiries.length}    color="text-rose-600"   bg="bg-rose-50"   />
        <MetricCard icon={Sparkles} label="Custom Quotes"    value={customQuotes.length} color="text-amber-600"  bg="bg-amber-50"  />
      </div>

      {/* Conversion Rate */}
      <div className="grid md:grid-cols-3 gap-5">
        <div className="md:col-span-2 bg-white rounded-2xl border border-stone-200/60 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-semibold text-stone-700">Booking Volume</p>
              <p className="text-[11px] text-stone-400 mt-0.5">Confirmed bookings per month</p>
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
              {conversionRate}% conversion
            </span>
          </div>
          <BarChart data={bookingsByMonth} label="Bookings per month" color="bg-orange-400" />
        </div>

        {/* Country donut */}
        <div className="bg-white rounded-2xl border border-stone-200/60 shadow-sm p-6">
          <p className="text-[13px] font-semibold text-stone-700 mb-1">Bookings by Destination</p>
          <p className="text-[11px] text-stone-400 mb-5">Based on package title</p>
          {countryBreakdown.length > 0 ? (
            <div className="flex flex-col items-center gap-4">
              <DonutChart segments={countryBreakdown} />
              <div className="w-full space-y-2">
                {countryBreakdown.map((seg) => (
                  <div key={seg.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                      <span className="text-[12px] text-stone-600">{seg.label}</span>
                    </div>
                    <span className="text-[12px] font-bold text-stone-700">{seg.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-10 text-center text-stone-300 text-[13px]">No bookings yet</div>
          )}
        </div>
      </div>

      {/* Inquiries & Quotes charts */}
      <div className="grid md:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-stone-200/60 shadow-sm p-6">
          <p className="text-[13px] font-semibold text-stone-700 mb-5">Inquiries per Month</p>
          <BarChart data={inquiriesByMonth} label="" color="bg-rose-400" />
        </div>
        <div className="bg-white rounded-2xl border border-stone-200/60 shadow-sm p-6">
          <p className="text-[13px] font-semibold text-stone-700 mb-5">Custom Quotes per Month</p>
          <BarChart data={quotesByMonth} label="" color="bg-amber-400" />
        </div>
      </div>

      {/* Summary table */}
      <div className="bg-white rounded-2xl border border-stone-200/60 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-100 flex items-center gap-2">
          <Globe size={14} className="text-stone-400" />
          <span className="text-[13px] font-semibold text-stone-700">Destination Overview</span>
        </div>
        <div className="divide-y divide-stone-100">
          {Object.entries(countries).map(([name, data]) => (
            <div key={name} className="px-5 py-3.5 flex items-center justify-between hover:bg-stone-50/50 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-base">{{ Kenya: "🇰🇪", Tanzania: "🇹🇿", Zanzibar: "🏝️", Uganda: "🇺🇬" }[name]}</span>
                <span className="text-[13px] font-semibold text-stone-800">{name}</span>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-[13px] font-bold text-stone-900">{data.packages?.length || 0}</p>
                  <p className="text-[10px] text-stone-400">packages</p>
                </div>
                <ArrowUpRight size={14} className="text-stone-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
