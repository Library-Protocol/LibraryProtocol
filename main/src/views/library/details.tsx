'use client';

import React, { useState } from 'react';
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
  CircularProgress, // For the loading spinner
} from '@mui/material';
import { Search, Calendar, Book } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify'; // Import toast notifications

interface Curator {
  id: number;
  name: string;
  description: string;
  country: string;
  state: string;
  city: string;
  coverImage: string;
  isVerified: boolean;
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

  const [error, setError] = useState<string | null>(null); // Error state for validation
  const [loading, setLoading] = useState(false); // Loading state for form submission

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setError(null); // Clear errors when modal is closed
  };

  const handleSubmitRequest = async () => {
    // Basic validation
    if (!bookTitle) {
      setError('Book title is required');
      return;
    }

    setError(null); // Clear any previous errors
    setLoading(true); // Start loading

    // Prepare the data for submission
    const requestData = {
      title: bookTitle,
      author: author || '', // optional field
      additionalNotes: additionalNotes || '', // optional field
      curatorId: Curator.id.toString(),
    };

    try {
      // Send data to the API
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

      const data = await response.json();

      // Show success toast
      toast.success('Your book request has been submitted successfully!', {
        position: 'bottom-center',
        autoClose: 3000, // Close after 3 seconds
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Clear form fields
      setBookTitle('');
      setAuthor('');
      setAdditionalNotes('');
      handleClose(); // Close the modal
    } catch (error: any) {

      // Show error toast
      toast.error(error.message || 'There was an error submitting your request', {
        position: 'bottom-center',
        autoClose: 3000, // Close after 3 seconds
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const ipfsUrl = process.env.NEXT_PUBLIC_IPFS_GATEWAY;

  const transactions = [
    { id: 1, book: "The Great Gatsby", borrowDate: "2025-01-20", returnDate: "2025-02-20", status: "active" },
    { id: 2, book: "To Kill a Mockingbird", borrowDate: "2025-01-15", returnDate: "2025-02-15", status: "overdue" },
    { id: 3, book: "1984", borrowDate: "2025-01-25", returnDate: "2025-02-25", status: "active" },
  ];

  const books = [
    { id: 1, title: "The Great Gatsby", author: "F. Scott Fitzgerald", available: true },
    { id: 2, title: "To Kill a Mockingbird", author: "Harper Lee", available: false },
    { id: 3, title: "1984", author: "George Orwell", available: true },
    { id: 4, title: "Pride and Prejudice", author: "Jane Austen", available: true },
    { id: 5, title: "Moby Dick", author: "Herman Melville", available: true },
    { id: 6, title: "The Catcher in the Rye", author: "J.D. Salinger", available: false },
    { id: 7, title: "Brave New World", author: "Aldous Huxley", available: true },
    { id: 8, title: "War and Peace", author: "Leo Tolstoy", available: true },
    { id: 9, title: "The Odyssey", author: "Homer", available: true },
    { id: 10, title: "The Picture of Dorian Gray", author: "Oscar Wilde", available: false },
  ];

  return (
    <div className="relative max-w-[990px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* Toast Container */}
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

        {/* Right Side */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={3}>
            {/* Top - Request Book Button */}
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
                      '&:hover': { backgroundColor: '#333' } // Slightly lighter black on hover
                    }}
                  >
                    Request a Book
                  </Button>
                </CardContent>
              </Card>
            </Grid>


            {/* Bottom - Transactions */}
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
                      height: '200px', // Fixed height for the list section
                      overflowY: 'auto', // Scroll if the content exceeds the height
                      justifyContent: transactions.length === 0 ? 'center' : 'flex-start', // Center content if empty
                      textAlign: 'center', // Center the text
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
            <Grid item xs={12}>
              <Card elevation={3}>
                <CardContent sx={{ p: 4 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center', // Center horizontally
                      justifyContent: 'center', // Center vertically
                      textAlign: 'center',
                      height: '100%', // Ensure full height for centering
                    }}
                  >
                    <Typography variant="h5">{Curator.name} Library Notice</Typography>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      height: '200px', // Fixed height
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      px: 3, // Add padding for better readability
                    }}
                  >
                    <Typography variant="body1" color="text.secondary">
                    All library books must be handled with care and returned in good condition. Borrowing privileges are available to registered members only. Please follow platform library guidelines for a smooth and enjoyable experience.
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
                      '&:hover': { backgroundColor: '#333' } // Slightly lighter black on hover
                    }}
                  >
                    Search
            </Button>
            </Box>
            <Grid container spacing={2}>
              {books.map((book) => (
                <Grid item xs={2.4} sm={2.4} md={2.4} key={book.id}>  {/* xs, sm, md: 12 / 5 = 2.4 */}
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      height: '300px', // Fixed height
                      borderRadius: '8px',
                      overflow: 'hidden',
                      '&:hover .overlay': {
                        opacity: 1,
                      }
                    }}
                  >
                    <img
                      src={`${ipfsUrl}QmY46BDeryMhxUXteDS5im7424F9GDZmh5M6upjitUJCEG`}
                      alt={book.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover', // Ensures the image covers the area
                      }}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
        </CardContent>
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
            disabled={loading} // Disable button while loading
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
