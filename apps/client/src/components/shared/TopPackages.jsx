import React, { useEffect, useState } from "react";
import { ArrowRightCircle } from "lucide-react";
import { Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

const COUNTRIES = [
  { key: "kenya",    fallbackImage: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e" },
  { key: "tanzania", fallbackImage: "https://images.unsplash.com/photo-1516426122078-c23e76319801" },
  { key: "uganda",   fallbackImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23" },
  { key: "zanzibar", fallbackImage: "https://images.unsplash.com/photo-1580741569354-08feedd159f9" },
];

const TopDestinations = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const results = await Promise.all(
          COUNTRIES.map(async ({ key, fallbackImage }) => {
            const res  = await fetch(`${API_BASE}/packages?country=${key}`);
            const json = await res.json();
            const first = json.data?.[0];

            return {
              key,
              image:       first?.thumbnail?.url || fallbackImage,
              title:       first?.title          || `${key.charAt(0).toUpperCase() + key.slice(1)} Safari`,
              description: first?.description    || "",
              link: `/${key.toLowerCase()}`,
            };
          })
        );
        setDestinations(results);
      } catch (err) {
        console.error("[TopDestinations]", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  return (
    <section className="py-16 px-6 bg-white max-w-7xl mx-auto">
      {/* Header */}
      <h2 className="text-3xl md:text-4xl font-bold text-[#865331] text-center mb-16">
        Explore Top East Africa Safari Destinations
      </h2>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Sidebar */}
        <div className="lg:w-1/4 space-y-6 pt-4 text-center lg:text-left">
          <h3 className="text-2xl font-bold text-[#865331] leading-tight">
            Ready to explore Top Africa Safari Destinations
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            Ready to explore top Africa safari destinations? Discover breathtaking
            wildlife, stunning landscapes, and unforgettable adventures across the
            continent's best parks.
          </p>
          <Link to="/destinations">
            <button className="flex items-center gap-2 bg-dark-olive-2 text-white px-6 py-3 rounded-md font-bold hover:bg-dark-olive transition-colors mx-auto lg:mx-0">
              Explore More <ArrowRightCircle size={20} />
            </button>
          </Link>
        </div>

        {/* Cards */}
        <div className="lg:w-3/4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 w-full">
          {loading
            ? 
              COUNTRIES.map(({ key }) => (
                <div key={key} className="group cursor-pointer animate-pulse">
                  <div className="aspect-[4/5] bg-gray-200 rounded-sm mb-4" />
                  <div className="space-y-2 border-b border-gray-100 pb-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-full" />
                    <div className="h-3 bg-gray-100 rounded w-5/6" />
                  </div>
                </div>
              ))
            : destinations.map((dest) => (
                <Link key={dest.key} to={dest.link} className="group cursor-pointer">
                  <div className="aspect-[4/5] overflow-hidden rounded-sm mb-4">
                    <img
                      src={dest.image}
                      alt={dest.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="space-y-2 border-b border-gray-100 pb-4">
                    <h4 className="font-bold text-gray-800 text-sm">{dest.title}</h4>
                    <p className="text-gray-600 text-xs leading-relaxed line-clamp-3">
                      {dest.description}
                    </p>
                  </div>
                </Link>
              ))}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="flex justify-center mt-12">
        <Link to="/inquiry-form">
          <button className="bg-dark-olive-2 text-white px-10 py-4 rounded-md font-bold hover:bg-dark-olive transition-transform hover:scale-105 shadow-md">
            Request Safari Quote
          </button>
        </Link>
      </div>
    </section>
  );
};

export default TopDestinations;