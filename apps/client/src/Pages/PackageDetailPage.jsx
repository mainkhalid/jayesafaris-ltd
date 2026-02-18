import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Clock, DollarSign, MapPin, ChevronDown, ChevronUp,
  ArrowLeft, Calendar, CheckCircle, Star, Share2, Heart,
  Sunrise, Camera, Users, Shield
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

const FontLink = () => (
  <link
     href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet"
  />
);

const usePackage = (id) => {
  const [pkg, setPkg]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`${API_BASE}/packages/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error(`Error ${r.status}`);
        return r.json();
      })
      .then(({ data }) => setPkg(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  return { pkg, loading, error };
};


const DayCard = ({ day, index, isOpen, onToggle }) => {
  const ICONS = ["🌅", "🦁", "🐘", "🌿", "🏔️", "🌊", "🦒", "🌄"];
  const icon  = ICONS[index % ICONS.length];

  return (
    <div
      className={`border-l-2 transition-all duration-300 ${
        isOpen ? "border-amber-500" : "border-stone-200 hover:border-amber-300"
      }`}
      style={{ marginLeft: "1rem" }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 px-6 py-5 text-left group"
      >
        {/* Timeline dot */}
        <div
          className={`absolute -left-[1.35rem] w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs transition-all ${
            isOpen
              ? "bg-amber-500 border-amber-500 text-white"
              : "bg-white border-stone-300 group-hover:border-amber-400"
          }`}
          style={{ position: "relative", left: "-2.05rem", flexShrink: 0 }}
        >
          {isOpen ? "✓" : index + 1}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-semibold tracking-[0.15em] text-amber-600 uppercase">
              Day {day.dayNumber ?? index + 1}
            </span>
          </div>
          <h4 className="text-base font-semibold text-stone-800 leading-snug" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            {day.title || "Safari Day"}
          </h4>
        </div>

        <span className="text-2xl shrink-0">{icon}</span>
        <div className="shrink-0 text-stone-400">
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {isOpen && (
        <div className="px-6 pb-6 ml-2">
          <p className="text-stone-600 text-sm leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {day.description || "Details for this day will be shared upon booking."}
          </p>
        </div>
      )}
    </div>
  );
};

// ─── Inclusion badge ──────────────────────────────────────────────────────────
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

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Skeleton = () => (
  <div className="min-h-screen bg-stone-50 animate-pulse">
    <div className="h-[60vh] bg-gray-200" />
    <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-3 gap-12">
      <div className="col-span-2 space-y-6">
        <div className="h-8 bg-gray-200 rounded w-2/3" />
        <div className="h-4 bg-gray-100 rounded w-full" />
        <div className="h-4 bg-gray-100 rounded w-5/6" />
      </div>
      <div className="space-y-4">
        <div className="h-48 bg-gray-200 rounded-2xl" />
      </div>
    </div>
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────
const PackageDetailPage = () => {
  const { id } = useParams();
  const { pkg, loading, error } = usePackage(id);
  const [openDays, setOpenDays] = useState({ 0: true });
  const [liked, setLiked]       = useState(false);
  const [heroLoaded, setHeroLoaded] = useState(false);
  const heroRef = useRef(null);

  const toggleDay = (i) =>
    setOpenDays((prev) => ({ ...prev, [i]: !prev[i] }));

  const expandAll   = () =>
    setOpenDays(Object.fromEntries((pkg?.days ?? []).map((_, i) => [i, true])));
  const collapseAll = () => setOpenDays({});

  if (loading) return <><FontLink /><Skeleton /></>;

  if (error || !pkg) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-stone-50">
      <FontLink />
      <p className="text-stone-500 text-lg">Package not found.</p>
      <Link to="/packages" className="text-amber-600 font-semibold underline">
        ← Back to packages
      </Link>
    </div>
  );

  const heroImage   = pkg.thumbnail?.url ?? "";
  const hasDays     = pkg.days?.length > 0;
  const hasInclusions = pkg.inclusions?.length > 0;
  const anyOpen     = Object.values(openDays).some(Boolean);

  return (
    <>
      <FontLink />
      <style>{`
        :root {
          --olive: #5d723c;
          --olive-dark: #4a5b30;
          --amber: #d48c5c;
          --stone: #78716c;
        }
        .hero-text { font-family: 'Cormorant Garamond', serif; }
        .body-text  { font-family: 'DM Sans', sans-serif; }
        .parallax-hero {
          background-attachment: fixed;
          background-size: cover;
          background-position: center;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.7s ease both; }
        .fade-up-1 { animation-delay: 0.1s; }
        .fade-up-2 { animation-delay: 0.25s; }
        .fade-up-3 { animation-delay: 0.4s; }
        .fade-up-4 { animation-delay: 0.55s; }
      `}</style>

      <div className="min-h-screen bg-stone-50">

        {/* ── Hero ── */}
        <div className="relative h-[75vh] overflow-hidden">
          {heroImage ? (
            <img
              src={heroImage}
              alt={pkg.title}
              onLoad={() => setHeroLoaded(true)}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 scale-105 ${
                heroLoaded ? "opacity-100 scale-100" : "opacity-0"
              }`}
              style={{ transform: "scale(1.05)" }}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-stone-700 to-stone-900" />
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

          {/* Top nav bar */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-8 py-6 z-10">
            <Link
              to="/"
              className="flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium transition-colors body-text"
            >
              <ArrowLeft size={16} /> All Packages
            </Link>
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

          {/* Hero content */}
          <div className="absolute bottom-0 left-0 right-0 px-8 pb-14 z-10 max-w-5xl">
            {pkg.country && (
              <div className="fade-up fade-up-1 inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full bg-amber-500/20 backdrop-blur-sm border border-amber-400/30">
                <MapPin size={11} className="text-amber-400" />
                <span className="text-amber-300 text-xs font-semibold tracking-widest uppercase body-text">
                  {pkg.country}
                </span>
              </div>
            )}
            <h1 className="hero-text fade-up fade-up-2 text-4xl md:text-6xl font-light text-white leading-tight mb-4" style={{ maxWidth: "720px" }}>
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
          </div>
        </div>

        {/* ── Body ── */}
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* ── Left: Main content ── */}
            <div className="lg:col-span-2 space-y-14">

              {/* Overview */}
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

              {/* Quick highlights row */}
              <section className="fade-up fade-up-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { icon: Sunrise,  label: "Wildlife", value: "Daily drives" },
                  { icon: Camera,   label: "Photography", value: "All access" },
                  { icon: Users,    label: "Group size", value: "Small groups" },
                  { icon: Shield,   label: "Safety", value: "Expert guides" },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-white rounded-xl p-4 border border-stone-100 shadow-sm text-center">
                    <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center mx-auto mb-2">
                      <Icon size={16} className="text-amber-600" />
                    </div>
                    <p className="body-text text-[10px] font-bold text-stone-400 uppercase tracking-wider">{label}</p>
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
                    <div className="flex gap-3 body-text">
                      <button
                        onClick={anyOpen ? collapseAll : expandAll}
                        className="text-xs text-amber-600 hover:text-amber-700 font-semibold underline underline-offset-2 transition-colors"
                      >
                        {anyOpen ? "Collapse all" : "Expand all"}
                      </button>
                    </div>
                  </div>

                  {/* Timeline */}
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
                    {/* End cap */}
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
            </div>

            {/* ── Right: Sticky booking card ── */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-4">
                {/* Booking card */}
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

                  <div className="px-6 py-6 space-y-3">
                    <Link to="/inquiry-form" state={{ packageTitle: pkg.title, packageId: pkg._id }}>
                      <button className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 rounded-xl transition-colors body-text text-sm shadow-sm shadow-amber-200">
                        Book This Safari
                      </button>
                    </Link>
                    <Link to="/inquiry-form" state={{ packageTitle: pkg.title, packageId: pkg._id }}>
                      <button className="w-full border-2 border-stone-200 hover:border-stone-900 text-stone-700 hover:text-stone-900 font-semibold py-3 rounded-xl transition-all body-text text-sm">
                        Request Custom Quote
                      </button>
                    </Link>

                    <p className="body-text text-center text-stone-400 text-xs pt-1">
                      Free cancellation · No booking fees
                    </p>
                  </div>
                </div>

                {/* Trust badges */}
                <div className="bg-white rounded-2xl border border-stone-100 shadow-sm px-6 py-5 space-y-3">
                  {[
                    { icon: Star,   text: "Rated 4.9 by 200+ travellers" },
                    { icon: Shield, text: "Certified local guides" },
                    { icon: Users,  text: "Small private groups" },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                        <Icon size={13} className="text-amber-600" />
                      </div>
                      <span className="body-text text-xs text-stone-600">{text}</span>
                    </div>
                  ))}
                </div>

                {/* Related info */}
                {pkg.country && (
                  <div className="text-center">
                    <Link
                      to={`/destinations/${pkg.country.toLowerCase()}`}
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

        {/* ── Bottom CTA banner ── */}
        <div className="bg-stone-900 py-16 px-6 text-center mt-8">
          <h3 className="hero-text text-3xl md:text-4xl font-light text-white mb-3">
            Ready for your African adventure?
          </h3>
          <p className="body-text text-stone-400 text-sm mb-8 max-w-md mx-auto">
            Our safari experts will tailor every detail to your dream itinerary.
          </p>
          <Link to="/inquiry-form" state={{ packageTitle: pkg.title }}>
            <button className="bg-amber-500 hover:bg-amber-400 text-white font-bold px-10 py-4 rounded-xl transition-colors body-text shadow-lg shadow-amber-900/30">
              Start Planning Now
            </button>
          </Link>
        </div>

      </div>
    </>
  );
};

export default PackageDetailPage;