import React, { useState, useMemo } from 'react';
import PackageCard from './PackageCard';

const PackageSection = ({ packages, title = "Safari Packages", showFilter = true }) => {
  const [filters, setFilters] = useState({ 
    destination: 'all', 
    duration: 'all',
    priceRange: 'all' 
  });

  const handleFilterChange = (type, value) => {
    setFilters((prev) => ({ ...prev, [type]: value }));
  };

  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      // Destination filter
      const matchDest =
        filters.destination === 'all' ||
        pkg.destination === filters.destination;

      // Duration filter
      let matchDur = true;
      if (filters.duration === 'short') matchDur = pkg.durationValue <= 3;
      if (filters.duration === 'medium')
        matchDur = pkg.durationValue > 3 && pkg.durationValue <= 7;
      if (filters.duration === 'long') matchDur = pkg.durationValue > 7;

      // Price filter (extract number from price string like "$1590")
      let matchPrice = true;
      if (filters.priceRange !== 'all' && pkg.price) {
        const priceNum = parseInt(pkg.price.replace(/[^0-9]/g, ''));
        if (filters.priceRange === 'budget') matchPrice = priceNum < 1500;
        if (filters.priceRange === 'mid') matchPrice = priceNum >= 1500 && priceNum < 2500;
        if (filters.priceRange === 'luxury') matchPrice = priceNum >= 2500;
      }

      return matchDest && matchDur && matchPrice;
    });
  }, [filters, packages]);

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
          {title}
        </h2>
        <p className="text-center text-gray-600 text-lg mb-8 max-w-3xl mx-auto">
          Browse our curated safari packages and find your perfect African adventure
        </p>

        {/* Filters */}
        {showFilter && (
          <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Duration Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Duration
                </label>
                <select
                  value={filters.duration}
                  onChange={(e) => handleFilterChange('duration', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#151b0e]"
                >
                  <option value="all">All Durations</option>
                  <option value="short">Short (1-3 days)</option>
                  <option value="medium">Medium (4-7 days)</option>
                  <option value="long">Long (8+ days)</option>
                </select>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Price Range
                </label>
                <select
                  value={filters.priceRange}
                  onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">All Prices</option>
                  <option value="budget">Budget (Under $1,500)</option>
                  <option value="mid">Mid-Range ($1,500 - $2,500)</option>
                  <option value="luxury">Luxury ($2,500+)</option>
                </select>
              </div>

              {/* Clear Filters Button */}
              <div className="flex items-end">
                <button
                  onClick={() => setFilters({ destination: 'all', duration: 'all', priceRange: 'all' })}
                  className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-md transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Active Filters Display */}
            {(filters.duration !== 'all' || filters.priceRange !== 'all') && (
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-sm text-gray-600">Active filters:</span>
                {filters.duration !== 'all' && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    {filters.duration} duration
                  </span>
                )}
                {filters.priceRange !== 'all' && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    {filters.priceRange} price
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Packages Grid */}
        {filteredPackages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 transition-all duration-500">
            {filteredPackages.map((pkg) => (
              <PackageCard key={pkg.id} {...pkg} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-lg">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No packages found
            </h3>
            <p className="text-gray-500 mb-4">
              No safaris match your current filters. Try adjusting your criteria.
            </p>
            <button
              onClick={() => setFilters({ destination: 'all', duration: 'all', priceRange: 'all' })}
              className="text-green-700 font-bold underline hover:text-green-800"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Results Count */}
        {filteredPackages.length > 0 && (
          <div className="mt-8 text-center text-gray-600">
            Showing {filteredPackages.length} of {packages.length} packages
          </div>
        )}
      </div>
    </section>
  );
};

export default PackageSection;