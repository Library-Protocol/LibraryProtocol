'use client';

import React, { useEffect, useRef, useState } from 'react';

import Link from 'next/link';

import { Box, Grid, Card, Typography, Avatar, Button, IconButton, Modal, Divider, CardContent, Skeleton } from '@mui/material';
import { Library, BookOpenCheck, Clock, BookMarked, Users, Bell, Home, Eye, MoveRight } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';

import FallbackBookCover from '@/components/library/FallbackBookCover';
import LibraryMascotWidget from '@/components/effects/MascotWidget';

interface BookBorrowed {
  title: string;
  author: string;
  isbn: number;
  description?: string;
  publisher?: string;
  publishDate?: string;
  pagination?: number;
  additionalNotes?: string;
  logs?: Array<{ id: string; status: string; wallet: string; message?: string; createdAt: string }>;
  book: any;
}

interface UserDashboardComponentProps {
  data: { booksBorrowed: any[]; booksRequested: any[]; userDetails: any };
}

const UserDashboard: React.FC<UserDashboardComponentProps> = ({ data }) => {
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState<BookBorrowed | null>(null);
  const [coverImages, setCoverImages] = useState<{ [isbn: number]: string | null }>({});
  const { authenticated } = usePrivy();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => setLoading(false), 2000);
  }, []);

  const handleOpen = (borrowing: BookBorrowed) => setSelectedBook(borrowing);
  const handleClose = () => setSelectedBook(null);
  const handleReturnHome = () => window.location.href = '/';

  const fetchCoverImage = async (isbn: number) => {
    try {
      const coverUrl = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`;
      const response = await fetch(coverUrl);

      if (response.ok) setCoverImages(prev => ({ ...prev, [isbn]: coverUrl }));
      else setCoverImages(prev => ({ ...prev, [isbn]: null }));
    } catch (error) {
      console.error('Error fetching cover image:', error);
      setCoverImages(prev => ({ ...prev, [isbn]: null }));
    }
  };

  const completedBooks = data.booksBorrowed.filter(book => {
    const statusSet = new Set(book.logs.map((log: { status: string }) => log.status));


return ['Preparing', 'Dispatched', 'Delivered', 'Returned'].every(status => statusSet.has(status));
  });

  useEffect(() => {
    if (!loading) {
      data.booksBorrowed.forEach(bb => {
        if (bb.book.isbn && !coverImages[bb.book.isbn]) fetchCoverImage(bb.book.isbn);
      });
    }
  }, [loading, data.booksBorrowed]);

  // Drag-to-scroll functionality
  let isDragging = false;
  let startX: number, scrollLeft: number;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    isDragging = true;
    startX = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft = scrollRef.current.scrollLeft;
  };

  const handleMouseLeave = () => (isDragging = false);
  const handleMouseUp = () => (isDragging = false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 0.7;

    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  if (loading) {
    return (
      <Box sx={{ maxWidth: '880px', mx: 'auto', px: { xs: 2, sm: 4, md: 6 }, py: 4 }}>
        {/* Skeleton for Profile Header */}
        <Box sx={{ mb: 6, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 4, p: 4, borderRadius: 2, boxShadow: 1 }}>
          <Skeleton variant="circular" width={96} height={96} />
          <Box sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <Skeleton variant="text" width={200} height={40} />
            <Skeleton variant="text" width={150} height={24} />
            <Skeleton variant="text" width={180} height={24} />
          </Box>
        </Box>

        {/* Skeleton for Action Cards */}
        <Grid container spacing={2} sx={{ mb: 6 }}>
          {[1, 2].map(index => (
            <Grid item xs={12} md={6} key={index}>
              <Skeleton variant="rectangular" width="100%" height={100} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>

        {/* Skeleton for Stats Cards */}
        <Grid container spacing={2} sx={{ mb: 6 }}>
          {[1, 2, 3].map(index => (
            <Grid item xs={12} sm={4} key={index}>
              <Skeleton variant="rectangular" width="100%" height={80} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>

        {/* Skeleton for Borrowed Books */}
        <Box sx={{ mb: 6 }}>
          <Skeleton variant="text" width={200} height={40} />
          <Box sx={{ overflowX: 'auto', py: 2 }}>
            <Grid container spacing={2} sx={{ flexWrap: 'nowrap' }}>
              {[1, 2, 3].map(index => (
                <Grid item key={index}>
                  <Skeleton variant="rectangular" width={280} height={160} sx={{ borderRadius: 2 }} />
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>

        {/* Skeleton for Requests and History */}
        {[1, 2].map(section => (
          <Box key={section} sx={{ mb: 6 }}>
            <Skeleton variant="text" width={200} height={40} />
            <Card sx={{ p: 2 }}>
              {[1, 2].map(index => (
                <Box key={index} sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
                  <Skeleton variant="text" width={150} height={24} />
                  <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
                </Box>
              ))}
            </Card>
          </Box>
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: '880px', mx: 'auto', px: { xs: 2, sm: 4, md: 6 }, py: 4, position: 'relative' }}>
      {/* Back Arrow */}
      <IconButton
        onClick={handleReturnHome}
        sx={{
          position: 'absolute',
          top: { xs: 8, sm: 32 },
          right: { xs: 8, sm: 32 },
          zIndex: 20,
          // bgcolor: 'grey.100',
          // '&:hover': { bgcolor: 'grey.200' },
        }}
      >
        <Home size={24} />
      </IconButton>

      {/* Profile Header */}
      <Box
        sx={{
          mb: 6,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
          gap: 4,
          p: 4,
          borderRadius: 2,
          boxShadow: 1,
          bgcolor: 'white',
          transition: 'box-shadow 0.3s',
          '&:hover': { boxShadow: 3 },
        }}
      >
        <Avatar
          src={data.userDetails.profileImage}
          alt={data.userDetails.name}
          sx={{ width: { xs: 72, sm: 96 }, height: { xs: 72, sm: 96 }, border: '4px solid #fff', boxShadow: 2 }}
        />
        <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
          <Typography
            variant="h5"
            sx={{ fontWeight: 'bold', mb: 1, color: 'brown.700', fontSize: { xs: '1.5rem', sm: '2rem' } }}
          >
            {data.userDetails.name}
          </Typography>
          <Typography sx={{ color: 'grey.600', mb: 1, display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', sm: 'flex-start' }, gap: 1 }}>
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
            {data.userDetails.email}
          </Typography>
          <Typography sx={{ color: 'grey.500', fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', sm: 'flex-start' }, gap: 1 }}>
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>
            Member since: {new Date(data.userDetails.updatedAt).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
          </Typography>
        </Box>
      </Box>

      {/* Action Cards */}
      <Grid container spacing={2} sx={{ mb: 6 }}>
        {!data.userDetails?.curator && (
          <Grid item xs={12} md={6}>
            <Link href="/library/onboarding" className="no-underline">
               <Card className="relative bg-gradient-to-r from-brown-700 to-brown-500 rounded-[10px] overflow-hidden p-4 text-white transform transition-all duration-300 cursor-pointer">
                 <Box className="flex items-center gap-4">
                   <Library className="w-12 h-12 text-white drop-shadow-md" />
                   <Box>
                     <Box className="flex items-center gap-2">
                       <Typography variant="h6" className="font-bold text-white mb-1">
                         Create Your Library
                       </Typography>
                       <MoveRight className="w-5 h-5 text-white" />
                     </Box>
                     <Typography className="opacity-90 text-white">
                       Start your own collection and share books with others
                     </Typography>
                   </Box>
                 </Box>
               </Card>
             </Link>
          </Grid>
        )}
        {data.userDetails?.curator && (
          <Grid item xs={12} md={6}>
            <Link href={`/library/curator/dashboard/${data.userDetails?.curator.id}`} className="no-underline">
                 <Card className="relative bg-gradient-to-r from-brown-600 via-brown-500 to-brown-700 rounded-[10px] overflow-hidden p-4 text-white">
                   <Box className="flex items-center gap-4">
                   <Library className="w-12 h-12 text-white drop-shadow-md animate-pulse" />
                   <Box>
                     <Box className="flex items-center gap-2">
                     <Typography variant="h6" className="font-bold text-white mb-1 tracking-wide">
                       View Your Library
                     </Typography>
                     <MoveRight className="w-5 h-5 text-white transition-transform group-hover:translate-x-1" />
                     </Box>
                     <Typography className="opacity-90 text-white text-sm leading-relaxed">
                     Includes information about your library like books, books borrowed, etc.
                     </Typography>
                   </Box>
                   </Box>
                 </Card>
              </Link>
          </Grid>
        )}
        <Grid item xs={12} md={6}>
        <Link href="/library/books" className="no-underline">
               <Card className="relative bg-gradient-to-r from-brown-700 to-brown-500 rounded-[10px] overflow-hidden p-4 text-white transform transition-all duration-300">
                 <Box className="flex items-center gap-4">
                   <BookOpenCheck className="w-12 h-12 text-white drop-shadow-md" /> {/* Brighter icon */}
                    <Box>
                     <Box className="flex items-center gap-2">
                       <Typography variant="h6" className="font-bold text-white mb-1">
                           Borrow Books
                       </Typography>
                       <MoveRight className="w-5 h-5 text-white" />
                     </Box>
                     <Typography className="opacity-90 text-white">
                          Explore and borrow from community libraries, read and return
                     </Typography>
                   </Box>
                 </Box>
               </Card>
             </Link>
        </Grid>
      </Grid>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 6 }}>
        {[
          { label: 'Borrowed', value: data.booksBorrowed.length, display: `${data.booksBorrowed.length} ${data.booksBorrowed.length === 1 ? 'Book' : 'Books'}`, icon: <BookMarked size={24} /> },
          { label: 'Active', value: data.booksRequested.length, display: `${data.booksRequested.length} ${data.booksRequested.length === 1 ? 'Request' : 'Requests'}`, icon: <Bell size={24} /> },
          { label: 'Libraries Joined', value: 'Coming Soon', display: 'Coming Soon', icon: <Users size={24} /> },
        ].map((stat, index) => (
          <Grid item xs={12} sm={4} key={index}>
            <Card sx={{ p: 3, borderRadius: 2, '&:hover': { boxShadow: 2 }, minHeight: 100, display: 'flex', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ p: 1.5, bgcolor: 'brown.500', borderRadius: 1 }}>{stat.icon}</Box>
                <Box>
                  <Typography sx={{ color: 'grey.600', fontSize: '0.875rem' }}>{stat.label}</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'medium' }}>{stat.display}</Typography>
                </Box>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Borrowed Books Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>Currently Borrowed</Typography>
        <Box
          ref={scrollRef}
          sx={{
            overflowX: 'auto',
            py: 2,
            '&::-webkit-scrollbar': { height: '6px' },
            '&::-webkit-scrollbar-thumb': { bgcolor: 'brown.600', borderRadius: '20px' },
            '&::-webkit-scrollbar-track': { bgcolor: 'grey.100' },
          }}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          <Grid container spacing={2} sx={{ flexWrap: 'nowrap', minWidth: data.booksBorrowed.length ? 'fit-content' : '100%' }}>
            {data.booksBorrowed
              .slice()
              .reverse()
              .filter(bb => {
                const logStatuses = bb.logs.map((log: { status: string }) => log.status);


return !['Preparing', 'Dispatched', 'Delivered', 'Returned'].every(status => logStatuses.includes(status));
              })
              .map(bb => (
                <Grid item key={bb.id}>
                  <Card sx={{ p: 3, width: { xs: 280, sm: 320 }, height: 180, borderRadius: 2, '&:hover': { boxShadow: 2 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {coverImages[bb.book.isbn] ? (
                        <img src={coverImages[bb.book.isbn] || undefined} alt={bb.book.title} style={{ width: 90, height: 130, objectFit: 'cover', borderRadius: 4 }} onError={e => (e.currentTarget.style.display = 'none')} />
                      ) : (
                        <FallbackBookCover title={bb.book.title} author={bb.book.author} width="90px" height="130px" />
                      )}
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontWeight: 'semibold', mb: 1, fontSize: '1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{bb.book.title}</Typography>
                        <Typography sx={{ color: 'grey.600', mb: 1, fontSize: '0.875rem' }}>{bb.book.author}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'orange.600', fontSize: '0.875rem' }}>
                          <Clock size={14} />
                          <Typography>Due: {new Date(bb.returnDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Typography>
                        </Box>
                      </Box>
                      <IconButton onClick={() => handleOpen(bb)}><Eye size={20} /></IconButton>
                    </Box>
                  </Card>
                </Grid>
              ))}
            {data.booksBorrowed.length === 0 && (
              <Typography sx={{ textAlign: 'center', color: 'grey.500', py: 4, width: '100%' }}>No borrowed books at the moment</Typography>
            )}
          </Grid>
        </Box>
      </Box>

      {/* Book Requests Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>Requests History</Typography>
        <Card sx={{ borderRadius: 2 }}>
          {data.booksRequested.map((request, index) => (
            <Box key={request.id} sx={{ p: 3, borderBottom: index !== data.booksRequested.length - 1 ? '1px solid' : 'none', borderColor: 'grey.200', display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 2 }}>
              <Box>
                <Typography sx={{ fontWeight: 'semibold', mb: 1, fontSize: '1rem' }}>{request.title} by {request.author} ({request.isbn})</Typography>
                <Typography sx={{ color: 'grey.600', fontSize: '0.875rem' }}>
                  Requested on {new Date(request.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}, {new Date(request.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                <Box sx={{ px: 2, py: 1, bgcolor: 'black', color: 'white', borderRadius: 1, fontSize: '0.875rem' }}>{request.status}</Box>
                {request.status === 'Approved' && (
                  <Link href={`/library/curator/${request.curatorId}/book/${request.isbn}`}>
                    <Button variant="contained" sx={{ bgcolor: '#8B4513', '&:hover': { bgcolor: '#A0522D' }, fontSize: '0.875rem', py: 1 }}>Borrow Book</Button>
                  </Link>
                )}
              </Box>
            </Box>
          ))}
          {data.booksRequested.length === 0 && (
            <Typography sx={{ textAlign: 'center', color: 'grey.500', py: 4 }}>No request history at the moment</Typography>
          )}
        </Card>
      </Box>

      {/* Borrowing History Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>Borrowing History</Typography>
        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 0 }}>
            {completedBooks.map(borrowing => (
              <Box key={borrowing.id} sx={{ p: 3, borderBottom: '1px solid', borderColor: 'grey.200', display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 2 }}>
                <Typography sx={{ fontWeight: 'semibold', fontSize: '1rem', width: { xs: '100%', sm: '33%' }, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{borrowing.book.title}<br /><span style={{ fontWeight: 'normal', color: 'grey.500', fontSize: '0.875rem' }}>{borrowing.book.author}</span></Typography>
                <Typography sx={{ fontSize: '0.875rem', width: { xs: '100%', sm: '25%' } }}>{new Date(borrowing.borrowDate).toLocaleDateString()}</Typography>
                <Typography sx={{ fontSize: '0.875rem', width: { xs: '100%', sm: '25%' } }}>{new Date(borrowing.returnDate).toLocaleDateString()}</Typography>
                <Button sx={{ bgcolor: 'black', color: 'white', '&:hover': { bgcolor: 'grey.900' }, fontSize: '0.875rem', py: 1, px: 3 }}>Completed</Button>
              </Box>
            ))}
            {completedBooks.length === 0 && (
              <Typography sx={{ textAlign: 'center', color: 'grey.500', py: 4 }}>No borrowing history at the moment</Typography>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Modal */}
      <Modal open={!!selectedBook} onClose={handleClose}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'white', p: 4, borderRadius: 2, boxShadow: 3, width: { xs: '90vw', sm: '40rem' }, maxHeight: '90vh', overflowY: 'auto' }}>
          <Typography sx={{ fontWeight: 'semibold', fontSize: '1.25rem', mb: 2 }}>{selectedBook?.title}</Typography>
          <Typography sx={{ color: 'grey.600', mb: 1, fontSize: '0.875rem' }}>Author: {selectedBook?.book.author}</Typography>
          <Typography sx={{ color: 'grey.600', mb: 1, fontSize: '0.875rem' }}>Publisher: {selectedBook?.book.publisher}</Typography>
          <Typography sx={{ color: 'grey.600', mb: 1, fontSize: '0.875rem' }}>Published: {selectedBook?.book.publishDate}</Typography>
          <Typography sx={{ color: 'grey.600', mb: 1, fontSize: '0.875rem' }}>Pages: {selectedBook?.book.pagination}</Typography>
          <Typography sx={{ color: 'grey.600', mb: 1, fontSize: '0.875rem' }}>ISBN: {selectedBook?.book.isbn}</Typography>
          <Typography sx={{ color: 'grey.600', mb: 2, fontSize: '0.875rem' }}>Additional Notes: {selectedBook?.book.additionalNotes || 'N/A'}</Typography>
          <Divider sx={{ my: 2 }} />
          <Typography sx={{ fontWeight: 'semibold', fontSize: '1rem', mb: 2 }}>Borrowing Logs</Typography>
          {selectedBook?.logs && selectedBook.logs.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {selectedBook.logs.map(log => (
                <Box key={log.id} sx={{ p: 2, border: '1px solid', borderColor: 'grey.200', borderRadius: 1, bgcolor: 'grey.100' }}>
                  <Typography sx={{ fontSize: '0.875rem' }}><strong>Status:</strong> {log.status}</Typography>
                  <Typography sx={{ fontSize: '0.875rem' }}><strong>Wallet:</strong> {log.wallet}</Typography>
                  {log.message && <Typography sx={{ fontSize: '0.875rem' }}><strong>Message:</strong> {log.message}</Typography>}
                  <Typography sx={{ fontSize: '0.75rem', color: 'grey.500' }}>{new Date(log.createdAt).toLocaleString()}</Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography sx={{ color: 'grey.500', fontSize: '0.875rem' }}>No logs available.</Typography>
          )}
        </Box>
      </Modal>

      {authenticated && <LibraryMascotWidget />}
    </Box>
  );
};

export default UserDashboard;
