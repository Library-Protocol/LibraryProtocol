'use client';

import React, { useEffect, useRef, useState } from 'react';

import Link from 'next/link';

import { Box, Grid, Card, Typography, Avatar, Button, IconButton, Modal, Divider, CardContent, Skeleton } from '@mui/material';
import { Library, BookOpenCheck, Clock, BookMarked, Users, Bell, Home, Eye, MoveRight } from 'lucide-react';

import FallbackBookCover from '@/components/library/FallbackBookCover';
import { usePrivy } from '@privy-io/react-auth';
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
  logs?: Array<{
    id: string;
    status: string;
    wallet: string;
    message?: string;
    createdAt: string;
  }>;
  book: any;
}

interface UserDashboardComponentProps {
  data: {
    booksBorrowed: any[];
    booksRequested: any[];
    userDetails: any;
  };
}

const UserDashboard: React.FC<UserDashboardComponentProps> = ({ data }) => {
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState<BookBorrowed | null>(null);
  const [coverImages, setCoverImages] = useState<{ [isbn: number]: string | null }>({});
  const { authenticated } = usePrivy(); // Get Privy authentication methods

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);

  const handleOpen = (borrowing: BookBorrowed) => setSelectedBook(borrowing);
  const handleClose = () => setSelectedBook(null);

  const handleReturnHome = () => {
    window.location.href = '/';
  };

  const fetchCoverImage = async (isbn: number) => {
    try {
      const coverUrl = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`;
      const coverResponse = await fetch(coverUrl);

      if (coverResponse.ok) {
        setCoverImages((prev) => ({ ...prev, [isbn]: coverUrl }));
      } else {
        setCoverImages((prev) => ({ ...prev, [isbn]: null }));
      }
    } catch (error) {
      console.error('Error fetching cover image:', error);
      setCoverImages((prev) => ({ ...prev, [isbn]: null }));
    }
  };

  const completedBooks = data.booksBorrowed.filter(book => {
    const statusSet = new Set(book.logs.map((log: { status: string }) => log.status));

    return statusSet.has('Preparing') &&
           statusSet.has('Dispatched') &&
           statusSet.has('Delivered') &&
           statusSet.has('Returned');
  });

  useEffect(() => {
    if (!loading) {
      data.booksBorrowed.forEach((bb) => {
        if (bb.book.isbn && !coverImages[bb.book.isbn]) {
          fetchCoverImage(bb.book.isbn);
        }
      });
    }
  }, [loading, data.booksBorrowed]);

   const scrollRef = useRef<HTMLDivElement>(null);
    let isDragging = false;
    let startX: number, scrollLeft: number;

    const handleMouseDown = (e: React.MouseEvent) => {
      if (!scrollRef.current) return;
      isDragging = true;
      startX = e.pageX - scrollRef.current.offsetLeft;
      scrollLeft = scrollRef.current.scrollLeft;
    };

    const handleMouseLeave = () => {
      isDragging = false;
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleMouseMove = (e: React.MouseEvent) => {
      if (!isDragging || !scrollRef.current) return;
      e.preventDefault();
      const x = e.pageX - scrollRef.current.offsetLeft;
      const walk = (x - startX) * 0.7; // Adjust sensitivity

      scrollRef.current.scrollLeft = scrollLeft - walk;
    };

  if (loading) {
    return (
      <div className="relative max-w-[880px] mx-auto px-4 sm:px-6 lg:px-8">
        <Box className="p-6 max-w-7xl mx-auto">
          {/* Skeleton for Profile Header */}
          <Box className="mb-8 flex items-center gap-6 p-8 rounded-lg shadow-lg">
            <Skeleton variant="circular" width={96} height={96} />
            <Box>
              <Skeleton variant="text" width={200} height={40} />
              <Skeleton variant="text" width={150} height={24} />
              <Skeleton variant="text" width={180} height={24} />
            </Box>
          </Box>

          {/* Skeleton for Action Cards */}
          <Grid container spacing={4} className="mb-8">
            <Grid item xs={12} md={6}>
              <Skeleton variant="rectangular" width="100%" height={120} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Skeleton variant="rectangular" width="100%" height={120} />
            </Grid>
          </Grid>

          {/* Skeleton for Stats Cards */}
          <Grid container spacing={4} className="mb-8">
            {[1, 2, 3].map((index) => (
              <Grid item xs={12} sm={4} md={4} key={index}>
                <Skeleton variant="rectangular" width="100%" height={100} />
              </Grid>
            ))}
          </Grid>

          {/* Skeleton for Borrowed Books Section */}
          <Box className="mb-8">
            <Skeleton variant="text" width={200} height={40} />
            <Box className="overflow-x-auto whitespace-nowrap p-4">
              <Grid container spacing={4} className="flex-nowrap flex">
                {[1, 2, 3].map((index) => (
                  <Grid item xs={12} sm={6} md={6} key={index}>
                    <Skeleton variant="rectangular" width={320} height={200} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Box>

          {/* Skeleton for Book Requests Section */}
          <Box>
            <Skeleton variant="text" width={200} height={40} />
            <Card>
              {[1, 2, 3].map((index) => (
                <Box key={index} className="p-4 flex items-center justify-between">
                  <Box>
                    <Skeleton variant="text" width={150} height={24} />
                    <Skeleton variant="text" width={200} height={20} />
                  </Box>
                  <Skeleton variant="rectangular" width={100} height={40} />
                </Box>
              ))}
            </Card>
          </Box>
        </Box>
      </div>
    );
  }

  return (
    <div className="relative max-w-[880px] mx-auto px-4 sm:px-6 lg:px-8">
      <Box
        sx={{
          position: 'absolute',
          top: 25,
          left: -50,
          zIndex: 10
        }}
      >
        <Button
          variant="contained" // Ensures a solid background
          onClick={handleReturnHome}
          sx={{
            minWidth: 'auto',
            p: 1,
            backgroundColor: '#5D4037', // Black background
            color: 'white', // White text
            borderColor: 'black',
            '&:hover': {
              backgroundColor: '#5D4037', // Slightly lighter black on hover
              borderColor: 'black'
            }
          }}
        >
          <Home size={32} />
        </Button>
      </Box>
      <Box className="p-6 max-w-7xl mx-auto">
        {/* Profile Header */}
        <Box
          className="mb-8 flex items-center gap-6 p-8 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl"
          sx={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f9f9f9 100%)',
            border: '1px solid #e0e0e0',
          }}
        >
      {/* Avatar with Border and Shadow */}
      <Avatar
        src={data.userDetails.profileImage}
        alt={data.userDetails.name}
        className="w-24 h-24"
        sx={{
          border: '4px solid #ffffff',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        }}
      />

        {/* User Details */}
        <Box>
          {/* Gradient Text for Name */}
          <Typography
            variant="h4"
            className="font-bold mb-2"
            sx={{
              background: 'linear-gradient(135deg, #5D4037 0%, #795548 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {data.userDetails.name}
          </Typography>

          {/* Email with Icon */}
          <Typography className="text-gray-600 mb-2 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            {data.userDetails.email}
          </Typography>

          {/* Member Since with Icon */}
          <Typography className="text-sm text-gray-500 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                clipRule="evenodd"
              />
              </svg>
              Member since :  {new Date(data.userDetails.updatedAt).toLocaleString('en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
               })}
            </Typography>
          </Box>
        </Box>

        {/* Action Cards */}
        <Grid container spacing={4} className="mb-8">
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
                         Explore and borrow from community libraries
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Link>
          </Grid>
        </Grid>

        {/* Stats Cards */}
        <Grid container spacing={4} className="mb-8">
          {[
            {
              label: "Borrowed",
              value: data.booksBorrowed.length,
              display: `${data.booksBorrowed.length} ${data.booksBorrowed.length === 1 ? "Book" : "Books"}`,
              icon: <BookMarked className="w-6 h-6 text-white" />,
            },
            {
              label: "Active",
              value: data.booksRequested.length,
              display: `${data.booksRequested.length} ${data.booksRequested.length === 1 ? "Request" : "Requests"}`,
              icon: <Bell className="w-6 h-6 text-white" />,
            },
            {
              label: "Libraries Joined",
              value: 'Coming Soon',
              display: 'Coming Soon', // No "Books" suffix
              icon: <Users className="w-6 h-6 text-white" />,
            }
          ].map((stat, index) => (
            <Grid item xs={12} sm={4} md={4} key={index}>
              <Card className="p-4 hover:shadow-md transition-shadow min-h-[100px] flex flex-col justify-center">
                <Box className="flex items-center gap-3">
                  <Box className="p-2 bg-brown-500 rounded-lg">{stat.icon}</Box>
                  <Box>
                    <Typography className="text-gray-600 text-sm">{stat.label}</Typography>
                    <Typography variant="h5" className="font-medium">{stat.display}</Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Borrowed Books Section */}
        <Box className="mb-8">
          <Typography variant="h5" className="font-bold mb-4">
            Currently Borrowed
          </Typography>
          <Box
            ref={scrollRef}
            className="overflow-x-auto whitespace-nowrap p-4 cursor-grab active:cursor-grabbing"
            sx={{
              '&::-webkit-scrollbar': {
                height: '6px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'brown',
                borderRadius: '20px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: '#f1f1f1',
              },
            }}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
          >
            <Grid container spacing={4} className="flex-nowrap flex">
              {data.booksBorrowed
                .slice()
                .reverse()
                .filter((bb) => {
                  const logStatuses = bb.logs.map((log: { status: string }) => log.status);

                  return !(
                    logStatuses.includes("Preparing") &&
                    logStatuses.includes("Dispatched") &&
                    logStatuses.includes("Delivered") &&
                    logStatuses.includes("Returned")
                  );
                })
                .map((bb) => (
                  <Grid item xs={12} sm={6} md={6} key={bb.id}>
                    <Card className="p-4 hover:shadow-md transition-shadow min-w-[320px] h-[200px] flex flex-col justify-between">
                      <Box className="flex gap-4 items-center">
                        {coverImages[bb.book.isbn] ? (
                          <img
                            src={coverImages[bb.book.isbn] || undefined}
                            alt={bb.book.title}
                            className="w-24 h-32 object-cover rounded"
                            onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                          />
                        ) : (
                          <FallbackBookCover
                            title={bb.book.title}
                            author={bb.book.author}
                            width="90px"
                            height="130px"
                          />
                        )}
                        <Box className="flex-1">
                          <Typography
                            className="font-semibold mb-1"
                            sx={{
                              wordWrap: "break-word",
                              whiteSpace: "normal",
                              maxWidth: "100%",
                            }}
                          >
                            {bb.book.title}
                          </Typography>
                          <Typography className="text-sm text-gray-600 mb-2">
                            {bb.book.author}
                          </Typography>
                          <Box className="flex items-center gap-1 text-orange-600">
                            <Clock size={14} />
                            <Typography className="text-sm">
                              Due:{" "}
                              {new Date(bb.returnDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </Typography>
                          </Box>
                        </Box>
                        <IconButton onClick={() => handleOpen(bb)}>
                          <Eye size={20} />
                        </IconButton>
                      </Box>
                    </Card>
                  </Grid>
                ))}
            </Grid>
          </Box>
          <Card className="w-full max-w-4xl mx-auto overflow-hidden">
              {data.booksBorrowed.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  No borrowed books at moment
                </div>
              )}
            </Card>
        </Box>
        {/* Book Requests Section */}
        <Box>
          <Typography variant="h5" className="font-bold mb-4">
            Requests History
          </Typography>
          <Card>
            {data.booksRequested.map((request, index) => (
              <Box
                key={request.id}
                className={`p-4 flex items-center justify-between ${
                  index !== data.booksRequested.length - 1 ? 'border-b' : ''
                }`}
              >
                <Box>
                  <Typography className="font-semibold mb-1">
                    {request.title} by {request.author} ({request.isbn})
                  </Typography>
                  <Typography className="text-sm text-gray-600">
                  Requested on&nbsp;
                    {new Date(request.createdAt).toLocaleDateString('en-US', {
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                    })},&nbsp;
                    {new Date(request.createdAt).toLocaleTimeString('en-US', {
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </Typography>
                </Box>
                <div className="flex items-center space-x-2">
                  <Box className="h-10 px-4 py-2 rounded text-sm bg-black text-white flex items-center">
                    {request.status}
                  </Box>

                  {request.status === "Approved" && (
                    <Link href={`/library/curator/${request.curatorId}/book/${request.isbn}`}>
                      <button className="h-10 px-4 py-2 bg-[#8B4513] text-white rounded hover:bg-[#A0522D] flex items-center whitespace-nowrap">
                        Borrow Book
                      </button>
                    </Link>
                  )}
                </div>
              </Box>
            ))}

            {data.booksRequested.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                  No request history at the moment
              </div>
            )}
          </Card>
        </Box>
      </Box>
      {/* Completed Borrowing History Section */}
      <Box className="mb-8 w-[770px] mx-auto">
        <Typography variant="h5" className="font-bold mb-4">
          Borrowing History
        </Typography>
        <Card className="w-full max-w-4xl mx-auto overflow-hidden">
          <CardContent className="divide-y">
            {completedBooks.map((borrowing) => (
              <div key={borrowing.id} className="flex justify-between items-center p-4">
                <div className="w-1/3">
                  <h3 className="font-semibold truncate">{borrowing.book.title}</h3>
                  <p className="text-sm text-gray-500 truncate">{borrowing.book.author}</p>
                </div>
                <p className="w-1/4 text-sm">{new Date(borrowing.borrowDate).toLocaleDateString()}</p>
                <p className="w-1/4 text-sm">{new Date(borrowing.returnDate).toLocaleDateString()}</p>
                <button className="h-10 px-4 py-2 bg-[#000000] text-white rounded hover:bg-[#000000] flex items-center whitespace-nowrap">
                        Completed
                </button>
              </div>
            ))}

            {completedBooks.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                No borrowing history at the moment
              </div>
            )}
          </CardContent>
        </Card>
      </Box>
      <Modal open={!!selectedBook} onClose={handleClose}>
        <Box className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg w-[40rem] max-w-[90vw] max-h-[90vh] overflow-y-auto">
          {/* Book Details Section */}
          <Typography className="font-semibold text-lg mb-2">
            {selectedBook?.title}
          </Typography>
          <Typography className="text-sm text-gray-600 mb-2">
            Author: {selectedBook?.book.author}
          </Typography>
          <Typography className="text-sm text-gray-600 mb-2">
            Publisher: {selectedBook?.book.publisher}
          </Typography>
          <Typography className="text-sm text-gray-600 mb-2">
            Published: {selectedBook?.book.publishDate}
          </Typography>
          <Typography className="text-sm text-gray-600 mb-2">
            Pages: {selectedBook?.book.pagination}
          </Typography>
          <Typography className="text-sm text-gray-600 mb-2">
            ISBN: {selectedBook?.book.isbn}
          </Typography>
          <Typography className="text-sm text-gray-600 mb-4">
            Additional Notes: {selectedBook?.book.additionalNotes || "N/A"}
          </Typography>

          {/* Divider for Logs */}
          <Divider className="my-4" />

          {/* Logs Section */}
          <Typography className="font-semibold text-md mb-2">Borrowing Logs</Typography>
          {selectedBook?.logs && selectedBook.logs.length > 0 ? (
            <Box className="space-y-3">
              {selectedBook.logs.map((log) => (
                <Box key={log.id} className="border p-3 rounded-md bg-gray-100">
                  <Typography className="text-sm text-gray-700">
                    <strong>Status:</strong> {log.status}
                  </Typography>
                  <Typography className="text-sm text-gray-700">
                    <strong>Wallet:</strong> {log.wallet}
                  </Typography>
                  {log.message && (
                    <Typography className="text-sm text-gray-700">
                      <strong>Message:</strong> {log.message}
                    </Typography>
                  )}
                  <Typography className="text-xs text-gray-500">
                    {new Date(log.createdAt).toLocaleString()}
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography className="text-sm text-gray-500">No logs available.</Typography>
          )}
        </Box>
      </Modal>
      {authenticated && <LibraryMascotWidget />}
    </div>
  );
};

export default UserDashboard;
