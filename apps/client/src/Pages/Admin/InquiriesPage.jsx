import { useState, useMemo } from "react";
import {
  Mail, Phone, Globe, Users, Calendar, X, Trash2,
  RefreshCw, MessageSquare, Search, Filter,
  ChevronRight, Clock, MapPin, Package,
  CheckCircle2, Circle, ArrowUpRight, Inbox,
  SlidersHorizontal, CornerDownRight,
} from "lucide-react";
import { useInquiries } from "../../hooks/useInquiry";

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS = {
  new:       { label: "New",       bg: "bg-amber-50",    text: "text-amber-700",   border: "border-amber-200",  dot: "bg-amber-400",    ring: "ring-amber-300"   },
  contacted: { label: "Contacted", bg: "bg-sky-50",      text: "text-sky-700",     border: "border-sky-200",    dot: "bg-sky-400",      ring: "ring-sky-300"     },
  resolved:  { label: "Resolved",  bg: "bg-emerald-50",  text: "text-emerald-700", border: "border-emerald-200",dot: "bg-emerald-400",  ring: "ring-emerald-300" },
};

const StatusBadge = ({ status, size = "sm" }) => {
  const s = STATUS[status] ?? STATUS.new;
  const pad = size === "xs" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-bold border ${pad} ${s.bg} ${s.text} ${s.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
      {s.label}
    </span>
  );
};

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, accent, sublabel, onClick, active }) => (
  <button
    onClick={onClick}
    className={`relative text-left px-5 py-4 rounded-2xl border transition-all duration-200 overflow-hidden group ${
      active
        ? "bg-stone-900 border-stone-900 shadow-xl shadow-stone-900/20"
        : "bg-white border-stone-100 hover:border-stone-200 hover:shadow-md shadow-sm"
    }`}
  >
    <div className={`text-3xl font-bold tracking-tight leading-none mb-1.5 ${active ? "text-white" : accent}`}>
      {value}
    </div>
    <div className={`text-[11px] font-bold uppercase tracking-[0.15em] ${active ? "text-stone-400" : "text-stone-400"}`}>
      {label}
    </div>
    {sublabel && (
      <div className={`text-[10px] mt-0.5 ${active ? "text-stone-500" : "text-stone-300"}`}>{sublabel}</div>
    )}
    {active && (
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
    )}
  </button>
);

// ── Skeleton ──────────────────────────────────────────────────────────────────
const Skeleton = () => (
  <div className="space-y-2">
    {[1, 2, 3, 4].map((n) => (
      <div key={n} className="bg-white rounded-2xl border border-stone-100 p-4 animate-pulse">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-stone-100 shrink-0" />
            <div>
              <div className="h-3.5 bg-stone-100 rounded-lg w-28 mb-1.5" />
              <div className="h-2.5 bg-stone-50 rounded-lg w-20" />
            </div>
          </div>
          <div className="h-5 bg-stone-100 rounded-full w-16" />
        </div>
        <div className="h-2.5 bg-stone-50 rounded w-full mb-1.5" />
        <div className="h-2.5 bg-stone-50 rounded w-2/3" />
      </div>
    ))}
  </div>
);

// ── Inquiry list item ─────────────────────────────────────────────────────────
const InquiryCard = ({ inq, selected, onClick }) => {
  const isSelected = selected?._id === inq._id;
  const initials = inq.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const date = new Date(inq.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 group ${
        isSelected
          ? "border-amber-300 bg-amber-50/80 shadow-md shadow-amber-100"
          : "border-stone-100 bg-white hover:border-stone-200 hover:shadow-sm"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
          isSelected ? "bg-amber-500 text-white" : "bg-stone-100 text-stone-600 group-hover:bg-stone-200"
        }`}>
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          {/* Name + date */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="font-bold text-stone-800 text-sm leading-tight truncate">{inq.name}</p>
            <span className="text-[10px] text-stone-300 shrink-0 mt-0.5">{date}</span>
          </div>

          {/* Destination / package */}
          {(inq.destination || inq.packageTitle) && (
            <p className="text-[11px] text-amber-600 font-semibold truncate mb-1.5 flex items-center gap-1">
              {inq.packageTitle ? <><Package size={9} /> {inq.packageTitle}</> : <><MapPin size={9} /> {inq.destination}</>}
            </p>
          )}

          {/* Message preview */}
          <p className="text-[11px] text-stone-400 line-clamp-2 leading-relaxed">{inq.message}</p>

          {/* Footer row */}
          <div className="flex items-center justify-between mt-2.5">
            <StatusBadge status={inq.status} size="xs" />
            {inq.numberOfTravelers && (
              <span className="text-[10px] text-stone-300 flex items-center gap-1">
                <Users size={9} /> {inq.numberOfTravelers}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
};

// ── Detail field ──────────────────────────────────────────────────────────────
const DetailField = ({ icon: Icon, label, children, accent }) => (
  <div className={`rounded-xl p-3.5 ${accent ? "bg-amber-50 border border-amber-100" : "bg-stone-50"}`}>
    <p className={`text-[10px] font-bold uppercase tracking-[0.15em] mb-1.5 flex items-center gap-1.5 ${accent ? "text-amber-500" : "text-stone-400"}`}>
      <Icon size={10} /> {label}
    </p>
    {children}
  </div>
);

// ── Inquiry detail panel ──────────────────────────────────────────────────────
const InquiryDetail = ({ inquiry, onClose, onStatusChange, onDelete }) => {
  const [notes,  setNotes]  = useState(inquiry?.adminNotes ?? "");
  const [saving, setSaving] = useState(false);

  // Sync notes when inquiry changes
  const key = inquiry?._id;
  useMemo(() => { setNotes(inquiry?.adminNotes ?? ""); }, [key]);

  if (!inquiry) return (
    <div className="h-full min-h-[400px] bg-white rounded-3xl border border-stone-100 shadow-sm flex flex-col items-center justify-center text-center p-10 gap-4">
      <div className="w-16 h-16 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-center">
        <Inbox size={28} className="text-stone-200" />
      </div>
      <div>
        <p className="text-stone-500 font-semibold text-sm">No inquiry selected</p>
        <p className="text-stone-300 text-xs mt-1">Click an inquiry from the list to view details</p>
      </div>
    </div>
  );

  const initials = inquiry.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  const handleStatusChange = async (s) => {
    setSaving(true);
    await onStatusChange(inquiry._id, { status: s, adminNotes: notes });
    setSaving(false);
  };

  const handleSaveNotes = async () => {
    setSaving(true);
    await onStatusChange(inquiry._id, { adminNotes: notes });
    setSaving(false);
  };

  const replySubject = `Re: Your Safari Inquiry${inquiry.destination ? ` – ${inquiry.destination}` : ""}`;
  const formattedDate = new Date(inquiry.createdAt).toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden sticky top-4">
      {/* Panel header */}
      <div className="px-6 pt-6 pb-4 border-b border-stone-50">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-bold text-white text-base shadow-md shadow-amber-200 shrink-0">
              {initials}
            </div>
            <div>
              <h3 className="font-bold text-stone-800 text-base leading-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                {inquiry.name}
              </h3>
              <p className="text-xs text-stone-400 mt-0.5 flex items-center gap-1.5">
                <Clock size={10} /> {formattedDate}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => onDelete(inquiry._id)}
              className="p-2 text-stone-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors" title="Delete">
              <Trash2 size={14} />
            </button>
            <button onClick={onClose}
              className="p-2 text-stone-300 hover:text-stone-600 hover:bg-stone-50 rounded-xl transition-colors">
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Status row */}
        <div className="flex items-center gap-2 mt-4">
          <StatusBadge status={inquiry.status} />
          {inquiry.destination && (
            <span className="text-xs text-stone-400 flex items-center gap-1">
              <ChevronRight size={12} className="text-stone-200" />
              <MapPin size={10} className="text-stone-300" />
              {inquiry.destination}
            </span>
          )}
        </div>
      </div>

      {/* Scrollable body */}
      <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(100vh-320px)]">
        {/* Contact grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <DetailField icon={Mail} label="Email">
            <a href={`mailto:${inquiry.email}`}
              className="text-sm text-amber-600 hover:text-amber-700 font-semibold break-all leading-snug flex items-center gap-1 group/link">
              {inquiry.email}
              <ArrowUpRight size={11} className="opacity-0 group-hover/link:opacity-100 transition-opacity" />
            </a>
          </DetailField>

          <DetailField icon={Phone} label="Phone">
            <p className="text-sm text-stone-700 font-semibold">{inquiry.phone || <span className="text-stone-300">—</span>}</p>
          </DetailField>

          {inquiry.numberOfTravelers && (
            <DetailField icon={Users} label="Travelers">
              <p className="text-sm text-stone-700 font-semibold">{inquiry.numberOfTravelers} {inquiry.numberOfTravelers === 1 ? "person" : "people"}</p>
            </DetailField>
          )}

          {inquiry.travelDate && (
            <DetailField icon={Calendar} label="Travel Date">
              <p className="text-sm text-stone-700 font-semibold">{inquiry.travelDate}</p>
            </DetailField>
          )}
        </div>

        {/* Package reference */}
        {inquiry.packageTitle && (
          <DetailField icon={Package} label="Interested Package" accent>
            <p className="text-sm text-stone-800 font-bold">{inquiry.packageTitle}</p>
          </DetailField>
        )}

        {/* Message */}
        <div>
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.15em] mb-2.5 px-0.5">Message</p>
          <div className="bg-stone-50 rounded-2xl p-4 border-l-2 border-stone-200">
            <p className="text-sm text-stone-600 leading-relaxed">{inquiry.message}</p>
          </div>
        </div>

        {/* Admin notes */}
        <div>
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.15em] mb-2.5 px-0.5 flex items-center gap-1.5">
            <CornerDownRight size={10} /> Internal Notes
          </p>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Private notes — not visible to the guest…"
            className="w-full text-sm text-stone-700 bg-stone-50 border border-stone-200 rounded-2xl p-4 focus:outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-100 resize-none transition-all placeholder-stone-300"
          />
          <button onClick={handleSaveNotes} disabled={saving}
            className="mt-1.5 text-[11px] text-amber-600 hover:text-amber-700 font-bold disabled:opacity-40 flex items-center gap-1 transition-colors px-1">
            {saving ? "Saving…" : <><CheckCircle2 size={11} /> Save notes</>}
          </button>
        </div>

        {/* Status update */}
        <div>
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.15em] mb-2.5 px-0.5">Update Status</p>
          <div className="grid grid-cols-3 gap-2">
            {["new", "contacted", "resolved"].map((s) => {
              const cfg = STATUS[s];
              const isActive = inquiry.status === s;
              return (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  disabled={saving}
                  className={`py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wide transition-all border ${
                    isActive
                      ? `${cfg.bg} ${cfg.text} ${cfg.border} shadow-sm`
                      : "bg-white text-stone-400 border-stone-200 hover:border-stone-300 hover:text-stone-600"
                  }`}
                >
                  {isActive && <span className={`inline-block w-1.5 h-1.5 rounded-full ${cfg.dot} mr-1.5 mb-px`} />}
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Reply CTA */}
        <a
          href={`mailto:${inquiry.email}?subject=${encodeURIComponent(replySubject)}`}
          className="flex items-center justify-center gap-2.5 w-full py-3.5 bg-stone-900 hover:bg-amber-500 text-white rounded-2xl font-bold text-sm transition-all duration-200 shadow-lg shadow-stone-900/20 group/reply"
        >
          <Mail size={15} className="group-hover/reply:scale-110 transition-transform" />
          Reply via Email
          <ArrowUpRight size={13} className="opacity-50" />
        </a>
      </div>
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────
const FILTERS = ["all", "new", "contacted", "resolved"];

const InquiriesPage = () => {
  const { inquiries, stats, loading, error, updateInquiry, deleteInquiry, refetch } = useInquiries();
  const [filter,   setFilter]   = useState("all");
  const [selected, setSelected] = useState(null);
  const [search,   setSearch]   = useState("");

  const filtered = useMemo(() => {
    let list = filter === "all" ? inquiries : inquiries.filter((i) => i.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((i) =>
        i.name?.toLowerCase().includes(q) ||
        i.email?.toLowerCase().includes(q) ||
        i.destination?.toLowerCase().includes(q) ||
        i.packageTitle?.toLowerCase().includes(q) ||
        i.message?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [inquiries, filter, search]);

  const handleStatusChange = async (id, updates) => {
    const updated = await updateInquiry(id, updates);
    if (updated && selected?._id === id) {
      setSelected((prev) => ({ ...prev, ...updated }));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this inquiry permanently?")) return;
    await deleteInquiry(id);
    if (selected?._id === id) setSelected(null);
  };

  return (
    <div className="space-y-6 pb-10">
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-light text-stone-800" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Inquiry Submissions
          </h2>
          <p className="text-xs text-stone-400 font-medium uppercase tracking-[0.2em] mt-1">
            Manage &amp; Respond to Safari Inquiries
          </p>
        </div>
        <button
          onClick={() => refetch(filter)}
          className="flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold text-stone-500 hover:text-stone-800 border border-stone-200 hover:border-stone-300 rounded-xl transition-colors self-start sm:self-auto"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* ── Stat cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total" value={stats.total}     accent="text-stone-800" active={filter === "all"}       onClick={() => { setFilter("all");       refetch("all");       }} />
        <StatCard label="New"   value={stats.new}       accent="text-amber-600" active={filter === "new"}       onClick={() => { setFilter("new");       refetch("new");       }} sublabel="Awaiting contact" />
        <StatCard label="Contacted" value={stats.contacted} accent="text-sky-600" active={filter === "contacted"} onClick={() => { setFilter("contacted"); refetch("contacted"); }} />
        <StatCard label="Resolved"  value={stats.resolved}  accent="text-emerald-600" active={filter === "resolved"}  onClick={() => { setFilter("resolved");  refetch("resolved");  }} />
      </div>

      {error && (
        <div className="flex items-center gap-3 px-4 py-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" /> {error}
        </div>
      )}

      {/* ── Search + filter row ──────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, destination…"
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-stone-700 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-300/40 focus:border-amber-300 transition-all"
          />
          {search && (
            <button onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-300 hover:text-stone-500 transition-colors">
              <X size={13} />
            </button>
          )}
        </div>

        {/* Status pill filters */}
        <div className="flex gap-1.5 flex-wrap">
          {FILTERS.map((f) => {
            const count = f === "all" ? stats.total : (stats[f] ?? 0);
            const cfg   = f !== "all" ? STATUS[f] : null;
            return (
              <button
                key={f}
                onClick={() => { setFilter(f); refetch(f); }}
                className={`px-3.5 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wide transition-all border flex items-center gap-1.5 ${
                  filter === f
                    ? "bg-stone-900 text-white border-stone-900 shadow-md"
                    : "bg-white text-stone-500 border-stone-200 hover:border-stone-300 hover:text-stone-700"
                }`}
              >
                {cfg && filter === f && <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />}
                {f}
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  filter === f ? "bg-white/10 text-white/70" : "bg-stone-100 text-stone-400"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Split view ───────────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-5 gap-4 items-start">
        {/* List column */}
        <div className="lg:col-span-2 space-y-2">
          {/* Result count */}
          {!loading && (
            <p className="text-[11px] text-stone-400 font-medium px-1 pb-1">
              {filtered.length === 0
                ? "No results"
                : `${filtered.length} inquir${filtered.length === 1 ? "y" : "ies"}`}
              {search && <span className="text-amber-500"> matching "{search}"</span>}
            </p>
          )}

          {loading ? <Skeleton /> : filtered.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-stone-100 border-dashed">
              <MessageSquare size={28} className="mx-auto mb-3 text-stone-200" />
              <p className="text-stone-400 text-sm font-medium">No inquiries found</p>
              {search && <button onClick={() => setSearch("")}
                className="mt-2 text-xs text-amber-600 font-bold hover:underline">Clear search</button>}
            </div>
          ) : (
            filtered.map((inq) => (
              <InquiryCard
                key={inq._id}
                inq={inq}
                selected={selected}
                onClick={() => setSelected(inq)}
              />
            ))
          )}
        </div>

        {/* Detail column */}
        <div className="lg:col-span-3">
          <InquiryDetail
            inquiry={selected}
            onClose={() => setSelected(null)}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
};

export default InquiriesPage;