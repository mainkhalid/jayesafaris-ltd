import React from "react";
import { Link } from "react-router-dom";

// Skeleton card shown while loading
const SkeletonCard = () => (
  <div className="bg-white rounded-lg shadow-lg overflow-hidden animate-pulse">
    <div className="h-64 bg-gray-200" />
    <div className="p-6 space-y-3">
      <div className="h-5 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-100 rounded w-full" />
      <div className="h-4 bg-gray-100 rounded w-5/6" />
      <div className="h-4 bg-gray-100 rounded w-4/6" />
      <div className="h-10 bg-gray-200 rounded mt-4" />
    </div>
  </div>
);

const PopularPackages = ({ data = [], title = "Safari", loading = false }) => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
          Popular {title} Packages
        </h2>
        <p className="text-center text-gray-600 text-lg mb-12 max-w-3xl mx-auto">
          Here are our most popular safari packages, all customizable to your travel style and budget.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {loading
            ? [1, 2, 3].map((n) => <SkeletonCard key={n} />)
            : data.length === 0
            ? (
              <p className="col-span-3 text-center text-gray-400 py-12">
                No packages available yet.
              </p>
            )
            : data.map((pkg) => (
              <div
                key={pkg.id ?? pkg._id}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Image */}
                <div className="h-64 overflow-hidden bg-gray-100">
                  {pkg.image ? (
                    <img
                      src={pkg.image}
                      alt={pkg.title}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
                      No image
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {pkg.title}
                  </h3>

                  <p className="text-gray-700 mb-4 leading-relaxed line-clamp-3">
                    {pkg.description}
                  </p>

                  {/* Highlights */}
                  {pkg.highlights?.length > 0 && (
                    <ul className="space-y-2 mb-4">
                      {pkg.highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-[#151b0e] mt-1">•</span>
                          <span className="text-gray-600 text-sm">{h}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Footer note */}
                  {pkg.footer && (
                    <p className="text-gray-500 text-sm italic mb-4">{pkg.footer}</p>
                  )}

                  {/* CTA */}
                  <Link to={pkg.ctaLink ?? "#"}>
                    <button className="w-full bg-[#ED2009] hover:bg-[#C51A07] text-white py-3 rounded-md font-semibold transition-colors">
                      {pkg.ctaText ?? "Book This Tour"}
                    </button>
                  </Link>
                </div>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
};

export default PopularPackages;