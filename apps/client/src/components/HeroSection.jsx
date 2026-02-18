import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";

const images = [
  "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1920&q=80",
  "https://images.unsplash.com/photo-1549366021-9f761d450615?w=1920&q=80",
  "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1920&q=80",
  "https://images.unsplash.com/photo-1534177616072-ef7dc120449d?w=1920&q=80",
  "https://images.unsplash.com/photo-1535338793062-fc6c4db692fd?w=1920&q=80",
];

const DESTINATIONS = [
  "All Destinations",
  "Kenya", "Masai Mara", "Amboseli", "Tsavo",
  "Tanzania", "Serengeti", "Ngorongoro",
  "Uganda", "Zanzibar",
];

const HeroSection = ({ onSearch }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [destination, setDestination]   = useState("");
  const gridRef = useRef(null);

  // Slideshow
  useEffect(() => {
    const t = setInterval(
      () => setCurrentIndex((p) => (p + 1) % images.length),
      5000
    );
    return () => clearInterval(t);
  }, []);

  // Scroll down to PackageGrid and trigger filter
  const handleSearch = () => {
    if (onSearch) onSearch(destination);
    gridRef.current?.scrollIntoView({ behavior: "smooth" });
    // Scroll to the packages section below the hero
    document
      .getElementById("packages-section")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <style>{`
        .hero-title { font-family: 'Cormorant Garamond', serif; }
        .hero-body  { font-family: 'DM Sans', sans-serif; }
        @keyframes kenBurns {
          0%   { transform: scale(1); }
          100% { transform: scale(1.08); }
        }
        .ken-burns { animation: kenBurns 7s ease-in-out forwards; }
      `}</style>

      <div className="relative w-full h-[85vh] overflow-hidden bg-stone-900">

        {/* Slideshow */}
        {images.map((img, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-[2500ms] ease-in-out ${
              i === currentIndex ? "opacity-100 z-0" : "opacity-0"
            }`}
          >
            <div
              className={`absolute inset-0 bg-cover bg-center ${i === currentIndex ? "ken-burns" : ""}`}
              style={{ backgroundImage: `url(${img})` }}
            />
          </div>
        ))}

        {/* Overlay — same as PackageDetailPage hero */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10 z-[1]" />

        {/* Ambient glow */}
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none z-[1]" />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center">

          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="hero-body text-amber-400 text-xs font-semibold tracking-widest uppercase">
              East Africa Safari Specialists
            </span>
          </div>

          {/* Heading */}
          <h1 className="hero-title text-5xl md:text-7xl font-light text-white leading-tight mb-4 max-w-4xl">
            Kenya Safari Tours &{" "}
            <span className="text-amber-400 italic">Holidays</span>
          </h1>

          <p className="hero-body text-stone-300 text-base md:text-lg leading-relaxed max-w-xl mb-10">
            Handcrafted safaris across Kenya, Tanzania, Uganda & Zanzibar.
            Wildlife, culture, and landscapes — unforgettable every time.
          </p>

          {/* Quick destination search */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-lg mb-6">
            <div className="relative flex-1 w-full">
              <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400 pointer-events-none" />
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="hero-body w-full pl-9 pr-4 py-3.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm focus:outline-none focus:border-amber-400/60 appearance-none cursor-pointer"
              >
                {DESTINATIONS.map((d) => (
                  <option key={d} value={d === "All Destinations" ? "" : d.toLowerCase()} className="text-stone-900">
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleSearch}
              className="hero-body w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-bold px-7 py-3.5 rounded-xl transition-all shadow-lg shadow-amber-900/30 text-sm whitespace-nowrap"
            >
              Find Safaris <ArrowRight size={15} />
            </button>
          </div>

          {/* Secondary CTA */}
          <Link to="/inquiry-form">
            <button className="hero-body text-stone-400 hover:text-white text-xs underline underline-offset-4 transition-colors">
              Or request a custom quote →
            </button>
          </Link>

          {/* Slideshow dots */}
          <div className="absolute bottom-8 flex gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`transition-all duration-300 rounded-full ${
                  i === currentIndex
                    ? "w-6 h-2 bg-amber-400"
                    : "w-2 h-2 bg-white/30 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default HeroSection;