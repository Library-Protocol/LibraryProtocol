'use client';

import React, { useState, useEffect } from 'react';

import { CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';

import { Button } from '@mui/material';

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
  const [isMobile, setIsMobile] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const heroSlides = [
    {
      image: 'images/illustrations/media/library-books.jpg',
      title: 'Bring Your Library Onchain',
      subtitle: 'Share your collection or borrow books to discover new stories!',
      url: '/library/onboarding',
    },
  ];

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;

      setIsMobile(mobile);
      // Adjust items per page based on screen size
      setItemsPerPage(mobile ? 6 : window.innerWidth < 1024 ? 9 : 10);
    };

    // Initial check
    checkMobile();

    // Set up event listener
    window.addEventListener('resize', checkMobile);

    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 10000);

    const contentTimer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => {
      window.removeEventListener('resize', checkMobile);
      clearInterval(slideTimer);
      clearTimeout(contentTimer);
    };
  }, []);

  // Update total pages when curators or itemsPerPage changes
  useEffect(() => {
    setTotalPages(Math.ceil(curators.length / itemsPerPage));
  }, [curators, itemsPerPage]);

  const goToSlide = (index: number) => setCurrentSlide(index);

  const handleGetStarted = () => {
    if (!authenticated) login();
    else window.location.href = '/library/onboarding';
  };

  const handleBooks = () => {
    if (!authenticated) login();
    else window.location.href = '/library/books';
  };

  const handlePageChange = (page: number) => {
    // Scroll to the featured libraries section
    const featuredSection = document.getElementById('featured-libraries');

    if (featuredSection) {
      featuredSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    setCurrentPage(page);
  };

  const SkeletonCard = () => (
    <div className="bg-gray-200 rounded-xl md:rounded-[32px] h-[250px] md:h-[350px] w-full max-w-[250px] animate-pulse flex flex-col">
      <div className="w-full h-[180px] md:h-[250px] bg-gray-300 rounded-t-xl md:rounded-t-[12px]" />
      <div className="p-3 md:p-4 space-y-2 md:space-y-3">
        <div className="h-3 md:h-4 bg-gray-300 rounded w-3/4" />
        <div className="h-2 md:h-3 bg-gray-300 rounded w-1/2" />
      </div>
    </div>
  );

  // Sort curators: verified first, then latest to oldest
  const sortedCurators = [...curators].sort((a, b) => {
    if (a.isVerified && !b.isVerified) return -1;
    if (!a.isVerified && b.isVerified) return 1;

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Get current page items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCurators = sortedCurators.slice(indexOfFirstItem, indexOfLastItem);

  // Generate page numbers for pagination
  const pageNumbers = [];
  const maxPageNumbersToShow = isMobile ? 3 : 5;

  let startPage = Math.max(1, currentPage - Math.floor(maxPageNumbersToShow / 2));
  const endPage = Math.min(totalPages, startPage + maxPageNumbersToShow - 1);

  if (endPage - startPage + 1 < maxPageNumbersToShow) {
    startPage = Math.max(1, endPage - maxPageNumbersToShow + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="relative w-full max-w-[1320px] mx-auto px-3 sm:px-6 lg:px-8">
      {/* Hero Carousel Section */}
      {isLoading ? (
        <div className="h-[250px] sm:h-[350px] lg:h-[550px] rounded-xl md:rounded-[32px] bg-gray-200 animate-pulse" />
      ) : (
        <div className="relative h-[250px] sm:h-[350px] lg:h-[550px] rounded-xl md:rounded-[32px] overflow-hidden my-1">
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
              <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center p-4 md:p-6 lg:p-16">
                <div className="max-w-2xl">
                  <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-white leading-tight">
                    {slide.title}
                  </h1>
                  <p className="mt-2 md:mt-4 text-sm sm:text-base lg:text-lg text-white">
                    {slide.subtitle}
                  </p>
                </div>
              </div>
            </div>
          ))}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-colors ${
                  currentSlide === index ? 'bg-white' : 'bg-white/50'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Call-to-Action Cards */}
      <div className="mt-6 md:mt-12 grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-6">
        {isLoading ? (
          <>
            <div className="bg-gray-200 rounded-xl md:rounded-[32px] h-[150px] md:h-[200px] animate-pulse" />
            <div className="bg-gray-200 rounded-xl md:rounded-[32px] h-[150px] md:h-[200px] animate-pulse" />
          </>
        ) : (
          <>
            <div className="relative bg-gradient-to-r from-brown-700 to-brown-500 rounded-xl md:rounded-[32px] overflow-hidden p-4 md:p-8 text-white transition-all duration-300">
              <div className="absolute inset-0 bg-black/10 hover:bg-black/20 transition-all duration-300 z-0" />
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2 md:mb-4 z-10 relative">Borrow a Book</h2>
              <p className="text-sm md:text-base lg:text-lg mb-3 md:mb-6 z-10 relative">
                Explore a world of stories. Borrow books from our onchain library.
              </p>
              <Button
                className="bg-white text-black px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium text-sm md:text-lg hover:bg-black hover:text-white transition-colors z-20 relative"
                onClick={handleBooks}
              >
                Start Borrowing
              </Button>
            </div>
            <div className="relative bg-gradient-to-r from-brown-800 to-brown-600 rounded-xl md:rounded-[32px] overflow-hidden p-4 md:p-8 text-white transition-all duration-300">
              <div className="absolute inset-0 bg-black/10 hover:bg-black/20 transition-all duration-300 z-0" />
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2 md:mb-4 z-10 relative">Create a Library</h2>
              <p className="text-sm md:text-base lg:text-lg mb-3 md:mb-6 z-10 relative">
                Share your collection with the world. Create your onchain library.
              </p>
              <Button
                className="bg-white text-black px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium text-sm md:text-lg hover:bg-black hover:text-white transition-colors z-20 relative"
                onClick={handleGetStarted}
              >
                Get Started
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Featured Libraries */}
      <div id="featured-libraries" className="mt-6 md:mt-12 scroll-mt-4">
        {isLoading ? (
          <div>
            <div className="h-6 md:h-8 w-36 md:w-48 bg-gray-300 rounded mb-4 md:mb-6 animate-pulse" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
              {Array.from({ length: itemsPerPage }).map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold">Featured Libraries</h2>
              <p className="text-sm text-gray-500">
                Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, sortedCurators.length)} of {sortedCurators.length}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
              {currentCurators.map((curator) => (
                <a
                  key={curator.id}
                  href={`/library/curator/${curator.id}`}
                  className="relative bg-gray-200 rounded-xl md:rounded-[12px] overflow-hidden hover:scale-105 transform transition-all duration-300 w-full h-[180px] sm:h-[220px] md:h-[300px] lg:h-[350px]"
                >
                  {/* Verification Badge - Top Left, White */}
                  {curator.isVerified && (
                    <div className="absolute top-1 md:top-2 left-1 md:left-2 p-1 rounded-full">
                      <CheckCircle size={16} className="text-white" />
                    </div>
                  )}
                  {/* Book Count Badge */}
                  <div className="absolute top-1 md:top-2 right-1 md:right-2 px-1.5 md:px-2 py-0.5 md:py-1 bg-black bg-opacity-50 rounded-full text-white text-xs md:text-sm font-medium">
                    {curator.books?.length || 0}{' '}
                    {(curator.books?.length || 0) === 1 ? 'Book' : 'Books'}
                  </div>
                  {curator.coverImage ? (
                    <img
                      src={`${ipfsUrl}${curator.coverImage}`}
                      alt={curator.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-300">
                      <span className="text-white text-sm md:text-base">No Image</span>
                    </div>
                  )}
                  <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4 p-1 md:p-2 bg-black bg-opacity-50 text-white rounded">
                    <h3 className="text-xs md:text-sm font-bold truncate max-w-[120px] md:max-w-[180px]">
                      {curator.country}, {curator.state}
                    </h3>
                  </div>
                </a>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6 md:mt-8">
                <nav className="inline-flex shadow-sm rounded-md">
                  <Button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    variant="outlined"
                    className="px-2 md:px-3 py-1 md:py-2 text-sm rounded-l-md border-r-0"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {/* Show ellipsis for first page if not included in page numbers */}
                  {startPage > 1 && (
                    <>
                      <Button
                        onClick={() => handlePageChange(1)}
                        variant={currentPage === 1 ? "contained" : "outlined"}
                        className="hidden md:flex px-3 py-2 text-sm border-r-0"
                      >
                        1
                      </Button>
                      {startPage > 2 && (
                        <span className="hidden md:inline-flex items-center px-3 py-2 text-sm bg-white border border-gray-300 border-r-0">
                          ...
                        </span>
                      )}
                    </>
                  )}

                  {/* Page Numbers */}
                  {pageNumbers.map(number => (
                    <Button
                      key={number}
                      onClick={() => handlePageChange(number)}
                      variant={currentPage === number ? "contained" : "outlined"}
                      className="px-2 md:px-3 py-1 md:py-2 text-sm border-r-0"
                    >
                      {number}
                    </Button>
                  ))}

                  {/* Show ellipsis for last page if not included in page numbers */}
                  {endPage < totalPages && (
                    <>
                      {endPage < totalPages - 1 && (
                        <span className="hidden md:inline-flex items-center px-3 py-2 text-sm bg-white border border-gray-300 border-r-0">
                          ...
                        </span>
                      )}
                      <Button
                        onClick={() => handlePageChange(totalPages)}
                        variant={currentPage === totalPages ? "text" : "outlined"}
                        className="hidden md:flex px-3 py-2 text-sm border-r-0"
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}

                  <Button
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    variant="outlined"
                    className="px-2 md:px-3 py-1 md:py-2 text-sm rounded-r-md"
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
      {authenticated && <LibraryMascotWidget />}
    </div>
  );
};

export default LandingPage;
