import React from 'react';
import { Link } from 'react-router-dom';

const PackageCard = ({
  image,
  category,
  duration,
  price,
  description,
  showPlanButton = false,
  link = '#',
  id,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 flex flex-col h-full">
      
      {/* Image Section */}
      <div className="h-48 overflow-hidden">
        <img
          src={image}
          alt={duration}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col flex-grow text-center">
        
        {/* Header Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4 text-xs font-bold uppercase tracking-wider text-black">
          <div className="text-left">
            {category}
            {price && (
              <span className="block text-gray-700">
                From: {price}
              </span>
            )}
          </div>
          <div className="text-right">
            {duration}
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-grow">
          {description}
        </p>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center mt-auto">
          <Link to={link} className="flex-1">
            <button className="w-full bg-[#5d723c] hover:bg-[#4a5b30] text-white text-xs font-bold py-3 px-4 rounded transition-colors">
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
};

export default PackageCard;