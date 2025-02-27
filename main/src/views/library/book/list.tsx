'use client';

import React, { useState, useEffect } from 'react';

import { usePrivy } from '@privy-io/react-auth';
import { Box, Typography, TextField, Button, Pagination, Skeleton, IconButton } from '@mui/material';
import { ArrowLeft } from 'lucide-react';

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
      if (book.image) return;
      if (!book.isbn) return;

      try {
        const coverUrl = `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg?default=false`;
        const response = await fetch(coverUrl);

        if (response.ok) setCoverImage(coverUrl);
        else setCoverImage(null);
      } catch (error) {
        console.error('Error fetching cover image:', error);
        setCoverImage(null);
      }
    };

    fetchCoverImage();
  }, [book.isbn, book.image]);

  return (
    <Box
      sx={{
        bgcolor: 'white',
        borderRadius: 2,
        boxShadow: 3,
        overflow: 'hidden',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': { transform: 'scale(1.02)', boxShadow: 6 },
        width: '100%',
        maxWidth: '176px',
        mx: 'auto',
      }}
    >
      <Box sx={{ position: 'relative', height: '240px' }}>
        {coverImage ? (
          <img src={coverImage} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <FallbackBookCover title={book.title} author={book.author} width="176px" height="240px" />
        )}
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            px: 1.5,
            py: 0.5,
            bgcolor: 'rgba(55, 65, 81, 0.75)',
            borderRadius: '9999px',
            color: 'white',
            fontSize: '0.75rem',
            fontWeight: 'medium',
          }}
        >
          {book.curator.name}
        </Box>
      </Box>
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="contained"
          disabled={!book.availability}
          onClick={() => book.availability && (window.location.href = `/library/curator/${book.curator.id}/book/${book.isbn}`)}
          sx={{
            bgcolor: book.availability ? 'brown.600' : 'brown.500',
            color: 'white',
            '&:hover': { bgcolor: book.availability ? 'brown.800' : 'brown.500' },
            py: 1,
            fontSize: '0.875rem',
          }}
        >
          {book.availability ? 'Borrow Now' : 'Unavailable'}
        </Button>
        <Typography
          variant="caption"
          sx={{ color: 'grey.800', mt: 1, display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
          title={book.curator.location}
        >
          {book.curator.location}
        </Typography>
      </Box>
    </Box>
  );
};

// Skeleton Loader Component
const BookSkeleton: React.FC = () => (
  <Box
    sx={{
      width: '100%',
      maxWidth: '176px',
      mx: 'auto',
      bgcolor: 'white',
      borderRadius: 2,
      boxShadow: 3,
      overflow: 'hidden',
    }}
  >
    <Skeleton variant="rectangular" width="100%" height={240} />
    <Box sx={{ p: 2 }}>
      <Skeleton variant="rectangular" width="100%" height={36} sx={{ borderRadius: 1 }} />
      <Skeleton variant="text" width="80%" sx={{ mt: 1 }} />
    </Box>
  </Box>
);

const BooksPage: React.FC<LandingPageProps> = ({ data }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [hasData, setHasData] = useState(false);
  const { authenticated } = usePrivy();
  const booksPerPage = { xs: 4, sm: 12 }; // 4 on mobile, 12 on larger screens

  // Flatten all books from curators
  const allBooks = data?.flatMap(curator =>
    curator.books?.map(book => ({
      ...book,
      curator: { id: curator.id, name: curator.name, location: `${curator.city}, ${curator.state}, ${curator.country}` },
    }))
  ) || [];

  // Check if data is available
  useEffect(() => {
    console.log("Curators data:", data);
    console.log("All books data:", allBooks);

    const dataExists = Array.isArray(data) && data.length > 0 && Array.isArray(allBooks) && allBooks.length > 0;

    setHasData(dataExists);

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [data, allBooks]);

  // Filter books based on search query
  const filteredBooks = searchQuery
    ? allBooks.filter(book =>
        [book.title, book.author, book.curator.name].some(field =>
          field?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : allBooks;

  // Pagination logic with responsive books per page
  const getBooksPerPage = () => (window.innerWidth < 600 ? booksPerPage.xs : booksPerPage.sm);
  const [currentBooksPerPage, setCurrentBooksPerPage] = useState(getBooksPerPage());

  useEffect(() => {
    const handleResize = () => setCurrentBooksPerPage(getBooksPerPage());

    window.addEventListener('resize', handleResize);
    
return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalPages = Math.ceil(filteredBooks.length / currentBooksPerPage);
  const indexOfLastItem = currentPage * currentBooksPerPage;
  const indexOfFirstItem = indexOfLastItem - currentBooksPerPage;
  const paginatedBooks = filteredBooks.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Determine what content to show
  const renderContent = () => {
    if (isLoading) {
      return Array.from({ length: currentBooksPerPage }).map((_, index) => <BookSkeleton key={index} />);
    } else if (!hasData) {
      return (
        <Typography variant="body1" sx={{ gridColumn: '1 / -1', textAlign: 'center', color: 'grey.600' }}>
          No books are currently available in the library.
        </Typography>
      );
    } else if (searchQuery && filteredBooks.length === 0) {
      return (
        <Typography variant="body1" sx={{ gridColumn: '1 / -1', textAlign: 'center', color: 'grey.600' }}>
          No books found matching your search.
        </Typography>
      );
    } else {
      return paginatedBooks.map((book) => <BookCard key={book.id} book={book} />);
    }
  };

  return (
    <Box sx={{ maxWidth: '1200px', mx: 'auto', px: { xs: 2, sm: 4, lg: 8 }, py: 4, position: 'relative' }}>
      {/* Back Arrow */}
      <IconButton
        onClick={() => window.location.href = '/'}
        sx={{
          position: 'absolute',
          top: { xs: 8, sm: 16 },
          left: { xs: 8, sm: 16 },
          zIndex: 1200,
          bgcolor: 'grey.100',
          '&:hover': { bgcolor: 'grey.200' },
        }}
      >
        <ArrowLeft size={24} />
      </IconButton>

      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'grey.900' }}>
          Borrow a Book
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, color: 'grey.700', fontSize: { xs: '1rem', sm: '1.125rem' } }}>
          Explore our collection of books and borrow your next read.
        </Typography>
      </Box>

      {/* Search Bar */}
      <Box sx={{ maxWidth: '600px', mx: 'auto', mb: 6 }}>
        <TextField
          fullWidth
          placeholder="Search for books, authors, or libraries..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          variant="outlined"
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              bgcolor: 'white',
              '& fieldset': { borderColor: 'grey.300' },
              '&:hover fieldset': { borderColor: 'grey.500' },
              '&.Mui-focused fieldset': { borderColor: 'grey.500' },
            },
            '& .MuiInputBase-input': { py: 1.5, fontSize: '1rem' },
          }}
        />
      </Box>

      {/* Featured Section */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: { sm: 'space-between' },
          alignItems: { sm: 'center' },
          mb: { xs: 4, md: 6 },
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 'bold',
            mb: { xs: 2, sm: 0 },
            fontSize: { xs: '1.25rem', md: '1.5rem', lg: '1.875rem' },
          }}
        >
          Available Books
        </Typography>
        {hasData && (
          <Typography variant="body2" sx={{ color: 'grey.500', fontSize: '0.875rem' }}>
            Showing {filteredBooks.length > 0 ? `${indexOfFirstItem + 1}-${Math.min(indexOfLastItem, filteredBooks.length)} of ` : ''}{filteredBooks.length}
          </Typography>
        )}
      </Box>

      {/* Book Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)',
            sm: 'repeat(3, 1fr)',
            md: 'repeat(4, 1fr)',
            lg: 'repeat(5, 1fr)',
            xl: 'repeat(6, 1fr)',
          },
          gap: { xs: 2, sm: 3 },
          justifyItems: 'center',
        }}
      >
        {renderContent()}
      </Box>

      {/* Pagination */}
      {!isLoading && hasData && totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            size="medium"
            sx={{
              '& .MuiPaginationItem-root': {
                fontSize: { xs: '0.875rem', sm: '1rem' },
                minWidth: { xs: 32, sm: 36 },
                height: { xs: 32, sm: 36 },
              },
            }}
          />
        </Box>
      )}

      {authenticated && <LibraryMascotWidget />}
    </Box>
  );
};

export default BooksPage;
