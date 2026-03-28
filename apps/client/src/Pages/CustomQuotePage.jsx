import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import {
  CheckCircle, AlertCircle, Compass,
  MapPin, Calendar, Clock, Banknote,
  Users, Send, Sparkles,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "/api";

// ── Shared input class ────────────────────────────────────────────────────────
const inputCls =
  "w-full px-5 py-4 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-amber-400/30 transition-all text-sm outline-none";

// ── Section label ─────────────────────────────────────────────────────────────
const SectionLabel = ({ children, required }) => (
  <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2 px-1">
    {children}
    {required && <span className="text-amber-500 ml-1">*</span>}
  </label>
);

// ── Custom radio group ────────────────────────────────────────────────────────
const RadioGroup = ({ options, value, onChange, name }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
    {options.map((opt) => (
      <label
        key={opt.value}
        className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
          value === opt.value
            ? "border-amber-500 bg-amber-50/50 shadow-sm"
            : "border-stone-100 hover:border-stone-200 bg-stone-50/30"
        }`}
      >
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
            value === opt.value ? "border-amber-500 bg-amber-500" : "border-stone-200"
          }`}
        >
          {value === opt.value && <div className="w-2 h-2 rounded-full bg-white" />}
        </div>
        <input
          type="radio"
          name={name}
          value={opt.value}
          checked={value === opt.value}
          onChange={onChange}
          className="sr-only"
        />
        <span
          className={`text-sm font-semibold transition-colors ${
            value === opt.value ? "text-amber-900" : "text-stone-600"
          }`}
        >
          {opt.label}
        </span>
      </label>
    ))}
  </div>
);

// ── Checkbox group ────────────────────────────────────────────────────────────
const CheckboxGroup = ({ options, values, onChange }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
    {options.map((opt) => {
      const isChecked = values.includes(opt.value);
      return (
        <label
          key={opt.value}
          className={`group flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
            isChecked
              ? "border-amber-400 bg-amber-50 shadow-sm"
              : "border-stone-100 hover:border-stone-200"
          }`}
        >
          <div
            className={`w-5 h-5 rounded border transition-all flex items-center justify-center shrink-0 ${
              isChecked
                ? "bg-amber-500 border-amber-500"
                : "bg-white border-stone-200 group-hover:border-amber-300"
            }`}
          >
            {isChecked && (
              <svg width="12" height="10" viewBox="0 0 12 10" fill="none" className="text-white">
                <path
                  d="M1 5L4.5 8.5L11 1"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
          <input
            type="checkbox"
            value={opt.value}
            checked={isChecked}
            onChange={() => onChange(opt.value)}
            className="sr-only"
          />
          <span
            className={`text-xs font-bold transition-colors ${
              isChecked ? "text-amber-900" : "text-stone-500"
            }`}
          >
            {opt.label}
          </span>
        </label>
      );
    })}
  </div>
);

// ── Traveler stepper ──────────────────────────────────────────────────────────
const Stepper = ({ label, sublabel, value, onDecrement, onIncrement, min = 0 }) => (
  <div className="flex flex-col items-center gap-1.5">
    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">{label}</span>
    {sublabel && <span className="text-[9px] text-stone-300">{sublabel}</span>}
    <div className="flex items-center gap-3 mt-1">
      <button
        type="button"
        onClick={onDecrement}
        disabled={value <= min}
        className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold flex items-center justify-center transition-colors disabled:opacity-30"
      >
        −
      </button>
      <span className="text-stone-800 font-bold text-lg w-6 text-center">{value}</span>
      <button
        type="button"
        onClick={onIncrement}
        className="w-8 h-8 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-700 font-bold flex items-center justify-center transition-colors"
      >
        +
      </button>
    </div>
  </div>
);

// ── Main page ─────────────────────────────────────────────────────────────────
const CustomQuotePage = () => {
  const { user, isLoaded: userLoaded } = useUser();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name:               "",
    email:              "",
    phone:              "",
    countryOfResidence: "",
    destinations:       [],
    travelDate:         "",
    duration:           "",
    budgetPerPerson:    "",
    adults:             1,
    kids:               0,
    infants:            0,
    travelingWith:      [],
    interests:          [],
    message:            "",
    source:             "",
  });

  // Sync Clerk user once auth resolves
  useEffect(() => {
    if (userLoaded && user) {
      setForm((prev) => ({
        ...prev,
        name:  prev.name  || user.fullName || "",
        email: prev.email || user.primaryEmailAddress?.emailAddress || "",
      }));
    }
  }, [userLoaded, user]);

  const [submitting, setSubmitting] = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [error,      setError]      = useState(null);

  const setField     = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  const stepField    = (field, delta, min = 0) =>
    setForm((prev) => ({ ...prev, [field]: Math.max(min, prev[field] + delta) }));
  const toggleArray  = (field, value) =>
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }));

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    if (!form.name.trim())  return "Full name is required.";
    if (!form.email.trim()) return "Email address is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return "Please enter a valid email address.";
    if (!form.phone.trim()) return "Phone / WhatsApp is required.";
    if (form.destinations.length === 0)
      return "Please select at least one destination.";
    if (!form.travelDate)   return "Please provide a target travel date.";
    if (!form.duration.trim()) return "Please provide an estimated duration.";
    if (!form.budgetPerPerson) return "Please select a budget range.";
    if (form.adults < 1)   return "At least 1 adult traveler is required.";
    return null;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`${API}/custom-quotes`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:               form.name.trim(),
          email:              form.email.trim().toLowerCase(),
          phone:              form.phone.trim(),
          countryOfResidence: form.countryOfResidence.trim(),
          destinations:       form.destinations,
          travelDate:         form.travelDate,
          duration:           form.duration.trim(),
          budgetPerPerson:    form.budgetPerPerson,
          numberOfTravelers: {
            adults:  form.adults,
            kids:    form.kids,
            infants: form.infants,
          },
          travelingWith: form.travelingWith,
          interests:     form.interests,
          message:       form.message.trim(),
          source:        form.source.trim(),
          clerkUserId:   user?.id || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit request.");

      setSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err.message);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success screen ─────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6 pt-32">
        <div className="max-w-2xl w-full bg-white rounded-[3rem] shadow-xl shadow-stone-200/50 p-12 text-center border border-stone-100 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400" />
          <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-8 relative">
            <Sparkles className="text-amber-500 w-10 h-10 animate-pulse" />
            <div className="absolute inset-0 bg-amber-200 rounded-full animate-ping opacity-20" />
          </div>
          <h2
            className="text-4xl font-light text-stone-900 mb-4"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Your Dream Safari is in Motion
          </h2>
          <p className="text-stone-500 text-lg leading-relaxed mb-10 max-w-md mx-auto">
            Our safari curators have received your request and are already crafting the perfect
            proposal for your African adventure.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => navigate("/")}
              className="px-8 py-4 rounded-2xl border-2 border-stone-100 text-stone-500 font-bold hover:bg-stone-50 transition-all"
            >
              Back Home
            </button>
            <button
              onClick={() => navigate("/about-us")}
              className="px-8 py-4 rounded-2xl bg-amber-500 text-white font-bold hover:bg-stone-900 transition-all shadow-lg shadow-amber-200"
            >
              Meet the Team
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-stone-50 pt-0 pb-24">
      {/* Hero */}
      <div className="relative h-[35vh] bg-stone-900 mb-16 overflow-hidden flex items-center justify-center">
        <img
          src="https://i.pinimg.com/1200x/bd/6a/87/bd6a87b5358d01c1ca1bfc4f639bf110.jpg"
          alt="Safari"
          className="absolute inset-0 w-full h-full object-cover object-center   opacity-50 grayscale-[0.3]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 to-transparent" />
        <div className="relative z-10 text-center px-6">
          <h1
            className="text-5xl md:text-6xl font-light text-white mb-4"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Tailor Your Journey
          </h1>
          <p className="text-amber-400 uppercase tracking-[0.3em] text-xs font-bold">
            Exclusively Crafted Safaris
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6">
        <form onSubmit={handleSubmit} className="space-y-12" noValidate>

          {/* Global error banner */}
          {error && (
            <div className="flex items-start gap-3 p-5 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 text-sm shadow-sm">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* ── Section 1: Destinations ──────────────────────────────────── */}
          <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-stone-100 transition-all hover:shadow-md">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-200">
                <MapPin size={24} />
              </div>
              <div>
                <h3
                  className="text-2xl font-light text-stone-800"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  Where does your heart lead?
                </h3>
                <p className="text-xs text-stone-400 font-medium uppercase tracking-widest">
                  Select one or more destinations <span className="text-amber-500">*</span>
                </p>
              </div>
            </div>
            <CheckboxGroup
              options={[
                { label: "Kenya",      value: "Kenya"      },
                { label: "Tanzania",   value: "Tanzania"   },
                { label: "Uganda",     value: "Uganda"     },
                { label: "Zanzibar",   value: "Zanzibar"   },
                { label: "Rwanda",     value: "Rwanda"     },
                { label: "Seychelles", value: "Seychelles" },
              ]}
              values={form.destinations}
              onChange={(val) => toggleArray("destinations", val)}
            />
          </div>

          {/* ── Section 2: Timeline + Budget ────────────────────────────── */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-stone-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-stone-900 text-white flex items-center justify-center">
                  <Calendar size={20} />
                </div>
                <h3 className="text-xl font-bold text-stone-800 tracking-tight">Timeline</h3>
              </div>
              <div className="space-y-6">
                <div>
                  <SectionLabel required>Target Travel Date</SectionLabel>
                  <input
                    type="date"
                    value={form.travelDate}
                    onChange={(e) => setField("travelDate", e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className={inputCls}
                  />
                </div>
                <div>
                  <SectionLabel required>Duration</SectionLabel>
                  <div className="relative">
                    <Clock size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300" />
                    <input
                      type="text"
                      placeholder="e.g. 10 Days"
                      value={form.duration}
                      onChange={(e) => setField("duration", e.target.value)}
                      className={`${inputCls} pl-12`}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-stone-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center">
                  <Banknote size={20} />
                </div>
                <h3 className="text-xl font-bold text-stone-800 tracking-tight">Investment</h3>
              </div>
              <SectionLabel required>Budget Per Person</SectionLabel>
              <RadioGroup
                name="budgetPerPerson"
                value={form.budgetPerPerson}
                onChange={(e) => setField("budgetPerPerson", e.target.value)}
                options={[
                  { label: "Explorer ($1k–$3k)",    value: "explorer" },
                  { label: "Comfort ($3k–$6k)",     value: "comfort"  },
                  { label: "Luxury ($6k–$12k)",     value: "luxury"   },
                  { label: "Ultra Luxe ($12k+)",    value: "ultra"    },
                ]}
              />
            </div>
          </div>

          {/* ── Section 3: Travel Group ──────────────────────────────────── */}
          <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-stone-100">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-stone-900 text-white flex items-center justify-center">
                <Users size={20} />
              </div>
              <div>
                <h3
                  className="text-2xl font-light text-stone-800"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  Your Travel Group
                </h3>
                <p className="text-xs text-stone-400 font-medium uppercase tracking-widest">
                  Who's joining the adventure?
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 bg-stone-50 p-6 rounded-2xl border border-stone-100 mb-8">
              <Stepper
                label="Adults"
                sublabel="18+"
                value={form.adults}
                onDecrement={() => stepField("adults", -1, 1)}
                onIncrement={() => stepField("adults",  1)}
                min={1}
              />
              <Stepper
                label="Kids"
                sublabel="2–17"
                value={form.kids}
                onDecrement={() => stepField("kids", -1)}
                onIncrement={() => stepField("kids",  1)}
              />
              <Stepper
                label="Infants"
                sublabel="Under 2"
                value={form.infants}
                onDecrement={() => stepField("infants", -1)}
                onIncrement={() => stepField("infants",  1)}
              />
            </div>

            <SectionLabel>Traveling With</SectionLabel>
            <CheckboxGroup
              options={[
                { label: "Partner / Couple",  value: "couple"   },
                { label: "Family",            value: "family"   },
                { label: "Friends Group",     value: "friends"  },
                { label: "Solo",              value: "solo"     },
                { label: "Corporate Group",   value: "corporate"},
                { label: "Honeymoon",         value: "honeymoon"},
              ]}
              values={form.travelingWith}
              onChange={(val) => toggleArray("travelingWith", val)}
            />
          </div>

          {/* ── Section 4: Interests ─────────────────────────────────────── */}
          <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-stone-100">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-200">
                <Sparkles size={20} />
              </div>
              <div>
                <h3
                  className="text-2xl font-light text-stone-800"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  Your Safari Interests
                </h3>
                <p className="text-xs text-stone-400 font-medium uppercase tracking-widest">
                  What excites you most?
                </p>
              </div>
            </div>
            <CheckboxGroup
              options={[
                { label: "Big 5 Game Drive",   value: "game_drive"     },
                { label: "Gorilla Trekking",   value: "gorilla"        },
                { label: "Great Migration",    value: "migration"      },
                { label: "Beach & Relaxation", value: "beach"          },
                { label: "Bird Watching",      value: "birding"        },
                { label: "Cultural Visits",    value: "culture"        },
                { label: "Photography",        value: "photography"    },
                { label: "Walking Safari",     value: "walking_safari" },
                { label: "Hot Air Balloon",    value: "balloon"        },
              ]}
              values={form.interests}
              onChange={(val) => toggleArray("interests", val)}
            />
          </div>

          {/* ── Section 5: Contact ───────────────────────────────────────── */}
          <div className="bg-white rounded-[2.5rem] p-12 shadow-sm border border-stone-100">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-200">
                <CheckCircle size={24} />
              </div>
              <div>
                <h3
                  className="text-2xl font-light text-stone-800"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  Contact Information
                </h3>
                <p className="text-xs text-stone-400 font-medium uppercase tracking-widest">
                  How can we reach you?
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <SectionLabel required>Full Name</SectionLabel>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setField("name", e.target.value)}
                    className={inputCls}
                    placeholder="Alex Johnson"
                  />
                </div>
                <div>
                  <SectionLabel required>Email Address</SectionLabel>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setField("email", e.target.value)}
                    className={inputCls}
                    placeholder="alex@example.com"
                  />
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <SectionLabel required>WhatsApp / Phone</SectionLabel>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setField("phone", e.target.value)}
                    className={inputCls}
                    placeholder="+1 XXX XXX XXXX"
                  />
                </div>
                <div>
                  <SectionLabel>Country of Residence</SectionLabel>
                  <input
                    type="text"
                    value={form.countryOfResidence}
                    onChange={(e) => setField("countryOfResidence", e.target.value)}
                    className={inputCls}
                    placeholder="United Kingdom"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Section 6: Message + submit ──────────────────────────────── */}
          <div className="bg-stone-900 rounded-[2.5rem] p-12 text-white overflow-hidden relative">
            <Compass size={120} className="absolute -right-10 -bottom-10 text-white/5 rotate-12" />
            <div className="relative z-10 space-y-8">
              <div>
                <h3
                  className="text-3xl font-light mb-2"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  Tell us more…
                </h3>
                <p className="text-stone-400 text-sm">
                  Every detail helps us craft your perfect Safari.
                </p>
              </div>

              <textarea
                rows={5}
                value={form.message}
                onChange={(e) => setField("message", e.target.value)}
                placeholder="Share your vision — migration season, gorilla trekking, beach finale, dietary needs…"
                className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] p-6 text-white focus:bg-white/10 focus:border-amber-500/50 outline-none transition-all placeholder:text-stone-600 resize-none"
              />

              <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-4">
                <p className="text-xs text-stone-500 max-w-sm">
                  By submitting, our experts will spend time curating a unique proposal for you. We
                  typically respond within 12–24 hours.
                </p>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-amber-500 hover:bg-white hover:text-stone-900 text-white px-12 py-5 rounded-2xl font-bold transition-all shadow-xl shadow-amber-900/40 flex items-center gap-3 disabled:opacity-50 whitespace-nowrap"
                >
                  {submitting ? "Creating Proposal…" : "Request Proposal"}
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CustomQuotePage;