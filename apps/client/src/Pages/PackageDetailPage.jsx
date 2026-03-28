import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Clock, DollarSign, MapPin, ChevronDown, ChevronUp,
  ArrowLeft, Calendar, CheckCircle, Star, Share2, Heart,
  Sunrise, Camera, Users, Shield, Sparkles, MessageSquare,
} from "lucide-react";
import { useDepartures } from "../hooks/useDepartures";

const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

const FontLink = () => (
  <link
    href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@400;500;600;700&display=swap"
    rel="stylesheet"
  />
);

// ── Package data hook ─────────────────────────────────────────────────────────
const usePackage = (id) => {
  const [pkg,     setPkg]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`${API_BASE}/packages/${id}`)
      .then((r) => { if (!r.ok) throw new Error(`Error ${r.status}`); return r.json(); })
      .then(({ data }) => setPkg(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  return { pkg, loading, error };
};

// ── Build inquiry URL with all package context ────────────────────────────────
const buildInquiryUrl = (pkg) => {
  if (!pkg) return "/inquiry-form";
  const params = new URLSearchParams({
    packageId:   pkg._id,
    title:       pkg.title,
    destination: pkg.country  || "",
    duration:    pkg.duration || "",
  });
  return `/inquiry-form?${params.toString()}`;
};

// ── Day accordion card ────────────────────────────────────────────────────────
const ICONS = ["🌅", "🦁", "🐘", "🌿", "🏔️", "🌊", "🦒", "🌄", "🦓", "🐆"];

const DayCard = ({ day, index, isOpen, onToggle }) => (
  <div
    className={`transition-all duration-300 ${
      isOpen ? "border-l-2 border-amber-500" : "border-l-2 border-stone-200 hover:border-amber-300"
    }`}
    style={{ marginLeft: "1rem" }}
  >
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-4 px-6 py-5 text-left group"
    >
      {/* Timeline dot — inline-flex avoids the conflicting absolute/relative fight */}
      <div
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs shrink-0 transition-all ${
          isOpen
            ? "bg-amber-500 border-amber-500 text-white"
            : "bg-white border-stone-300 text-stone-500 group-hover:border-amber-400"
        }`}
        style={{ marginLeft: "-2.15rem" }}
      >
        {isOpen ? "✓" : index + 1}
      </div>

      <div className="flex-1 min-w-0">
        <span className="text-[10px] font-semibold tracking-[0.15em] text-amber-600 uppercase">
          Day {day.dayNumber ?? index + 1}
        </span>
        <h4
          className="text-base font-semibold text-stone-800 leading-snug truncate"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          {day.title || "Safari Day"}
        </h4>
      </div>

      <span className="text-2xl shrink-0">{ICONS[index % ICONS.length]}</span>
      <span className="shrink-0 text-stone-400">
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </span>
    </button>

    {isOpen && (
      <div className="px-6 pb-6 ml-8">
        <p
          className="text-stone-600 text-sm leading-relaxed"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {day.description || "Details for this day will be shared upon booking."}
        </p>
      </div>
    )}
  </div>
);

// ── Inclusions ────────────────────────────────────────────────────────────────
const InclusionBadge = ({ item }) => (
  <div className="flex items-center gap-3 py-3 border-b border-stone-100 last:border-0">
    <div className="w-10 h-10 rounded-lg overflow-hidden bg-stone-100 shrink-0">
      {item.image?.url ? (
        <img src={item.image.url} alt="" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <CheckCircle size={16} className="text-amber-500" />
        </div>
      )}
    </div>
    <span className="text-sm text-stone-700" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {item.description}
    </span>
  </div>
);

// ── Loading skeleton ──────────────────────────────────────────────────────────
const Skeleton = () => (
  <div className="min-h-screen bg-stone-50 animate-pulse">
    <div className="h-[60vh] bg-stone-200" />
    <div className="max-w-6xl mx-auto px-6 py-16 grid lg:grid-cols-3 gap-12">
      <div className="lg:col-span-2 space-y-6">
        <div className="h-8 bg-stone-200 rounded w-2/3" />
        <div className="h-4 bg-stone-100 rounded w-full" />
        <div className="h-4 bg-stone-100 rounded w-5/6" />
      </div>
      <div className="space-y-4">
        <div className="h-48 bg-stone-200 rounded-2xl" />
      </div>
    </div>
  </div>
);

// ── Upcoming departures widget ────────────────────────────────────────────────
const UpcomingDepartures = ({ departures, loading, pkg }) => {
  const fmt = (d) =>
    new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

  if (loading)
    return (
      <div className="space-y-2">
        {[1, 2].map((n) => (
          <div key={n} className="h-12 rounded-xl bg-stone-100 animate-pulse" />
        ))}
      </div>
    );

  if (!departures || departures.length === 0)
    return (
      <div className="text-center py-4 bg-stone-50 rounded-xl border border-stone-100">
        <p className="text-xs text-stone-400 font-medium">No scheduled departures</p>
        <Link
          to={buildInquiryUrl(pkg)}
          className="text-xs text-amber-600 font-bold hover:underline mt-1 inline-flex items-center gap-1"
        >
          <Sparkles size={11} /> Request a custom date
        </Link>
      </div>
    );

  const open  = departures.filter((d) => d.status === "open");
  const full  = departures.filter((d) => d.status === "full");
  const shown = [...open, ...full].slice(0, 3);

  return (
    <div className="space-y-2">
      {shown.map((dep) => {
        const available = dep.totalSlots - dep.bookedSlots;
        const isFull    = dep.status === "full";

        // Build booking URL with both packageId AND departureId so BookingPage
        // can pre-select this exact departure
        const bookingUrl = `/booking?packageId=${pkg._id}&title=${encodeURIComponent(pkg.title)}&departureId=${dep._id}`;

        if (isFull) {
          // Non-navigable — render a div so we don't pollute history with "#"
          return (
            <div
              key={dep._id}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-stone-100 bg-stone-50 opacity-60 cursor-not-allowed"
            >
              <div className="flex items-center gap-2">
                <Calendar size={13} className="text-stone-400 shrink-0" />
                <span className="text-sm font-semibold text-stone-500">{fmt(dep.departureDate)}</span>
              </div>
              <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                Full
              </span>
            </div>
          );
        }

        return (
          <Link
            key={dep._id}
            to={bookingUrl}
            className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-stone-100 hover:border-amber-300 hover:bg-amber-50/50 transition-all"
          >
            <div className="flex items-center gap-2">
              <Calendar size={13} className="text-amber-500 shrink-0" />
              <span className="text-sm font-semibold text-stone-800">{fmt(dep.departureDate)}</span>
              <span className="text-[10px] text-stone-400">
                → {fmt(dep.endDate)}
              </span>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full whitespace-nowrap">
              {available} slot{available !== 1 ? "s" : ""} left
            </span>
          </Link>
        );
      })}

      {departures.length > 3 && (
        <p className="text-[10px] text-stone-400 text-center pt-1">
          +{departures.length - 3} more dates available
        </p>
      )}
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────
const PackageDetailPage = () => {
  const { id }   = useParams();
  const navigate = useNavigate();

  const { pkg, loading, error }          = usePackage(id);
  const { departures = [], loading: depsLoading } = useDepartures(id); // default to [] to avoid .some() crash

  const [openDays,   setOpenDays]   = useState({ 0: true });
  const [liked,      setLiked]      = useState(false);
  const [heroLoaded, setHeroLoaded] = useState(false);

  const toggleDay   = (i) => setOpenDays((p) => ({ ...p, [i]: !p[i] }));
  const expandAll   = ()  => setOpenDays(Object.fromEntries((pkg?.days ?? []).map((_, i) => [i, true])));
  const collapseAll = ()  => setOpenDays({});

  if (loading) return <><FontLink /><Skeleton /></>;
  if (error || !pkg)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-stone-50">
        <FontLink />
        <p className="text-stone-500 text-lg">Package not found.</p>
        <Link to="/" className="text-amber-600 font-semibold underline">
          ← Back to home
        </Link>
      </div>
    );

  const heroImage     = pkg.thumbnail?.url ?? "";
  const hasDays       = pkg.days?.length > 0;
  const hasInclusions = pkg.inclusions?.length > 0;
  const anyOpen       = Object.values(openDays).some(Boolean);
  const hasOpenDeps   = departures.some((d) => d.status === "open");

  // Pre-built URLs used in multiple places
  const inquiryUrl = buildInquiryUrl(pkg);
  const bookingUrl = `/booking?packageId=${pkg._id}&title=${encodeURIComponent(pkg.title)}`;

  return (
    <>
      <FontLink />
      <style>{`
        .hero-text { font-family: 'Cormorant Garamond', serif; }
        .body-text  { font-family: 'DM Sans', sans-serif; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up   { animation: fadeUp 0.7s ease both; }
        .fade-up-1 { animation-delay: 0.1s; }
        .fade-up-2 { animation-delay: 0.25s; }
        .fade-up-3 { animation-delay: 0.4s; }
        .fade-up-4 { animation-delay: 0.55s; }
      `}</style>

      <div className="min-h-screen bg-stone-50">

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <div className="relative h-[75vh] overflow-hidden">
          {heroImage ? (
            <img
              src={heroImage}
              alt={pkg.title}
              onLoad={() => setHeroLoaded(true)}
              className="absolute inset-0 w-full h-full object-cover transition-all duration-1000"
              // Fix: don't set inline transform — let the loaded state control both opacity AND scale
              style={{
                opacity:   heroLoaded ? 1 : 0,
                transform: heroLoaded ? "scale(1)"    : "scale(1.06)",
              }}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-stone-700 to-stone-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

          {/* Top nav bar */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-8 py-6 z-10">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium transition-colors body-text"
            >
              <ArrowLeft size={16} /> All Packages
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setLiked(!liked)}
                className={`w-10 h-10 rounded-full backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all ${
                  liked ? "bg-red-500 border-red-500" : "bg-white/10 hover:bg-white/20"
                }`}
              >
                <Heart size={16} className={liked ? "text-white fill-white" : "text-white"} />
              </button>
              <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 flex items-center justify-center transition-all">
                <Share2 size={16} className="text-white" />
              </button>
            </div>
          </div>

          {/* Hero text */}
          <div className="absolute bottom-0 left-0 right-0 px-8 pb-14 z-10 max-w-5xl">
            {pkg.country && (
              <div className="fade-up fade-up-1 inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full bg-amber-500/20 backdrop-blur-sm border border-amber-400/30">
                <MapPin size={11} className="text-amber-400" />
                <span className="text-amber-300 text-xs font-semibold tracking-widest uppercase body-text">
                  {pkg.country}
                </span>
              </div>
            )}
            <h1
              className="hero-text fade-up fade-up-2 text-4xl md:text-6xl font-light text-white leading-tight mb-4"
              style={{ maxWidth: "720px" }}
            >
              {pkg.title}
            </h1>
            <div className="fade-up fade-up-3 flex flex-wrap items-center gap-6 text-white/70 body-text text-sm">
              {pkg.duration && (
                <span className="flex items-center gap-1.5">
                  <Clock size={14} className="text-amber-400" /> {pkg.duration}
                </span>
              )}
              {pkg.price && (
                <span className="flex items-center gap-1.5">
                  <DollarSign size={14} className="text-amber-400" /> From {pkg.price}
                </span>
              )}
              {hasDays && (
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-amber-400" /> {pkg.days.length} days planned
                </span>
              )}
            </div>

            {/* Hero CTA — "Plan This Safari" → inquiry form with pre-filled context */}
            <div className="fade-up fade-up-4 mt-6 flex flex-wrap gap-3">
              <Link to={inquiryUrl}>
                <button className="body-text inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-lg shadow-amber-900/30">
                  <MessageSquare size={15} /> Plan This Safari
                </button>
              </Link>
              {hasOpenDeps && (
                <Link to={bookingUrl}>
                  <button className="body-text inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all">
                    Book a Departure
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ── Body ─────────────────────────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* ── Left: main content ────────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-14">

              {/* Description */}
              {pkg.description && (
                <section className="fade-up fade-up-1">
                  <h2 className="hero-text text-3xl font-light text-stone-800 mb-5">
                    About This Safari
                  </h2>
                  <p className="body-text text-stone-600 leading-relaxed text-base">
                    {pkg.description}
                  </p>
                </section>
              )}

              {/* Highlight tiles */}
              <section className="fade-up fade-up-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { icon: Sunrise,  label: "Wildlife",   value: "Daily drives"   },
                  { icon: Camera,   label: "Photography",value: "All access"     },
                  { icon: Users,    label: "Group size", value: "Small groups"   },
                  { icon: Shield,   label: "Safety",     value: "Expert guides"  },
                ].map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="bg-white rounded-xl p-4 border border-stone-100 shadow-sm text-center"
                  >
                    <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center mx-auto mb-2">
                      <Icon size={16} className="text-amber-600" />
                    </div>
                    <p className="body-text text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                      {label}
                    </p>
                    <p className="body-text text-sm font-semibold text-stone-700 mt-0.5">{value}</p>
                  </div>
                ))}
              </section>

              {/* Itinerary */}
              {hasDays && (
                <section className="fade-up fade-up-3">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="hero-text text-3xl font-light text-stone-800">
                      Day-by-Day Itinerary
                    </h2>
                    <button
                      onClick={anyOpen ? collapseAll : expandAll}
                      className="text-xs text-amber-600 hover:text-amber-700 font-semibold underline underline-offset-2 transition-colors body-text"
                    >
                      {anyOpen ? "Collapse all" : "Expand all"}
                    </button>
                  </div>
                  <div className="relative border-l-2 border-stone-200 ml-4 space-y-1">
                    {pkg.days.map((day, i) => (
                      <DayCard
                        key={day._id ?? i}
                        day={day}
                        index={i}
                        isOpen={!!openDays[i]}
                        onToggle={() => toggleDay(i)}
                      />
                    ))}
                    <div className="absolute -bottom-1 -left-[5px] w-2.5 h-2.5 rounded-full bg-amber-500" />
                  </div>
                </section>
              )}

              {/* Inclusions */}
              {hasInclusions && (
                <section className="fade-up fade-up-4">
                  <h2 className="hero-text text-3xl font-light text-stone-800 mb-6">
                    What's Included
                  </h2>
                  <div className="bg-white rounded-2xl border border-stone-100 shadow-sm px-6 divide-y divide-stone-50">
                    {pkg.inclusions.map((item, i) => (
                      <InclusionBadge key={item._id ?? i} item={item} />
                    ))}
                  </div>
                </section>
              )}

              {/* Plan Safari inline CTA (below itinerary, before the sidebar becomes visible on mobile) */}
              <section className="fade-up fade-up-4 bg-gradient-to-br from-stone-900 to-stone-800 rounded-3xl p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
                <div className="relative z-10">
                  <p className="body-text text-amber-400 text-xs font-bold uppercase tracking-widest mb-2">
                    Ready to go?
                  </p>
                  <h3 className="hero-text text-2xl font-light text-white mb-3">
                    Start planning your {pkg.title}
                  </h3>
                  <p className="body-text text-stone-400 text-sm mb-6 max-w-sm">
                    Tell us your travel dates, group size and budget — we'll do the rest.
                    Destination and duration are already filled in for you.
                  </p>
                  <Link to={inquiryUrl}>
                    <button className="body-text inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-lg shadow-amber-900/40">
                      <MessageSquare size={15} /> Plan This Safari
                    </button>
                  </Link>
                </div>
              </section>
            </div>

            {/* ── Right: sticky booking card ────────────────────────────────── */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-4">
                <div className="bg-white rounded-2xl border border-stone-100 shadow-lg overflow-hidden">

                  {/* Card header */}
                  <div className="bg-gradient-to-br from-stone-800 to-stone-900 px-6 py-6">
                    {pkg.price && (
                      <div className="mb-1">
                        <span className="hero-text text-3xl font-light text-white">{pkg.price}</span>
                        <span className="body-text text-white/50 text-sm ml-1">/ person</span>
                      </div>
                    )}
                    {pkg.duration && (
                      <p className="body-text text-white/60 text-xs flex items-center gap-1.5">
                        <Clock size={11} /> {pkg.duration}
                      </p>
                    )}
                  </div>

                  <div className="px-6 py-5 space-y-5">

                    {/* Upcoming departures */}
                    <div>
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">
                        Upcoming Departures
                      </p>
                      <UpcomingDepartures
                        departures={departures}
                        loading={depsLoading}
                        pkg={pkg}
                      />
                    </div>

                    {/* Action buttons */}
                    <div className="pt-1 space-y-2">
                      {/* Primary: Plan Safari → inquiry form with context */}
                      <Link to={inquiryUrl}>
                        <button className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 rounded-xl transition-colors body-text text-sm shadow-sm shadow-amber-200 flex items-center justify-center gap-2">
                          <MessageSquare size={15} /> Plan This Safari
                        </button>
                      </Link>

                      {/* Secondary: Book a specific departure (only if open ones exist) */}
                      {hasOpenDeps && (
                        <Link to={bookingUrl}>
                          <button className="w-full border-2 border-stone-200 hover:border-amber-500 hover:text-amber-700 text-stone-700 font-semibold py-3 rounded-xl transition-all body-text text-sm">
                            Book a Departure
                          </button>
                        </Link>
                      )}

                      <p className="body-text text-center text-stone-400 text-xs pt-1">
                        Free consultation · No booking fees
                      </p>
                    </div>
                  </div>
                </div>

                {/* Trust badges */}
                <div className="bg-white rounded-2xl border border-stone-100 shadow-sm px-6 py-5 space-y-3">
                  {[
                    { icon: Star,   text: "Rated 4.9 by 200+ travellers" },
                    { icon: Shield, text: "Certified local guides"        },
                    { icon: Users,  text: "Small private groups"          },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                        <Icon size={13} className="text-amber-600" />
                      </div>
                      <span className="body-text text-xs text-stone-600">{text}</span>
                    </div>
                  ))}
                </div>

                {pkg.country && (
                  <div className="text-center">
                    <Link
                      to={`/${pkg.country.toLowerCase()}`}
                      className="body-text text-xs text-amber-600 hover:text-amber-700 font-semibold underline underline-offset-2"
                    >
                      Explore more {pkg.country} packages →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom CTA ───────────────────────────────────────────────────── */}
        <div className="bg-stone-900 py-16 px-6 text-center mt-8">
          <h3 className="hero-text text-3xl md:text-4xl font-light text-white mb-3">
            Ready for your African adventure?
          </h3>
          <p className="body-text text-stone-400 text-sm mb-8 max-w-md mx-auto">
            Our safari experts will tailor every detail to your dream itinerary.
          </p>
          {/* Bottom CTA also carries package context */}
          <Link to={inquiryUrl}>
            <button className="bg-amber-500 hover:bg-amber-400 text-white font-bold px-10 py-4 rounded-xl transition-colors body-text shadow-lg shadow-amber-900/30 inline-flex items-center gap-2">
              <MessageSquare size={16} /> Start Planning Now
            </button>
          </Link>
        </div>
      </div>
    </>
  );
};

export default PackageDetailPage;