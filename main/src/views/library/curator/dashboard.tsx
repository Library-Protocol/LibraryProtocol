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
  InputAdornment,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import { Home, Minus, Plus } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';

import { Html5QrcodeScanner, Html5QrcodeScanType, Html5QrcodeSupportedFormats } from 'html5-qrcode';

import FallbackBookCover from '@/components/library/FallbackBookCover';
import BookRequestsCard from '@/components/library/BookRequestsCard';
import BookBorrowRequestsCard from '@/components/library/BookBorrowRequestsCard';
import { addBook } from '@/contract/Interraction';
import LibraryMascotWidget from '@/components/effects/MascotWidget';
import { createBookMetadata } from '@/utils/pinata';
import SubmissionProgress from '@/components/effects/SubmissionProgress';
import BookSearchGrid from '@/components/library/BookSaerchCard';

// Interfaces
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

interface BookRequest {
  id: string;
  logs: any;
  isbn: string;
  title: string;
  author: string;
  additionalNotes?: string;
  wallet: string;
  curatorId: string;
  createdAt: Date;
  transactionHash: string;
  onChainBookRequestId: string;
}

interface BorrowBookRequests {
  id: string;
  title: string;
  author: string;
  additionalNotes?: string;
  wallet: string;
  curatorId: string;
  createdAt: Date;
  name: string;
  email: string;
  deliveryAddress: string;
  borrowDate: Date;
  returnDate: Date;
  book: Book;
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
  bookRequests: BookRequest[];
}

interface LandingDetailsProps {
  Curator: Curator;
}

const CuratorDashboard: React.FC<LandingDetailsProps> = ({ Curator }) => {
  const [open, setOpen] = useState(false);
  const [openPublicNotice, setOpenPublicNotice] = useState(false);
  const [publicNoticeText, setPublicNoticeText] = useState(Curator.publicNotice || '');
  const [bookRequests, setBookRequests] = useState<BookRequest[]>([]);
  const [bookBorrowRequests, setBookBorrowRequests] = useState<BorrowBookRequests[]>([]);
  const [bookTitle, setBookTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isbn, setIsbn] = useState('');
  const [publisher, setPublisher] = useState('');
  const [publishDate, setPublishDate] = useState('');
  const [pagination, setPagination] = useState('');
  const [copies, setCopies] = useState<number>(1);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [Books, setBooks] = useState<Book[]>(Curator.books);
  const [fileError, setFileError] = useState('');
  const { authenticated } = usePrivy();
  const [submissionStep, setSubmissionStep] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null);
  const [failedLoads, setFailedLoads] = useState(new Set<number>());
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState<boolean | null>(null);

  // Scanner cleanup
  useEffect(() => {
    return () => {
      if (scanner) {
        scanner.clear().catch((err) => {
          console.error('Failed to clean up scanner:', err);
        });
      }
    };
  }, [scanner]);

  // Check camera permissions
  const checkCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });

      // If we got here, permission is granted
      stream.getTracks().forEach(track => track.stop()); // Clean up
      setCameraPermissionGranted(true);

return true;
    } catch (err) {
      console.error("Camera permission error:", err);
      setCameraPermissionGranted(false);

return false;
    }
  };

  const startScanner = async () => {
    // First check for camera permissions
    const hasPermission = await checkCameraPermission();

    if (!hasPermission) {
      setError('Camera access denied. Please allow camera access in your browser settings.');

return;
    }

    setIsScanning(true);
    setError(null);

    // Important: Set a small delay to ensure the DOM element is rendered
    setTimeout(() => {
      // Make sure the container exists first
      const scannerContainer = document.getElementById('qr-scanner-container');

      if (!scannerContainer) {
        setError("Scanner container not found in DOM");
        setIsScanning(false);

return;
      }

      // Clear any existing content in the container
      scannerContainer.innerHTML = '';

      try {
        // Create scanner with more robust config
        const qrScanner = new Html5QrcodeScanner(
          'qr-scanner-container',
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
            videoConstraints: {
              // Try environment camera first, but fallback to any camera
              facingMode: { ideal: "environment" }
            },
            formatsToSupport: [
              // Add ISBN formats
              Html5QrcodeSupportedFormats.EAN_13,
              Html5QrcodeSupportedFormats.EAN_8,
              Html5QrcodeSupportedFormats.QR_CODE
            ],
          },
          /* verbose= */ true
        );

        qrScanner.render(
          (decodedText) => {
            // Success callback
            console.log("Scan successful, result:", decodedText);
            setIsbn(decodedText);
            setIsScanning(false);
            qrScanner.clear().catch(err => console.error("Failed to clear scanner:", err));
            setScanner(null);
            toast.success('ISBN scanned successfully!');
          },
          (errorMessage) => {
            console.log("QR code scanning error:", errorMessage);
            // Don't stop scanning here - this is called for individual frame errors
          }
        );

        setScanner(qrScanner);

        // Add debugging info
        console.log("Scanner initialized successfully");
        setTimeout(() => {
          const videoElement = scannerContainer.querySelector('video');

          if (!videoElement) {
            console.log("No video element found after init");
          } else {
            console.log("Video element found and initialized");
          }
        }, 2000);

      } catch (err) {
        console.error("Scanner initialization error:", err);
        setError('Failed to initialize scanner. Ensure camera access is allowed.');
        setIsScanning(false);
      }
    }, 300); // 300ms delay to ensure DOM is ready
  };

  const stopScanner = () => {
    if (scanner) {
      console.log("Stopping scanner...");
      scanner.clear().catch(err => console.error("Error clearing scanner:", err));
      setIsScanning(false);
      setScanner(null);
    }
  };

  const handleDecrease = () => setCopies((prev) => Math.max(1, prev - 1));
  const handleIncrease = () => setCopies((prev) => prev + 1);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];

      if (!allowedTypes.includes(file.type)) {
        setFileError('Only JPEG, JPG, and PNG files are allowed.');

return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB

      if (file.size > maxSize) {
        setFileError('File size must be less than 5MB.');

return;
      }

      setFileError('');
      const reader = new FileReader();

      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setCoverImage(reader.result);
        }
      };

      reader.readAsDataURL(file);
    }
  };

  const handleReturnHome = () => {
    window.location.href = '/';
  };

  const handleImageError = (isbn: number) => {
    setFailedLoads((prev) => new Set(prev).add(isbn));
  };

  const handleClickOpen = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
    setError(null);
    setIsbn('');
    setBookTitle('');
    setAuthor('');
    setAdditionalNotes('');
    setPublisher('');
    setPublishDate('');
    setPagination('');
    setCoverImage(null);
    setFileError('');
    stopScanner(); // Ensure scanner is stopped when closing
  };

  const handleClickOpenPublicNotice = () => setOpenPublicNotice(true);

  const handleClosePublicNotice = () => {
    setOpenPublicNotice(false);
    setPublicNoticeText(Curator.publicNotice || '');
  };

  useEffect(() => {
    if (isbn.length === 13) {
      fetchBookData(Number(isbn));
    }
  }, [isbn]);

  const fetchCoverImage = async (isbn: number) => {
    try {
      const coverUrl = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`;
      const coverResponse = await fetch(coverUrl);

      if (coverResponse.ok) {
        const imageBlob = await coverResponse.blob();
        const reader = new FileReader();

        reader.readAsDataURL(imageBlob);

        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setCoverImage(reader.result);
          }
        };
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
      const response = await fetch(`/api/openlibrary/search?isbn=${isbn}`);
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setBookTitle(data.title || '');
      setAuthor(data.authors || '');
      setPublisher(data.publisher || '');
      setPublishDate(data.publishDate || '');
      setPagination(data.pagination || '');
      await fetchCoverImage(isbn);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch book data');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSavePublicNotice = async () => {
    if (publicNoticeText.length > 200) {
      toast.error('Public notice cannot exceed 200 characters.');

return;
    }

    try {
      const response = await fetch('/api/library/curator/public-notice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicNotice: publicNoticeText, curatorId: Curator.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to update public notice');
      }

      Curator.publicNotice = publicNoticeText;
      toast.success('Public notice updated successfully!');
      handleClosePublicNotice();
    } catch (error) {
      toast.error('Failed to update public notice');
    }
  };

  const handleSubmitRequest = async () => {
    if (!bookTitle) {
      setError('Book title is required');

return;
    }

    setError(null);
    setLoading(true);
    setSubmissionStep('Storing data on IPFS Node');

    try {
      const addBookData = {
        title: bookTitle,
        author,
        publisher,
        publishDate,
        pagination: Number(pagination) || 0,
        additionalNotes,
        onChainUniqueId: Curator.onChainUniqueId,
        isbn: Number(isbn),
        copies,
        image: coverImage,
      };

      if (!coverImage) {
        throw new Error('Cover image is required');
      }

      const { imageCID } = await createBookMetadata(
        bookTitle,
        author,
        publisher,
        publishDate,
        Number(pagination),
        isbn,
        copies,
        coverImage
      );

      setSubmissionStep('Magically adding your book onchain');
      const { hash, uniqueId, nftTokenId } = await addBook({ ...addBookData, imageCID });

      const requestData = {
        title: bookTitle,
        author: author || '',
        additionalNotes: additionalNotes || '',
        isbn: isbn || '',
        publisher: publisher || '',
        publishDate: publishDate || '',
        pagination: pagination || '',
        curatorId: Curator.id.toString(),
        onChainUniqueId: uniqueId,
        transactionHash: hash,
        nftTokenId,
        image: coverImage,
      };

      const response = await fetch(`/api/library/curator/${Curator.id}/add-book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(errorData.error || 'Failed to submit request');
      }

      const updatedBooksResponse = await fetch(`/api/library/curator/${Curator.id}`);

      if (!updatedBooksResponse.ok) {
        throw new Error('Failed to fetch updated books');
      }

      const updatedBooks = await updatedBooksResponse.json();

      setBooks(updatedBooks.books);
      setSubmissionStep(null);
      toast.success('Book Successfully added to library!');
      handleClose();
    } catch (error: any) {
      toast.error(error.message || 'There was an error submitting your request');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchBookRequests = async () => {
      try {
        const response = await fetch(`/api/library/curator/${Curator.id}/book-requests`);

        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.bookRequests) {
          setBookRequests(data.bookRequests || []);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (Curator.id) fetchBookRequests();
  }, [Curator.id]);

  useEffect(() => {
    const fetchBookBorrowRequests = async () => {
      try {
        const response = await fetch(`/api/library/curator/${Curator.id}/book-borrow-requests`);
        const data = await response.json();

        if (data.borrowings) {
          setBookBorrowRequests(data.borrowings || []);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (Curator.id) fetchBookBorrowRequests();
  }, [Curator.id]);

  const ipfsUrl = process.env.NEXT_PUBLIC_IPFS_GATEWAY;

  return (
    <div className="relative max-w-[880px] mx-auto px-4 sm:px-6 lg:px-8">
      <Box sx={{ position: 'absolute', top: 12, left: -50, zIndex: 10 }}>
        <Button
          variant="contained"
          onClick={handleReturnHome}
          sx={{
            minWidth: 'auto',
            p: 1,
            backgroundColor: 'black',
            color: 'white',
            borderColor: 'black',
            '&:hover': { backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'black' },
          }}
        >
          <Home size={32} />
        </Button>
      </Box>
      <ToastContainer />
      {submissionStep && <SubmissionProgress currentStep={submissionStep} />}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Card elevation={3} sx={{ height: '550px' }}>
                <Box sx={{ position: 'relative', height: '100%' }}>
                  <img
                    src={`${ipfsUrl}${Curator.coverImage}`}
                    alt={Curator.name}
                    className="w-full h-[550px] object-cover"
                  />
                </Box>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card elevation={3}>
                <CardContent sx={{ p: 4 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      height: '80px',
                      gap: 2,
                    }}
                  >
                    <Typography variant="h5">{Curator.name} Library Notice</Typography>
                    {Curator.publicNotice && Curator.publicNotice.trim() && (
                      <Button
                        variant="outlined"
                        onClick={handleClickOpenPublicNotice}
                        sx={{
                          fontSize: '0.8rem',
                          padding: '4px 8px',
                          textTransform: 'none',
                          height: '30px',
                          width: 'auto',
                          backgroundColor: 'black',
                          borderColor: 'black',
                          color: 'white',
                          '&:hover': { backgroundColor: '#f5f5f5', borderColor: 'black' },
                        }}
                      >
                        Update
                      </Button>
                    )}
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
                      {Curator.publicNotice ? (
                        Curator.publicNotice
                      ) : (
                        <Button
                          variant="outlined"
                          onClick={handleClickOpenPublicNotice}
                          sx={{
                            mt: 2,
                            backgroundColor: 'black',
                            color: 'white',
                            borderColor: 'white',
                            '&:hover': { backgroundColor: 'white', color: 'black', borderColor: 'black' },
                          }}
                        >
                          Add a Public Notice
                        </Button>
                      )}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} md={6}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <div className="relative bg-gradient-to-r from-brown-700 to-brown-500 rounded-[5px] overflow-hidden p-4 text-white transform transition-all duration-300">
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
              <BookBorrowRequestsCard bookBorrowRequests={bookBorrowRequests} Curator={Curator} />
            </Grid>
            <Grid item xs={12}>
              <BookRequestsCard bookRequests={bookRequests} Curator={Curator} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Card elevation={3} sx={{ mt: 4 }}>
        <BookSearchGrid
          BookCurator={Curator}
          Books={Books}
          failedLoads={failedLoads}
          onImageError={handleImageError}
        />
      </Card>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Add A Book</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', gap: 4 }}>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={9}>
                  <TextField
                    fullWidth
                    label="ISBN"
                    variant="outlined"
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                    error={!!error}
                    helperText={error || 'Enter ISBN or scan it'}
                    InputProps={{
                      endAdornment: searchLoading ? (
                        <InputAdornment position="end">
                          <CircularProgress size={20} />
                        </InputAdornment>
                      ) : null,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={isScanning ? stopScanner : startScanner}
                    sx={{ height: '56px' }}
                  >
                    {isScanning ? 'Stop Scanning' : 'Scan'}
                  </Button>
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Book Title"
                    variant="outlined"
                    value={bookTitle}
                    onChange={(e) => setBookTitle(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Author"
                    variant="outlined"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Publisher"
                    variant="outlined"
                    value={publisher}
                    onChange={(e) => setPublisher(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Publish Date"
                    variant="outlined"
                    value={publishDate}
                    onChange={(e) => setPublishDate(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={12}>
                  <TextField
                    fullWidth
                    label="Pagination"
                    variant="outlined"
                    value={pagination}
                    onChange={(e) => setPagination(e.target.value)}
                  />
                </Grid>
              </Grid>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                gap={1}
                sx={{ border: '1px solid #ccc', borderRadius: '8px', p: 1 }}
              >
                <Typography variant="body1" sx={{ mr: 1 }}>
                  Copies:
                </Typography>
                <IconButton onClick={handleDecrease} size="small">
                  <Minus size={18} />
                </IconButton>
                <Typography variant="h6" sx={{ minWidth: '30px', textAlign: 'center' }}>
                  {copies}
                </Typography>
                <IconButton onClick={handleIncrease} size="small">
                  <Plus size={18} />
                </IconButton>
              </Box>
              <TextField
                fullWidth
                label="Additional Notes"
                multiline
                rows={3}
                variant="outlined"
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
              />
              <Button variant="outlined" component="label" fullWidth sx={{ mt: 2 }}>
                Upload Book Cover
                <input type="file" hidden accept="image/*" onChange={handleFileUpload} />
              </Button>
              {fileError && (
                <Typography color="error" variant="body2">
                  {fileError}
                </Typography>
              )}
            </Box>
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
              {isScanning ? (
              <>
                <Box sx={{
                width: '100%',
                height: '450px',
                border: '1px solid #ccc',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
                }}>
                <div id="qr-scanner-container" style={{ width: '100%', height: '100%' }}></div>
                <Box sx={{
                  position: 'absolute',
                  bottom: 0,
                  width: '100%',
                  padding: 2,
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  textAlign: 'center'
                }}>
                  <img
                  src="/isbn-barcode-example.png"
                  alt="ISBN Barcode Example"
                  style={{
                    height: '60px',
                    margin: '0 auto'
                  }}
                  />
                  <Typography variant="caption" display="block">
                  Scan the ISBN barcode found on the back of your book
                  </Typography>
                </Box>
                {cameraPermissionGranted === false && (
                  <Typography color="error" sx={{ position: 'absolute', bottom: 10, textAlign: 'center', width: '100%' }}>
                  Camera access denied. Please check browser permissions.
                  </Typography>
                )}
                </Box>
                {error && (
                <Typography color="error" sx={{ mt: 2, textAlign: 'center' }}>
                  {error}
                </Typography>
                )}
              </>
              ) : coverImage ? (
              <img
                src={coverImage}
                alt="Book Cover"
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
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
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
              '&:hover': { backgroundColor: 'white', color: 'black' },
            }}
          >
            {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Add Book'}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openPublicNotice} onClose={handleClosePublicNotice} maxWidth="sm" fullWidth>
        <DialogTitle>Add/Edit Public Notice</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            placeholder="Enter your public notice here..."
            value={publicNoticeText}
            onChange={(e) => setPublicNoticeText(e.target.value)}
            sx={{ mt: 2 }}
            inputProps={{ maxLength: 200 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePublicNotice}>Cancel</Button>
          <Button
            onClick={handleSavePublicNotice}
            variant="contained"
            color="primary"
            disabled={!publicNoticeText.trim()}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
      {authenticated && <LibraryMascotWidget />}
    </div>
  );
};

export default CuratorDashboard;
