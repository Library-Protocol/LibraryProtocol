'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Typography,
  Box,
  Paper,
  Chip,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import { Search, Calendar } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import FallbackBookCover from '@/components/library/FallbackBookCover';

interface Book {
  id: string;
  title: string;
  author: string;
  publisher: string;
  publishDate: Date; // ✅ Match Prisma DateTime
  pagination: number;
  additionalNotes?: string;
  isbn: number;
  availability: boolean;
  image?: string;
  curatorId: string;
  createdAt: Date;
}

interface Curator {
  id: string;
  name: string;
  description?: string;
  country: string;
  state: string;
  city: string;
  coverImage?: string;
  isVerified: boolean;
  books: Book[]; // ✅ Plural "books"
}

interface LandingDetailsProps {
  Curator: Curator;
}


const CuratorDashboard: React.FC<LandingDetailsProps> = ({ Curator }) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [bookTitle, setBookTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isbn, setIsbn] = useState('');
  const [publisher, setPublisher] = useState('');
  const [publishDate, setPublishDate] = useState('');
  const [pagination, setPagination] = useState('');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false); // Loading state for ISBN search

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setError(null);
  };

  const [failedLoads, setFailedLoads] = useState(new Set());

  const handleImageError = (isbn: number) => {
    setFailedLoads(prev => new Set(prev).add(isbn));
  };

  // Fetch book data when ISBN is 14 characters long
  useEffect(() => {
    if (isbn.length === 13) {
      fetchBookData(Number(isbn)); // Convert string to number
    }
  }, [isbn]);

  const fetchCoverImage = async (isbn: number) => {
    try {
      const coverUrl = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`;
      const coverResponse = await fetch(coverUrl);

      if (coverResponse.ok) {
        setCoverImage(coverUrl); // Set the cover image URL if valid
      } else {
        setCoverImage(null); // No cover image available
      }
    } catch (error) {
      console.error('Error fetching cover image:', error);
      setCoverImage(null); // Fallback to null in case of an error
    }
  };

  const fetchBookData = async (isbn: number) => {
    setSearchLoading(true); // Show spinner
    try {
      const response = await fetch(`/api/openlibrary/search?isbn=${isbn}`);
      if (!response.ok) {
        throw new Error('Failed to fetch book data');
      }
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Auto-fill form fields
      setBookTitle(data.title || '');
      setAuthor(data.authors || '');
      setPublisher(data.publisher || '');
      setPublishDate(data.publishDate || '');
      setPagination(data.pagination || '');

      // Fetch the cover image separately
      await fetchCoverImage(isbn);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch book data', {
        position: 'bottom-center',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setSearchLoading(false); // Hide spinner
    }
  };

  const handleSubmitRequest = async () => {
    if (!bookTitle) {
      setError('Book title is required');
      return;
    }

    setError(null);
    setLoading(true);

    const requestData = {
      title: bookTitle,
      author: author || '',
      additionalNotes: additionalNotes || '',
      isbn: isbn || '',
      publisher: publisher || '',
      publishDate: publishDate || '',
      pagination: pagination || '',
      curatorId: Curator.id.toString(),
    };

    console.log('requested data', requestData);

    try {
      const response = await fetch(`/api/library/curator/${Curator.id}/add-book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit request');
      }

      const data = await response.json();

      toast.success('Your book has successfully been added to your catalog!', {
        position: 'bottom-center',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Reset form fields
      setBookTitle('');
      setAuthor('');
      setAdditionalNotes('');
      setIsbn('');
      setPublisher('');
      setPublishDate('');
      setPagination('');
      setCoverImage(null); // Reset cover image
      handleClose();

      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || 'There was an error submitting your request', {
        position: 'bottom-center',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const ipfsUrl = process.env.NEXT_PUBLIC_IPFS_GATEWAY;

  const transactions = [];

  return (
    <div className="relative max-w-[990px] mx-auto px-4 sm:px-6 lg:px-8">
      <ToastContainer />

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <Box sx={{ position: 'relative', height: '100%' }}>
              <img
                src={`${ipfsUrl}${Curator.coverImage}`}
                alt="sample"
                className="w-full h-full object-cover"
              />
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <div
                className="relative bg-gradient-to-r from-green-600 to-teal-500 rounded-[32px] overflow-hidden p-4 text-white transform transition-all duration-300 hover:scale-10 hover:shadow-2xl"
                style={{ minHeight: 'auto' }}
              >
                <div className="absolute inset-0 bg-black/10 hover:bg-black/20 transition-all duration-300 z-0" />
                <h2 className="text-xl sm:text-2xl font-bold mb-2">Welcome, {Curator.name}</h2>
                <p className="text-sm sm:text-base mb-3">
                  Contribute to our onchain library. Share your favorite books and help others discover new stories.
                </p>
                <div className="flex justify-end">
                  <button
                    className="bg-white text-black px-5 py-1.5 rounded-lg font-medium text-base hover:bg-black hover:text-white transition-colors z-20 relative"
                    onClick={handleClickOpen}
                  >
                    Add a Book
                  </button>
                </div>
              </div>
            </Grid>

            <Grid item xs={12}>
              <Card elevation={3}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Calendar size={20} style={{ marginRight: 8 }} />
                    <Typography variant="h5">Current Lendings</Typography>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                      height: '200px',
                      overflowY: 'auto',
                      justifyContent: transactions.length === 0 ? 'center' : 'flex-start',
                      textAlign: 'center',
                    }}
                  >
                    {transactions.length === 0 ? (
                      <Typography variant="body1" color="text.secondary">
                        No borrowing logs available at the moment
                      </Typography>
                    ) : (
                      transactions.map((transaction) => (
                        <Paper key={transaction.id} elevation={1} sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                              <Typography variant="subtitle1">{transaction.book}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                Borrowed: {transaction.borrowDate}
                              </Typography>
                            </Box>
                            <Chip
                              label={`Return by: ${transaction.returnDate}`}
                              sx={{
                                backgroundColor: 'black',
                                color: 'white',
                              }}
                              variant="outlined"
                            />
                          </Box>
                        </Paper>
                      ))
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card elevation={3}>
                <CardContent sx={{ p: 4 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      height: '50px',
                    }}
                  >
                    <Typography variant="h5">{Curator.name} Library Notice</Typography>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      height: '100px',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      px: 3,
                    }}
                  >
                    <Typography variant="body1" color="text.secondary">
                      All library books must be handled with care and returned in good condition. Borrowing privileges
                      are available to registered members only. Please follow platform library guidelines for a smooth
                      and enjoyable experience.
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <Card elevation={3} sx={{ mt: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
            <TextField
              fullWidth
              placeholder="Search books by title, author, or ISBN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={20} />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              sx={{
                mt: 1,
                backgroundColor: 'black',
                color: 'white',
                '&:hover': { backgroundColor: '#333' },
              }}
            >
              Search
            </Button>
          </Box>
          <Grid container spacing={2}>
            {Curator.books.map((book) => {
              const bookCover = `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg?default=false`;
              const shouldShowFallback = failedLoads.has(book.isbn);

              return (
                <Grid item xs={2.4} sm={2.4} md={2.4} key={book.id}>
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      height: '250px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      '&:hover .overlay': {
                        opacity: 1,
                      },
                    }}
                  >
                    {!shouldShowFallback ? (
                      <img
                        src={bookCover}
                        alt={book.title}
                        onError={() => handleImageError(book.isbn)}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <FallbackBookCover title={book.title} author={book.author} width="180px" height="250px" />
                    )}
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Add A Book</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', gap: 4 }}>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="ISBN"
                variant="outlined"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                error={!!error}
                helperText={error}
                InputProps={{
                  endAdornment: searchLoading ? (
                    <InputAdornment position="end">
                      <CircularProgress size={20} />
                    </InputAdornment>
                  ) : null,
                }}
              />
              <TextField
                fullWidth
                label="Book Title"
                variant="outlined"
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
              />
              <TextField
                fullWidth
                label="Author"
                variant="outlined"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
              <TextField
                fullWidth
                label="Publisher"
                variant="outlined"
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
              />
              <TextField
                fullWidth
                label="Publish Date"
                variant="outlined"
                value={publishDate}
                onChange={(e) => setPublishDate(e.target.value)}
              />
              <TextField
                fullWidth
                label="Pagination"
                variant="outlined"
                value={pagination}
                onChange={(e) => setPagination(e.target.value)}
              />
              <TextField
                fullWidth
                label="Additional Notes"
                multiline
                rows={3}
                variant="outlined"
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
              />
            </Box>

            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {coverImage ? (
                <img
                  src={coverImage}
                  alt={publisher}
                  style={{ maxWidth: '100%', maxHeight: '450px', borderRadius: '3px' }}
                />
              ) : (
                <FallbackBookCover title={bookTitle} author={author} />
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClose}
            sx={{
              color: 'black',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitRequest}
            disabled={loading}
            sx={{
              color: 'white',
              backgroundColor: 'black',
              border: '1px solid white',
              '&:hover': {
                backgroundColor: 'white',
                color: 'black',
              },
            }}
          >
            {loading ? <CircularProgress size={24} /> : 'Add Book'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CuratorDashboard;
