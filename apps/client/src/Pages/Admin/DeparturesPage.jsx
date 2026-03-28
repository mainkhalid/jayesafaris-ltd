import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  CalendarDays, Plus, X, AlertCircle,
  CheckCircle, XCircle, Pencil, Trash2,
} from "lucide-react";
import { useAdminData } from "../../context/AdminDataContext";

const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

// ── Status badge ──────────────────────────────────────────────────────────────
const STATUS_STYLES = {
  open:      { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500", label: "Open"      },
  full:      { bg: "bg-orange-100",  text: "text-orange-700",  dot: "bg-orange-500",  label: "Full"      },
  closed:    { bg: "bg-stone-100",   text: "text-stone-600",   dot: "bg-stone-400",   label: "Closed"    },
  cancelled: { bg: "bg-rose-100",    text: "text-rose-700",    dot: "bg-rose-500",    label: "Cancelled" },
  completed: { bg: "bg-blue-100",    text: "text-blue-700",    dot: "bg-blue-500",    label: "Completed" },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.open;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
};

// ── Slot bar ──────────────────────────────────────────────────────────────────
const SlotBar = ({ booked, total }) => {
  const pct   = total > 0 ? Math.min((booked / total) * 100, 100) : 0;
  const color = pct >= 100 ? "bg-orange-500" : pct >= 75 ? "bg-amber-500" : "bg-emerald-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] font-bold text-stone-500 whitespace-nowrap">{booked}/{total}</span>
    </div>
  );
};

// ── Create / Edit modal (rendered via React portal) ───────────────────────────
const COUNTRIES = ["kenya", "tanzania", "zanzibar", "uganda"];

const DepartureModal = ({ departure, onClose, onSave }) => {
  const isEdit = !!departure;

  const [packages,    setPackages]    = useState([]);
  const [pkgLoading,  setPkgLoading]  = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState(null);

  const [form, setForm] = useState({
    packageId:     departure?.packageId?._id || departure?.packageId || "",
    packageTitle:  departure?.packageTitle   || "",
    country:       departure?.country        || "kenya",
    departureDate: departure?.departureDate  ? departure.departureDate.slice(0, 10) : "",
    endDate:       departure?.endDate        ? departure.endDate.slice(0, 10)       : "",
    totalSlots:    departure?.totalSlots     ?? 12,
    priceOverride: departure?.priceOverride  || "",
    adminNotes:    departure?.adminNotes     || "",
    status:        departure?.status         || "open",
  });

  // Load packages for the selected country on mount (create flow)
  const loadPackages = useCallback(async (country) => {
    setPkgLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/packages?country=${country}`);
      const json = await res.json();
      setPackages(json.data || []);
    } catch {
      setPackages([]);
    } finally {
      setPkgLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isEdit) loadPackages(form.country);
    // For edit we don't need the list (package is locked)
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCountryChange = (e) => {
    const country = e.target.value;
    setForm((p) => ({ ...p, country, packageId: "", packageTitle: "" }));
    loadPackages(country);
  };

  const handlePackageChange = (e) => {
    const id  = e.target.value;
    const pkg = packages.find((p) => p._id === id);
    setForm((p) => ({ ...p, packageId: id, packageTitle: pkg?.title || "" }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async () => {
    setError(null);
    if (!form.packageId || !form.departureDate || !form.endDate || !form.totalSlots) {
      setError("Package, departure date, end date and total slots are required.");
      return;
    }
    if (new Date(form.departureDate) >= new Date(form.endDate)) {
      setError("End date must be after the departure date.");
      return;
    }
    setSaving(true);
    const result = await onSave(form);
    setSaving(false);
    if (result) onClose();
    else setError("Failed to save departure. Please try again.");
  };

  // Close on backdrop click
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const inputCls = "w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-400/40 text-sm";
  const labelCls = "block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2";

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={handleBackdrop}
    >
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        {/* Modal header */}
        <div className="bg-stone-900 px-8 py-6 flex items-center justify-between shrink-0">
          <div>
            <h3
              className="text-white font-bold text-lg"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              {isEdit ? "Edit Departure" : "Schedule New Departure"}
            </h3>
            <p className="text-stone-400 text-xs mt-0.5 uppercase tracking-widest">
              Tour scheduling
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-stone-500 hover:text-white transition-colors p-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="p-8 space-y-5 overflow-y-auto">
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-sm">
              <AlertCircle size={15} className="shrink-0" /> {error}
            </div>
          )}

          {/* Country */}
          <div>
            <label className={labelCls}>Country</label>
            <select
              name="country"
              value={form.country}
              onChange={handleCountryChange}
              className={inputCls}
              disabled={isEdit}
            >
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Package */}
          <div>
            <label className={labelCls}>
              Package {pkgLoading && <span className="text-amber-500 normal-case font-normal ml-1">loading…</span>}
            </label>
            {isEdit ? (
              <input
                type="text"
                value={form.packageTitle}
                disabled
                className={`${inputCls} opacity-60 cursor-not-allowed`}
              />
            ) : (
              <select
                name="packageId"
                value={form.packageId}
                onChange={handlePackageChange}
                className={inputCls}
                disabled={pkgLoading}
              >
                <option value="">
                  {pkgLoading ? "Loading packages…" : "Select a package…"}
                </option>
                {packages.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.title}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Departure date</label>
              <input
                type="date"
                name="departureDate"
                value={form.departureDate}
                onChange={handleChange}
                min={new Date().toISOString().slice(0, 10)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>End date</label>
              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                min={form.departureDate || new Date().toISOString().slice(0, 10)}
                className={inputCls}
              />
            </div>
          </div>

          {/* Slots + price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Total slots</label>
              <input
                type="number"
                name="totalSlots"
                value={form.totalSlots}
                onChange={handleChange}
                min="1"
                max="100"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>
                Price override{" "}
                <span className="text-stone-300 normal-case font-normal">(optional)</span>
              </label>
              <input
                type="text"
                name="priceOverride"
                value={form.priceOverride}
                onChange={handleChange}
                placeholder="e.g. $2,800"
                className={inputCls}
              />
            </div>
          </div>

          {/* Status (edit only) */}
          {isEdit && (
            <div>
              <label className={labelCls}>Status</label>
              <select name="status" value={form.status} onChange={handleChange} className={inputCls}>
                <option value="open">Open</option>
                <option value="full">Full</option>
                <option value="closed">Closed</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          )}

          {/* Admin notes */}
          <div>
            <label className={labelCls}>
              Admin notes{" "}
              <span className="text-stone-300 normal-case font-normal">(internal)</span>
            </label>
            <textarea
              name="adminNotes"
              value={form.adminNotes}
              onChange={handleChange}
              rows={2}
              placeholder="Internal notes about this departure…"
              className={`${inputCls} resize-none`}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full bg-amber-500 hover:bg-stone-900 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-amber-200/50 disabled:opacity-50 text-sm"
          >
            {saving ? "Saving…" : isEdit ? "Update Departure" : "Schedule Departure"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
const STATUS_FILTERS = ["all", "open", "full", "closed", "cancelled", "completed"];

const fmt = (dateStr) =>
  dateStr
    ? new Date(dateStr).toLocaleDateString("en-GB", {
        day: "numeric", month: "short", year: "numeric",
      })
    : "—";

const DeparturesPage = () => {
  const {
    departures, departureStats, departuresLoading,
    createDeparture, updateDeparture, deleteDeparture,
  } = useAdminData();

  const [filter,     setFilter]     = useState("all");
  const [showModal,  setShowModal]  = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const safeDepartures = Array.isArray(departures) ? departures : [];
  const filtered =
    filter === "all"
      ? safeDepartures
      : safeDepartures.filter((d) => d.status === filter);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this departure? This cannot be undone.")) return;
    await deleteDeparture(id);
  };

  const handleSave = async (form) => {
    if (editTarget) return updateDeparture(editTarget._id, form);
    return createDeparture(form);
  };

  const openCreate = () => { setEditTarget(null); setShowModal(true); };
  const openEdit   = (dep) => { setEditTarget(dep); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditTarget(null); };

  return (
    <div className="space-y-6 pb-10">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2
            className="text-3xl font-light text-stone-800"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Tour Departures
          </h2>
          <p className="text-xs text-stone-400 font-medium uppercase tracking-[0.2em]">
            Schedule & manage tour dates
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {[
            { label: "Open",     value: departureStats?.open     || 0, color: "text-emerald-600" },
            { label: "Full",     value: departureStats?.full     || 0, color: "text-orange-600"  },
            { label: "Upcoming", value: departureStats?.upcoming || 0, color: "text-stone-800"   },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="bg-white px-4 py-2 rounded-xl border border-stone-100 shadow-sm text-center"
            >
              <p className={`text-lg font-bold leading-tight ${color}`}>{value}</p>
              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-tight">{label}</p>
            </div>
          ))}

          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-stone-900 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-amber-200"
          >
            <Plus size={16} /> New Departure
          </button>
        </div>
      </div>

      {/* ── Modal (portal) ─────────────────────────────────────────────────── */}
      {showModal && (
        <DepartureModal
          departure={editTarget}
          onClose={closeModal}
          onSave={handleSave}
        />
      )}

      {/* ── Filters ────────────────────────────────────────────────────────── */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all ${
              filter === f
                ? "bg-stone-900 text-white shadow"
                : "bg-white text-stone-500 border border-stone-200 hover:border-stone-300"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50/50 border-b border-stone-100">
                {["Package", "Dates", "Slots", "Price", "Status", "Actions"].map((h, i) => (
                  <th
                    key={h}
                    className={`px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest ${
                      i === 5 ? "text-right" : ""
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-stone-50">
              {departuresLoading && (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center">
                    <div className="flex items-center justify-center gap-3 text-stone-400 animate-pulse">
                      <div className="w-4 h-4 rounded-full bg-amber-400" />
                      <span className="text-sm font-bold uppercase tracking-widest">
                        Loading departures…
                      </span>
                    </div>
                  </td>
                </tr>
              )}

              {!departuresLoading && filtered.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-20 text-center text-stone-400 italic text-sm"
                  >
                    No departures found. Schedule your first one above.
                  </td>
                </tr>
              )}

              {!departuresLoading &&
                filtered.map((dep) => (
                  <tr
                    key={dep._id}
                    className="hover:bg-stone-50/30 transition-colors group"
                  >
                    {/* Package */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {dep.packageId?.thumbnail?.url ? (
                          <img
                            src={dep.packageId.thumbnail.url}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 font-bold text-xs shrink-0">
                            {dep.packageTitle?.[0]?.toUpperCase() ?? "?"}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-bold text-stone-800">{dep.packageTitle}</p>
                          <p className="text-[10px] text-stone-400 uppercase tracking-wider">
                            {dep.country}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Dates */}
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-stone-700">
                        {fmt(dep.departureDate)}
                      </p>
                      <p className="text-[10px] text-stone-400">to {fmt(dep.endDate)}</p>
                    </td>

                    {/* Slots */}
                    <td className="px-6 py-4 min-w-[130px]">
                      <SlotBar booked={dep.bookedSlots} total={dep.totalSlots} />
                    </td>

                    {/* Price */}
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-stone-700">
                        {dep.priceOverride || (
                          <span className="text-stone-300 text-xs">Package default</span>
                        )}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <StatusBadge status={dep.status} />
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div
                        className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {dep.status === "open" && (
                          <button
                            onClick={() => updateDeparture(dep._id, { status: "closed" })}
                            className="p-2 text-stone-400 hover:bg-stone-100 rounded-lg transition-colors"
                            title="Close departure"
                          >
                            <XCircle size={16} />
                          </button>
                        )}
                        {dep.status === "closed" && (
                          <button
                            onClick={() => updateDeparture(dep._id, { status: "open" })}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Re-open"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => openEdit(dep)}
                          className="p-2 text-stone-400 hover:bg-stone-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(dep._id)}
                          className="p-2 text-rose-400 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DeparturesPage;