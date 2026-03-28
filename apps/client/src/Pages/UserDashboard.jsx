import { useState, useEffect, } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate, Link } from "react-router-dom";
import {
  Package, Sparkles, User, Calendar, MapPin,
  Clock, ChevronRight, ArrowRight, LogOut,
} from "lucide-react";
import { UserButton } from "@clerk/clerk-react";
import logo from "../assets/jayesafari.png";


const API = import.meta.env.VITE_API_URL || "/api";

const STATUS_MAP = {
  pending:   { cls: "bg-orange-50 text-orange-700 border-orange-200",    dot: "bg-orange-500"  },
  confirmed: { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  cancelled: { cls: "bg-rose-50 text-rose-700 border-rose-200",          dot: "bg-rose-500"    },
  new:       { cls: "bg-amber-50 text-amber-700 border-amber-200",       dot: "bg-amber-500"   },
  contacted: { cls: "bg-sky-50 text-sky-700 border-sky-200",             dot: "bg-sky-500"     },
  quoted:    { cls: "bg-violet-50 text-violet-700 border-violet-200",    dot: "bg-violet-500"  },
  resolved:  { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_MAP[status] ?? STATUS_MAP.new;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border ${s.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
};

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";

const EmptyState = ({ icon: Icon, title, message, action, onAction }) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
    <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center mb-4">
      <Icon size={24} className="text-stone-300" />
    </div>
    <p className="text-[14px] font-semibold text-stone-700">{title}</p>
    <p className="text-[12px] text-stone-400 mt-1 max-w-xs">{message}</p>
    {action && (
      <button
        onClick={onAction}
        className="mt-5 flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-[13px] font-semibold rounded-xl transition-all shadow-sm"
      >
        {action} <ArrowRight size={14} />
      </button>
    )}
  </div>
);

const UserDashboard = () => {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();

  const [bookings, setBookings]   = useState([]);
  const [quotes, setQuotes]       = useState([]);
  const [loadingB, setLoadingB]   = useState(true);
  const [loadingQ, setLoadingQ]   = useState(true);

  const clerkId = user?.id;

  useEffect(() => {
    if (!clerkId) return;
    fetch(`${API}/bookings?userId=${clerkId}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setBookings(d.data || []))
      .catch(() => {})
      .finally(() => setLoadingB(false));
  }, [clerkId]);

  useEffect(() => {
    if (!clerkId) return;
    fetch(`${API}/custom-quotes?userId=${clerkId}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setQuotes(d.data || []))
      .catch(() => {})
      .finally(() => setLoadingQ(false));
  }, [clerkId]);

  if (!isLoaded) return null;

  const firstName = user?.firstName || user?.username || "Traveler";

  return (
    <div className="min-h-screen bg-stone-50">
      {/* ── Top bar ── */}
      <header className="sticky top-0 z-40 bg-white border-b border-stone-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.04)] h-[60px] flex items-center px-6 justify-between">
        <button onClick={() => navigate("/")} className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
                <img
                  src={logo}
                  alt="Jaye Safaris"
                  className="h-16 w-16 object-contain"
                />
          </Link>
          <span className="text-[13px] font-semibold text-stone-800 hidden sm:block">Jaye Safaris</span>
        </button>
        <div className="flex items-center gap-3">
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-5 py-10 space-y-10">

        {/* ── Welcome header ── */}
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 font-bold text-xl shrink-0">
            {firstName[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-[11px] font-semibold text-amber-600 uppercase tracking-[0.2em]">My Account</p>
            <h1 className="text-[26px] font-bold text-stone-900 leading-tight">
              Welcome back, {firstName}
            </h1>
            <p className="text-[13px] text-stone-400 mt-0.5">{user?.primaryEmailAddress?.emailAddress}</p>
          </div>
        </div>

        {/* ── Quick stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { icon: Package,  label: "Total Bookings", value: loadingB ? "—" : bookings.length,                           color: "text-orange-600", bg: "bg-orange-50" },
            { icon: Sparkles, label: "Quote Requests",  value: loadingQ ? "—" : quotes.length,                            color: "text-amber-600",  bg: "bg-amber-50"  },
            { icon: Clock,    label: "Pending",          value: loadingB ? "—" : bookings.filter((b) => b.status === "pending").length, color: "text-sky-600", bg: "bg-sky-50" },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className="bg-white rounded-2xl border border-stone-200/60 shadow-sm p-5 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                <Icon size={18} className={color} />
              </div>
              <div>
                <p className="text-[22px] font-bold text-stone-900 leading-none">{value}</p>
                <p className="text-[10px] text-stone-400 font-semibold uppercase tracking-[0.14em] mt-1">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── My Bookings ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-bold text-stone-900">My Bookings</h2>
            <button
              onClick={() => navigate("/booking")}
              className="flex items-center gap-1.5 text-[12px] font-semibold text-amber-600 hover:text-amber-700 transition-colors"
            >
              Book a Safari <ChevronRight size={13} />
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200/60 shadow-sm overflow-hidden">
            {loadingB ? (
              <div className="py-14 text-center">
                <div className="w-6 h-6 rounded-full border-2 border-amber-400 border-t-transparent animate-spin mx-auto" />
              </div>
            ) : bookings.length === 0 ? (
              <EmptyState
                icon={Package}
                title="No bookings yet"
                message="Start your East Africa adventure by browsing our safari packages."
                action="Browse Packages"
                onAction={() => navigate("/kenya")}
              />
            ) : (
              <div className="divide-y divide-stone-100">
                {bookings.map((b) => (
                  <div key={b._id} className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-stone-50/40 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-700 font-bold text-[13px] shrink-0">
                        {b.packageTitle?.[0]?.toUpperCase() || "S"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-stone-800 truncate">{b.packageTitle || "Safari Package"}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="flex items-center gap-1 text-[11px] text-stone-400">
                            <Calendar size={10} /> {fmt(b.departureId?.departureDate)}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-stone-400">
                            Booked {fmt(b.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── My Custom Quotes ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-bold text-stone-900">My Quote Requests</h2>
            <button
              onClick={() => navigate("/request-quote")}
              className="flex items-center gap-1.5 text-[12px] font-semibold text-amber-600 hover:text-amber-700 transition-colors"
            >
              New Request <ChevronRight size={13} />
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200/60 shadow-sm overflow-hidden">
            {loadingQ ? (
              <div className="py-14 text-center">
                <div className="w-6 h-6 rounded-full border-2 border-amber-400 border-t-transparent animate-spin mx-auto" />
              </div>
            ) : quotes.length === 0 ? (
              <EmptyState
                icon={Sparkles}
                title="No quote requests"
                message="Tell us your dream safari and our experts will create a bespoke itinerary just for you."
                action="Request a Quote"
                onAction={() => navigate("/request-quote")}
              />
            ) : (
              <div className="divide-y divide-stone-100">
                {quotes.map((q) => (
                  <div key={q._id} className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-stone-50/40 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 font-bold text-[13px] shrink-0">
                        {q.destinations?.[0]?.[0]?.toUpperCase() || "Q"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-stone-800 truncate">
                          {q.destinations?.join(", ") || "Custom Safari"}
                        </p>
                        <div className="flex items-center gap-3 mt-0.5">
                          {q.travelDate && (
                            <span className="flex items-center gap-1 text-[11px] text-stone-400">
                              <Calendar size={10} /> {q.travelDate}
                            </span>
                          )}
                          <span className="text-[11px] text-stone-400">{fmt(q.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <StatusBadge status={q.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── Profile card ── */}
        <section>
          <h2 className="text-[16px] font-bold text-stone-900 mb-4">Profile</h2>
          <div className="bg-white rounded-2xl border border-stone-200/60 shadow-sm p-6 flex items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-700 font-bold text-lg shrink-0">
                {firstName[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-[14px] font-semibold text-stone-800">{user?.fullName || firstName}</p>
                <p className="text-[12px] text-stone-400">{user?.primaryEmailAddress?.emailAddress}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "w-9 h-9 rounded-xl" } }} />
            </div>
          </div>
        </section>

        {/* ── Back to site link ── */}
        <div className="flex justify-center pt-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-[12px] text-stone-400 hover:text-stone-700 transition-colors font-medium"
          >
            ← Back to Jaye Safaris website
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
