'use client';

import React, { useState, useEffect } from 'react';

import { Book } from 'lucide-react';

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

// Fallback Book Cover Component
const FallbackBookCover: React.FC<{ title: string; author: string }> = ({ title, author }) => (
  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 p-4">
    <Book className="w-12 h-12 text-gray-400 mb-2" />
    <div className="text-xs text-center text-gray-600 font-medium truncate w-full">
      {title}
    </div>
    <div className="text-xs text-center text-gray-500 truncate w-full">
      {author}
    </div>
  </div>
);

// Book Card Component
const BookCard: React.FC<{ book: BookType & { curator: { id: string; name: string; location: string } } }> = ({ book }) => {
  console.log('book', book);
  console.log('book.curator', book.curator);
  const [coverImage, setCoverImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoverImage = async () => {
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
  }, [book.isbn]);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transform transition-all">
      {/* Book Cover */}
      <div className="relative h-40">
        {coverImage ? (
          <img
            src={coverImage}
            alt={book.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <FallbackBookCover title={book.title} author={book.author} />
        )}
        <div className="absolute bottom-2 left-2 px-2 py-1 bg-gray-800 bg-opacity-75 rounded-full text-white text-xs font-medium">
          {book.curator.name}
        </div>
      </div>

      {/* Book Details */}
      <div className="p-3">
        <h2 className="text-sm font-bold text-gray-900 truncate" title={book.title}>
          {book.title}
        </h2>
        <p className="mt-1 text-xs text-gray-700 truncate" title={book.author}>
          {book.author}
        </p>
        <p className="mt-1 text-xs text-gray-500 truncate" title={book.curator.location}>
          {book.curator.location}
        </p>

        {/* Borrow Button */}
        <button
          className={`mt-2 w-full px-2 py-1 rounded-md text-xs transition-colors ${
            book.availability
              ? 'bg-brown-600 hover:bg-brown-800 text-white'
              : 'bg-brown-500 text-gray-500 cursor-not-allowed'
          }`}
          disabled={!book.availability}
          onClick={() => {
            if (book.availability) {
              window.open(`/library/curator/${book.curator.id}/book/${book.isbn}`);
            }
          }}
        >
          {book.availability ? 'Borrow Now' : 'Unavailable'}
        </button>
      </div>
    </div>
  );
};

const BooksPage: React.FC<LandingPageProps> = ({ data }) => {
  const [searchQuery, setSearchQuery] = useState('');

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
    </div>
  );
};

export default BooksPage;
