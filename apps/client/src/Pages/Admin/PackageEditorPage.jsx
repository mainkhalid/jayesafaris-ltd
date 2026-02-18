import { useState, useRef } from "react";
import { useParams, Navigate } from "react-router-dom";
import {
  Save, Check, Plus, Trash2, X,
  Image, Package, DollarSign, Clock,
  ChevronDown, ChevronUp, Calendar, UploadCloud,
  ListChecks, ArrowLeft, Sunrise,
  Camera, FileText, AlertCircle, Loader2,
} from "lucide-react";
import { useAdminData } from "../../context/AdminDataContext";
import { usePackages }  from "../../hooks/usePackage";

const FLAGS = { kenya: "🇰🇪", tanzania: "🇹🇿", zanzibar: "🏝️", uganda: "🇺🇬" };

// ─── Primitives ───────────────────────────────────────────────────────────────
const inputCls =
  "w-full border border-stone-200 rounded-lg px-3.5 py-2.5 text-sm text-stone-800 " +
  "focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400 " +
  "bg-white placeholder:text-stone-300 transition-all";

const Label = ({ children, required }) => (
  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-[0.1em] mb-1.5">
    {children}{required && <span className="text-amber-500 ml-0.5">*</span>}
  </label>
);

const Field = ({ label, required, children, className = "" }) => (
  <div className={className}>
    <Label required={required}>{label}</Label>
    {children}
  </div>
);

const Spinner = ({ size = 16, className = "" }) => (
  <Loader2 size={size} className={`animate-spin ${className}`} />
);

const ErrorBanner = ({ message }) => (
  <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border-b border-red-100 text-xs text-red-600 font-medium">
    <AlertCircle size={13} className="shrink-0" />
    <span>{message}</span>
  </div>
);

// ─── Thumbnail Uploader ───────────────────────────────────────────────────────
// `value`    – { preview: string (blob URL or https URL), file: File|null }
// `onChange` – receives the same shape
const ThumbnailUploader = ({ value, onChange }) => {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const processFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    // Create a local blob URL just for preview — the raw File goes to FormData
    const preview = URL.createObjectURL(file);
    onChange({ preview, file });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    processFile(e.dataTransfer.files[0]);
  };

  const preview = value?.preview ?? "";

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative cursor-pointer rounded-xl border-2 transition-all group overflow-hidden
          ${dragging ? "border-amber-400 bg-amber-50" : preview ? "border-transparent" : "border-dashed border-stone-200 hover:border-amber-300 bg-stone-50 hover:bg-amber-50/40"}`}
        style={{ height: preview ? 180 : 110 }}
      >
        {preview ? (
          <>
            <img src={preview} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
              <UploadCloud size={20} className="text-white" />
              <span className="text-white text-xs font-semibold">Replace image</span>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange({ preview: "", file: null }); }}
              className="absolute top-2 right-2 w-6 h-6 bg-black/50 hover:bg-red-500 rounded-full flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
            >
              <X size={12} className="text-white" />
            </button>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-1.5 text-stone-400">
            <div className="w-10 h-10 rounded-full bg-stone-100 group-hover:bg-amber-100 flex items-center justify-center transition-colors">
              <Camera size={18} className="group-hover:text-amber-500 transition-colors" />
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-stone-500">Drop image or click to upload</p>
              <p className="text-[10px] text-stone-300 mt-0.5">PNG, JPG, WEBP · Recommended 1200×800</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 h-px bg-stone-100" />
        <span className="text-[10px] text-stone-300 font-medium">or paste URL</span>
        <div className="flex-1 h-px bg-stone-100" />
      </div>

      <div className="relative">
        <Image size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-300 pointer-events-none" />
        <input
          className={`${inputCls} pl-8 font-mono text-[11px]`}
          value={preview?.startsWith("http") ? preview : ""}
          onChange={(e) => onChange({ preview: e.target.value, file: null })}
          placeholder="https://example.com/image.jpg"
        />
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => processFile(e.target.files?.[0])} />
    </div>
  );
};

// ─── Day Editor ───────────────────────────────────────────────────────────────
const DAY_ICONS = ["🌅", "🦁", "🐘", "🌿", "🏔️", "🌊", "🦒", "🌄"];

const DayCard = ({ day, index, onUpdate, onDelete, defaultOpen }) => {
  const [open, setOpen] = useState(defaultOpen);
  const icon = DAY_ICONS[index % DAY_ICONS.length];

  return (
    <div className={`rounded-xl border transition-all ${open ? "border-amber-200 shadow-sm" : "border-stone-100 hover:border-stone-200"}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-sm shrink-0 shadow-sm">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Day {day.dayNumber}</span>
          <p className="text-sm font-semibold text-stone-700 truncate leading-tight">
            {day.title || <span className="text-stone-300 font-normal">Untitled day…</span>}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="w-7 h-7 flex items-center justify-center text-stone-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={13} />
          </button>
          <div className="w-7 h-7 flex items-center justify-center text-stone-300">
            {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </div>
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-stone-50 pt-3">
          <Field label="Day Title">
            <div className="relative">
              <Sunrise size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-300 pointer-events-none" />
              <input
                className={`${inputCls} pl-8`}
                value={day.title}
                onChange={(e) => onUpdate("title", e.target.value)}
                placeholder="e.g. Nairobi to Amboseli – Wildlife & Kilimanjaro Views"
              />
            </div>
          </Field>
          <Field label="Description">
            <textarea
              rows={5}
              className={`${inputCls} resize-y leading-relaxed`}
              value={day.description}
              onChange={(e) => onUpdate("description", e.target.value)}
              placeholder="Describe the day's journey, activities, wildlife encounters, accommodation…"
            />
          </Field>
        </div>
      )}
    </div>
  );
};

const ItineraryEditor = ({ days, onChange }) => {
  const [latestId, setLatestId] = useState(null);

  const addDay = () => {
    const id = `day-${Date.now()}`;
    onChange([...days, { id, dayNumber: days.length + 1, title: "", description: "" }]);
    setLatestId(id);
  };

  const updateDay = (id, field, val) =>
    onChange(days.map((d) => (d.id === id ? { ...d, [field]: val } : d)));

  const deleteDay = (id) =>
    onChange(
      days.filter((d) => d.id !== id).map((d, i) => ({ ...d, dayNumber: i + 1 }))
    );

  return (
    <div className="space-y-2">
      {days.length === 0 && (
        <div className="text-center py-10 text-stone-300">
          <Calendar size={28} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm font-medium text-stone-400">No days yet</p>
          <p className="text-xs text-stone-300">Add the first day of the itinerary below</p>
        </div>
      )}
      {days.map((day, i) => (
        <DayCard
          key={day.id}
          day={day}
          index={i}
          defaultOpen={day.id === latestId}
          onUpdate={(field, val) => updateDay(day.id, field, val)}
          onDelete={() => deleteDay(day.id)}
        />
      ))}
      <button
        type="button"
        onClick={addDay}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-stone-200 text-stone-400 hover:border-amber-300 hover:text-amber-600 hover:bg-amber-50/50 transition-all text-sm font-semibold"
      >
        <Plus size={15} /> Add Day {days.length + 1}
      </button>
    </div>
  );
};

// ─── Inclusions Editor ────────────────────────────────────────────────────────
// Each inclusion stores: { id, description, image: { preview, file } }
// `image.preview` → shown in <img src>
// `image.file`    → raw File appended to FormData, or null if it's a URL
const InclusionItem = ({ item, onUpdate, onDelete }) => {
  const imgRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    onUpdate("image", { preview, file });
  };

  const preview = item.image?.preview ?? "";

  return (
    <div className="flex items-start gap-3 p-3 bg-white border border-stone-100 rounded-xl hover:border-stone-200 transition-colors group">
      <div
        onClick={() => imgRef.current?.click()}
        className="w-12 h-12 rounded-lg border-2 border-dashed border-stone-200 hover:border-amber-400 cursor-pointer shrink-0 overflow-hidden flex items-center justify-center bg-stone-50 hover:bg-amber-50 transition-all"
      >
        {preview ? (
          <img src={preview} alt="" className="w-full h-full object-cover" />
        ) : (
          <UploadCloud size={14} className="text-stone-300 hover:text-amber-400 transition-colors" />
        )}
      </div>
      <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

      <div className="flex-1 min-w-0">
        <input
          className="w-full text-sm text-stone-700 bg-transparent focus:outline-none placeholder:text-stone-300 py-0.5 border-b border-transparent focus:border-stone-200 transition-colors"
          value={item.description}
          onChange={(e) => onUpdate("description", e.target.value)}
          placeholder="e.g. Breakfast, Lunch & Dinner included"
        />
        {/* Only show URL input when no file is selected */}
        {!item.image?.file && (
          <input
            className="w-full text-[10px] font-mono text-stone-300 bg-transparent focus:outline-none placeholder:text-stone-200 mt-1"
            value={preview?.startsWith("http") ? preview : ""}
            onChange={(e) => onUpdate("image", { preview: e.target.value, file: null })}
            placeholder="or paste image URL…"
          />
        )}
      </div>

      <button
        type="button"
        onClick={onDelete}
        className="w-7 h-7 flex items-center justify-center text-stone-200 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
      >
        <X size={13} />
      </button>
    </div>
  );
};

const InclusionsEditor = ({ inclusions, onChange }) => {
  const add    = () => onChange([...inclusions, { id: `inc-${Date.now()}`, image: { preview: "", file: null }, description: "" }]);
  const update = (id, field, val) => onChange(inclusions.map((i) => (i.id === id ? { ...i, [field]: val } : i)));
  const remove = (id) => onChange(inclusions.filter((i) => i.id !== id));

  return (
    <div className="space-y-2">
      {inclusions.length === 0 && (
        <div className="text-center py-10">
          <ListChecks size={28} className="mx-auto mb-2 text-stone-200" />
          <p className="text-sm font-medium text-stone-400">No inclusions yet</p>
          <p className="text-xs text-stone-300">Add what's included in this package</p>
        </div>
      )}
      {inclusions.map((item) => (
        <InclusionItem
          key={item.id}
          item={item}
          onUpdate={(field, val) => update(item.id, field, val)}
          onDelete={() => remove(item.id)}
        />
      ))}
      <button
        type="button"
        onClick={add}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-stone-200 text-stone-400 hover:border-amber-300 hover:text-amber-600 hover:bg-amber-50/50 transition-all text-xs font-semibold"
      >
        <Plus size={13} /> Add Inclusion
      </button>
    </div>
  );
};

// ─── Package Edit Panel ───────────────────────────────────────────────────────
const TABS = [
  { id: "overview",   label: "Overview",   icon: FileText },
  { id: "itinerary",  label: "Itinerary",  icon: Calendar },
  { id: "inclusions", label: "Inclusions", icon: ListChecks },
];

const EMPTY_PKG = {
  title: "", price: "", duration: "", description: "",
  // thumbnail: { preview: string, file: File|null }
  thumbnail: { preview: "", file: null },
  days: [],
  inclusions: [],
};

/** Normalise a package coming from the DB into the local draft shape */
const normalisePkg = (pkg) => ({
  ...EMPTY_PKG,
  ...pkg,
  // DB stores thumbnail as { url, publicId } OR as a plain string from old data
  thumbnail: {
    preview: pkg.thumbnail?.url ?? pkg.thumbnail ?? "",
    file: null,
  },
  // DB stores inclusions with image: { url, publicId }
  inclusions: (pkg.inclusions ?? []).map((inc) => ({
    ...inc,
    id: inc._id ?? inc.id ?? `inc-${Date.now()}-${Math.random()}`,
    image: {
      preview: inc.image?.url ?? inc.image ?? "",
      file: null,
    },
  })),
});

/**
 * Build a FormData payload ready to POST/PUT.
 * - Text fields go as plain strings.
 * - Image files go as binary fields (no base64).
 * - inclusions and days go as JSON strings (multer can't parse nested objects).
 */
const buildFormData = (draft) => {
  const fd = new FormData();

  fd.append("title",       draft.title       ?? "");
  fd.append("price",       draft.price       ?? "");
  fd.append("duration",    draft.duration    ?? "");
  fd.append("description", draft.description ?? "");
  fd.append("sortOrder",   draft.sortOrder   ?? 0);
  if (draft.isActive !== undefined) fd.append("isActive", draft.isActive);

  // Thumbnail: send the File if new, otherwise send the existing URL (or "")
  if (draft.thumbnail?.file) {
    fd.append("thumbnail", draft.thumbnail.file);
  } else {
    fd.append("thumbnail", draft.thumbnail?.preview ?? "");
  }

  // Days: plain JSON string (no images)
  fd.append("days", JSON.stringify(
    (draft.days ?? []).map(({ id, dayNumber, title, description }) => ({
      ...(String(id).startsWith("day-") ? {} : { _id: id }), // temp IDs don't go to DB
      dayNumber, title, description,
    }))
  ));

  // Inclusions: JSON string for text fields + separate file fields per index
  const inclusionsMeta = (draft.inclusions ?? []).map((inc, idx) => {
    if (inc.image?.file) {
      // New file upload — append as binary
      fd.append(`inclusions[${idx}][image]`, inc.image.file);
    }
    return {
      ...(inc._id ? { _id: inc._id } : {}),
      description: inc.description,
      // If no new file, pass existing URL (or "") so backend can diff it
      image: inc.image?.file ? "" : (inc.image?.preview ?? ""),
    };
  });
  fd.append("inclusions", JSON.stringify(inclusionsMeta));

  return fd;
};

const PackageEditPanel = ({ pkg, onSave, onCancel, saving, error }) => {
  const [draft, setDraft] = useState(() => normalisePkg(pkg));
  const [tab, setTab]     = useState("overview");
  const [saved, setSaved] = useState(false);

  // When the DB version updates (e.g. after save), sync the thumbnail preview
  // so the blob URL is replaced with the Cloudinary https URL.
  const trackedId    = useRef(pkg._id ?? pkg.id);
  const trackedThumb = useRef(pkg.thumbnail?.url ?? pkg.thumbnail);
  const newThumb     = pkg.thumbnail?.url ?? pkg.thumbnail;
  if (
    (pkg._id ?? pkg.id) === trackedId.current &&
    newThumb !== trackedThumb.current &&
    typeof newThumb === "string" &&
    newThumb.startsWith("http")
  ) {
    trackedThumb.current = newThumb;
    setDraft((d) => ({ ...d, thumbnail: { preview: newThumb, file: null } }));
  }

  const set = (field, val) => setDraft((d) => ({ ...d, [field]: val }));

  const handleSave = async () => {
    const formData = buildFormData({ ...draft, _id: pkg._id ?? pkg.id });
    const result   = await onSave(formData, pkg._id ?? pkg.id);
    if (result) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const counts = { itinerary: draft.days.length, inclusions: draft.inclusions.length };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-stone-100 bg-white">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">Editing Package</p>
            <h3 className="text-lg font-bold text-stone-800 truncate" style={{ fontFamily: "'Playfair Display', serif" }}>
              {draft.title || "Untitled Package"}
            </h3>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onCancel}
              disabled={saving}
              className="px-3 py-2 text-xs font-semibold text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm min-w-[110px] justify-center ${
                saved
                  ? "bg-emerald-500 text-white shadow-emerald-200"
                  : "bg-stone-900 text-white hover:bg-stone-700 disabled:opacity-60"
              }`}
            >
              {saving ? <><Spinner size={13} /> Saving…</>
               : saved ? <><Check size={13} /> Saved!</>
               : <><Save size={13} /> Save Package</>}
            </button>
          </div>
        </div>

        {error && saving && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600">
            <AlertCircle size={12} className="shrink-0" /> {error}
          </div>
        )}

        <div className="flex gap-1 mt-4 -mb-4 border-b border-stone-100">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold border-b-2 -mb-px transition-all ${
                tab === id
                  ? "border-amber-500 text-amber-700"
                  : "border-transparent text-stone-400 hover:text-stone-600"
              }`}
            >
              <Icon size={13} />
              {label}
              {counts[id] > 0 && (
                <span className={`rounded-full px-1.5 py-px text-[9px] font-bold ${
                  tab === id ? "bg-amber-100 text-amber-600" : "bg-stone-100 text-stone-400"
                }`}>
                  {counts[id]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6">
        {tab === "overview" && (
          <div className="space-y-5">
            <Field label="Package Thumbnail">
              <ThumbnailUploader
                value={draft.thumbnail}
                onChange={(v) => set("thumbnail", v)}
              />
            </Field>
            <Field label="Package Title" required>
              <div className="relative">
                <Package size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-300 pointer-events-none" />
                <input
                  className={`${inputCls} pl-8 font-semibold`}
                  value={draft.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="e.g. 6-Day Kenya Safari Itinerary"
                />
              </div>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Price">
                <div className="relative">
                  <DollarSign size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-300 pointer-events-none" />
                  <input className={`${inputCls} pl-8`} value={draft.price}
                    onChange={(e) => set("price", e.target.value)} placeholder="From $1,200" />
                </div>
              </Field>
              <Field label="Duration">
                <div className="relative">
                  <Clock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-300 pointer-events-none" />
                  <input className={`${inputCls} pl-8`} value={draft.duration}
                    onChange={(e) => set("duration", e.target.value)} placeholder="6 Days / 5 Nights" />
                </div>
              </Field>
            </div>
            <Field label="Overview Description">
              <textarea rows={4} className={`${inputCls} resize-y leading-relaxed`}
                value={draft.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Describe this safari package — highlights, who it's ideal for, what makes it special…"
              />
            </Field>
          </div>
        )}

        {tab === "itinerary" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-stone-700">Day-by-Day Itinerary</h4>
                <p className="text-xs text-stone-400 mt-0.5">Each day covers locations, activities, and highlights</p>
              </div>
              {draft.days.length > 0 && (
                <span className="text-[10px] font-bold text-stone-400 bg-stone-100 px-2.5 py-1 rounded-full">
                  {draft.days.length} days
                </span>
              )}
            </div>
            <ItineraryEditor days={draft.days} onChange={(days) => set("days", days)} />
          </div>
        )}

        {tab === "inclusions" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-stone-700">What's Included</h4>
                <p className="text-xs text-stone-400 mt-0.5">Add an icon/image and description for each inclusion</p>
              </div>
              {draft.inclusions.length > 0 && (
                <span className="text-[10px] font-bold text-stone-400 bg-stone-100 px-2.5 py-1 rounded-full">
                  {draft.inclusions.length} items
                </span>
              )}
            </div>
            <InclusionsEditor inclusions={draft.inclusions} onChange={(inc) => set("inclusions", inc)} />
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Package List Item ────────────────────────────────────────────────────────
const PackageListItem = ({ pkg, isActive, onClick, onDelete, isDeleting }) => {
  // thumbnail can be { url, publicId } from DB or { preview, file } locally
  const thumbSrc = pkg.thumbnail?.url ?? pkg.thumbnail?.preview ?? pkg.thumbnail ?? "";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left flex items-start gap-3 p-3 rounded-xl border transition-all group ${
        isActive
          ? "border-amber-300 bg-amber-50 shadow-sm"
          : "border-stone-100 hover:border-stone-200 hover:bg-stone-50"
      }`}
    >
      <div className="w-14 h-12 rounded-lg overflow-hidden shrink-0 bg-stone-100 border border-stone-100">
        {thumbSrc ? (
          <img src={thumbSrc} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Camera size={16} className="text-stone-300" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate leading-tight ${isActive ? "text-amber-800" : "text-stone-700"}`}>
          {pkg.title || <span className="text-stone-300 font-normal">Untitled package</span>}
        </p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {pkg.duration && (
            <span className="text-[10px] text-stone-400 flex items-center gap-1">
              <Clock size={9} /> {pkg.duration}
            </span>
          )}
          {pkg.price && <span className="text-[10px] font-bold text-amber-600">{pkg.price}</span>}
        </div>
        <div className="flex items-center gap-2 mt-1">
          {pkg.days?.length > 0 && (
            <span className="text-[9px] bg-stone-100 text-stone-400 px-1.5 py-px rounded-full font-semibold">
              {pkg.days.length} days
            </span>
          )}
          {pkg.inclusions?.length > 0 && (
            <span className="text-[9px] bg-stone-100 text-stone-400 px-1.5 py-px rounded-full font-semibold">
              {pkg.inclusions.length} inclusions
            </span>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        disabled={isDeleting}
        className="w-7 h-7 flex items-center justify-center text-stone-200 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 shrink-0"
      >
        {isDeleting
          ? <Spinner size={13} className="text-red-400" />
          : <Trash2 size={13} />}
      </button>
    </button>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────
const PackageEditorPage = () => {
  const { country }  = useParams();
  const { countries } = useAdminData();

  const key  = country.charAt(0).toUpperCase() + country.slice(1);
  const data = countries[key];

  const {
    packages, loading, saving, deleting, error,
    createPackage, updatePackage, deletePackage,
  } = usePackages(key);

  const [activeId, setActiveId] = useState(null);

  const didAutoSelect = useRef(false);
  if (!didAutoSelect.current && packages.length > 0) {
    didAutoSelect.current = true;
    setActiveId(packages[0]._id ?? packages[0].id);
  }

  if (!data) return <Navigate to="/admin/dashboard" replace />;

  const getId    = (p) => p._id ?? p.id;
  const activePkg = packages.find((p) => getId(p) === activeId) ?? null;

  const handleCreate = async () => {
    const created = await createPackage();
    if (created) setActiveId(getId(created));
  };

  const handleDelete = async (id) => {
    const ok = await deletePackage(id);
    if (ok && activeId === id) {
      const remaining = packages.filter((p) => getId(p) !== id);
      setActiveId(remaining[0] ? getId(remaining[0]) : null);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-stone-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* Top bar */}
      <div className="h-14 bg-white border-b border-stone-100 flex items-center px-5 gap-4 shrink-0">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-1.5 text-stone-400 hover:text-stone-700 text-sm font-medium transition-colors"
        >
          <ArrowLeft size={15} />
        </button>
        <div className="w-px h-5 bg-stone-100" />
        <span className="text-2xl leading-none">{FLAGS[country] ?? "🌍"}</span>
        <div>
          <span className="text-sm font-bold text-stone-800" style={{ fontFamily: "'Playfair Display', serif" }}>
            {key}
          </span>
          <span className="text-stone-300 mx-2 text-xs">›</span>
          <span className="text-sm text-stone-500 font-medium">Package Editor</span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          {loading
            ? <Spinner size={14} className="text-stone-400" />
            : <span className="text-xs text-stone-400">{packages.length} package{packages.length !== 1 ? "s" : ""}</span>}
        </div>
      </div>

      {error && !saving && <ErrorBanner message={error} />}

      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        <div className="w-72 bg-white border-r border-stone-100 flex flex-col shrink-0">
          <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Packages</span>
            <button
              onClick={handleCreate}
              disabled={saving || loading}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white rounded-lg text-[11px] font-bold transition-colors"
            >
              {saving ? <Spinner size={11} /> : <Plus size={12} />} New
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {loading && (
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-stone-300">
                <Spinner size={22} />
                <p className="text-xs">Loading packages…</p>
              </div>
            )}
            {!loading && packages.length === 0 && (
              <div className="text-center py-12">
                <Package size={24} className="mx-auto mb-2 text-stone-200" />
                <p className="text-xs text-stone-400 font-medium">No packages yet</p>
                <p className="text-[10px] text-stone-300 mt-1">Click "New" to create the first one</p>
              </div>
            )}
            {packages.map((pkg) => {
              const id = getId(pkg);
              return (
                <PackageListItem
                  key={id}
                  pkg={pkg}
                  isActive={id === activeId}
                  isDeleting={deleting === id}
                  onClick={() => setActiveId(id)}
                  onDelete={() => handleDelete(id)}
                />
              );
            })}
          </div>
        </div>

        {/* Editor panel */}
        <div className="flex-1 overflow-hidden bg-stone-50">
          {activePkg ? (
            <div className="h-full bg-white shadow-xl shadow-stone-100/50">
              <PackageEditPanel
                key={getId(activePkg)}
                pkg={activePkg}
                saving={saving}
                error={saving ? error : null}
                onSave={updatePackage}   // expects (formData, id)
                onCancel={() => setActiveId(null)}
              />
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 rounded-2xl bg-stone-100 flex items-center justify-center mb-4">
                <Package size={32} className="text-stone-300" />
              </div>
              <h3 className="text-lg font-bold text-stone-700 mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                Select a package
              </h3>
              <p className="text-sm text-stone-400 max-w-xs leading-relaxed">
                Choose a package from the sidebar to edit its details, itinerary, and inclusions.
              </p>
              {!loading && (
                <button
                  onClick={handleCreate}
                  disabled={saving}
                  className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-bold transition-colors shadow-sm shadow-amber-200 disabled:opacity-60"
                >
                  <Plus size={15} /> Create First Package
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PackageEditorPage;