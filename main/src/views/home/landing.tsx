'use client'

import React, { useState, useEffect } from 'react'

export default function LandingPage() {
  const heroSlides = [
    {
      image: 'images/illustrations/media/library-books.jpg',
      title: 'Bring Your Library Onchain',
      subtitle: 'Share your collection or borrow books to discover new stories!',
      url: '/library/onboarding' // Add the URL here
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroSlides.length)
    }, 10000)

    return () => clearInterval(timer)
  }, [])

  const goToSlide = (index: number): void => {
    setCurrentSlide(index)
  }

  return (
    <div className='relative max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8'>
      {/* Hero Carousel Section */}
      <div className='relative h-[300px] sm:h-[400px] lg:h-[550px] rounded-[32px] overflow-hidden my-1'>
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-500 ${
              currentSlide === index ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className='absolute inset-0 bg-cover bg-center' style={{ backgroundImage: `url('${slide.image}')` }} />
            <div className='absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center p-6 lg:p-16'>
              <div className='max-w-2xl'>
                <h1 className='text-3xl sm:text-4xl lg:text-5xl font-bold text-white'>{slide.title}</h1>
                <p className='mt-4 text-base sm:text-lg text-white'>{slide.subtitle}</p>
                <button
          className="mt-6 bg-black text-white border border-white transition-colors px-6 py-3 rounded-lg font-medium text-lg sm:text-xl hover:bg-white hover:text-black"
          onClick={() => window.location.href = slide.url} // Redirect to the URL
        >
          Create Library
        </button>
              </div>
            </div>
          </div>
        ))}

        {/* Carousel Navigation Dots */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                currentSlide === index ? 'bg-white' : 'bg-white/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
