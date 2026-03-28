import React, { useState, useEffect, useRef } from "react";
import {
  Settings, Save, Users, Plus, Pencil, Trash2,
  X, AlertCircle, CheckCircle, Loader2,
  Upload, Globe, Phone, Mail, MapPin, Facebook, Instagram,
  Twitter, Youtube, Link, Building2, Clock, ImageIcon,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "/api";

// ── Primitives ─────────────────────────────────────────────────────────────────
const inputCls =
  "w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-300 text-[13px] transition-all";

const Label = ({ children, required }) => (
  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-[0.18em] mb-1.5 px-0.5">
    {children}{required && <span className="text-rose-400 ml-1">*</span>}
  </label>
);

const SectionCard = ({ title, description, icon: Icon, children }) => (
  <div className="bg-white rounded-2xl border border-stone-200/60 shadow-sm overflow-hidden">
    <div className="px-5 py-4 border-b border-stone-100 flex items-center gap-3">
      {Icon && (
        <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
          <Icon size={14} className="text-amber-600" />
        </div>
      )}
      <div>
        <h4 className="font-semibold text-stone-800 text-[13px]">{title}</h4>
        {description && <p className="text-[11px] text-stone-400 mt-0.5">{description}</p>}
      </div>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

// ── Toast ─────────────────────────────────────────────────────────────────────
const Toast = ({ message, type = "success", onDone }) => {
  useEffect(() => {
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-[13px] font-semibold text-white border animate-in slide-in-from-bottom-4 ${
      type === "success" ? "bg-emerald-600 border-emerald-700" : "bg-rose-600 border-rose-700"
    }`}>
      {type === "success" ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
      {message}
    </div>
  );
};

// ── Image Uploader ─────────────────────────────────────────────────────────────
const ImageUploader = ({ value, onChange, label = "Photo", folder = "team" }) => {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState(null);

  const upload = async (file) => {
    if (!file || !file.type.startsWith("image/")) { setError("Only image files allowed."); return; }
    if (file.size > 10 * 1024 * 1024) { setError("Image must be under 10 MB."); return; }
    setError(null); setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      fd.append("folder", folder);
      const res = await fetch(`${API}/upload/single`, { method: "POST", credentials: "include", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Upload failed.");
      onChange(json.url, json.publicId);
    } catch (err) { setError(err.message); }
    finally { setUploading(false); }
  };

  const handleFile = (e) => { if (e.target.files?.[0]) upload(e.target.files[0]); };
  const handleDrop = (e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files?.[0]) upload(e.dataTransfer.files[0]); };

  return (
    <div>
      <Label>{label}</Label>
      <div className="flex items-start gap-4">
        <div className="relative shrink-0">
          {value ? (
            <div className="relative group w-20 h-20">
              <img src={value} alt="Preview" className="w-20 h-20 rounded-xl object-cover border border-stone-200" />
              <button onClick={() => onChange("", "")}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow">
                <X size={10} />
              </button>
            </div>
          ) : (
            <div className="w-20 h-20 rounded-xl bg-stone-50 border-2 border-dashed border-stone-200 flex items-center justify-center">
              <ImageIcon size={20} className="text-stone-300" />
            </div>
          )}
        </div>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex-1 flex flex-col items-center justify-center gap-2 py-4 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
            dragOver ? "border-amber-400 bg-amber-50" : "border-stone-200 bg-stone-50 hover:border-amber-300 hover:bg-amber-50/50"
          }`}
        >
          {uploading ? (
            <><Loader2 size={18} className="text-amber-500 animate-spin" /><p className="text-[11px] text-stone-400">Uploading…</p></>
          ) : (
            <>
              <Upload size={16} className="text-amber-500" />
              <div className="text-center">
                <p className="text-[12px] font-semibold text-stone-600">Drop or <span className="text-amber-600">browse</span></p>
                <p className="text-[10px] text-stone-400 mt-0.5">PNG, JPG, WEBP · max 10 MB</p>
              </div>
            </>
          )}
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>
      </div>
      {error && <p className="mt-2 text-[11px] text-rose-500 flex items-center gap-1"><AlertCircle size={11} /> {error}</p>}
    </div>
  );
};

// ── Toggle ─────────────────────────────────────────────────────────────────────
const Toggle = ({ value, onChange, label }) => (
  <label className="flex items-center gap-3 cursor-pointer select-none">
    <div onClick={() => onChange(!value)} className={`w-10 h-[22px] rounded-full transition-colors relative shrink-0 ${value ? "bg-emerald-500" : "bg-stone-200"}`}>
      <div className={`absolute top-0.5 w-[18px] h-[18px] rounded-full bg-white shadow transition-transform ${value ? "translate-x-[20px]" : "translate-x-0.5"}`} />
    </div>
    <span className="text-[13px] text-stone-600 font-medium">{label}</span>
  </label>
);

// ── Member Modal ───────────────────────────────────────────────────────────────
const MemberModal = ({ member, onClose, onSave }) => {
  const isEdit = !!member;
  const [form, setForm] = useState({
    name: member?.name || "", role: member?.role || "", bio: member?.bio || "",
    imageUrl: member?.imageUrl || "", imagePublicId: member?.imagePublicId || "",
    email: member?.email || "", phone: member?.phone || "",
    isVisible: member?.isVisible ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.name.trim() || !form.role.trim()) { setError("Name and role are required."); return; }
    setSaving(true); setError(null);
    try {
      await onSave(form, member?._id);
      onClose();
    } catch (err) { setError(err.message || "Save failed."); setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-stone-200">
        <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between">
          <h3 className="font-semibold text-stone-800 text-[15px]">{isEdit ? "Edit Team Member" : "Add Team Member"}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-stone-100 flex items-center justify-center text-stone-400 transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <ImageUploader value={form.imageUrl} onChange={(url, id) => { set("imageUrl", url); set("imagePublicId", id); }} folder="jaye-safaris/team" />
          <div className="grid grid-cols-2 gap-4">
            <div><Label required>Full Name</Label><input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Jane Mwangi" /></div>
            <div><Label required>Position</Label><input className={inputCls} value={form.role} onChange={(e) => set("role", e.target.value)} placeholder="Safari Guide" /></div>
          </div>
          <div><Label>Bio</Label><textarea className={`${inputCls} resize-none`} rows={3} value={form.bio} onChange={(e) => set("bio", e.target.value)} placeholder="Short bio…" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Email</Label><input type="email" className={inputCls} value={form.email} onChange={(e) => set("email", e.target.value)} /></div>
            <div><Label>Phone</Label><input type="tel" className={inputCls} value={form.phone} onChange={(e) => set("phone", e.target.value)} /></div>
          </div>
          <Toggle value={form.isVisible} onChange={(v) => set("isVisible", v)} label="Visible on website" />
          {error && <p className="text-[12px] text-rose-600 flex items-center gap-1.5"><AlertCircle size={13} /> {error}</p>}
        </div>
        <div className="px-6 py-4 border-t border-stone-100 flex justify-end gap-2.5">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-[13px] font-semibold text-stone-500 hover:bg-stone-100 border border-stone-200 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-amber-500 hover:bg-stone-900 text-white text-[13px] font-semibold rounded-xl transition-all disabled:opacity-50 shadow-sm">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? "Saving…" : "Save Member"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Team Tab ───────────────────────────────────────────────────────────────────
const TeamTab = ({ onToast }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  useEffect(() => {
    fetch(`${API}/team/all`, { credentials: "include" })
      .then((r) => r.json()).then((d) => setMembers(d.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  // ── Uses multipart FormData to hit /api/team (teamUpload middleware) ──────
  const handleSave = async (form, id) => {
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (k !== "imagePublicId") fd.append(k, String(v));
    });
    // If imageUrl is empty, signal clear; if it's a blob URL the uploader already managed it
    const method = id ? "PUT" : "POST";
    const url    = id ? `${API}/team/${id}` : `${API}/team`;
    const res    = await fetch(url, { method, credentials: "include", body: fd });
    const json   = await res.json();
    if (!res.ok) throw new Error(json.message || "Save failed.");
    setMembers(id ? members.map((m) => (m._id === id ? json.data : m)) : [...members, json.data]);
    onToast(id ? "Member updated." : "Member added.");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this team member?")) return;
    await fetch(`${API}/team/${id}`, { method: "DELETE", credentials: "include" });
    setMembers(members.filter((m) => m._id !== id));
    onToast("Member removed.");
  };

  if (loading) return <div className="py-10 text-center text-stone-400 text-[13px]">Loading team…</div>;

  return (
    <div>
      <div className="space-y-2 mb-4">
        {members.length === 0 && <p className="text-[13px] text-stone-400 italic py-4 text-center">No team members yet.</p>}
        {members.map((m) => (
          <div key={m._id} className="flex items-center gap-3 p-3 rounded-xl border border-stone-100 hover:border-stone-200 bg-stone-50/50 group transition-all">
            {m.imageUrl ? (
              <img src={m.imageUrl} alt={m.name} className="w-10 h-10 rounded-xl object-cover shrink-0 border border-stone-200" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 font-bold text-[13px] shrink-0">
                {m.name?.[0]?.toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-stone-800">{m.name}</p>
              <p className="text-[11px] text-stone-400">{m.role}</p>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => setModal(m)} className="w-7 h-7 flex items-center justify-center rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-all">
                <Pencil size={13} />
              </button>
              <button onClick={() => handleDelete(m._id)} className="w-7 h-7 flex items-center justify-center rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-all">
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => setModal({})} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-stone-200 text-stone-400 hover:border-amber-300 hover:text-amber-600 text-[12px] font-semibold w-full justify-center transition-all">
        <Plus size={14} /> Add Team Member
      </button>
      {modal !== null && <MemberModal member={Object.keys(modal).length ? modal : null} onClose={() => setModal(null)} onSave={handleSave} />}
    </div>
  );
};

// ── General Tab ────────────────────────────────────────────────────────────────
const GeneralTab = ({ onToast }) => {
  const [form, setForm] = useState({ companyName: "Jaye Safaris", tagline: "", description: "", email: "", phone: "", address: "", logoUrl: "", logoPublicId: "" });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    fetch(`${API}/settings/general`, { credentials: "include" })
      .then((r) => r.json()).then((d) => { if (d.data) setForm(d.data); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/settings/general`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Save failed.");
      onToast("General settings saved.");
    } catch { onToast("Failed to save.", "error"); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="py-10 text-center text-stone-400 text-[13px]">Loading settings…</div>;

  return (
    <div className="space-y-5">
      <SectionCard title="Brand Identity" icon={Building2} description="Your company's core information">
        <div className="space-y-4">
          <ImageUploader value={form.logoUrl} onChange={(url, id) => { set("logoUrl", url); set("logoPublicId", id); }} label="Company Logo" folder="jaye-safaris/branding" />
          <div className="grid md:grid-cols-2 gap-4">
            <div><Label required>Company Name</Label><input className={inputCls} value={form.companyName} onChange={(e) => set("companyName", e.target.value)} /></div>
            <div><Label>Tagline</Label><input className={inputCls} value={form.tagline} onChange={(e) => set("tagline", e.target.value)} placeholder="Discover East Africa" /></div>
          </div>
          <div><Label>Description</Label><textarea className={`${inputCls} resize-none`} rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} /></div>
        </div>
      </SectionCard>

      <SectionCard title="Contact Details" icon={Phone} description="Used across the website and emails">
        <div className="grid md:grid-cols-2 gap-4">
          <div><Label>Email</Label><div className="relative"><Mail size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-300" /><input type="email" className={`${inputCls} pl-9`} value={form.email} onChange={(e) => set("email", e.target.value)} /></div></div>
          <div><Label>Phone</Label><div className="relative"><Phone size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-300" /><input type="tel" className={`${inputCls} pl-9`} value={form.phone} onChange={(e) => set("phone", e.target.value)} /></div></div>
          <div className="md:col-span-2"><Label>Address</Label><div className="relative"><MapPin size={13} className="absolute left-3.5 top-3.5 text-stone-300" /><input className={`${inputCls} pl-9`} value={form.address} onChange={(e) => set("address", e.target.value)} /></div></div>
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-stone-900 text-white text-[13px] font-semibold rounded-xl transition-all shadow-sm disabled:opacity-50">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

// ── Social Tab 
const SocialTab = ({ onToast }) => {
  const [form, setForm] = useState({ facebook: "", instagram: "", twitter: "", youtube: "", tiktok: "", tripadvisor: "" });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    fetch(`${API}/settings/social`, { credentials: "include" })
      .then((r) => r.json()).then((d) => { if (d.data) setForm(d.data); }).catch(() => {});
  }, []);

  const socials = [
    { key: "facebook",    label: "Facebook",    icon: Facebook,  placeholder: "https://facebook.com/jayesafaris"    },
    { key: "instagram",   label: "Instagram",   icon: Instagram, placeholder: "https://instagram.com/jayesafaris"   },
    { key: "twitter",     label: "Twitter / X", icon: Twitter,   placeholder: "https://twitter.com/jayesafaris"     },
    { key: "youtube",     label: "YouTube",     icon: Youtube,   placeholder: "https://youtube.com/@jayesafaris"    },
    { key: "tiktok",      label: "TikTok",      icon: Link,      placeholder: "https://tiktok.com/@jayesafaris"     },
    { key: "tripadvisor", label: "TripAdvisor", icon: Globe,     placeholder: "https://tripadvisor.com/…"           },
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/settings/social`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Save failed.");
      onToast("Social links saved.");
    } catch { onToast("Failed to save.", "error"); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-5">
      <SectionCard title="Social Media Links" icon={Globe} description="Displayed in the website footer and contact page">
        <div className="grid md:grid-cols-2 gap-4">
          {socials.map(({ key, label, icon: Icon, placeholder }) => (
            <div key={key}>
              <Label>{label}</Label>
              <div className="relative">
                <Icon size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-300" />
                <input type="url" value={form[key]} onChange={(e) => set(key, e.target.value)} placeholder={placeholder} className={`${inputCls} pl-9`} />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-stone-900 text-white text-[13px] font-semibold rounded-xl transition-all shadow-sm disabled:opacity-50">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {saving ? "Saving…" : "Save Links"}
        </button>
      </div>
    </div>
  );
};

// ── Booking Tab ────────────────────────────────────────────────────────────────
const BookingTab = ({ onToast }) => {
  const [form, setForm] = useState({ depositPercent: 30, fullPaymentDays: 14, cancellationDays: 30, autoConfirm: false, notifyOnInquiry: true, notifyOnBooking: true, currency: "USD", timezone: "Africa/Nairobi" });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    fetch(`${API}/settings/booking`, { credentials: "include" })
      .then((r) => r.json()).then((d) => { if (d.data) setForm(d.data); }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/settings/booking`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Save failed.");
      onToast("Booking settings saved.");
    } catch { onToast("Failed to save.", "error"); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-5">
      <SectionCard title="Payment Rules" icon={Settings} description="Deposit and cancellation policy defaults">
        <div className="grid md:grid-cols-3 gap-4">
          <div><Label>Deposit (%)</Label><input type="number" min={0} max={100} value={form.depositPercent} onChange={(e) => set("depositPercent", Number(e.target.value))} className={inputCls} /><p className="text-[10px] text-stone-400 mt-1.5 px-0.5">% required to confirm booking</p></div>
          <div><Label>Full Payment (days)</Label><input type="number" min={0} value={form.fullPaymentDays} onChange={(e) => set("fullPaymentDays", Number(e.target.value))} className={inputCls} /><p className="text-[10px] text-stone-400 mt-1.5 px-0.5">Days before departure</p></div>
          <div><Label>Free Cancellation (days)</Label><input type="number" min={0} value={form.cancellationDays} onChange={(e) => set("cancellationDays", Number(e.target.value))} className={inputCls} /><p className="text-[10px] text-stone-400 mt-1.5 px-0.5">Full refund window</p></div>
        </div>
      </SectionCard>

      <SectionCard title="Regional Settings" icon={Globe} description="Currency and timezone for the platform">
        <div className="grid md:grid-cols-2 gap-4">
          <div><Label>Default Currency</Label><select value={form.currency} onChange={(e) => set("currency", e.target.value)} className={inputCls}>{["USD", "EUR", "GBP", "KES", "TZS", "UGX"].map((c) => <option key={c}>{c}</option>)}</select></div>
          <div><Label>Timezone</Label><select value={form.timezone} onChange={(e) => set("timezone", e.target.value)} className={inputCls}>{["Africa/Nairobi", "Africa/Dar_es_Salaam", "Africa/Kampala", "UTC"].map((tz) => <option key={tz}>{tz}</option>)}</select></div>
        </div>
      </SectionCard>

      <SectionCard title="Automation & Notifications" icon={Clock} description="Email alerts and auto-response settings">
        <div className="space-y-4">
          <Toggle value={form.autoConfirm} onChange={(v) => set("autoConfirm", v)} label="Auto-confirm bookings on payment" />
          <Toggle value={form.notifyOnInquiry} onChange={(v) => set("notifyOnInquiry", v)} label="Email alert on new inquiry" />
          <Toggle value={form.notifyOnBooking} onChange={(v) => set("notifyOnBooking", v)} label="Email alert on new booking" />
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-stone-900 text-white text-[13px] font-semibold rounded-xl transition-all shadow-sm disabled:opacity-50">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {saving ? "Saving…" : "Save Settings"}
        </button>
      </div>
    </div>
  );
};

// ── Main ───────────────────────────────────────────────────────────────────────
const TABS = [
  { id: "general", label: "General",      icon: Building2 },
  { id: "social",  label: "Social Media", icon: Globe     },
  { id: "booking", label: "Booking",      icon: Clock     },
  { id: "team",    label: "Team",         icon: Users     },
];

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [toast, setToast] = useState(null);
  const showToast = (message, type = "success") => setToast({ message, type });

  return (
    <div className="space-y-7 pb-10">
      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[11px] font-semibold text-amber-600 uppercase tracking-[0.2em] mb-1">Configuration</p>
          <h1 className="text-[28px] font-bold text-stone-900 leading-tight tracking-tight">Settings</h1>
        </div>
        <span className="text-[10px] text-stone-300 font-medium hidden md:block">Jaye Safaris Admin v2.0</span>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-white border border-stone-200 p-1 rounded-xl w-fit shadow-sm">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 text-[12px] font-semibold rounded-lg transition-all ${
              activeTab === id
                ? "bg-stone-900 text-white shadow-sm"
                : "text-stone-500 hover:text-stone-800 hover:bg-stone-50"
            }`}
          >
            <Icon size={13} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div>
        {activeTab === "general" && <GeneralTab onToast={showToast} />}
        {activeTab === "social"  && <SocialTab  onToast={showToast} />}
        {activeTab === "booking" && <BookingTab onToast={showToast} />}
        {activeTab === "team"    && (
          <SectionCard title="Team Members" icon={Users} description="Profiles shown on the About page — images uploaded to Cloudinary">
            <TeamTab onToast={showToast} />
          </SectionCard>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;