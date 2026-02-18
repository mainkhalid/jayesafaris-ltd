import React from 'react';
import { Link } from 'react-router-dom';

const HeroSection = ({ data }) => {
  return (
    <section 
      className="relative h-[600px] flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${data.image})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      
      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 max-w-4xl">
        <p className="text-lg md:text-xl mb-4 font-light tracking-wide">
          {data.subtitle}
        </p>
        <h1 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
          {data.title}
        </h1>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link to={data.cta.primaryLink}>
            <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-3 rounded-md font-semibold text-lg transition-all transform hover:scale-105 shadow-lg">
              {data.cta.primary}
            </button>
          </Link>
          <Link to={data.cta.secondaryLink}>
            <button className="bg-transparent border-2 border-white hover:bg-white hover:text-gray-900 text-white px-8 py-3 rounded-md font-semibold text-lg transition-all transform hover:scale-105">
              {data.cta.secondary}
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;