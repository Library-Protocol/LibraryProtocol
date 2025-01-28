import React, { useState } from 'react';

function Carousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const content = [
    {
      title: "Join the Web3 Content Revolution",
      description: "Publish Your Articles & Podcasts!",
      cta: "Publish Now",
    },
    {
      title: "Vitalik's Ultimatum to L2s",
      description: "September 12, 2024 · 4 min read",
      cta: "Read More",
    },
    {
      title: "KyberSwap Hacker Wants it All!",
      description: "September 12, 2024 · 4 min read",
      cta: "Read More",
    },
    {
      title: "From Phishing to Fixing: Web3 on Edge!",
      description: "September 12, 2024 · 4 min read",
      cta: "Read More",
    },
  ];

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % content.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? content.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className="relative w-full h-[500px] bg-gradient-to-b from-[#1C0F0A] to-[#2B1810] overflow-hidden">
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-[#B45F06]/10 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${15 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      {/* Carousel Content */}
      <div
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {content.map((item, index) => (
          <div
            key={index}
            className="min-w-full flex-shrink-0 flex items-center justify-center p-8"
          >
            <div className="text-center max-w-2xl mx-auto">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-[#B45F06] to-[#783F04] bg-clip-text text-transparent">
                {item.title}
              </h1>
              <p className="mt-4 text-lg text-[#F8F2EB]/80">{item.description}</p>
              <button className="mt-8 px-6 py-3 bg-gradient-to-r from-[#B45F06] to-[#783F04] rounded-lg text-[#F8F2EB] hover:scale-105 hover:shadow-[#B45F06]/20 transition-all duration-300">
                {item.cta}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-[#1C0F0A]/60 backdrop-blur-sm border border-[#783F04]/30 rounded-full p-3 hover:bg-[#B45F06]/10 transition-all duration-300"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 text-[#F8F2EB]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-[#1C0F0A]/60 backdrop-blur-sm border border-[#783F04]/30 rounded-full p-3 hover:bg-[#B45F06]/10 transition-all duration-300"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 text-[#F8F2EB]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  );
}

export default Carousel;
