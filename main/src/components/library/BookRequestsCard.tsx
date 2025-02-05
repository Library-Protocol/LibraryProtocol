import React, { useState, useEffect } from 'react';

import {
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  IconButton,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  CircularProgress,
  InputAdornment,
  Grid,
} from '@mui/material';
import { Calendar, Copy } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';

import { toast } from 'react-toastify';

import FallbackBookCover from './FallbackBookCover';

interface BookRequest {
  id: string;
  title: string;
  author: string;
  additionalNotes?: string;
  curatorId: string;
  wallet: string;
  createdAt: Date;
}

interface Book {
  id?: string;
  isbn: string;
  title: string;
  author: string;
  publisher?: string;
  publishDate?: string;
  pagination?: string;
  coverImage?: string;
  notes?: string;
  isbnExternalSearch?: string;
}

interface Curator {
  id: string;
}

const BookRequestsCard = ({ bookRequests, Curator }: { bookRequests: BookRequest[], Curator: Curator }) => {
  const [selectedRequest, setSelectedRequest] = useState<BookRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [bookSystemStatus, setBookSystemStatus] = useState<'existing' | 'new'>('existing');
  const [selectedExistingBook, setSelectedExistingBook] = useState<Book | null>(null);
  const [newBookDetails, setNewBookDetails] = useState<Partial<Book>>({});
  const [newBookDetailsExternalSearch, setNewBookDetailsExternalSearch] = useState<Partial<Book>>({});
  const [isbn, setIsbn] = useState<string>('');
  const [isbnExternalSearch, setIsbnExternalSearch] = useState<string>('');
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [, setHasBookData] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const { user } = usePrivy();


  // Reset form and switch status
  const clearFormFields = () => {
    setNewBookDetails({});
    setNewBookDetailsExternalSearch({});
    setIsbn('');
    setIsbnExternalSearch('');
    setCoverImage(null);
    setHasBookData(false);
  };

  useEffect(() => {
    if (user && user.wallet) {
      setWalletAddress(user.wallet.address);
    }
  }, [user]);

  // Fetch book data when ISBN length is 13
  useEffect(() => {
    if (isbn.length === 13) {
      fetchBookData(Number(isbn));
      fetchExternalBookData(Number(isbnExternalSearch));
    } else {
      setHasBookData(false); // Reset if ISBN is not 13 digits
    }
  }, [isbn, Curator.id]);

  useEffect(() => {
    console.log("isbnExternalSearch changed:", isbnExternalSearch); // Debugging

    if (isbnExternalSearch.length === 13) {
      console.log("Fetching external book data..."); // Debugging
      fetchExternalBookData(Number(isbnExternalSearch));
    } else {
      setHasBookData(false); // Reset if ISBN is not 13 digits
    }
  }, [isbnExternalSearch]); // Ensure this dependency is correct

  const fetchCoverImage = async (isbn: number) => {
    try {
      const coverUrl = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`;
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

  const fetchBookData = async (isbn: number) => {
    setSearchLoading(true);

    try {
      const response = await fetch(`/api/library/curator/${Curator.id}/books/search?isbn=${isbn}`);

      if (!response.ok) {
        throw new Error('Failed to fetch book data');
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.books || !Array.isArray(data.books) || data.books.length === 0) {
        throw new Error('No books found');
      }

      const book = data.books[0]; // Get the first book from the books array

      setNewBookDetails({
        title: book.title || '',
        author: book.author || '',
        publisher: book.publisher || '',
        publishDate: book.publishDate || '',
        pagination: book.pagination?.toString() || '',
        isbn: book.isbn || isbn.toString(),
      });

      setHasBookData(true); // Indicate book data is available

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
      setHasBookData(false); // Reset if no book is found
    } finally {
      setSearchLoading(false);
    }
  };

    const fetchExternalBookData = async (isbn: number) => {
      setSearchLoading(true);

      try {
        const response = await fetch(`/api/openlibrary/search?isbn=${isbn}`);

        if (!response.ok) {
          throw new Error('Failed to fetch book data');
        }

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        setNewBookDetailsExternalSearch({
          title: data.title || '',
          author: data.authors || '',
          publisher: data.publisher || '',
          publishDate: data.publishDate || '',
          pagination: data.pagination?.toString() || '',
          isbn: data.isbn || isbn.toString(),
        });

        setHasBookData(true); // Indicate book data is available

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
        setSearchLoading(false);
      }
    };

  const handleOpenModal = (request: BookRequest) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  const handleOpenAcceptModal = (request: BookRequest) => {
    setSelectedRequest(request);
    setIsAcceptModalOpen(true);
  };

  const handleCloseAcceptModal = () => {
    setIsAcceptModalOpen(false);
    setSelectedRequest(null);
    setBookSystemStatus('existing');
    setSelectedExistingBook(null);
    setNewBookDetails({});
    setNewBookDetailsExternalSearch({});
    setIsbn('');
    setCoverImage(null);
    setHasBookData(false); // Reset hasBookData when modal is closed
  };

  const handleSubmitBorrowRequest = async () => {
    try {

      if (bookSystemStatus === 'existing' && !selectedExistingBook) {
        toast.error('Please select an existing book');

        return;
      }

      if (bookSystemStatus === 'new' && (!newBookDetailsExternalSearch)) {
        toast.error('Please fill in required book details');

        return;
      }

      const submissionData = {
        requestId: selectedRequest?.id,
        curatorId: Curator.id,
        wallet: walletAddress,
        bookSystemStatus,
        book: bookSystemStatus === 'existing' ? selectedExistingBook : newBookDetailsExternalSearch,
      };

      console.log('Submission Data:', submissionData);

      const response = await fetch('/api/library/accept-book-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });

      if (response.ok) {
        toast.success('Book request processed successfully');
        handleCloseAcceptModal();
      } else {
        toast.error('Failed to process book request');
      }
    } catch (error) {
      toast.error('An error occurred while processing the request');
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  };

  return (
    <>
      <Card elevation={3}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Calendar size={20} style={{ marginRight: 8 }} />
            <Typography variant="h5">Requested Books</Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              height: '200px',
              overflowY: 'auto',
              justifyContent: bookRequests.length === 0 ? 'center' : 'flex-start',
              textAlign: 'center',
              '&::-webkit-scrollbar': {
                width: '3px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'gray',
                borderRadius: '10px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: '#f1f1f1',
              },
            }}
          >
            {bookRequests.length === 0 ? (
              <Typography variant="body1" color="text.secondary">
                No book requests available at the moment
              </Typography>
            ) : (
              bookRequests.map((request) => (
                <Paper key={request.id} elevation={1} sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1">
                        {truncateText(`${request.title} by ${request.author}`, 50)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        variant="outlined"
                        onClick={() => handleOpenModal(request)}
                        sx={{
                          borderColor: 'black',
                          color: 'black',
                          '&:hover': {
                            backgroundColor: 'rgba(0,0,0,0.1)',
                          },
                        }}
                      >
                        View
                      </Button>
                      <Button
                        variant="contained"
                        onClick={() => handleOpenAcceptModal(request)}
                        sx={{
                          backgroundColor: 'black',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: '#333',
                          },
                        }}
                      >
                        Accept
                      </Button>
                    </Box>
                  </Box>
                </Paper>
              ))
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Modal for Book Request Details */}
      <Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>Book Request Details</DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="h6"><strong>Title:</strong> {selectedRequest.title}</Typography>
              <Typography variant="body1">
                <strong>Author:</strong> {selectedRequest.author}
              </Typography>
              {selectedRequest.additionalNotes && (
                <Typography variant="body1">
                  <strong>Additional Notes:</strong> {selectedRequest.additionalNotes}
                </Typography>
              )}
              <Typography variant="body1" color="text.secondary">
                <strong>Requested On:</strong>{' '}
                {new Date(selectedRequest.createdAt).toLocaleDateString()}
              </Typography>
              <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <strong>Requested By:</strong>
                {selectedRequest.wallet
                  ? `${selectedRequest.wallet.slice(0, 6)}...${selectedRequest.wallet.slice(-6)}`
                  : 'N/A'}
                <Tooltip title="Copy Address">
                  <IconButton
                    size="small"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedRequest.wallet)
                        .then(() => {
                          toast.success('Wallet address copied', {
                            position: 'bottom-center',
                            autoClose: 3000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                          });
                        })
                        .catch(() => {
                          toast.error('Failed to copy wallet address', {
                            position: 'bottom-center',
                            autoClose: 3000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                          });
                        });
                    }}
                  >
                    <Copy size={16} />
                  </IconButton>
                </Tooltip>
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} sx={{ color: 'black' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Accept Book Request Modal */}
      <Dialog open={isAcceptModalOpen} onClose={handleCloseAcceptModal} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center' }}>
          Book Borrowing Request
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Typography variant="body1">
                <strong>Details:</strong> {selectedRequest.title} by {selectedRequest.author}
              </Typography>
              <Typography variant="body1">
                <strong>Request ID:</strong> {selectedRequest.id}
              </Typography>
              <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <strong>Requested By:</strong>
                {selectedRequest.wallet
                  ? `${selectedRequest.wallet.slice(0, 6)}...${selectedRequest.wallet.slice(-6)}`
                  : 'N/A'}
                <Tooltip title="Copy Address">
                  <IconButton
                    size="small"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedRequest.wallet)
                        .then(() => {
                          toast.success('Wallet address copied', {
                            position: 'bottom-center',
                            autoClose: 3000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                          });
                        })
                        .catch(() => {
                          toast.error('Failed to copy wallet address', {
                            position: 'bottom-center',
                            autoClose: 3000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                          });
                        });
                    }}
                  >
                    <Copy size={16} />
                  </IconButton>
                </Tooltip>
              </Typography>
              <RadioGroup
                  row
                  value={bookSystemStatus}
                  onChange={(e) => {
                    const newValue = e.target.value as 'existing' | 'new';

                    setBookSystemStatus(newValue);

                    if (newValue === 'new') {
                      clearFormFields();
                    }
                  }}
                >
                <FormControlLabel
                  value="existing"
                  control={<Radio />}
                  label="Book Already in System"
                />
                <FormControlLabel
                  value="new"
                  control={<Radio />}
                  label="Add New Book"
                />
              </RadioGroup>

              {bookSystemStatus === 'existing' ? (
                <>
                <Grid container spacing={2}>
                  {/* Form fields on the left */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="ISBN"
                      variant="outlined"
                      value={isbn}
                      onChange={(e) => setIsbn(e.target.value)}
                      helperText="Enter a 13-digit ISBN"
                      InputProps={{
                        endAdornment: searchLoading ? (
                          <InputAdornment position="end">
                            <CircularProgress size={20} />
                          </InputAdornment>
                        ) : null,
                      }}
                      sx={{ mb: 4 }}
                    />
                      <>
                        <TextField
                          fullWidth
                          label="Book Title"
                          variant="outlined"
                          value={newBookDetails.title || ''}
                          onChange={(e) => setNewBookDetails(prev => ({ ...prev, title: e.target.value }))}
                          sx={{ mb: 4 }}
                          disabled
                        />
                        <TextField
                          fullWidth
                          label="Author"
                          variant="outlined"
                          value={newBookDetails.author || ''}
                          onChange={(e) => setNewBookDetails(prev => ({ ...prev, author: e.target.value }))}
                          sx={{ mb: 4 }}
                          disabled
                        />
                        <TextField
                          fullWidth
                          label="Publisher"
                          variant="outlined"
                          value={newBookDetails.publisher || ''}
                          onChange={(e) => setNewBookDetails(prev => ({ ...prev, publisher: e.target.value }))}
                          sx={{ mb: 3 }}
                          disabled
                        />
                        <TextField
                          fullWidth
                          label="Publish Date"
                          variant="outlined"
                          value={newBookDetails.publishDate || ''}
                          onChange={(e) => setNewBookDetails(prev => ({ ...prev, publishDate: e.target.value }))}
                          sx={{ mb: 3 }}
                          disabled
                        />
                       <TextField
                          fullWidth
                          label="Pagination"
                          variant="outlined"
                          value={newBookDetails.pagination || ''}
                          onChange={(e) => setNewBookDetails(prev => ({ ...prev, pagination: e.target.value }))}
                          sx={{ mb: 3 }}
                          disabled
                        />
                      </>
                  </Grid>
                      <Grid item xs={12} md={6}>
                       {coverImage ? (
                        <img
                          src={coverImage}
                          alt={newBookDetails.publisher}
                          style={{ maxWidth: '100%', maxHeight: '450px', borderRadius: '3px' }}
                        />
                      ) : (
                        <FallbackBookCover title={newBookDetails.title || ''} author={newBookDetails.author || ''} width={'280px'} height={'425px'}/>
                      )}
                    </Grid>
                  </Grid>
                  <Grid item xs={12} md={12}>
                        <TextField
                          fullWidth
                          label="Notes (Optional)"
                          multiline
                          rows={2}
                          variant="outlined"
                          placeholder="Enter some notes you'd like to share with the borrower..."
                          value={newBookDetails.notes || ''}
                          onChange={(e) => setNewBookDetails(prev => ({ ...prev, notes: e.target.value }))}
                          sx={{ mt: 2 }}
                          inputProps={{
                            maxLength: 200, // Limit the number of characters to 150
                          }}
                        />
                    </Grid>
                </>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Grid container spacing={2}>
                    {/* Form fields on the left */}
                    <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="ISBN"
                        variant="outlined"
                        value={isbnExternalSearch}
                        onChange={(e) => {
                          console.log("ISBN Input:", e.target.value); // Debugging
                          setIsbnExternalSearch(e.target.value);
                        }}
                        helperText="Enter a 13-digit ISBN"
                        InputProps={{
                          endAdornment: searchLoading ? (
                            <InputAdornment position="end">
                              <CircularProgress size={20} />
                            </InputAdornment>
                          ) : null,
                        }}
                        sx={{ mb: 3 }}
                      />
                      <TextField
                        fullWidth
                        label="Book Title"
                        variant="outlined"
                        value={newBookDetailsExternalSearch.title || ''}
                        onChange={(e) => setNewBookDetailsExternalSearch(prev => ({ ...prev, title: e.target.value }))}
                        sx={{ mb: 3 }}
                      />
                      <TextField
                        fullWidth
                        label="Author"
                        variant="outlined"
                        value={newBookDetailsExternalSearch.author || ''}
                        onChange={(e) => setNewBookDetailsExternalSearch(prev => ({ ...prev, author: e.target.value }))}
                        sx={{ mb: 3 }}
                      />
                      <TextField
                        fullWidth
                        label="Publisher"
                        variant="outlined"
                        value={newBookDetailsExternalSearch.publisher || ''}
                        onChange={(e) => setNewBookDetailsExternalSearch(prev => ({ ...prev, publisher: e.target.value }))}
                        sx={{ mb: 3 }}
                      />
                      <TextField
                        fullWidth
                        label="Publish Date"
                        variant="outlined"
                        value={newBookDetailsExternalSearch.publishDate || ''}
                        onChange={(e) => setNewBookDetailsExternalSearch(prev => ({ ...prev, publishDate: e.target.value }))}
                        sx={{ mb: 3 }}
                      />
                      <TextField
                        fullWidth
                        label="Pagination"
                        variant="outlined"
                        value={newBookDetailsExternalSearch.pagination || ''}
                        onChange={(e) => setNewBookDetailsExternalSearch(prev => ({ ...prev, pagination: e.target.value }))}
                        sx={{ mb: 3 }}
                      />
                    </Grid>
                    {/* Image on the right */}
                    <Grid item xs={12} md={6}>
                      {coverImage ? (
                        <img
                          src={coverImage}
                          alt={newBookDetails.publisher}
                          style={{ maxWidth: '100%', maxHeight: '450px', borderRadius: '3px' }}
                        />
                      ) : (
                        <FallbackBookCover title={newBookDetails.title || ''} author={newBookDetails.author || ''} width={'280px'} height={'405px'}/>
                      )}
                    </Grid>
                    <Grid item xs={12} md={12}>
                        <TextField
                          fullWidth
                          label="Notes (Optional)"
                          multiline
                          rows={2}
                          variant="outlined"
                          placeholder="Enter some notes you'd like to share with the borrower..."
                          value={newBookDetailsExternalSearch.notes || ''}
                          onChange={(e) => setNewBookDetailsExternalSearch(prev => ({ ...prev, notes: e.target.value }))}
                          sx={{ mt: 2 }}
                          inputProps={{
                            maxLength: 200, // Limit the number of characters to 150
                          }}
                        />
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAcceptModal} sx={{ color: 'black' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitBorrowRequest}
            sx={{
              backgroundColor: 'black',
              color: 'white',
              '&:hover': { backgroundColor: '#333' }
            }}
          >
            Accept
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BookRequestsCard;
