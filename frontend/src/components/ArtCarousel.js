// src/components/ArtCarousel.js
import React, { useState } from "react";

const ArtCarousel = ({ arts }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? arts.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === arts.length - 1 ? 0 : prevIndex + 1
    );
  };

  const currentArt = arts[currentIndex];

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <img    
            src={`https://api.museoningangeles.com${currentArt.image}`}
            alt={`Artwork ${currentIndex + 1}`}
            className="w-full max-h-64 sm:max-h-96 object-contain rounded-lg"
        />
      </div>
      <button
        onClick={handlePrev}
        className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-yellow-800 text-white p-2 sm:p-3 rounded-full hover:bg-yellow-900"
      >
        &#8249;
      </button>
      <button
        onClick={handleNext}
        className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-yellow-800 text-white p-2 sm:p-3 rounded-full hover:bg-yellow-900"
      >
        &#8250;
      </button>
      <div className="mt-4 p-4 bg-white rounded shadow">
        <p className="text-gray-800 text-sm sm:text-base">{currentArt.description}</p>
      </div>
      <div className="flex justify-center mt-2 space-x-2">
        {arts.map((_, idx) => (
          <div
            key={idx}
            className={`w-3 h-3 rounded-full ${
              idx === currentIndex ? "bg-yellow-900" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default ArtCarousel;
