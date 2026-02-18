import React from 'react';
import { Link } from 'react-router-dom';

const QuoteSection = ({ data }) => {
  return (
    <div className="bg-dark-olive-custom py-4">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <Link 
          to={data.link}
          className="text-white text-lg font-medium hover:text-yellow-400 transition-colors inline-flex items-center gap-2"
        >
          {data.text}
        </Link>
      </div>
    </div>
  );
};

export default QuoteSection;