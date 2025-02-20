import React, { useState } from 'react';

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
  Grid,
  TextField,
  CircularProgress,
} from '@mui/material';

import { Calendar, Copy } from 'lucide-react';

import { toast } from 'react-toastify';

import { bookRequestConfirmation } from '@/contract/Interraction';

// import { bookRequestConfirmation } from '@/contract/Interraction';

interface BookRequest {
  logs: any;
  id: string;
  isbn: string;
  title: string;
  author: string;
  additionalNotes?: string;
  curatorId: string;
  wallet: string;
  createdAt: Date;
  transactionHash: string;
  onChainBookRequestId: string;
}

interface Curator {
  id: string;
  onChainUniqueId: string;
}

const BookRequestsCard = ({ bookRequests, Curator }: { bookRequests: BookRequest[], Curator: Curator }) => {
  const [selectedRequest, setSelectedRequest] = useState<BookRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmationNote, setConfirmationNote] = useState('');
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [loadingAccept, setLoadingAccept] = useState(false);
  const [loadingReject, setLoadingReject] = useState(false);

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
  };

  const handleSubmitBookRequest = async (isApproved: boolean) => {
    try {
      if (isApproved) {
        setLoadingAccept(true);
      } else {
        setLoadingReject(true);
      }

      const newStatus = isApproved ? 'Approved' : 'Rejected'; // Assuming BookRequestStatus is a string enum

      const onChainSubmissionData = {
        requestId: selectedRequest?.onChainBookRequestId || '',
        status: newStatus,
        message: confirmationNote
      };

      await bookRequestConfirmation(onChainSubmissionData)

      const submissionData = {
        bookRequestId: selectedRequest?.id,
        curatorId: Curator.id,
        message: confirmationNote,
        isApproved,
      };

      const response = await fetch(`/api/library/curator/${Curator.id}/books/accept-book-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) throw new Error('Failed to process book request');

      toast.success(`Book request ${isApproved ? 'approved' : 'rejected'} successfully`);
      handleCloseAcceptModal();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred while processing the request');
    } finally {
      setLoadingAccept(false);
      setLoadingReject(false);
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
                      {!request.logs?.length && (
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
                      )}
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
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <strong>ISBN:</strong> {selectedRequest.isbn}
                <Tooltip title="Copy ISBN">
                  <IconButton
                  size="small"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedRequest.isbn)
                    .then(() => {
                      toast.success('ISBN copied', {
                      position: 'bottom-center',
                      autoClose: 3000,
                      hideProgressBar: false,
                      closeOnClick: true,
                      pauseOnHover: true,
                      draggable: true,
                      });
                    })
                    .catch(() => {
                      toast.error('Failed to copy ISBN', {
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
        <DialogTitle sx={{ textAlign: 'center' }}>Book Request Confirmation</DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <><Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="body1">
                <strong>ISBN:</strong> {selectedRequest.isbn}
              </Typography>
              <Typography variant="body1">
                <strong>Details:</strong> {selectedRequest.title} by {selectedRequest.author}
              </Typography>
              <Typography variant="body1">
                <strong>Request ID:</strong> {selectedRequest.id}
              </Typography>
              <Typography variant="body1">
                <strong>Requested By:</strong> {selectedRequest.wallet
                  ? `${selectedRequest.wallet.slice(0, 6)}...${selectedRequest.wallet.slice(-6)}`
                  : 'N/A'}
              </Typography>
            </Box>
            <Grid item xs={12} md={12}>
                <TextField
                  fullWidth
                  label="Notes (Optional)"
                  multiline
                  rows={2}
                  variant="outlined"
                  placeholder="Enter some notes you'd like to share with the requester..."
                  value={confirmationNote}
                  onChange={(e) => setConfirmationNote(e.target.value)}
                  sx={{ mt: 2 }}
                  inputProps={{
                    maxLength: 200,
                  }} />
              </Grid>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center' }}>
          {/* Wrap the text and buttons in a flex container */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h5">Do you have this book?</Typography>
            <Button
              variant="contained"
              onClick={() => handleSubmitBookRequest(true)}
              sx={{ backgroundColor: 'green', color: 'white' }}
              disabled={loadingAccept || loadingReject}
            >
              {loadingAccept ? <CircularProgress size={20} color="inherit" /> : 'Yes'}
            </Button>

            <Button
              variant="outlined"
              onClick={() => handleSubmitBookRequest(false)}
              sx={{ color: 'red', borderColor: 'red' }}
              disabled={loadingAccept || loadingReject}
            >
              {loadingReject ? <CircularProgress size={20} color="inherit" /> : 'No'}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BookRequestsCard;
