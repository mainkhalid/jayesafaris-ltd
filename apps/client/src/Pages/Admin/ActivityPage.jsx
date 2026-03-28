import { useAdminData } from "../../context/AdminDataContext";
import { Package, Mail, Sparkles, Activity, Clock } from "lucide-react";

const TYPE_MAP = {
  booking: {
    icon: Package,
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-100",
    label: "New Booking",
  },
  inquiry: {
    icon: Mail,
    color: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-100",
    label: "New Inquiry",
  },
  quote: {
    icon: Sparkles,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
    label: "Custom Quote",
  },
};

const fmtDateTime = (d) =>
  new Date(d).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

const timeAgo = (d) => {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const STATUS_CLS = {
  new:       "bg-amber-50 text-amber-700 border-amber-200",
  contacted: "bg-sky-50 text-sky-700 border-sky-200",
  resolved:  "bg-emerald-50 text-emerald-700 border-emerald-200",
  quoted:    "bg-violet-50 text-violet-700 border-violet-200",
  pending:   "bg-orange-50 text-orange-700 border-orange-200",
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-rose-50 text-rose-700 border-rose-200",
};

const ActivityPage = () => {
  const { inquiries, bookings, customQuotes } = useAdminData();

  const events = [
    ...bookings.map((b) => ({
      type: "booking",
      name: b.name,
      detail: b.packageTitle || "Unknown package",
      status: b.status,
      ts: new Date(b.createdAt),
    })),
    ...inquiries.map((i) => ({
      type: "inquiry",
      name: i.name,
      detail: i.message?.slice(0, 60) + (i.message?.length > 60 ? "…" : "") || i.email,
      status: i.status,
      ts: new Date(i.createdAt),
    })),
    ...customQuotes.map((q) => ({
      type: "quote",
      name: q.name,
      detail: q.destinations?.join(", ") || q.email,
      status: q.status,
      ts: new Date(q.createdAt),
    })),
  ].sort((a, b) => b.ts - a.ts);

  return (
    <div className="space-y-8 pb-10">
      <div>
        <p className="text-[11px] font-semibold text-amber-600 uppercase tracking-[0.2em] mb-1">Log</p>
        <h1 className="text-[28px] font-bold text-stone-900 leading-tight tracking-tight">Activity Feed</h1>
        <p className="text-[13px] text-stone-400 mt-1">{events.length} total events</p>
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: "Bookings",  count: bookings.length,     color: "bg-orange-50 text-orange-700 border-orange-200" },
          { label: "Inquiries", count: inquiries.length,    color: "bg-rose-50 text-rose-700 border-rose-200"       },
          { label: "Quotes",    count: customQuotes.length, color: "bg-amber-50 text-amber-700 border-amber-200"    },
        ].map(({ label, count, color }) => (
          <span key={label} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[12px] font-semibold ${color}`}>
            <Activity size={11} /> {count} {label}
          </span>
        ))}
      </div>

      {/* Feed */}
      <div className="bg-white rounded-2xl border border-stone-200/60 shadow-sm overflow-hidden">
        {events.length === 0 ? (
          <div className="py-20 text-center text-stone-400">
            <Clock size={32} className="mx-auto mb-3 text-stone-200" />
            <p className="text-[13px]">No activity recorded yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {events.map((ev, i) => {
              const t = TYPE_MAP[ev.type];
              const Icon = t.icon;
              return (
                <div key={i} className="flex items-start gap-4 px-5 py-4 hover:bg-stone-50/40 transition-colors">
                  <div className={`w-9 h-9 rounded-xl ${t.bg} border ${t.border} flex items-center justify-center shrink-0 mt-0.5`}>
                    <Icon size={15} className={t.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${t.color}`}>{t.label}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wide ${STATUS_CLS[ev.status] || "bg-stone-50 text-stone-500 border-stone-200"}`}>
                        {ev.status}
                      </span>
                    </div>
                    <p className="text-[13px] font-semibold text-stone-800 mt-0.5">{ev.name}</p>
                    <p className="text-[12px] text-stone-400 mt-0.5 truncate">{ev.detail}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[11px] font-semibold text-stone-500">{timeAgo(ev.ts)}</p>
                    <p className="text-[10px] text-stone-300 mt-0.5">{fmtDateTime(ev.ts)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityPage;
