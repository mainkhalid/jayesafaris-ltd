import React, { useState } from "react";
import { useAdminData } from "../../context/AdminDataContext";
import {
  Sparkles, Search, MessageSquare,
  MapPin, Calendar, Clock, Banknote,
  Trash2, Mail, Phone,
  CheckCircle, ChevronRight, Users,
} from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (d) =>
  d ? new Date(d).toLocaleDateString(undefined, { dateStyle: "medium" }) : "—";

const fmtTravelDate = (d) => {
  if (!d) return "Flexible";
  // ISO date string (YYYY-MM-DD) — parse without timezone shift
  const [y, m, day] = d.split("-");
  if (y && m && day) {
    return new Date(Number(y), Number(m) - 1, Number(day)).toLocaleDateString(undefined, {
      dateStyle: "medium",
    });
  }
  return d;
};

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_STYLES = {
  new:       { bg: "bg-amber-100",   text: "text-amber-800"  },
  contacted: { bg: "bg-blue-100",    text: "text-blue-800"   },
  quoted:    { bg: "bg-emerald-100", text: "text-emerald-800"},
  resolved:  { bg: "bg-stone-100",   text: "text-stone-600"  },
};

const StatusBadge = ({ status, inverted }) => {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.new;
  if (inverted) {
    // On the dark selected card, use a simpler amber pill
    return (
      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tight bg-amber-500 text-white">
        {status}
      </span>
    );
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tight ${s.bg} ${s.text}`}>
      {status}
    </span>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
const CustomQuotesPage = () => {
  const {
    customQuotes, customQuoteStats, customQuotesLoading,
    updateCustomQuote, deleteCustomQuote,
  } = useAdminData();

  const [searchTerm,    setSearchTerm]    = useState("");
  const [selectedQuote, setSelectedQuote] = useState(null);

  const filteredQuotes = (customQuotes || []).filter(
    (q) =>
      q.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.destinations?.join(" ").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusUpdate = async (id, status) => {
    const updated = await updateCustomQuote(id, { status });
    // Refresh selected quote so the header buttons stay in sync
    if (updated && selectedQuote?._id === id) {
      setSelectedQuote((prev) => ({ ...prev, status }));
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to archive (delete) this quote request? This cannot be undone."
      )
    )
      return;
    await deleteCustomQuote(id);
    if (selectedQuote?._id === id) setSelectedQuote(null);
  };

  const totalTravelers = (q) =>
    (q.numberOfTravelers?.adults  || 0) +
    (q.numberOfTravelers?.kids    || 0) +
    (q.numberOfTravelers?.infants || 0);

  return (
    <div className="space-y-8 pb-20">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-end justify-between">
        <div>
          <h2
            className="text-4xl font-light text-stone-800"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Luxury Custom Inquiries
          </h2>
          <p className="text-xs text-stone-400 font-bold uppercase tracking-[0.3em] mt-1">
            Bespoke Safari Requests
          </p>
        </div>

        <div className="flex gap-3">
          {[
            { label: "New",       value: customQuoteStats?.new       || 0, color: "bg-amber-500"   },
            { label: "Quoted",    value: customQuoteStats?.quoted    || 0, color: "bg-emerald-600" },
            { label: "Resolved",  value: customQuoteStats?.resolved  || 0, color: "bg-stone-700"   },
          ].map(({ label, value, color }) => (
            <div key={label} className={`${color} rounded-2xl p-4 text-white shadow-lg`}>
              <p className="text-[10px] font-bold uppercase opacity-80">{label}</p>
              <p className="text-2xl font-bold">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-8 items-start">
        {/* ── List column ───────────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300"
              size={18}
            />
            <input
              type="text"
              placeholder="Filter by name, email, destination…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-stone-100 rounded-[1.5rem] shadow-sm focus:ring-2 focus:ring-amber-400/20 outline-none transition-all text-sm"
            />
          </div>

          {/* Loading */}
          {customQuotesLoading && (
            <div className="flex items-center justify-center gap-3 py-10 text-stone-400 animate-pulse">
              <div className="w-4 h-4 rounded-full bg-amber-400" />
              <span className="text-sm font-bold uppercase tracking-widest">Loading…</span>
            </div>
          )}

          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
            {filteredQuotes.map((q) => {
              const isSelected = selectedQuote?._id === q._id;
              return (
                <div
                  key={q._id}
                  onClick={() => setSelectedQuote(isSelected ? null : q)}
                  className={`p-5 rounded-[2rem] border transition-all cursor-pointer relative overflow-hidden group ${
                    isSelected
                      ? "bg-stone-900 border-stone-900 text-white shadow-xl shadow-stone-200"
                      : "bg-white border-stone-100 hover:border-amber-200 hover:shadow-md"
                  }`}
                >
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-2">
                      <StatusBadge status={q.status} inverted={isSelected} />
                      <span
                        className={`text-[10px] font-medium ${
                          isSelected ? "text-stone-500" : "text-stone-300"
                        }`}
                      >
                        {fmt(q.createdAt)}
                      </span>
                    </div>
                    <h4 className="font-bold text-base mb-1">{q.name}</h4>
                    <p
                      className={`text-xs truncate ${
                        isSelected ? "text-stone-400" : "text-stone-400"
                      }`}
                    >
                      {q.destinations?.join(", ") || "No destinations selected"}
                    </p>
                  </div>
                  {!isSelected && (
                    <div className="absolute top-1/2 -right-2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all mr-4">
                      <ChevronRight size={18} className="text-amber-500" />
                    </div>
                  )}
                </div>
              );
            })}

            {!customQuotesLoading && filteredQuotes.length === 0 && (
              <div className="text-center py-10 text-stone-400 text-sm italic">
                No requests found.
              </div>
            )}
          </div>
        </div>

        {/* ── Detail column ─────────────────────────────────────────────────── */}
        <div className="lg:col-span-3">
          {selectedQuote ? (
            <div className="bg-white rounded-[3rem] border border-stone-100 shadow-sm overflow-hidden sticky top-24">
              {/* Detail header */}
              <div className="p-8 bg-stone-50/50 border-b border-stone-100 flex flex-wrap justify-between items-start gap-4">
                <div>
                  <h3
                    className="text-2xl font-bold text-stone-800"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {selectedQuote.name}
                  </h3>
                  <div className="flex flex-wrap gap-4 mt-2">
                    <a
                      href={`mailto:${selectedQuote.email}`}
                      className="flex items-center gap-1.5 text-xs text-amber-600 font-bold hover:underline underline-offset-4"
                    >
                      <Mail size={12} /> {selectedQuote.email}
                    </a>
                    {selectedQuote.phone && (
                      <a
                        href={`tel:${selectedQuote.phone}`}
                        className="flex items-center gap-1.5 text-xs text-stone-400 font-bold hover:text-stone-900 transition-colors"
                      >
                        <Phone size={12} /> {selectedQuote.phone}
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {selectedQuote.status !== "contacted" && (
                    <button
                      onClick={() => handleStatusUpdate(selectedQuote._id, "contacted")}
                      className="px-4 py-2 bg-white border border-stone-100 rounded-xl text-[10px] font-bold uppercase tracking-widest text-stone-500 hover:bg-stone-50 transition-all"
                    >
                      Contacted
                    </button>
                  )}
                  {selectedQuote.status !== "quoted" && (
                    <button
                      onClick={() => handleStatusUpdate(selectedQuote._id, "quoted")}
                      className="px-4 py-2 bg-amber-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-amber-600 transition-all shadow-md shadow-amber-200"
                    >
                      Mark Quoted
                    </button>
                  )}
                  {selectedQuote.status !== "resolved" && (
                    <button
                      onClick={() => handleStatusUpdate(selectedQuote._id, "resolved")}
                      className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-600 transition-all"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>

              {/* Detail content */}
              <div className="p-8 grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  {/* Destinations */}
                  <div>
                    <p className="text-[10px] font-bold text-stone-300 uppercase tracking-widest mb-3">
                      Target Destinations
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedQuote.destinations?.length ? (
                        selectedQuote.destinations.map((d) => (
                          <span
                            key={d}
                            className="px-3 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm"
                          >
                            <MapPin size={10} className="text-amber-500" /> {d}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-stone-300 italic">None selected</span>
                      )}
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100">
                      <p className="text-[9px] font-bold text-stone-400 uppercase tracking-tighter mb-1">
                        Timeframe
                      </p>
                      <div className="flex items-center gap-2 text-stone-800">
                        <Calendar size={14} className="text-amber-500 shrink-0" />
                        <span className="text-sm font-bold">
                          {fmtTravelDate(selectedQuote.travelDate)}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100">
                      <p className="text-[9px] font-bold text-stone-400 uppercase tracking-tighter mb-1">
                        Duration
                      </p>
                      <div className="flex items-center gap-2 text-stone-800">
                        <Clock size={14} className="text-amber-500 shrink-0" />
                        <span className="text-sm font-bold">
                          {selectedQuote.duration || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Budget */}
                  <div>
                    <p className="text-[10px] font-bold text-stone-300 uppercase tracking-widest mb-2">
                      Investment Level
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
                      <Banknote size={16} />
                      <span className="text-sm font-bold capitalize">
                        {selectedQuote.budgetPerPerson
                          ? `${selectedQuote.budgetPerPerson} Range`
                          : "Not specified"}
                      </span>
                    </div>
                  </div>

                  {/* Interests */}
                  {selectedQuote.interests?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-stone-300 uppercase tracking-widest mb-2">
                        Interests
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedQuote.interests.map((i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-100 rounded-lg text-[10px] font-bold capitalize"
                          >
                            {i.replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right column: message + travelers */}
                <div className="space-y-6">
                  <div className="bg-stone-50 rounded-[2rem] p-6 border border-dashed border-stone-200">
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <MessageSquare size={14} /> Client Vision
                    </p>
                    <p className="text-sm text-stone-600 leading-relaxed italic">
                      "
                      {selectedQuote.message?.trim() ||
                        "No additional notes provided."}
                      "
                    </p>

                    <div className="mt-6 pt-5 border-t border-stone-200">
                      <p className="text-[10px] font-bold text-stone-300 uppercase tracking-widest mb-3">
                        Travel Group
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm font-bold text-stone-700">
                        <div className="flex items-center gap-1.5">
                          <Users size={14} className="text-stone-400" />
                          {selectedQuote.numberOfTravelers?.adults ?? 1} Adult
                          {(selectedQuote.numberOfTravelers?.adults ?? 1) !== 1 ? "s" : ""}
                        </div>
                        {(selectedQuote.numberOfTravelers?.kids || 0) > 0 && (
                          <div className="text-stone-400 font-medium">
                            {selectedQuote.numberOfTravelers.kids} Kid
                            {selectedQuote.numberOfTravelers.kids !== 1 ? "s" : ""}
                          </div>
                        )}
                        {(selectedQuote.numberOfTravelers?.infants || 0) > 0 && (
                          <div className="text-stone-400 font-medium">
                            {selectedQuote.numberOfTravelers.infants} Infant
                            {selectedQuote.numberOfTravelers.infants !== 1 ? "s" : ""}
                          </div>
                        )}
                      </div>
                      {selectedQuote.travelingWith?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {selectedQuote.travelingWith.map((t) => (
                            <span
                              key={t}
                              className="px-2 py-0.5 bg-stone-100 text-stone-600 rounded-lg text-[10px] font-bold capitalize"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Country + source */}
                  {(selectedQuote.countryOfResidence || selectedQuote.source) && (
                    <div className="space-y-2">
                      {selectedQuote.countryOfResidence && (
                        <div className="flex items-center gap-2 text-xs text-stone-400">
                          <MapPin size={12} className="text-stone-300" />
                          <span>
                            Based in{" "}
                            <span className="font-semibold text-stone-600">
                              {selectedQuote.countryOfResidence}
                            </span>
                          </span>
                        </div>
                      )}
                      {selectedQuote.source && (
                        <div className="text-[10px] text-stone-300">
                          Source: {selectedQuote.source}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="px-8 py-4 bg-stone-900 border-t border-stone-800 flex justify-between items-center">
                <span className="text-white/30 text-[10px] font-bold uppercase tracking-widest truncate">
                  Ref: {selectedQuote._id}
                </span>
                <button
                  onClick={() => handleDelete(selectedQuote._id)}
                  className="text-rose-500 hover:text-rose-400 transition-colors flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest shrink-0"
                >
                  <Trash2 size={12} /> Archive Request
                </button>
              </div>
            </div>
          ) : (
            <div className="h-[60vh] flex flex-col items-center justify-center bg-stone-50 rounded-[3rem] border-2 border-dashed border-stone-200 p-10 text-center">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-stone-300 mb-4 animate-bounce">
                <Sparkles size={32} />
              </div>
              <h3 className="text-xl font-bold text-stone-400">
                Select a request to view details
              </h3>
              <p className="text-sm text-stone-300 mt-2 max-w-xs">
                Each request represents a unique safari opportunity waiting for a perfect proposal.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomQuotesPage;