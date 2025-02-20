'use client';

import React, { useState, useEffect } from 'react';

import { CheckCircle } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth'; // Import Privy
import LibraryMascotWidget from '@/components/effects/MascotWidget';

interface Book {
  id: string;
  onChainUniqueId: string;
  transactionHash: string;
  title: string;
  author: string;
  publisher: string;
  publishDate: Date;
  pagination: number;
  additionalNotes?: string;
  isbn: number;
  availability: boolean;
  image?: string;
  curatorId: string;
  createdAt: Date;
}

interface Curator {
  id: number;
  name: string;
  description: string;
  country: string;
  state: string;
  city: string;
  coverImage: string;
  isVerified: boolean;
  books: Book[];
}

interface LandingPageProps {
  curators: Curator[];
}

const LandingPage: React.FC<LandingPageProps> = ({ curators }) => {
  const ipfsUrl = process.env.NEXT_PUBLIC_IPFS_GATEWAY;
  const { login, authenticated } = usePrivy(); // Get Privy authentication methods
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  const heroSlides = [
    {
      image: 'images/illustrations/media/library-books.jpg',
      title: 'Bring Your Library Onchain',
      subtitle: 'Share your collection or borrow books to discover new stories!',
      url: '/library/onboarding',
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 10000);

    // Simulate loading delay
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => {
      clearInterval(timer);
      clearTimeout(loadingTimer);
    };
  }, []);

  const goToSlide = (index: number): void => {
    setCurrentSlide(index);
  };

  const handleGetStarted = () => {
    if (!authenticated) {
      login(); // Trigger Privy modal if not logged in
    } else {
      window.location.href = '/library/onboarding'; // Redirect if logged in
    }
  };

  const handleBooks = () => {
    if (!authenticated) {
      login(); // Trigger Privy modal if not logged in
    } else {
      window.location.href = '/library/books'; // Redirect if logged in
    }
  };

  return (
    <div className="relative max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Carousel Section */}
      <div className="relative h-[300px] sm:h-[400px] lg:h-[550px] rounded-[32px] overflow-hidden my-1">
      {heroSlides.map((slide, index) => (
        <div
        key={index}
        className={`absolute inset-0 transition-opacity duration-500 ${
          currentSlide === index ? 'opacity-100' : 'opacity-0'
        }`}
        >
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${slide.image}')` }} />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center p-6 lg:p-16">
          <div className="max-w-2xl">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">{slide.title}</h1>
          <p className="mt-4 text-base sm:text-lg text-white">{slide.subtitle}</p>
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

      {/* Two Beautiful Cards Section */}
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6">
      {/* Borrow a Book Card */}
      <div className="relative bg-gradient-to-r from-brown-700 to-brown-500 rounded-[32px] overflow-hidden p-8 text-white transform transition-all duration-300">
        <div className="absolute inset-0 bg-black/10 hover:bg-black/20 transition-all duration-300 z-0" />
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">Borrow a Book</h2>
        <p className="text-base sm:text-lg mb-6">
        Explore a world of stories. Borrow books from our onchain library and dive into new adventures.
        </p>
        <button className="bg-white text-black px-6 py-3 rounded-lg font-medium text-lg hover:bg-black hover:text-white transition-colors z-20 relative"
        onClick={handleBooks}>
        Start Borrowing
        </button>
      </div>

      {/* Create a Library Card */}
      <div className="relative bg-gradient-to-r from-brown-800 to-brown-600 rounded-[32px] overflow-hidden p-8 text-white transform transition-all duration-300">
        <div className="absolute inset-0 bg-black/10 hover:bg-black/20 transition-all duration-300 z-0" />
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">Create a Library</h2>
        <p className="text-base sm:text-lg mb-6">
        Share your collection with the world. Create your own onchain library and connect with readers.
        </p>
        <button
        className="bg-white text-black px-6 py-3 rounded-lg font-medium text-lg hover:bg-black hover:text-white transition-colors z-20 relative"
        onClick={handleGetStarted}
        >
        Get Started
        </button>
      </div>
      </div>

      {/* Display Curators */}
      {curators.length >= 1 && (
      <div className="mt-12">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6">Featured Libraries</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {isLoading
          ? Array.from({ length: 5 }).map((_, index) => (
            <div
            key={index}
            className="relative bg-gray-200 rounded-lg overflow-hidden hover:scale-105 transform transition-all duration-300 max-w-[250px] max-h-[350px] animate-pulse"
            >
            <div className="w-full h-full bg-gray-300" />
            </div>
          ))
          : curators.map((curator) => (
            <a
            key={curator.id}
            href={`/library/curator/${curator.id}`}
            className="relative bg-gray-200 rounded-lg overflow-hidden hover:scale-105 transform transition-all duration-300 max-w-[250px] max-h-[350px]"
            >
            {/* Book Count Badge */}
            <div className="absolute top-2 right-2 px-2 py-1 bg-black bg-opacity-50 rounded-full text-white text-sm font-medium">
              {(curator.books?.length || 0)} {(curator.books?.length || 0) === 1 ? 'Book' : 'Books'}
            </div>

            {/* Verification Badge - moved slightly lower */}
            {curator.isVerified && (
              <div className="absolute top-12 right-2 p-1 rounded-full shadow-md">
              <CheckCircle size={18} className="text-blue-500" />
              </div>
            )}

            {curator.coverImage ? (
              <img src={`${ipfsUrl}${curator.coverImage}`} alt={curator.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-300">
              <span className="text-white">No Image Available</span>
              </div>
            )}

            {/* Country Label */}
            <div className="absolute bottom-4 left-4 p-2 bg-black bg-opacity-50 text-white rounded">
              <h3 className="text-sm font-bold">
              {curator.country}, {curator.state}
              </h3>
            </div>
            </a>
          ))}
        </div>
      </div>
      )}
      {authenticated && <LibraryMascotWidget />}
    </div>
  );
};

export default LandingPage;
