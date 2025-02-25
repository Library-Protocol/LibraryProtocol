'use client';

import React, { useState, useEffect } from 'react';

import { CheckCircle } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';

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
  createdAt: Date;
}

interface LandingPageProps {
  curators: Curator[];
}

const LandingPage: React.FC<LandingPageProps> = ({ curators }) => {
  const ipfsUrl = process.env.NEXT_PUBLIC_IPFS_GATEWAY;
  const { login, authenticated } = usePrivy();
  const [isLoading, setIsLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      image: 'images/illustrations/media/library-books.jpg',
      title: 'Bring Your Library Onchain',
      subtitle: 'Share your collection or borrow books to discover new stories!',
      url: '/library/onboarding',
    },
  ];

  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 10000);

    const contentTimer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => {
      clearInterval(slideTimer);
      clearTimeout(contentTimer);
    };
  }, []);

  const goToSlide = (index: number) => setCurrentSlide(index);

  const handleGetStarted = () => {
    if (!authenticated) login();
    else window.location.href = '/library/onboarding';
  };

  const handleBooks = () => {
    if (!authenticated) login();
    else window.location.href = '/library/books';
  };

  const SkeletonCard = () => (
    <div className="bg-gray-200 rounded-[32px] h-[350px] max-w-[250px] animate-pulse">
      <div className="w-full h-[250px] bg-gray-300 rounded-t-[12px]" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-300 rounded w-3/4" />
        <div className="h-3 bg-gray-300 rounded w-1/2" />
      </div>
    </div>
  );

  // Sort curators: verified first, then latest to oldest
  const sortedCurators = [...curators].sort((a, b) => {
    if (a.isVerified && !b.isVerified) return -1;
    if (!a.isVerified && b.isVerified) return 1;
    
return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="relative max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Carousel Section */}
      {isLoading ? (
        <div className="h-[300px] sm:h-[400px] lg:h-[550px] rounded-[32px] bg-gray-200 animate-pulse" />
      ) : (
        <div className="relative h-[300px] sm:h-[400px] lg:h-[550px] rounded-[32px] overflow-hidden my-1">
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-500 ${
                currentSlide === index ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url('${slide.image}')` }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center p-6 lg:p-16">
                <div className="max-w-2xl">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                    {slide.title}
                  </h1>
                  <p className="mt-4 text-base sm:text-lg text-white">{slide.subtitle}</p>
                </div>
              </div>
            </div>
          ))}
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
      )}

      {/* Call-to-Action Cards */}
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6">
        {isLoading ? (
          <>
            <div className="bg-gray-200 rounded-[32px] h-[200px] animate-pulse" />
            <div className="bg-gray-200 rounded-[32px] h-[200px] animate-pulse" />
          </>
        ) : (
          <>
            <div className="relative bg-gradient-to-r from-brown-700 to-brown-500 rounded-[32px] overflow-hidden p-8 text-white transition-all duration-300">
              <div className="absolute inset-0 bg-black/10 hover:bg-black/20 transition-all duration-300 z-0" />
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 z-10 relative">Borrow a Book</h2>
              <p className="text-base sm:text-lg mb-6 z-10 relative">
                Explore a world of stories. Borrow books from our onchain library.
              </p>
              <button
                className="bg-white text-black px-6 py-3 rounded-lg font-medium text-lg hover:bg-black hover:text-white transition-colors z-20 relative"
                onClick={handleBooks}
              >
                Start Borrowing
              </button>
            </div>
            <div className="relative bg-gradient-to-r from-brown-800 to-brown-600 rounded-[32px] overflow-hidden p-8 text-white transition-all duration-300">
              <div className="absolute inset-0 bg-black/10 hover:bg-black/20 transition-all duration-300 z-0" />
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 z-10 relative">Create a Library</h2>
              <p className="text-base sm:text-lg mb-6 z-10 relative">
                Share your collection with the world. Create your onchain library.
              </p>
              <button
                className="bg-white text-black px-6 py-3 rounded-lg font-medium text-lg hover:bg-black hover:text-white transition-colors z-20 relative"
                onClick={handleGetStarted}
              >
                Get Started
              </button>
            </div>
          </>
        )}
      </div>

      {/* Featured Libraries */}
        <div className="mt-12">
          {isLoading ? (
            <div>
              <div className="h-8 w-48 bg-gray-300 rounded mb-6 animate-pulse" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <SkeletonCard key={index} />
                ))}
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-2xl sm:text-3xl font-bold mb-6">Featured Libraries</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {sortedCurators.map((curator) => (
                  <a
                    key={curator.id}
                    href={`/library/curator/${curator.id}`}
                    className="relative bg-gray-200 rounded-[12px] overflow-hidden hover:scale-105 transform transition-all duration-300 max-w-[250px] h-[350px]"
                  >
                    {/* Verification Badge - Top Left, White */}
                    {curator.isVerified && (
                      <div className="absolute top-2 left-2 p-1 rounded-full">
                        <CheckCircle size={18} className="text-white" />
                      </div>
                    )}
                    {/* Book Count Badge */}
                    <div className="absolute top-2 right-2 px-2 py-1 bg-black bg-opacity-50 rounded-full text-white text-sm font-medium">
                      {curator.books?.length || 0}{' '}
                      {(curator.books?.length || 0) === 1 ? 'Book' : 'Books'}
                    </div>
                    {curator.coverImage ? (
                      <img
                        src={`${ipfsUrl}${curator.coverImage}`}
                        alt={curator.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-300">
                        <span className="text-white">No Image</span>
                      </div>
                    )}
                    <div className="absolute bottom-4 left-4 p-2 bg-black bg-opacity-50 text-white rounded">
                      <h3 className="text-sm font-bold">
                        {curator.country}, {curator.state}
                      </h3>
                    </div>
                  </a>
                ))}
              </div>
            </>
          )}
        </div>
      {authenticated && <LibraryMascotWidget />}
    </div>
  );
};

export default LandingPage;
