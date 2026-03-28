import React, { useState } from "react";
import { useAdminData } from "../../context/AdminDataContext";
import {
  Search, Phone, Mail,
  Calendar, Users, Trash2, Download,
} from "lucide-react";

const STATUS_OPTIONS = [
  { label: "All",       value: "all"       },
  { label: "Pending",   value: "pending"   },
  { label: "Confirmed", value: "confirmed" },
  { label: "Cancelled", value: "cancelled" },
];

const STATUS_STYLES = {
  confirmed: { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  pending:   { cls: "bg-orange-50 text-orange-700 border-orange-200",    dot: "bg-orange-500"  },
  cancelled: { cls: "bg-rose-50 text-rose-700 border-rose-200",          dot: "bg-rose-500"    },
};

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";

const getDepartureDate = (b) => b.departureId?.departureDate || null;

const Avatar = ({ name }) => (
  <div className="w-9 h-9 rounded-xl border border-amber-100 bg-amber-50 flex items-center justify-center font-bold text-[12px] text-amber-700 shrink-0">
    {name?.[0]?.toUpperCase() || "?"}
  </div>
);

const StatusBadge = ({ status }) => {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border ${s.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
};

const StatusSelect = ({ current, onChange }) => (
  <select
    value={current}
    onChange={(e) => onChange(e.target.value)}
    onClick={(e) => e.stopPropagation()}
    className="text-[11px] font-semibold border border-stone-200 rounded-lg px-2 py-1.5 bg-white text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-300 transition-all cursor-pointer"
  >
    <option value="pending">Pending</option>
    <option value="confirmed">Confirmed</option>
    <option value="cancelled">Cancelled</option>
  </select>
);

const exportCSV = (rows) => {
  const header = ["Name", "Email", "Phone", "Package", "Departure Date", "Travelers", "Status", "Booked On"];
  const lines = rows.map((b) => [
    b.name, b.email, b.phone || "",
    b.packageTitle || "",
    fmt(getDepartureDate(b)),
    (b.numberOfTravelers?.adults || 0) + (b.numberOfTravelers?.kids || 0) + (b.numberOfTravelers?.infants || 0),
    b.status,
    fmt(b.createdAt),
  ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));
  const csv = [header.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "bookings.csv"; a.click();
  URL.revokeObjectURL(url);
};

const BookingsPage = () => {
  const { bookings, bookingStats, bookingsLoading, updateBooking, deleteBooking } = useAdminData();
  const [filter, setFilter]         = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [updating, setUpdating]     = useState(null);

  const filtered = (bookings || []).filter((b) => {
    const matchStatus = filter === "all" || b.status === filter;
    const q = searchTerm.toLowerCase();
    const matchSearch =
      b.name?.toLowerCase().includes(q) ||
      b.packageTitle?.toLowerCase().includes(q) ||
      b.email?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const handleStatusChange = async (id, newStatus) => {
    setUpdating(id);
    try { await updateBooking(id, { status: newStatus }); }
    finally { setUpdating(null); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this booking permanently? This cannot be undone.")) await deleteBooking(id);
  };

  return (
    <div className="space-y-6 pb-10">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <p className="text-[11px] font-semibold text-amber-600 uppercase tracking-[0.2em] mb-1">Management</p>
          <h1 className="text-[28px] font-bold text-stone-900 leading-tight tracking-tight">Bookings</h1>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {[
            { label: "Total",     value: bookingStats?.total     || 0, color: "text-stone-800"   },
            { label: "Pending",   value: bookingStats?.pending   || 0, color: "text-orange-600"  },
            { label: "Confirmed", value: bookingStats?.confirmed || 0, color: "text-emerald-600" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white px-4 py-2.5 rounded-xl border border-stone-200/60 shadow-sm text-center min-w-[70px]">
              <p className={`text-[18px] font-bold leading-tight ${color}`}>{value}</p>
              <p className="text-[10px] text-stone-400 font-semibold uppercase tracking-wide mt-0.5">{label}</p>
            </div>
          ))}
          <button
            onClick={() => exportCSV(filtered)}
            className="flex items-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-[12px] font-semibold rounded-xl transition-all shadow-sm"
          >
            <Download size={13} /> Export CSV
          </button>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="bg-white rounded-2xl border border-stone-200/60 shadow-sm p-3 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-300" size={15} />
          <input
            type="text"
            placeholder="Search by name, email or package…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-[13px] text-stone-700 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-300 transition-all"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`px-3.5 py-2 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
                filter === opt.value
                  ? "bg-stone-900 text-white shadow-sm"
                  : "text-stone-500 hover:text-stone-700 hover:bg-stone-100 border border-stone-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-stone-200/60 shadow-sm overflow-hidden">
        <div className="px-6 py-3.5 border-b border-stone-100 bg-stone-50/50">
          <span className="text-[12px] font-semibold text-stone-500">
            {bookingsLoading ? "Loading…" : `${filtered.length} booking${filtered.length !== 1 ? "s" : ""}`}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-stone-100">
                {["Client", "Package & Date", "Travelers", "Status", "Change Status", "Actions"].map((h, i) => (
                  <th key={h} className={`px-5 py-3 text-[10px] font-bold text-stone-400 uppercase tracking-[0.15em] ${i >= 4 ? "text-right" : ""}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookingsLoading && (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center">
                    <div className="flex items-center justify-center gap-2.5 text-stone-300">
                      <div className="w-4 h-4 rounded-full bg-amber-400 animate-pulse" />
                      <span className="text-[12px] font-semibold uppercase tracking-widest">Loading…</span>
                    </div>
                  </td>
                </tr>
              )}
              {!bookingsLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center text-stone-400 text-[13px]">No bookings match your criteria.</td>
                </tr>
              )}
              {!bookingsLoading && filtered.map((b, idx) => {
                const travelers =
                  (b.numberOfTravelers?.adults  || 0) +
                  (b.numberOfTravelers?.kids    || 0) +
                  (b.numberOfTravelers?.infants || 0);
                const depDate = getDepartureDate(b);
                return (
                  <tr key={b._id} className={`group hover:bg-stone-50/40 transition-colors ${idx !== filtered.length - 1 ? "border-b border-stone-100" : ""}`}>
                    {/* Client */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={b.name} />
                        <div>
                          <p className="text-[13px] font-semibold text-stone-800">{b.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <a href={`mailto:${b.email}`} className="text-stone-300 hover:text-amber-500 transition-colors"><Mail size={11} /></a>
                            <a href={`tel:${b.phone}`}    className="text-stone-300 hover:text-amber-500 transition-colors"><Phone size={11} /></a>
                            <span className="text-[10px] text-stone-300 truncate max-w-[140px]">{b.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    {/* Package + departure */}
                    <td className="px-5 py-4">
                      <p className="text-[13px] font-semibold text-stone-700">{b.packageTitle}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Calendar size={11} className="text-stone-300" />
                        <span className="text-[11px] text-stone-400 font-medium">
                          {depDate ? fmt(depDate) : <span className="text-stone-300 italic text-[10px]">No date</span>}
                        </span>
                      </div>
                    </td>
                    {/* Travelers */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Users size={13} className="text-stone-300" />
                        <span className="text-[13px] font-semibold text-stone-700">{travelers}</span>
                        <span className="text-[10px] text-stone-400">({b.numberOfTravelers?.adults}A/{b.numberOfTravelers?.kids}K)</span>
                      </div>
                    </td>
                    {/* Status badge */}
                    <td className="px-5 py-4"><StatusBadge status={b.status} /></td>
                    {/* Inline status change */}
                    <td className="px-5 py-4 text-right">
                      {updating === b._id ? (
                        <div className="w-4 h-4 rounded-full border-2 border-amber-400 border-t-transparent animate-spin ml-auto" />
                      ) : (
                        <StatusSelect current={b.status} onChange={(s) => handleStatusChange(b._id, s)} />
                      )}
                    </td>
                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a href={`mailto:${b.email}`} title="Email" className="w-8 h-8 flex items-center justify-center rounded-lg text-sky-500 hover:bg-sky-50 border border-transparent hover:border-sky-200 transition-all">
                          <Mail size={14} />
                        </a>
                        <button onClick={() => handleDelete(b._id)} title="Delete" className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-400 hover:bg-rose-50 hover:text-rose-600 border border-transparent hover:border-rose-200 transition-all">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BookingsPage;