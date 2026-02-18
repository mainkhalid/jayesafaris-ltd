import React from 'react';
import { Link } from 'react-router-dom';

const WhyChoose = ({ data }) => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Image Column */}
          <div className="order-2 md:order-1">
            <img 
              src={data.image} 
              alt={data.title}
              className="w-full h-[500px] object-cover rounded-lg shadow-xl"
            />
          </div>
          
          {/* Content Column */}
          <div className="order-1 md:order-2">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              {data.title}
            </h2>
            
            <p className="text-gray-700 text-lg mb-6 leading-relaxed">
              {data.description}
            </p>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {data.highlightsTitle}
            </h3>
            
            <ul className="space-y-3 mb-6">
              {data.highlights.map((item) => (
                <li key={item.id} className="flex items-start gap-3">
                  <span className="text-green-600 text-xl mt-1">•</span>
                  <span className="text-gray-700 text-lg">
                    {item.text}
                    {item.highlight && (
                      <strong className="text-gray-900"> {item.highlight}</strong>
                    )}
                  </span>
                </li>
              ))}
            </ul>
            
            <p className="text-gray-700 text-lg mb-8 leading-relaxed">
              {data.tourInfo}
            </p>
            
            <Link to={data.ctaLink}>
              <button className="bg-dark-olive-custom hover:bg-green-800 text-white px-8 py-3 rounded-md font-semibold text-lg transition-all transform hover:scale-105 shadow-lg">
                {data.ctaText}
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChoose;