import React, { useState, useMemo, useEffect } from 'react';

import Link from 'next/link';

import {
  CardContent,
  Box,
  TextField,
  InputAdornment,
  Grid,
  Skeleton,
  Typography,
  CircularProgress,
} from '@mui/material';
import { Search, BookX } from 'lucide-react';

import FallbackBookCover from '@/components/library/FallbackBookCover';

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: number;
  image?: string; // Base64 encoded image
}

interface BookCurator {
  id: string;
  books: Book[];
}

interface BookSearchGridProps {
  BookCurator: BookCurator;
  Books: Book[];
  failedLoads: Set<number>;
  onImageError: (isbn: number) => void;
}

const BookSearchGrid: React.FC<BookSearchGridProps> = ({
  BookCurator,
  Books,
  failedLoads,
  onImageError,
}) => {
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Handle debounced search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setIsSearching(false);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Show loading state when typing
  useEffect(() => {
    if (searchQuery !== debouncedQuery) {
      setIsSearching(true);
    }
  }, [searchQuery, debouncedQuery]);

  const handleImageLoad = (isbn: number) => {
    setLoadedImages((prev) => new Set(prev.add(isbn)));
  };

  const filteredBooks = useMemo(() => {
    if (!debouncedQuery.trim()) return Books;

    const query = debouncedQuery.toLowerCase().trim();

    return Books.filter((book) => {
      if (book.isbn.toString().includes(query)) return true;
      if (book.title.toLowerCase().includes(query)) return true;
      const titleWords = book.title.toLowerCase().split(' ');


return titleWords.some((word) => word.startsWith(query));
    });
  }, [Books, debouncedQuery]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const renderEmptyState = () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 2,
        minHeight: '300px',
        backgroundColor: 'rgba(0, 0, 0, 0.02)',
        borderRadius: 2,
        textAlign: 'center',
      }}
    >
      <BookX size={48} strokeWidth={1.5} style={{ marginBottom: '16px', opacity: 0.6 }} />
      <Typography variant="h6" sx={{ mb: 1, color: 'text.primary' }}>
        No books found
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: '400px' }}>
        {Books.length === 0
          ? 'This library is currently empty. Books added to this library will appear here.'
          : `No books match "${searchQuery}". Try adjusting your search term or check for typos.`}
      </Typography>
      {searchQuery && Books.length > 0 && (
        <Typography
          variant="body2"
          sx={{
            mt: 2,
            color: 'primary.main',
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' },
          }}
          onClick={() => setSearchQuery('')}
        >
          Clear search and show all books
        </Typography>
      )}
    </Box>
  );

  return (
    <CardContent sx={{ p: 4 }}>
      {/* Search Bar */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <TextField
          fullWidth
          placeholder="Search books by title or ISBN..."
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={20} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                {isSearching && (
                  <CircularProgress
                    size={20}
                    sx={{
                      color: 'text.secondary',
                      opacity: 0.7,
                    }}
                  />
                )}
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiInputBase-root': {
              height: '36px',
              padding: '0 14px',
            },
            '& .MuiInputBase-input': {
              padding: '6px 0',
            },
          }}
        />
      </Box>

      {/* Results count */}
      {searchQuery && !isSearching && filteredBooks.length > 0 && (
        <Box sx={{ mb: 2, color: 'text.secondary' }}>
          Found {filteredBooks.length} {filteredBooks.length === 1 ? 'book' : 'books'}
        </Box>
      )}

      {/* Empty state or grid of books */}
      {!isSearching && filteredBooks.length === 0 ? (
        renderEmptyState()
      ) : (
        <Grid container spacing={2}>
          {filteredBooks.map((book) => {
            const bookCover = `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg?default=false`;
            const shouldShowFallback = failedLoads.has(book.isbn);
            const isImageLoaded = loadedImages.has(book.isbn);

            return (
              <Grid item xs={2.4} sm={2.4} md={2.4} key={book.id}>
                <Link href={`/library/curator/${BookCurator.id}/book/${book.isbn}`} passHref>
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      height: '250px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      '&:hover .overlay': {
                        opacity: 1,
                      },
                    }}
                  >
                    {/* Priority 1: Base64 Encoded Image */}
                    {book.image ? (
                      <img
                        src={book.image}
                        alt={book.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <>
                        {/* Priority 2: OpenLibrary Link */}
                        {!shouldShowFallback ? (
                          <>
                            {!isImageLoaded && (
                              <Skeleton
                                variant="rectangular"
                                width="100%"
                                height="100%"
                              />
                            )}
                            <img
                              src={bookCover}
                              alt={book.title}
                              onLoad={() => handleImageLoad(book.isbn)}
                              onError={() => onImageError(book.isbn)}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                display: isImageLoaded ? 'block' : 'none',
                              }}
                            />
                          </>
                        ) : (
                          // Priority 3: FallbackBookCover
                          <FallbackBookCover
                            title={book.title}
                            author={book.author}
                            width="100%"
                            height="100%"
                          />
                        )}
                      </>
                    )}
                  </Box>
                </Link>
              </Grid>
            );
          })}
        </Grid>
      )}
    </CardContent>
  );
};

export default BookSearchGrid;
