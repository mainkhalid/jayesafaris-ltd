import React, { useState } from "react";
import { CheckCircle, AlertCircle, Send, ChevronRight } from "lucide-react";
import { useSubmitInquiry } from "../hooks/useInquiry";
import { useUser } from "@clerk/clerk-react";

// ─── Reusable primitives ──────────────────────────────────────────────────────
const SectionLabel = ({ children, required }) => (
  <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">
    {children}
    {required && <span className="text-amber-500 ml-1">*</span>}
  </label>
);

const RadioOption = ({ name, value, label, checked, onChange }) => (
  <label className="flex items-center gap-3 cursor-pointer group">
    <div
      onClick={onChange}
      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
        checked
          ? "border-amber-500 bg-amber-500"
          : "border-stone-300 group-hover:border-amber-400"
      }`}
    >
      {checked && <div className="w-2 h-2 rounded-full bg-white" />}
    </div>
    <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="sr-only" />
    <span className={`text-sm transition-colors ${checked ? "text-stone-900 font-semibold" : "text-stone-600 group-hover:text-stone-800"}`}>
      {label}
    </span>
  </label>
);

const CheckOption = ({ value, label, checked, onChange }) => (
  <label className="flex items-center gap-3 cursor-pointer group">
    <div
      onClick={onChange}
      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all shrink-0 ${
        checked
          ? "border-amber-500 bg-amber-500"
          : "border-stone-300 group-hover:border-amber-400"
      }`}
    >
      {checked && (
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </div>
    <input type="checkbox" value={value} checked={checked} onChange={onChange} className="sr-only" />
    <span className={`text-sm transition-colors ${checked ? "text-stone-900 font-semibold" : "text-stone-600 group-hover:text-stone-800"}`}>
      {label}
    </span>
  </label>
);

const TextInput = ({ type = "text", placeholder, value, onChange, name }) => (
  <input
    type={type}
    name={name}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className="inq-body w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800
               focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400
               placeholder:text-stone-300 transition-all"
  />
);

const NumberInput = ({ value, onChange, name, min = "0" }) => (
  <input
    type="number"
    name={name}
    value={value}
    min={min}
    onChange={onChange}
    className="inq-body w-24 px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800
               focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all text-center"
  />
);

// ─── Step divider ─────────────────────────────────────────────────────────────
const Step = ({ number, title }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
      <span className="text-white text-xs font-bold">{number}</span>
    </div>
    <h3 className="inq-title text-lg font-light text-stone-800">{title}</h3>
    <div className="flex-1 h-px bg-stone-100" />
  </div>
);

// ─── Main Form ────────────────────────────────────────────────────────────────
const InquiryForm = () => {
  const { user } = useUser();
  const { submit, submitting, success, error } = useSubmitInquiry();

  const [form, setForm] = useState({
    knowDestination:  "",
    destinations:     [],
    budget:           "",
    travelDate:       "",
    travelDuration:   "",
    travelingWith:    [],
    adults:           "1",
    kids:             "0",
    infants:          "0",
    name:             user?.fullName ?? "",
    email:            user?.primaryEmailAddress?.emailAddress ?? "",
    phone:            "",
    country:          "",
    source:           "",
    message:          "",
  });

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const toggleArray = (field, value) =>
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }));

  const handleTextChange = (e) => set(e.target.name, e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Compose a readable message from the structured data
    const message = [
      `Destinations: ${form.destinations.join(", ") || form.knowDestination}`,
      `Budget: ${form.budget}`,
      `Travel date: ${form.travelDate}`,
      `Duration: ${form.travelDuration}`,
      `Traveling with: ${form.travelingWith.join(", ")}`,
      `Adults: ${form.adults}, Kids: ${form.kids}, Infants: ${form.infants}`,
      `Country of residence: ${form.country}`,
      `Heard about us via: ${form.source}`,
      form.message ? `Additional notes: ${form.message}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    await submit({
      name:              form.name,
      email:             form.email,
      phone:             form.phone,
      destination:       form.destinations.join(", "),
      travelDate:        form.travelDate,
      numberOfTravelers: Number(form.adults) + Number(form.kids) + Number(form.infants),
      budget:            form.budget,
      message,
      clerkUserId:       user?.id ?? null,
    });
  };

  if (success) return (
    <div className="max-w-2xl mx-auto py-24 px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
        <CheckCircle size={36} className="text-emerald-500" />
      </div>
      <h2 className="inq-title text-3xl font-light text-stone-800 mb-3">Inquiry Received!</h2>
      <p className="inq-body text-stone-500 text-sm leading-relaxed max-w-md mx-auto">
        Thank you for reaching out. Our safari experts will review your inquiry and get back to you within 24 hours.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="inq-body mt-8 inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all"
      >
        Submit Another Inquiry
      </button>
    </div>
  );

  return (
    <>
      <style>{`
        .inq-title { font-family: 'Cormorant Garamond', serif; }
        .inq-body  { font-family: 'DM Sans', sans-serif; }
      `}</style>

      {/* Hero */}
      <div className="relative h-[35vh] bg-stone-900 overflow-hidden flex items-center justify-center">
        <img
          src="https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1920&q=80"
          alt="Safari"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/40 to-transparent" />
        <div className="relative z-10 text-center px-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="inq-body text-amber-400 text-xs font-semibold tracking-widest uppercase">Plan Your Safari</span>
          </div>
          <h1 className="inq-title text-4xl md:text-5xl font-light text-white">
            Tailor Make Your African Safari
          </h1>
        </div>
      </div>

      <section className="max-w-3xl mx-auto py-16 px-6 inq-body">
        <div className="mb-10">
          <p className="inq-title text-2xl font-light text-stone-800 mb-1">Safari Inquiry Form</p>
          <p className="text-stone-400 text-xs">
            Fields marked with <span className="text-amber-500 font-bold">*</span> are required
          </p>
        </div>

        {error && (
          <div className="mb-8 flex items-center gap-3 px-5 py-4 bg-red-50 border border-red-200 rounded-xl">
            <AlertCircle size={16} className="text-red-500 shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-12">

          {/* ── Step 1: Destination ── */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-8">
            <Step number="1" title="Your Destination" />

            <div className="space-y-6">
              <div>
                <SectionLabel required>Do you know where you want to travel?</SectionLabel>
                <div className="flex gap-6">
                  {["Yes", "No"].map((v) => (
                    <RadioOption
                      key={v} name="knowDestination" value={v} label={v}
                      checked={form.knowDestination === v}
                      onChange={() => set("knowDestination", v)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <SectionLabel required>Where would you like to travel?</SectionLabel>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {["Kenya", "Uganda", "Tanzania", "Zanzibar"].map((c) => (
                    <CheckOption
                      key={c} value={c} label={c}
                      checked={form.destinations.includes(c)}
                      onChange={() => toggleArray("destinations", c)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Step 2: Trip details ── */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-8">
            <Step number="2" title="Trip Details" />

            <div className="space-y-6">
              <div>
                <SectionLabel required>What is your budget per person?</SectionLabel>
                <div className="flex flex-col gap-3">
                  {[
                    { value: "$300 – $1,000",  label: "$300 – $1,000  (Budget)" },
                    { value: "$1,000 – $3,000", label: "$1,000 – $3,000  (Mid-range)" },
                    { value: "$3,000+",         label: "$3,000+  (Luxury)" },
                    { value: "Not Sure",        label: "Not Sure Yet" },
                  ].map((o) => (
                    <RadioOption
                      key={o.value} name="budget" value={o.value} label={o.label}
                      checked={form.budget === o.value}
                      onChange={() => set("budget", o.value)}
                    />
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <SectionLabel required>When do you want to travel?</SectionLabel>
                  <TextInput
                    type="date" name="travelDate"
                    value={form.travelDate} onChange={handleTextChange}
                  />
                </div>
                <div>
                  <SectionLabel required>How long do you want to travel?</SectionLabel>
                  <TextInput
                    name="travelDuration" placeholder="e.g. 7 days"
                    value={form.travelDuration} onChange={handleTextChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Step 3: Group ── */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-8">
            <Step number="3" title="Your Group" />

            <div className="space-y-6">
              <div>
                <SectionLabel required>Who will you be travelling with?</SectionLabel>
                <div className="grid grid-cols-2 gap-3">
                  {["Solo", "My Partner", "My Family", "My Friends"].map((v) => (
                    <CheckOption
                      key={v} value={v} label={v}
                      checked={form.travelingWith.includes(v)}
                      onChange={() => toggleArray("travelingWith", v)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <SectionLabel required>Number of travellers</SectionLabel>
                <div className="grid grid-cols-3 gap-6">
                  {[
                    { label: "Adults (12+)",   name: "adults"  },
                    { label: "Kids (2–11)",    name: "kids"    },
                    { label: "Infants (0–2)",  name: "infants" },
                  ].map(({ label, name }) => (
                    <div key={name} className="text-center">
                      <p className="text-xs text-stone-400 font-semibold mb-2">{label}</p>
                      <NumberInput
                        name={name} value={form[name]}
                        onChange={handleTextChange} min="0"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Step 4: Contact ── */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-8">
            <Step number="4" title="Your Contact Details" />

            <div className="grid sm:grid-cols-2 gap-6">
              {[
                { label: "Full Name",     name: "name",    type: "text",  placeholder: "Jane Doe",              required: true },
                { label: "Email Address", name: "email",   type: "email", placeholder: "jane@example.com",      required: true },
                { label: "Phone Number",  name: "phone",   type: "tel",   placeholder: "+1 234 567 890" },
                { label: "Country",       name: "country", type: "text",  placeholder: "United Kingdom" },
              ].map(({ label, name, type, placeholder, required }) => (
                <div key={name}>
                  <SectionLabel required={required}>{label}</SectionLabel>
                  <TextInput
                    type={type} name={name}
                    value={form[name]} onChange={handleTextChange}
                    placeholder={placeholder}
                  />
                </div>
              ))}

              <div className="sm:col-span-2">
                <SectionLabel>How did you hear about us?</SectionLabel>
                <select
                  name="source"
                  value={form.source}
                  onChange={handleTextChange}
                  className="inq-body w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-700
                             focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all"
                >
                  <option value="">Select an option</option>
                  {["Online Search", "Social Media", "Friend / Recommendation", "Travel Agency", "Return Client"].map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <SectionLabel>Anything else we should know?</SectionLabel>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleTextChange}
                  rows={4}
                  placeholder="Special requests, accessibility needs, specific interests…"
                  className="inq-body w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800
                             focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 resize-none
                             placeholder:text-stone-300 transition-all"
                />
              </div>
            </div>
          </div>

          {/* ── Submit ── */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <p className="text-xs text-stone-400">
              By submitting you agree to our privacy policy. We never share your data.
            </p>
            <button
              type="submit"
              disabled={submitting}
              className="inq-body inline-flex items-center gap-3 bg-stone-900 hover:bg-amber-500 text-white
                         px-10 py-4 rounded-xl font-bold text-sm transition-all shadow-md disabled:opacity-50 whitespace-nowrap"
            >
              {submitting ? "Submitting…" : "Submit Inquiry"}
              <Send size={15} />
            </button>
          </div>

        </form>
      </section>
    </>
  );
};

export default InquiryForm;