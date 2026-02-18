import { useState } from "react";
import { Mail, Phone, Globe, Users, Calendar, X, Trash2, RefreshCw, MessageSquare } from "lucide-react";
import { useInquiries } from "../../hooks/useInquiry";

// ─── Status badge ─────────────────────────────────────────────────────────────
const STATUS_MAP = {
  new:       { label: "New",       bg: "bg-amber-100",   text: "text-amber-700",   dot: "bg-amber-500"   },
  contacted: { label: "Contacted", bg: "bg-blue-100",    text: "text-blue-700",    dot: "bg-blue-500"    },
  resolved:  { label: "Resolved",  bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_MAP[status] ?? STATUS_MAP.new;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
};

// ─── Info field ───────────────────────────────────────────────────────────────
const Field = ({ icon: Icon, label, children }) => (
  <div className="bg-stone-50 rounded-xl p-3">
    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1 flex items-center gap-1">
      <Icon size={10} /> {label}
    </p>
    {children}
  </div>
);

// ─── Inquiry list item ────────────────────────────────────────────────────────
const InquiryList = ({ inquiries, selected, onSelect, loading }) => {
  if (loading) return (
    <div className="space-y-3">
      {[1,2,3].map((n) => (
        <div key={n} className="bg-white rounded-2xl border border-stone-100 p-4 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
          <div className="h-3 bg-gray-100 rounded w-3/4" />
        </div>
      ))}
    </div>
  );

  if (inquiries.length === 0) return (
    <div className="text-center py-12 text-stone-400 text-sm bg-white rounded-2xl border border-stone-100">
      <MessageSquare size={28} className="mx-auto mb-2 opacity-30" />
      No inquiries with this status.
    </div>
  );

  return (
    <div className="space-y-2">
      {inquiries.map((inq) => (
        <button
          key={inq._id}
          onClick={() => onSelect(inq)}
          className={`w-full text-left p-4 rounded-2xl border transition-all ${
            selected?._id === inq._id
              ? "border-amber-400 bg-amber-50 shadow-md"
              : "border-stone-100 bg-white hover:border-stone-200 shadow-sm"
          }`}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <p className="font-bold text-stone-800 text-sm">{inq.name}</p>
            <StatusBadge status={inq.status} />
          </div>
          {inq.destination && (
            <p className="text-xs text-stone-500 flex items-center gap-1 mb-1">
              <Globe size={10} /> {inq.destination}
            </p>
          )}
          {inq.packageTitle && (
            <p className="text-xs text-amber-600 mb-1">📦 {inq.packageTitle}</p>
          )}
          <p className="text-xs text-stone-400 line-clamp-1">{inq.message}</p>
          <p className="text-[10px] text-stone-300 mt-2">
            {new Date(inq.createdAt).toLocaleDateString("en-GB", {
              day: "numeric", month: "short", year: "numeric",
            })}
          </p>
        </button>
      ))}
    </div>
  );
};

// ─── Inquiry detail panel ─────────────────────────────────────────────────────
const InquiryDetail = ({ inquiry, onClose, onStatusChange, onDelete }) => {
  const [notes, setNotes] = useState(inquiry?.adminNotes ?? "");
  const [saving, setSaving] = useState(false);

  if (!inquiry) return (
    <div className="h-64 bg-white rounded-2xl border border-stone-100 shadow-sm flex items-center justify-center text-center p-8">
      <div>
        <Mail size={32} className="text-stone-300 mx-auto mb-3" />
        <p className="text-stone-400 font-medium text-sm">Select an inquiry to view details</p>
      </div>
    </div>
  );

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

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden sticky top-4">
      {/* Header */}
      <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center font-bold text-amber-700 text-lg shrink-0">
            {inquiry.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-stone-800 text-sm">{inquiry.name}</p>
            <StatusBadge status={inquiry.status} />
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onDelete(inquiry._id)}
            className="p-2 text-stone-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete inquiry"
          >
            <Trash2 size={14} />
          </button>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-50 transition-colors"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
        {/* Contact fields */}
        <div className="grid grid-cols-2 gap-3">
          <Field icon={Mail} label="Email">
            <a href={`mailto:${inquiry.email}`} className="text-sm text-amber-600 hover:underline font-medium break-all">
              {inquiry.email}
            </a>
          </Field>
          <Field icon={Phone} label="Phone">
            <p className="text-sm text-stone-700 font-medium">{inquiry.phone || "—"}</p>
          </Field>
          {inquiry.destination && (
            <Field icon={Globe} label="Destination">
              <p className="text-sm text-stone-700 font-medium capitalize">{inquiry.destination}</p>
            </Field>
          )}
          {inquiry.numberOfTravelers && (
            <Field icon={Users} label="Travelers">
              <p className="text-sm text-stone-700 font-medium">{inquiry.numberOfTravelers} people</p>
            </Field>
          )}
        </div>

        {inquiry.travelDate && (
          <Field icon={Calendar} label="Travel Date">
            <p className="text-sm text-stone-700 font-medium">{inquiry.travelDate}</p>
          </Field>
        )}

        {/* Package reference */}
        {inquiry.packageTitle && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">Package Inquiry</p>
            <p className="text-sm text-stone-700 font-medium">{inquiry.packageTitle}</p>
          </div>
        )}

        {/* Message */}
        <div className="bg-stone-50 rounded-xl p-3">
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">Message</p>
          <p className="text-sm text-stone-600 leading-relaxed">{inquiry.message}</p>
        </div>

        {/* Admin notes */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Internal Notes</p>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add private notes about this inquiry…"
            className="w-full text-sm text-stone-700 bg-stone-50 border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-amber-400 resize-none transition-colors"
          />
          <button
            onClick={handleSaveNotes}
            disabled={saving}
            className="text-xs text-amber-600 hover:text-amber-700 font-semibold disabled:opacity-40"
          >
            {saving ? "Saving…" : "Save notes"}
          </button>
        </div>

        {/* Status actions */}
        <div>
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">Update Status</p>
          <div className="flex gap-2">
            {["new", "contacted", "resolved"].map((s) => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                disabled={saving}
                className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all border ${
                  inquiry.status === s
                    ? "bg-stone-900 text-white border-stone-900"
                    : "bg-white text-stone-500 border-stone-200 hover:border-stone-400"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Reply CTA */}
        <a
          href={`mailto:${inquiry.email}?subject=Re: Your Safari Inquiry${inquiry.destination ? ` – ${inquiry.destination}` : ""}`}
          className="flex items-center justify-center gap-2 w-full py-3 bg-amber-500 hover:bg-amber-400 text-white rounded-xl font-bold text-sm transition-colors"
        >
          <Mail size={15} /> Reply by Email
        </a>
      </div>
    </div>
  );
};

// ─── Stats bar ────────────────────────────────────────────────────────────────
const StatsBar = ({ stats }) => (
  <div className="grid grid-cols-4 gap-3 mb-6">
    {[
      { label: "Total",     value: stats.total,     color: "text-stone-800" },
      { label: "New",       value: stats.new,        color: "text-amber-600" },
      { label: "Contacted", value: stats.contacted,  color: "text-blue-600"  },
      { label: "Resolved",  value: stats.resolved,   color: "text-emerald-600" },
    ].map(({ label, value, color }) => (
      <div key={label} className="bg-white rounded-2xl border border-stone-100 shadow-sm px-4 py-3 text-center">
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
        <p className="text-xs text-stone-400 font-medium mt-0.5">{label}</p>
      </div>
    ))}
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────
const FILTERS = ["all", "new", "contacted", "resolved"];

const InquiriesPage = () => {
  const { inquiries, stats, loading, error, updateInquiry, deleteInquiry, refetch } = useInquiries();
  const [filter,   setFilter]   = useState("all");
  const [selected, setSelected] = useState(null);

  const filtered = filter === "all"
    ? inquiries
    : inquiries.filter((i) => i.status === filter);

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
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-stone-800" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Inquiry Submissions
          </h2>
          <p className="text-sm text-stone-500">Manage and respond to customer safari inquiries</p>
        </div>
        <button
          onClick={() => refetch(filter)}
          className="flex items-center gap-2 px-3 py-2 text-xs text-stone-500 hover:text-stone-800 border border-stone-200 rounded-xl transition-colors"
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <StatsBar stats={stats} />

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {FILTERS.map((f) => {
          const count = f === "all" ? stats.total : stats[f] ?? 0;
          return (
            <button
              key={f}
              onClick={() => { setFilter(f); refetch(f); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all ${
                filter === f
                  ? "bg-stone-900 text-white shadow"
                  : "bg-white text-stone-500 border border-stone-200 hover:border-stone-300"
              }`}
            >
              {f} <span className="ml-1 opacity-60">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Split view */}
      <div className="grid lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2">
          <InquiryList
            inquiries={filtered}
            selected={selected}
            onSelect={setSelected}
            loading={loading}
          />
        </div>
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