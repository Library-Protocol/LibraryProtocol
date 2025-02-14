'use client';

import React, { useEffect, useState } from 'react';

import { usePrivy } from '@privy-io/react-auth';

import UserDashboard from '@/views/user/dashboard';

function UserLibraryDashboard() {
  const { ready, authenticated, user } = usePrivy();

  const [data, setData] = useState({
    booksBorrowed: [],
    booksRequested: [],
    userDetails: []
  });

  const [, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || !authenticated || !user?.wallet?.address) return;

    const fetchData = async () => {
      try {
        const [booksBorrowedRes, booksRequestedRes, userDetails] = await Promise.all([
          fetch(`/api/user/dashboard/books-borrowed?wallet=${user?.wallet?.address}`).then(res => res.json()),
          fetch(`/api/user/dashboard/books-requested?wallet=${user?.wallet?.address}`).then(res => res.json()),
          fetch(`/api/user/fetch-details?wallet=${user?.wallet?.address}`).then(res => res.json())
        ]);

        setData({
          booksBorrowed: booksBorrowedRes,
          booksRequested: booksRequestedRes,
          userDetails: userDetails
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ready, authenticated, user?.wallet?.address]);

  return <UserDashboard data={data} />;
}

export default UserLibraryDashboard;
