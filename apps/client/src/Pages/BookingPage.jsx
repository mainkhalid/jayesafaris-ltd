import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import {
  CheckCircle, AlertCircle, Calendar, Users,
  Package, Send, ChevronLeft, ChevronRight, Loader2,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "/api";

// ─── Primitive Components ─────────────────────────────────────────────────────
const SectionLabel = ({ children, required }) => (
  <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2 px-1">
    {children}
    {required && <span className="text-amber-500 ml-1">*</span>}
  </label>
);

const TextInput = ({ type = "text", placeholder, value, onChange, name, required, disabled }) => (
  <input
    type={type}
    name={name}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    required={required}
    disabled={disabled}
    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all text-sm disabled:opacity-60 disabled:cursor-not-allowed"
  />
);

// ─── Traveler counter (stepper UI, no raw number input) ───────────────────────
const TravelerStepper = ({ label, sublabel, name, value, onChange, min = 0 }) => (
  <div className="flex flex-col items-center gap-2">
    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">{label}</span>
    {sublabel && <span className="text-[9px] text-stone-300 -mt-1">{sublabel}</span>}
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(name, Math.max(min, value - 1))}
        className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold transition-colors flex items-center justify-center text-lg leading-none"
      >
        −
      </button>
      <span className="text-stone-800 font-bold text-lg w-6 text-center">{value}</span>
      <button
        type="button"
        onClick={() => onChange(name, value + 1)}
        className="w-8 h-8 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-700 font-bold transition-colors flex items-center justify-center text-lg leading-none"
      >
        +
      </button>
    </div>
  </div>
);

// ─── Booking Page ─────────────────────────────────────────────────────────────
const BookingPage = () => {
  const { user, isLoaded: userLoaded } = useUser();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const packageId    = searchParams.get("packageId");
  const packageTitle = searchParams.get("title");

  const [step, setStep] = useState(1);

  // Personal details — re-initialise once Clerk resolves the user
  const [form, setForm] = useState({
    name:  "",
    email: "",
    phone: "",
    adults:   1,
    kids:     0,
    infants:  0,
    message:  "",
  });

  // Sync Clerk user into form after auth loads
  useEffect(() => {
    if (userLoaded && user) {
      setForm((prev) => ({
        ...prev,
        name:  prev.name  || user.fullName || "",
        email: prev.email || user.primaryEmailAddress?.emailAddress || "",
      }));
    }
  }, [userLoaded, user]);

  // Departures fetched from API
  const [departures,       setDepartures]       = useState([]);
  const [departuresLoading, setDeparturesLoading] = useState(false);
  const [selectedDeparture, setSelectedDeparture] = useState(null);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [error,      setError]      = useState(null);

  // ── Fetch available departures when packageId is ready ───────────────────
  useEffect(() => {
    if (!packageId) return;
    const fetchDepartures = async () => {
      setDeparturesLoading(true);
      try {
        const res  = await fetch(`${API}/departures/by-package/${packageId}`);
        const json = await res.json();
        setDepartures(json.data || []);
      } catch {
        setDepartures([]);
      } finally {
        setDeparturesLoading(false);
      }
    };
    fetchDepartures();
  }, [packageId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleStepperChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const totalTravelers = form.adults + form.kids + form.infants;

  // ── Per-step validation ───────────────────────────────────────────────────
  const validateStep = () => {
    if (step === 1) {
      if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
        setError("Please fill out all required personal details.");
        return false;
      }
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(form.email)) {
        setError("Please enter a valid email address.");
        return false;
      }
    }
    if (step === 2) {
      if (!selectedDeparture) {
        setError("Please select a departure date.");
        return false;
      }
      if (form.adults < 1) {
        setError("At least 1 adult traveler is required.");
        return false;
      }
      const available = selectedDeparture.totalSlots - selectedDeparture.bookedSlots;
      if (totalTravelers > available) {
        setError(`Only ${available} slot(s) remaining on this departure. Please reduce traveler count.`);
        return false;
      }
    }
    setError(null);
    return true;
  };

  const nextStep = () => { if (validateStep()) setStep((p) => p + 1); };
  const prevStep = () => { setError(null); setStep((p) => p - 1); };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validateStep()) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`${API}/bookings`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:         form.name.trim(),
          email:        form.email.trim().toLowerCase(),
          phone:        form.phone.trim(),
          packageId,
          departureId:  selectedDeparture._id,
          packageTitle: packageTitle || selectedDeparture.packageTitle || "Safari Package",
          numberOfTravelers: {
            adults:  form.adults,
            kids:    form.kids,
            infants: form.infants,
          },
          message:     form.message.trim(),
          clerkUserId: user?.id || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong.");

      setSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const fmt = (d) =>
    d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";

  const duration = (dep) => {
    if (!dep) return "";
    const days = Math.round(
      (new Date(dep.endDate) - new Date(dep.departureDate)) / 86400000
    );
    return `${days} day${days !== 1 ? "s" : ""}`;
  };

  // ── Success screen ────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6 pt-32">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-stone-200/50 p-10 text-center border border-stone-100">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-emerald-500 w-10 h-10" />
          </div>
          <h2
            className="text-2xl font-bold text-stone-800 mb-2"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Booking Request Received!
          </h2>
          <p className="text-stone-500 text-sm leading-relaxed mb-2">
            Thank you for booking with Jaye Safaris. Our team will contact you at{" "}
            <strong>{form.email}</strong> shortly to finalise your itinerary and payment.
          </p>
          {selectedDeparture && (
            <div className="my-6 p-4 bg-amber-50 rounded-2xl border border-amber-100 text-sm text-stone-700 text-left space-y-1">
              <p><span className="font-semibold">Departure:</span> {fmt(selectedDeparture.departureDate)}</p>
              <p><span className="font-semibold">Duration:</span> {duration(selectedDeparture)}</p>
              <p><span className="font-semibold">Travelers:</span> {totalTravelers} ({form.adults}A · {form.kids}K · {form.infants}I)</p>
            </div>
          )}
          <button
            onClick={() => navigate("/")}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-amber-200"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-stone-50 pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-stone-400 hover:text-amber-600 transition-colors mb-8 group"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Package</span>
        </button>

        <div className="grid lg:grid-cols-5 gap-10">
          {/* ── Main Form ─────────────────────────────────────────────────── */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
              {/* Header + progress */}
              <div className="p-8 border-b border-stone-50 bg-stone-900 text-white relative overflow-hidden">
                <div className="relative z-10 flex justify-between items-center">
                  <div>
                    <h1
                      className="text-3xl font-light mb-2"
                      style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    >
                      Reserve Your Safari
                    </h1>
                    <p className="text-stone-400 text-xs uppercase tracking-widest font-semibold flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Secure your adventure today
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-amber-400 font-bold text-xl">{step}</span>
                    <span className="text-stone-500 text-sm">/3</span>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-stone-800">
                  <div
                    className="h-full bg-amber-500 transition-all duration-500"
                    style={{ width: `${(step / 3) * 100}%` }}
                  />
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
              </div>

              <div className="p-8 space-y-8">
                {/* Error banner */}
                {error && (
                  <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* ── Step 1: Personal Details ───────────────────────────── */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold text-xs">
                        1
                      </div>
                      <h3 className="font-bold text-stone-800 tracking-tight">Personal Details</h3>
                    </div>

                    <div className="grid md:grid-cols-2 gap-5">
                      <div>
                        <SectionLabel required>Full Name</SectionLabel>
                        <TextInput
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          placeholder="e.g. David Kinuthia"
                          required
                        />
                      </div>
                      <div>
                        <SectionLabel required>Email Address</SectionLabel>
                        <TextInput
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="david@example.com"
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <SectionLabel required>Phone / WhatsApp</SectionLabel>
                        <TextInput
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                          placeholder="+254 7XX XXX XXX"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Step 2: Select Departure + Travelers ──────────────── */}
                {step === 2 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold text-xs">
                        2
                      </div>
                      <h3 className="font-bold text-stone-800 tracking-tight">Select Departure & Travelers</h3>
                    </div>

                    {/* Departure picker */}
                    <div>
                      <SectionLabel required>Available Departures</SectionLabel>
                      {departuresLoading ? (
                        <div className="flex items-center gap-3 py-8 justify-center text-stone-400 animate-pulse">
                          <Loader2 size={18} className="animate-spin" />
                          <span className="text-sm">Loading available dates…</span>
                        </div>
                      ) : departures.length === 0 ? (
                        <div className="p-6 bg-stone-50 rounded-2xl border border-stone-100 text-center text-stone-400 text-sm">
                          No upcoming departures available for this package.
                          <br />
                          <span className="text-xs">Please contact us for a custom date.</span>
                        </div>
                      ) : (
                        <div className="grid gap-3">
                          {departures.map((dep) => {
                            const available = dep.totalSlots - dep.bookedSlots;
                            const isSelected = selectedDeparture?._id === dep._id;
                            const isFull = dep.status === "full" || available <= 0;
                            return (
                              <button
                                key={dep._id}
                                type="button"
                                disabled={isFull}
                                onClick={() => {
                                  setSelectedDeparture(dep);
                                  setError(null);
                                }}
                                className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                                  isFull
                                    ? "border-stone-100 bg-stone-50 opacity-50 cursor-not-allowed"
                                    : isSelected
                                    ? "border-amber-400 bg-amber-50 shadow-md shadow-amber-100"
                                    : "border-stone-100 bg-white hover:border-amber-200 hover:bg-amber-50/30"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    {isSelected && (
                                      <CheckCircle size={16} className="text-amber-500 shrink-0" />
                                    )}
                                    <div>
                                      <p className="font-bold text-stone-800 text-sm">
                                        {fmt(dep.departureDate)}
                                        <span className="text-stone-400 font-normal mx-1.5">→</span>
                                        {fmt(dep.endDate)}
                                      </p>
                                      <p className="text-[11px] text-stone-400 mt-0.5">
                                        {duration(dep)} ·{" "}
                                        {dep.priceOverride || "Package price applies"}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right shrink-0 ml-4">
                                    {isFull ? (
                                      <span className="text-[10px] font-bold text-orange-500 uppercase bg-orange-50 px-2 py-0.5 rounded-full">
                                        Full
                                      </span>
                                    ) : (
                                      <span className="text-[10px] font-bold text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded-full">
                                        {available} slot{available !== 1 ? "s" : ""} left
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Traveler count */}
                    <div>
                      <SectionLabel required>Number of Travelers</SectionLabel>
                      <div className="grid grid-cols-3 gap-6 bg-stone-50 p-6 rounded-2xl border border-stone-100">
                        <TravelerStepper
                          label="Adults"
                          sublabel="18+"
                          name="adults"
                          value={form.adults}
                          onChange={handleStepperChange}
                          min={1}
                        />
                        <TravelerStepper
                          label="Kids"
                          sublabel="2–17"
                          name="kids"
                          value={form.kids}
                          onChange={handleStepperChange}
                        />
                        <TravelerStepper
                          label="Infants"
                          sublabel="Under 2"
                          name="infants"
                          value={form.infants}
                          onChange={handleStepperChange}
                        />
                      </div>
                      {selectedDeparture && (
                        <p className="text-xs text-stone-400 mt-2 px-1">
                          {totalTravelers} traveler{totalTravelers !== 1 ? "s" : ""} ·{" "}
                          {selectedDeparture.totalSlots - selectedDeparture.bookedSlots - totalTravelers >= 0
                            ? `${selectedDeparture.totalSlots - selectedDeparture.bookedSlots - totalTravelers} slot(s) would remain`
                            : <span className="text-rose-500 font-semibold">Exceeds available slots</span>
                          }
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* ── Step 3: Notes + Review ─────────────────────────────── */}
                {step === 3 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold text-xs">
                        3
                      </div>
                      <h3 className="font-bold text-stone-800 tracking-tight">Review & Notes</h3>
                    </div>

                    <div>
                      <SectionLabel>Special Requests / Notes</SectionLabel>
                      <textarea
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Dietary requirements, accessibility needs, specific interests…"
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-400/40 transition-all text-sm resize-none"
                      />
                    </div>

                    {/* Summary card */}
                    <div className="bg-stone-50 rounded-2xl border border-stone-100 divide-y divide-stone-100 text-sm">
                      {[
                        ["Name",       form.name],
                        ["Email",      form.email],
                        ["Phone",      form.phone],
                        ["Package",    packageTitle || "Safari Package"],
                        [
                          "Departure",
                          selectedDeparture
                            ? `${fmt(selectedDeparture.departureDate)} → ${fmt(selectedDeparture.endDate)}`
                            : "—",
                        ],
                        [
                          "Travelers",
                          `${form.adults} Adult${form.adults !== 1 ? "s" : ""} · ${form.kids} Kid${form.kids !== 1 ? "s" : ""} · ${form.infants} Infant${form.infants !== 1 ? "s" : ""}`,
                        ],
                      ].map(([label, value]) => (
                        <div key={label} className="flex justify-between px-5 py-3">
                          <span className="text-stone-400 font-medium">{label}</span>
                          <span className="text-stone-800 font-semibold text-right max-w-[60%] truncate">{value}</span>
                        </div>
                      ))}
                    </div>

                    <div className="bg-amber-50 p-4 rounded-xl text-xs text-amber-800 leading-relaxed border border-amber-100">
                      <p className="font-bold mb-1">No payment required now.</p>
                      We'll verify your booking and send a formal quote to <strong>{form.email}</strong>.
                    </div>
                  </div>
                )}

                {/* ── Navigation ────────────────────────────────────────── */}
                <div className="flex items-center gap-4 pt-4 border-t border-stone-100">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 group"
                    >
                      <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                      Back
                    </button>
                  )}

                  {step < 3 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="flex-1 bg-amber-500 hover:bg-stone-900 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-amber-200/50 flex items-center justify-center gap-3 group"
                    >
                      Next Step
                      <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="flex-[2] bg-amber-500 hover:bg-stone-900 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-amber-200/50 flex items-center justify-center gap-3 disabled:opacity-60 group"
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={18} className="animate-spin" /> Processing…
                        </>
                      ) : (
                        <>
                          Confirm Request
                          <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Sidebar Summary ───────────────────────────────────────────── */}
          <div className="lg:col-span-2 hidden lg:block">
            <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-8 sticky top-36 space-y-6">
              <h3 className="font-bold text-stone-800 flex items-center gap-2">
                <Package size={20} className="text-amber-500" /> Your Selection
              </h3>

              {/* Package */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100">
                <p className="text-xs text-stone-400 uppercase tracking-widest font-bold mb-1">Adventure</p>
                <p className="text-stone-800 font-bold leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {packageTitle || "Custom Tailored Safari"}
                </p>
              </div>

              {/* Selected departure */}
              {selectedDeparture ? (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 space-y-2">
                  <p className="text-xs text-amber-600 uppercase tracking-widest font-bold">Departure</p>
                  <p className="text-sm font-bold text-stone-800">
                    {fmt(selectedDeparture.departureDate)}
                  </p>
                  <p className="text-xs text-stone-500">
                    to {fmt(selectedDeparture.endDate)} · {duration(selectedDeparture)}
                  </p>
                  {selectedDeparture.priceOverride && (
                    <p className="text-xs font-semibold text-amber-700">{selectedDeparture.priceOverride}</p>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-stone-50 rounded-2xl border border-dashed border-stone-200 text-center text-xs text-stone-400">
                  <Calendar size={20} className="mx-auto mb-2 text-stone-300" />
                  Select a departure date in step 2
                </div>
              )}

              {/* Traveler summary */}
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-stone-500 flex items-center gap-1.5">
                    <Users size={14} /> Total Travelers
                  </span>
                  <span className="text-stone-800 font-bold">{totalTravelers}</span>
                </div>
                {totalTravelers > 0 && (
                  <p className="text-xs text-stone-400 text-right">
                    {form.adults}A · {form.kids}K · {form.infants}I
                  </p>
                )}
              </div>

              {/* No payment note */}
              <div className="pt-4 border-t border-dashed border-stone-200">
                <div className="bg-amber-50 p-4 rounded-xl text-xs text-amber-800 leading-relaxed border border-amber-100/50">
                  <p className="font-bold mb-1">No payment required now.</p>
                  We verify availability and send a formal quote before any payment is taken.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;