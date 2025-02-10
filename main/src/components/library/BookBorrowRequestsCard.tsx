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
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
} from '@mui/material';
import { Calendar, Copy, History, Plus } from 'lucide-react';
import { toast } from 'react-toastify';

import { usePrivy } from '@privy-io/react-auth';

import { borrowBookConfirmationAndStatusUpdate } from '@/contract/Interraction';

interface Book {
  id: string;
  isbn: number;
  title: string;
  author: string;
  publisher: string;
  publishDate: Date;
  pagination: number;
  additionalNotes?: string;
  availability: boolean;
  image?: string;
  curatorId: string;
  createdAt: Date;
}

type BorrowingStatus = 'Preparing' | 'Dispatched' | 'Delivered' | 'Returned';

interface BorrowingLog {
  id: string;
  wallet: string;
  status: BorrowingStatus;
  message?: string;
  createdAt: Date;
}

interface BorrowBookRequest {
  id: string;
  title: string;
  author: string;
  name: string;
  email: string;
  deliveryAddress: string;
  additionalNotes?: string;
  wallet: string;
  curatorId: string;
  createdAt: Date;
  borrowDate: Date;
  returnDate: Date;
  book: Book;
  logs?: BorrowingLog[];
  onChainBorrowingId: string;
}

interface CuratorProps {
  id: string;
}

interface BookBorrowRequestsCardProps {
  bookBorrowRequests: BorrowBookRequest[];
  Curator: CuratorProps;
}

const statusOrder: BorrowingStatus[] = ['Preparing', 'Dispatched', 'Delivered', 'Returned'];

const BookBorrowRequestsCard: React.FC<BookBorrowRequestsCardProps> = ({
  bookBorrowRequests: initialRequests,
  Curator,
}) => {

  const [selectedRequest, setSelectedRequest] = useState<BorrowBookRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [isAddLogModalOpen, setIsAddLogModalOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [confirmationNote, setConfirmationNote] = useState('');
  const [newLogStatus, setNewLogStatus] = useState<BorrowingStatus>('Preparing');
  const [newLogMessage, setNewLogMessage] = useState('');
  const [bookBorrowRequests, setBookBorrowRequests] = useState<BorrowBookRequest[]>(initialRequests);
  const [loading, setLoading] = useState(false);
  const { user } = usePrivy();

  const getNextStatus = (currentLogs: BorrowingLog[] | undefined): BorrowingStatus | null => {
    if (!currentLogs || currentLogs.length === 0) return 'Preparing';

    const loggedStatuses = currentLogs.map(log => log.status);

    for (const status of statusOrder) {
      if (!loggedStatuses.includes(status)) {
        return status;
      }
    }

    return null;
  };

  const hasAllStatusesLogged = (logs: BorrowingLog[] | undefined): boolean => {

    if (!logs) return false;

    return statusOrder.every(status =>
      logs.some(log => log.status === status)
    );
  };

  useEffect(() => {
    if (user && user.wallet) {
      setWalletAddress(user.wallet.address);
    }
  }, [user]);

  useEffect(() => {
    if (selectedRequest) {

      const nextStatus = getNextStatus(selectedRequest.logs);

      if (nextStatus) {
        setNewLogStatus(nextStatus);
      }
    }
  }, [selectedRequest]);

  const handleOpenModal = (request: BorrowBookRequest) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  const handleOpenAcceptModal = (request: BorrowBookRequest) => {
    setSelectedRequest(request);
    setIsAcceptModalOpen(true);
  };

  const handleCloseAcceptModal = () => {
    setIsAcceptModalOpen(false);
    setSelectedRequest(null);
    setConfirmationNote('');
  };

  const handleOpenLogsModal = (request: BorrowBookRequest) => {
    setSelectedRequest(request);
    setIsLogsModalOpen(true);
  };

  const handleCloseLogsModal = () => {
    setIsLogsModalOpen(false);
    setSelectedRequest(null);
  };

  const handleOpenAddLogModal = () => {
    const nextStatus = getNextStatus(selectedRequest?.logs);

    if (nextStatus) {
      setNewLogStatus(nextStatus);
      setIsAddLogModalOpen(true);
    } else {
      toast.info('All statuses have been logged for this request');
    }
  };

  const handleCloseAddLogModal = () => {
    setIsAddLogModalOpen(false);
    setNewLogStatus('Preparing');
    setNewLogMessage('');
  };

  const fetchBookBorrowRequests = async () => {
    try {
      const response = await fetch(`/api/library/curator/${Curator.id}/book-borrow-requests`);

      if (!response.ok) throw new Error('Failed to fetch borrow requests');

      const data = await response.json();

      if (data && Array.isArray(data.borrowings)) {
        setBookBorrowRequests(data.borrowings);
        // setSelectedRequest(data.borrowings);
      }
    } catch (error) {
      // console.error('Error fetching borrow requests:', error);
      setBookBorrowRequests([]);
    }
  };

  // Fetch data on page load
  useEffect(() => {
    fetchBookBorrowRequests();
  }, []);

  const handleSubmitNewLog = async () => {
    if (!selectedRequest) return;

    setLoading(true);

    try {

      const BorrowBookConfirmation = {
        borrowingId: selectedRequest?.onChainBorrowingId,
        status: newLogStatus,
        message: newLogMessage.trim(),
      };

      await borrowBookConfirmationAndStatusUpdate(BorrowBookConfirmation);

      const logData = {
        status: newLogStatus,
        wallet: walletAddress,
        note: newLogMessage.trim(),
        borrowingId: selectedRequest?.id,
        curatorId: Curator.id,
        bookId: selectedRequest?.book.id
      };


      const response = await fetch(`/api/library/curator/${Curator.id}/books/accept-borrow-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logData),
      });

      if (response.ok) {
        toast.success('Borrowing status updated successfully');
        handleCloseAddLogModal();
        fetchBookBorrowRequests();
      } else {
        toast.error('Failed to update borrowing status');
      }
    } catch (error) {
      toast.error('An error occurred while updating the status');
    }
  };

  const handleSubmitBorrowRequest = async () => {

    setLoading(true);

    try {

      const BorrowBookConfirmation = {
        borrowingId: selectedRequest?.onChainBorrowingId,
        status: statusOrder[0],
        message: confirmationNote
      };

      await borrowBookConfirmationAndStatusUpdate(BorrowBookConfirmation);

      const submissionData = {
        wallet: walletAddress,
        note: confirmationNote,
        borrowingId: selectedRequest?.id,
        bookId: selectedRequest?.book.id,
        curatorId: Curator.id,
        status: statusOrder[0], // Defaults to 'Preparing'
      };

      const response = await fetch(`/api/library/curator/${Curator.id}/books/accept-borrow-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });

      if (response.ok) {
        toast.success('Borrow request processed successfully');
        handleCloseAcceptModal();
        fetchBookBorrowRequests();
      } else {
        toast.error('Failed to process borrow request');
      }
    } catch (error) {
      toast.error('An error occurred while processing the request');
    }
  };

  const getStatusColor = (status: BorrowingStatus) => {

    const colors = {
      Preparing: '#FFA500',
      Dispatched: '#1E90FF',
      Delivered: '#32CD32',
      Returned: '#4B0082',
    };

    return colors[status];
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
            <Typography variant="h5">Borrowed Books</Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              height: '200px',
              overflowY: 'auto',
              justifyContent: bookBorrowRequests.length === 0 ? 'center' : 'flex-start',
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
            {bookBorrowRequests.length === 0 ? (
              <Typography variant="body1" color="text.secondary">
                No borrowing requests available at the moment
              </Typography>
            ) : (
              bookBorrowRequests.map((request) => (
                <Paper key={request.id} elevation={1} sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1">
                        {truncateText(`${request.book.title} by ${request.book.author}`, 50)}
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
                      {request.logs && request.logs.length > 0 ? (
                        <Button
                          variant="contained"
                          onClick={() => handleOpenLogsModal(request)}
                          startIcon={<History size={16} />}
                          sx={{
                            backgroundColor: 'black',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: '#333',
                            },
                          }}
                        >
                          Logs
                        </Button>
                      ) : (
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

      {/* Details Modal */}
      <Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>Borrow A Book Details:</DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="body1" color="text.secondary">
                <strong>Title:</strong> {selectedRequest.book.title}
              </Typography>
              <Typography variant="body1">
                <strong>Author:</strong> {selectedRequest.book.author}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                <strong>Borrowed Date:</strong>{' '}
                {new Date(selectedRequest.borrowDate).toLocaleDateString()}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                <strong>Expected Return Date:</strong>{' '}
                {new Date(selectedRequest.returnDate).toLocaleDateString()}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                <strong>Requested On:</strong>{' '}
                {new Date(selectedRequest.createdAt).toLocaleDateString()}
              </Typography>
              <Box sx={{ borderBottom: '1px solid #ddd', my: 2 }} />
              <Typography variant="body1">
                <strong>Name:</strong> {selectedRequest.name}
              </Typography>
              <Typography variant="body1">
                <strong>Email:</strong> {selectedRequest.email}
              </Typography>
              <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <strong>Wallet:</strong>
                {selectedRequest.wallet
                  ? `${selectedRequest.wallet.slice(0, 6)}...${selectedRequest.wallet.slice(-6)}`
                  : 'N/A'}
                <Tooltip title="Copy Address">
                  <IconButton
                    size="small"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedRequest.wallet)
                        .then(() => toast.success('Wallet address copied'))
                        .catch(() => toast.error('Failed to copy wallet address'));
                    }}
                  >
                    <Copy size={16} />
                  </IconButton>
                </Tooltip>
              </Typography>
              <Box sx={{ borderBottom: '1px solid #ddd', my: 2 }} />
              <Typography variant="body1">
                <strong>Delivery Location:</strong> {selectedRequest.deliveryAddress}
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

      {/* Accept Request Modal */}
      <Dialog open={isAcceptModalOpen} onClose={handleCloseAcceptModal} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center' }}>Confirm Borrow Request</DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center',
                }}
              >
                <Typography variant="body1">
                  Are you sure you want to confirm the borrowing request for -{" "}
                  <strong>
                    {selectedRequest.book.title} by {selectedRequest.book.author}
                  </strong>{" "}
                  for wallet{" "}
                  <strong>
                    {selectedRequest.wallet.slice(0, 6)}...{selectedRequest.wallet.slice(-6)}
                  </strong>{" "}
                  which will be expected on{" "}
                  <strong>
                    {new Date(selectedRequest.borrowDate).toLocaleDateString()}
                  </strong>{" "}
                  with an expected return date on{" "}
                  <strong>
                    {new Date(selectedRequest.returnDate).toLocaleDateString()}
                  </strong>{" "}
                  to this{" "}
                  <strong>{selectedRequest.deliveryAddress}</strong> delivery location.
                </Typography>
              </Box>
              <Grid item xs={12} md={12}>
                <TextField
                  fullWidth
                  label="Notes (Optional)"
                  multiline
                  rows={2}
                  variant="outlined"
                  placeholder="Enter some notes you'd like to share with the borrower..."
                  value={confirmationNote}
                  onChange={(e) => setConfirmationNote(e.target.value)}
                  sx={{ mt: 2 }}
                  inputProps={{
                    maxLength: 200,
                  }}
                />
              </Grid>
            </>
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
              '&:hover': { backgroundColor: '#333' },
            }}
           >
            {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Logs Modal */}
      <Dialog open={isLogsModalOpen} onClose={handleCloseLogsModal} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <History size={20} />
              Borrowing History
            </Box>
            {selectedRequest && !hasAllStatusesLogged(selectedRequest.logs) && (
              <Button
                variant="contained"
                startIcon={<Plus size={16} />}
                onClick={handleOpenAddLogModal}
                sx={{
                  backgroundColor: 'black',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#333',
                  },
                }}
              >
                Update Status
              </Button>
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedRequest?.logs && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                {selectedRequest.book.title} by {selectedRequest.book.author}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                {selectedRequest.logs.map((log) => (
                  <Paper
                    key={log.id}
                    elevation={1}
                    sx={{
                      p: 2,
                      borderLeft: `4px solid ${getStatusColor(log.status)}`,
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          color: getStatusColor(log.status),
                          fontWeight: 'bold',
                        }}
                      >
                        {log.status}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(log.createdAt).toLocaleString()}
                      </Typography>
                    </Box>
                    {log.message && (
                      <Typography variant="body2" color="text.secondary">
                        {log.message}
                      </Typography>
                    )}
                  </Paper>
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseLogsModal} sx={{ color: 'black' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add New Log Modal */}
      <Dialog open={isAddLogModalOpen} onClose={handleCloseAddLogModal} maxWidth="sm" fullWidth>
        <DialogTitle>Update Borrowing Status</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel id="status-select-label">Status</InputLabel>
              <Select
                labelId="status-select-label"
                value={newLogStatus}
                label="Status"
                onChange={(e) => setNewLogStatus(e.target.value as BorrowingStatus)}
              >
                {statusOrder.map((status) => {
                  const isStatusAvailable = selectedRequest?.logs
                    ? !selectedRequest.logs.some(log => log.status === status) &&
                      status === getNextStatus(selectedRequest.logs)
                    : status === 'Preparing';

                  return isStatusAvailable && (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Message"
              multiline
              rows={3}
              value={newLogMessage}
              onChange={(e) => setNewLogMessage(e.target.value)}
              placeholder="Add any additional notes or details about this status update..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddLogModal} sx={{ color: 'black' }}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmitNewLog}
            variant="contained"
            sx={{
              backgroundColor: 'black',
              color: 'white',
              '&:hover': {
                backgroundColor: '#333',
              },
            }}
            >
            {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Update Status'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BookBorrowRequestsCard;
