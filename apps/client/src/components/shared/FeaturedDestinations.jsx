import React from "react";
import { Link } from "react-router-dom";

const SkeletonCard = () => (
  <div className="bg-white rounded-lg shadow-lg overflow-hidden animate-pulse">
    <div className="h-48 bg-gray-200" />
    <div className="p-6 space-y-3">
      <div className="h-5 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-100 rounded w-full" />
      <div className="h-3 bg-gray-100 rounded w-5/6" />
      <div className="h-3 bg-gray-100 rounded w-4/6" />
    </div>
  </div>
);

const FeaturedDestinations = ({
  data = [],
  title = "Featured Safari Destinations",
  loading = false,
}) => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
          {title}
        </h2>
        <p className="text-center text-gray-600 text-lg mb-12 max-w-4xl mx-auto">
          Dreaming of a safari in Kenya and East Africa? Jaye safaris gets you onto
          breathtaking safari tours faster, easier, and with more unforgettable moments than
          anyone else!
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading
            ? [1, 2, 3, 4].map((n) => <SkeletonCard key={n} />)
            : data.length === 0
            ? (
              <p className="col-span-4 text-center text-gray-400 py-12">
                No destinations available yet.
              </p>
            )
            : data.map((destination) => (
              <Link
                key={destination.id ?? destination._id}
                to={destination.link ?? "#"}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-2"
              >
                {/* Image */}
                <div className="h-48 overflow-hidden bg-gray-100">
                  {destination.image ? (
                    <img
                      src={destination.image}
                      alt={destination.title}
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
                  <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-green-700 transition-colors">
                    {destination.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-4">
                    {destination.description}
                  </p>
                  <div className="mt-4 text-dark-olive-custom font-semibold flex items-center gap-2 group">
                    <span>View Package</span>
                    <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedDestinations;