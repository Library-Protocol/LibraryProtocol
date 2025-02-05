'use client';

import React, { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { usePrivy } from '@privy-io/react-auth';

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
  CircularProgress, // For the loading spinner
} from '@mui/material';
import { Calendar, Book, Home } from 'lucide-react';

import { ToastContainer, toast } from 'react-toastify'; // Import toast notifications

import BookSearchGrid from '@/components/library/BookSaerchCard';


interface Book {
  id: string;
  wallet: string
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
  wallet: string;
  name: string;
  description: string;
  country: string;
  state: string;
  city: string;
  coverImage: string;
  publicNotice: string;
  isVerified: boolean;
  books: Book[];
}

interface LandingDetailsProps {
  Curator: Curator;
}

const LibraryDetails: React.FC<LandingDetailsProps> = ({ Curator }) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [bookTitle, setBookTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [failedLoads, setFailedLoads] = useState(new Set<number>());

  const { user } = usePrivy();
  const [walletAddress, setWalletAddress] = useState('');
  const router = useRouter();

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchClick = () => {
    console.log('Searching for:', searchQuery);
  };

  const handleImageError = (isbn: number) => {
    setFailedLoads((prev) => new Set(prev).add(isbn));
  };

  const handleClickOpen = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
    setError(null);
  };

  // Return home function
  const handleReturnHome = () => {
    router.push('/');
  };

  useEffect(() => {
    if (user && user.wallet) {
      setWalletAddress(user.wallet.address);
    }
  }, [user]);

  const handleSubmitRequest = async () => {

    if (!bookTitle) {
      setError('Book title is required');

      return;
    }

    setError(null);
    setLoading(true);

    const requestData = {
      wallet: walletAddress,
      title: bookTitle,
      author: author || '',
      additionalNotes: additionalNotes || '',
      curatorId: Curator.id.toString(),
    };

    try {
      const response = await fetch(`/api/library/curator/${Curator.id}/request-book`, {
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

      await response.json();

      toast.success('Your book request has been submitted successfully!', {
        position: 'bottom-center',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      setBookTitle('');
      setAuthor('');
      setAdditionalNotes('');
      handleClose();
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

  const transactions = [
    { id: 1, book: "The Great Gatsby", borrowDate: "2025-01-20", returnDate: "2025-02-20", status: "active" },
    { id: 2, book: "To Kill a Mockingbird", borrowDate: "2025-01-15", returnDate: "2025-02-15", status: "overdue" },
    { id: 3, book: "1984", borrowDate: "2025-01-25", returnDate: "2025-02-25", status: "active" },
  ];

  return (
    <div className="relative max-w-[990px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* Home Icon Button */}
      <Box
        sx={{
          position: 'absolute',
          top: 12,
          left: -50,
          zIndex: 10
        }}
      >
        <Button
          variant="outlined"
          onClick={handleReturnHome}
          sx={{
            minWidth: 'auto',
            p: 1,
            borderColor: 'black',
            color: 'black',
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.1)',
              borderColor: 'black'
            }
          }}
        >
          <Home size={24} />
        </Button>
      </Box>

      <ToastContainer />

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <Box sx={{ position: 'relative', height: '100%' }}>
              <img
                src={`${ipfsUrl}${Curator.coverImage}`}
                alt='sample'
                className="w-full h-full object-cover"
              />
            </Box>
          </Card>
        </Grid>

        {/* Rest of the existing component remains unchanged */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card elevation={3}>
                <CardContent sx={{ textAlign: 'center', p: 4 }}>
                  <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Ready to borrow?
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Book />}
                    onClick={handleClickOpen}
                    sx={{
                      mt: 1,
                      backgroundColor: 'black',
                      color: 'white',
                      '&:hover': { backgroundColor: '#333' }
                    }}
                  >
                    Request a Book
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Remaining Grid items and content stay the same */}
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
                                color: 'white'
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

            {/* Remaining Grid items and content stay the same */}
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
                      height: '100%',
                    }}
                  >
                    <Typography variant="h5">{Curator.name} Library Notice</Typography>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      height: '200px',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      px: 3,
                    }}
                  >
                    <Typography variant="body1" color="text.secondary">
                      {Curator.publicNotice && Curator.publicNotice.trim() ? (
                        Curator.publicNotice
                      ) : (
                        "All library books must be handled with care and returned in good condition. Borrowing privileges are available to registered members only. Please follow platform library guidelines for a smooth and enjoyable experience."
                      )}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Book Search Section */}
      <Card elevation={3} sx={{ mt: 4 }}>
        <BookSearchGrid
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onSearchClick={handleSearchClick}
          BookCurator={{
            ...Curator,
            id: String(Curator.id)
          }}
          failedLoads={failedLoads as Set<number>}
          onImageError={handleImageError}
        />
      </Card>

      {/* Request Book Modal */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Request a Book</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Book Title"
              variant="outlined"
              value={bookTitle}
              onChange={(e) => setBookTitle(e.target.value)}
              error={!!error}
              helperText={error}
            />
            <TextField
              fullWidth
              label="Author (optional)"
              variant="outlined"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
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
            {loading ? <CircularProgress size={24} /> : 'Submit Request'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default LibraryDetails;
