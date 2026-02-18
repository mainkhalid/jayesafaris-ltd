import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { usePackages } from "../../hooks/usePackage";

const COUNTRIES = ["kenya", "tanzania", "zanzibar", "uganda"];

const DURATION_LABELS = {
  all:    "All Durations",
  short:  "1–3 Days",
  medium: "4–7 Days",
  long:   "8+ Days",
};

// ─── Package Card ─────────────────────────────────────────────────────────────
const PackageCard = ({ image, category, duration, price, description, showPlanButton = false, link = "#" }) => (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 flex flex-col h-full">
    {/* Image */}
    <div className="h-48 overflow-hidden bg-gray-100">
      {image ? (
        <img
          src={image}
          alt={duration}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
          No image
        </div>
      )}
    </div>

    {/* Content */}
    <div className="p-5 flex flex-col flex-grow text-center">
      <div className="grid grid-cols-2 gap-2 mb-4 text-xs font-bold uppercase tracking-wider text-black">
        <div className="text-left">
          {category}
          {price && <span className="block text-gray-700">From: {price}</span>}
        </div>
        <div className="text-right">{duration}</div>
      </div>

      <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-grow line-clamp-3">
        {description}
      </p>

      <div className="flex gap-3 justify-center mt-auto">
        <Link to={link} className="flex-1">
          <button className="w-full bg-[#1F2815] hover:bg-[#4a5b30] text-white text-xs font-bold py-3 px-4 rounded transition-colors">
            View Full Itinerary
          </button>
        </Link>
        {showPlanButton && (
          <Link to="/inquiry-form" className="flex-1">
            <button className="w-full bg-[#ED2009] hover:bg-[#C51A07] text-white text-xs font-bold py-3 px-4 rounded transition-colors">
              Plan Your Safari
            </button>
          </Link>
        )}
      </div>
    </div>
  </div>
);

// ─── Skeleton Card ────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 flex flex-col h-full animate-pulse">
    <div className="h-48 bg-gray-200" />
    <div className="p-5 space-y-3 flex-grow">
      <div className="grid grid-cols-2 gap-2">
        <div className="h-3 bg-gray-200 rounded" />
        <div className="h-3 bg-gray-200 rounded" />
      </div>
      <div className="h-3 bg-gray-100 rounded w-full" />
      <div className="h-3 bg-gray-100 rounded w-5/6" />
      <div className="h-3 bg-gray-100 rounded w-4/6" />
      <div className="h-9 bg-gray-200 rounded mt-4" />
    </div>
  </div>
);

// ─── Hook: merge packages from all countries ──────────────────────────────────
const useAllPackages = () => {
  const kenya    = usePackages("Kenya");
  const tanzania = usePackages("Tanzania");
  const zanzibar = usePackages("Zanzibar");
  const uganda   = usePackages("Uganda");

  const loading = kenya.loading || tanzania.loading || zanzibar.loading || uganda.loading;

  const all = useMemo(() => [
    ...kenya.packages.map((p) => ({ ...p, destination: "kenya" })),
    ...tanzania.packages.map((p) => ({ ...p, destination: "tanzania" })),
    ...zanzibar.packages.map((p) => ({ ...p, destination: "zanzibar" })),
    ...uganda.packages.map((p) => ({ ...p, destination: "uganda" })),
  ], [kenya.packages, tanzania.packages, zanzibar.packages, uganda.packages]);

  return { packages: all, loading };
};

// ─── Normalise DB package → PackageCard props ─────────────────────────────────
const toCardProps = (pkg) => ({
  id:             pkg._id ?? pkg.id,
  image:          pkg.thumbnail?.url ?? pkg.thumbnail ?? "",
  category:       pkg.destination
                    ? `${pkg.destination.charAt(0).toUpperCase() + pkg.destination.slice(1)} Safari`
                    : "Safari",
  price:          pkg.price ?? "",
  duration:       pkg.duration ?? "",
  durationValue:  parseDuration(pkg.duration),
  destination:    pkg.destination ?? "all",
  description:    pkg.description ?? "",
  showPlanButton: true,
  link:           `/packages/${pkg._id ?? pkg.id}`,
});

/** Extract the leading number from a duration string like "6 Days / 5 Nights" → 6 */
const parseDuration = (str) => {
  if (!str) return 0;
  const match = str.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
};

// ─── PackageGrid ──────────────────────────────────────────────────────────────
const PackageGrid = () => {
  const [filters, setFilters] = useState({ destination: "all", duration: "all" });
  const { packages, loading } = useAllPackages();

  const handleFilterChange = (type, value) =>
    setFilters((prev) => ({ ...prev, [type]: value }));

  const filteredPackages = useMemo(() => {
    return packages.map(toCardProps).filter((pkg) => {
      const matchDest =
        filters.destination === "all" ||
        pkg.destination.toLowerCase() === filters.destination.toLowerCase();

      let matchDur = true;
      if (filters.duration === "short")  matchDur = pkg.durationValue <= 3;
      if (filters.duration === "medium") matchDur = pkg.durationValue > 3 && pkg.durationValue <= 7;
      if (filters.duration === "long")   matchDur = pkg.durationValue > 7;

      return matchDest && matchDur;
    });
  }, [filters, packages]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-3 mb-10 justify-center">
        {/* Destination filter */}
        <div className="flex flex-wrap gap-2">
          {["all", ...COUNTRIES].map((dest) => (
            <button
              key={dest}
              onClick={() => handleFilterChange("destination", dest)}
              className={`px-4 py-2 rounded-full text-xs font-bold border transition-colors capitalize ${
                filters.destination === dest
                  ? "bg-[#1F2815] text-white border-[#5d723c]"
                  : "bg-white text-gray-600 border-gray-200 hover:border-[#151b0e] hover:text-[#5d723c]"
              }`}
            >
              {dest === "all" ? "All Destinations" : dest}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="w-px bg-gray-200 hidden sm:block" />

        {/* Duration filter */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(DURATION_LABELS).map(([val, label]) => (
            <button
              key={val}
              onClick={() => handleFilterChange("duration", val)}
              className={`px-4 py-2 rounded-full text-xs font-bold border transition-colors ${
                filters.duration === val
                  ? "bg-yellow-500 text-white border-yellow-500"
                  : "bg-white text-gray-600 border-gray-200 hover:border-[#C51A07] hover:text-[#ED2009]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Results count ── */}
      {!loading && (
        <p className="text-center text-gray-400 text-sm mb-6">
          {filteredPackages.length} package{filteredPackages.length !== 1 ? "s" : ""} found
        </p>
      )}

      {/* ── Grid ── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((n) => <SkeletonCard key={n} />)}
        </div>
      ) : filteredPackages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 transition-all duration-500">
          {filteredPackages.map((item) => (
            <PackageCard key={item.id} {...item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-gray-500">No safaris match your current filters.</p>
          <button
            onClick={() => setFilters({ destination: "all", duration: "all" })}
            className="text-green-700 font-bold underline mt-2"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};

export default PackageGrid;