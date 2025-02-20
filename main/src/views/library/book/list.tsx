'use client';

import React, { useState, useEffect } from 'react';

import { usePrivy } from '@privy-io/react-auth';

import FallbackBookCover from '@/components/library/FallbackBookCover';
import LibraryMascotWidget from '@/components/effects/MascotWidget';

interface BookType {
  id: string;
  onChainUniqueId: string;
  title: string;
  author: string;
  publisher: string;
  publishDate: string;
  pagination: number;
  isbn: string;
  availability: boolean;
  image: string | null;
  nftTokenId: string;
}

interface Curator {
  id: string;
  onChainUniqueId: string;
  name: string;
  country: string;
  city: string;
  state: string;
  coverImage: string | null;
  isVerified: boolean;
  books: BookType[];
}

interface LandingPageProps {
  data: Curator[];
}

// Book Card Component
const BookCard: React.FC<{ book: BookType & { curator: { id: string; name: string; location: string } } }> = ({ book }) => {
  const [coverImage, setCoverImage] = useState<string | null>(book.image || null);

  useEffect(() => {
    const fetchCoverImage = async () => {
      // If book.image is already set (base64), skip fetching
      if (book.image) return;

      if (!book.isbn) return;

      try {
        const coverUrl = `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg?default=false`;
        const coverResponse = await fetch(coverUrl);

        if (coverResponse.ok) {
          setCoverImage(coverUrl);
        } else {
          setCoverImage(null);
        }
      } catch (error) {
        console.error('Error fetching cover image:', error);
        setCoverImage(null);
      }
    };

    fetchCoverImage();
  }, [book.isbn, book.image]);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transform transition-all hover:shadow-lg">
      {/* Book Cover */}
      <div className="relative h-60">
        {coverImage ? (
         <img
         src={coverImage}
         alt={book.title}
         className="w-full h-full object-cover object-center"
       />
        ) : (
          <FallbackBookCover title={book.title} author={book.author} width={'176px'} height={'240px'} />
        )}

        {/* Curator Name Badge */}
        <div className="absolute top-2 left-2 px-2 py-1 bg-gray-800 bg-opacity-75 rounded-full text-white text-xs font-medium">
          {book.curator.name}
        </div>
      </div>

      {/* Borrow Button */}
      <div className="p-3">
        <button
          className={`w-full px-4 py-2 rounded-md text-sm transition-colors ${
            book.availability
              ? 'bg-brown-600 hover:bg-brown-800 text-white'
              : 'bg-brown-500 text-white cursor-not-allowed'
          }`}
          disabled={!book.availability}
          onClick={() => {
            if (book.availability) {
              window.location.href = `/library/curator/${book.curator.id}/book/${book.isbn}`;
            }
          }}
        >
          {book.availability ? 'Borrow Now' : 'Unavailable'}
        </button>
        <p className="text-xs text-black truncate mt-2" title={book.curator.location}>
            {book.curator.location}
          </p>
      </div>
    </div>
  );
};

const BooksPage: React.FC<LandingPageProps> = ({ data }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { authenticated } = usePrivy(); // Get Privy authentication methods

  // Flatten all books from all curators
  const allBooks = data.flatMap(curator =>
    curator.books.map(book => ({
      ...book,
      curator: {
        id: curator.id,
        name: curator.name,
        location: `${curator.city}, ${curator.state}, ${curator.country}`
      }
    }))
  );

  // Filter books based on search query
  const filteredBooks = searchQuery
    ? allBooks.filter(book =>
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.curator.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allBooks;

  return (
    <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900">Borrow a Book</h1>
        <p className="mt-4 text-lg text-gray-700">
          Explore our collection of books and borrow your next read.
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-3xl mx-auto mb-12">
        <input
          type="text"
          placeholder="Search for books, authors, or libraries..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-6 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-gray-900 placeholder-gray-400"
        />
      </div>

      {/* Book Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {filteredBooks.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>

      {authenticated && <LibraryMascotWidget />}
    </div>
  );
};

export default BooksPage;
