'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Button, Card, CardContent, CircularProgress, Grid, TextField, Typography } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import { usePrivy } from '@privy-io/react-auth';
import { Library } from 'lucide-react';
import { borrowBookRequest } from '@/contract/Interraction';
import FallbackBookCover from '@/components/library/FallbackBookCover';

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

interface BorrowBook {
  onChainBorrowingId: string;
}

interface Curator {
  id: string;
  onChainUniqueId: string;
  transactionHash: string;
  name: string;
  description?: string;
  country: string;
  state: string;
  city: string;
  publicNotice: string;
  coverImage?: string;
  isVerified: boolean;
  books: Book[];
  borrowBook: BorrowBook;
}

interface BookDetailsProps {
  Curator: Curator;
  Book: Book;
}

const BookDetails: React.FC<BookDetailsProps> = ({ Book, Curator }) => {
  const [borrowerName, setBorrowerName] = useState('');
  const [borrowerEmail, setBorrowerEmail] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [borrowerPhone, setBorrowerPhone] = useState('');
  const [borrowDate, setBorrowDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = usePrivy();
  const [walletAddress, setWalletAddress] = useState('');
  const [imageError, setImageError] = useState(false);
  const [showSummary, setShowSummary] = useState(false); // State for summary visibility
  const [isGenerating, setIsGenerating] = useState(false); // State for generating summary
  const [summaryText, setSummaryText] = useState(''); // State for streaming summary text
  const router = useRouter();

  // Hard-coded summary for demonstration
  const fullSummary =
    "This is a dynamically generated summary of the book. It is being streamed letter by letter to simulate an AI-powered summary generation process. Once the summary is fully generated, you can flip back to the book cover.";

  // Function to simulate streaming the summary letter by letter
  const generateSummary = () => {
    setIsGenerating(true);
    setSummaryText('');
    let index = 0;
    const interval = setInterval(() => {
      if (index < fullSummary.length) {
        setSummaryText((prev) => prev + fullSummary[index]);
        index++;
      } else {
        clearInterval(interval);
        setIsGenerating(false);
      }
    }, 50); // Adjust the speed of streaming here
  };

  // Return home function
  const handleReturnHome = () => {
    router.push(`/library/curator/${Curator.id}`);
  };

  // Move the walletAddress update logic inside useEffect
  useEffect(() => {
    if (user && user.wallet) {
      setWalletAddress(user.wallet.address);
    }
  }, [user]);

  const handleSubmit = async () => {
    setError(null); // Clear any previous errors
    setLoading(true); // Start loading

    const BorrowBookData = {
      bookId: Book.onChainUniqueId,
      borrowDate: Math.floor(new Date(borrowDate).getTime() / 1000), // Convert to seconds
      returnDate: Math.floor(new Date(returnDate).getTime() / 1000), // Convert to seconds
    };

    const { borrowingId } = await borrowBookRequest(BorrowBookData);

    const borrowBookData = {
      wallet: walletAddress,
      bookId: Book.id.toString(),
      name: borrowerName,
      email: borrowerEmail,
      phone: borrowerPhone,
      deliveryAddress: deliveryAddress,
      borrowDate: new Date(borrowDate).toISOString(),
      returnDate: new Date(returnDate).toISOString(),
      curatorId: Curator.id.toString(),
      onChainBorrowingId: borrowingId,
    };

    try {
      // Send data to the API
      const response = await fetch(`/api/library/curator/${Curator.id}/borrow-book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(borrowBookData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit request');
      }

      await response.json();

      // Show success toast
      toast.success('Book borrowing request has been submitted successfully!', {
        position: 'bottom-center',
        autoClose: 3000, // Close after 3 seconds
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        onClose: () => {
          // Navigate to another page after toast closes
          window.location.href = `/library/curator/${Curator.id}`;
        },
      });

      // Clear form fields
      setBorrowerName('');
      setBorrowerEmail('');
      setBorrowerPhone('');
      setDeliveryAddress('');
      setBorrowDate('');
      setReturnDate('');
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

  const bookCover = Book.image
    ? Book.image
    : `https://covers.openlibrary.org/b/isbn/${Book.isbn}-L.jpg?default=false`;

  return (
    <div className="relative max-w-[990px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* Toast Container */}
      <ToastContainer />

      <Box
        sx={{
          position: 'absolute',
          top: 10,
          left: -50,
          zIndex: 10,
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
              borderColor: 'black',
            },
          }}
        >
          <Library size={24} />
        </Button>
      </Box>

      <Grid container spacing={2}>
        {/* Book Cover Image (on the Left) */}
        <Grid item xs={12} md={6}>
          <Box sx={{ position: 'relative', height: '100%', borderRadius: '12px', overflow: 'hidden' }}>
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                height: '100%',
                transformStyle: 'preserve-3d',
                transition: 'transform 0.6s',
                transform: showSummary ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
            >
              {/* Front Side (Book Cover) */}
              <Box
                sx={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  backfaceVisibility: 'hidden',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#f5f5f5',
                }}
              >
                {!imageError ? (
                  <img
                    src={bookCover}
                    alt={Book.title}
                    className="w-full h-full object-fit object-center"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <FallbackBookCover title={Book.title} author={Book.author} width="100%" height="100%" />
                )}
                <Button
                  variant="contained"
                  sx={{
                    position: 'absolute',
                    bottom: 16,
                    right: 16,
                    backgroundColor: 'black',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#333',
                    },
                  }}
                  onClick={() => setShowSummary(!showSummary)}
                >
                  View Summary
                </Button>
              </Box>

              {/* Back Side (Summary) */}
              <Box
                sx={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  backgroundColor: '#fff',
                  padding: 2,
                  boxShadow: 3,
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Summary
                </Typography>
                <Typography variant="body1" sx={{ textAlign: 'center', mb: 2 }}>
                  {summaryText}
                </Typography>
                {!isGenerating && summaryText === '' && (
                  <Button
                    variant="contained"
                    sx={{
                      mt: 2,
                      backgroundColor: 'black',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: '#333',
                      },
                    }}
                    onClick={generateSummary}
                  >
                    Generate Summary
                  </Button>
                )}
                {!isGenerating && summaryText !== '' && (
                  <Button
                    variant="contained"
                    sx={{
                      mt: 2,
                      backgroundColor: 'black',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: '#333',
                      },
                    }}
                    onClick={() => setShowSummary(!showSummary)}
                  >
                    Back to Cover
                  </Button>
                )}
                {isGenerating && <CircularProgress size={24} sx={{ mt: 2 }} />}
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* Book Details Section (on the Right) */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={2}>
            {/* Top Card with Title and Author */}
            <Grid item xs={12}>
              <Card elevation={3}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {Book.title}
                  </Typography>
                  <Typography variant="h6" color="textSecondary">
                    By {Book.author}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Bottom Card with Additional Details */}
            <Grid item xs={12}>
              <Card elevation={3}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="body1" color="textSecondary">
                    <strong>Publisher:</strong> {Book.publisher}
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    <strong>Publish Date:</strong> {new Date(Book.publishDate).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    <strong>Pagination:</strong> {Book.pagination} pages
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    <strong>ISBN:</strong> {Book.isbn}
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    <strong>Availability:</strong> {Book.availability ? 'Available' : 'Not Available'}
                  </Typography>
                  <Typography variant="body1" color="textSecondary" sx={{ mt: 2 }}>
                    <strong>Additional Notes:</strong> {Book.additionalNotes || 'No additional notes.'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Borrow Book Form */}
            <Grid item xs={12}>
              <Card elevation={3}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                    Borrow this Book
                  </Typography>

                  {/* Borrower Name */}
                  <TextField
                    fullWidth
                    label="Name"
                    variant="outlined"
                    value={borrowerName}
                    onChange={(e) => setBorrowerName(e.target.value)}
                    sx={{ mb: 2 }}
                  />

                  {/* Borrower Email */}
                  <TextField
                    fullWidth
                    label="Email"
                    variant="outlined"
                    value={borrowerEmail}
                    onChange={(e) => setBorrowerEmail(e.target.value)}
                    sx={{ mb: 2 }}
                  />

                  {/* Delivery Address */}
                  <TextField
                    fullWidth
                    label="Delivery Location"
                    variant="outlined"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    sx={{ mb: 2 }}
                  />

                  {/* Phone Number */}
                  <TextField
                    fullWidth
                    label="Phone Number (Optional)"
                    variant="outlined"
                    value={borrowerPhone}
                    onChange={(e) => setBorrowerPhone(e.target.value)}
                    sx={{ mb: 2 }}
                  />

                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <TextField
                      fullWidth
                      label="Borrow Date"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      value={borrowDate}
                      onChange={(e) => setBorrowDate(e.target.value)}
                    />

                    <TextField
                      fullWidth
                      label="Expected Return Date"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                    />
                  </Box>

                  {/* Submit Button */}
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleSubmit}
                    sx={{
                      mt: 2,
                      backgroundColor: 'black',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: '#333', // Slightly lighter black on hover
                      },
                    }}
                    disabled={loading} // Disable the button while loading
                  >
                    {loading ? (
                      <CircularProgress size={24} sx={{ color: 'white' }} />
                    ) : (
                      'Borrow Book'
                    )}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
};

export default BookDetails;
