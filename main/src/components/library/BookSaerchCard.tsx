import React, { useState } from 'react';

import Link from 'next/link';

import {
  CardContent,
  Box,
  TextField,
  InputAdornment,
  Button,
  Grid,
  Skeleton
} from '@mui/material';
import { Search } from 'lucide-react';

import FallbackBookCover from '@/components/library/FallbackBookCover';

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: number;
}

interface BookCurator {
  id: string;
  books: Book[];
}

interface BookSearchGridProps {
  searchQuery: string;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchClick: () => void;
  BookCurator: BookCurator;
  Books: Book[];
  failedLoads: Set<number>;
  onImageError: (isbn: number) => void;
}

const BookSearchGrid: React.FC<BookSearchGridProps> = ({
  searchQuery,
  onSearchChange,
  onSearchClick,
  BookCurator,
  Books,
  failedLoads,
  onImageError,
}) => {
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  const handleImageLoad = (isbn: number) => {
    setLoadedImages(prev => new Set(prev.add(isbn)));
  };

  return (
    <CardContent sx={{ p: 4 }}>
      {/* Search Bar and Button */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <TextField
          fullWidth
          placeholder="Search books by title, author, or ISBN..."
          value={searchQuery}
          onChange={onSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={20} />
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
        <Button
          variant="contained"
          onClick={onSearchClick}
          sx={{
            backgroundColor: 'black',
            color: 'white',
            padding: '6px 16px',
            '&:hover': { backgroundColor: '#333' },
          }}
        >
          Search
        </Button>
      </Box>
      <Grid container spacing={2}>
        {Books.map((book) => {
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
                    <FallbackBookCover
                      title={book.title}
                      author={book.author}
                      width="100%"
                      height="100%"
                    />
                  )}
                </Box>
              </Link>
            </Grid>
          );
        })}
      </Grid>
    </CardContent>
  );
};

export default BookSearchGrid;
