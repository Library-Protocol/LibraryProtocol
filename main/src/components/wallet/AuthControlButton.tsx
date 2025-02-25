'use client';

import React, { useEffect } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { User } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { Engagespot } from '@engagespot/react-component';
import { useQuery } from '@tanstack/react-query';

import { generateUserToken } from '@/app/server/actions/engage/library-reader';

const fetchUserDetails = async (walletAddress: string) => {
  const response = await fetch(`/api/user/fetch-details?wallet=${walletAddress}`);

  if (!response.ok) throw new Error('User not found');

return response.json(); // Assuming the API returns JSON data
};

const AuthControlButton = () => {
  const router = useRouter();
  const { user, authenticated, ready, login, logout } = usePrivy();
  const [walletAddress, setWalletAddress] = React.useState<string>('');

  const apiKey = process.env.NEXT_PUBLIC_ENGAGESPOT_API_KEY;

  // Set wallet address
  useEffect(() => {
    if (authenticated && user?.wallet?.address) {
      setWalletAddress(user.wallet.address);
    } else {
      setWalletAddress('');
    }
  }, [authenticated, user]);

  // Fetch user details with React Query
  const { isLoading: isUserLoading, error: userError } = useQuery({
    queryKey: ['user', walletAddress],
    queryFn: () => fetchUserDetails(walletAddress),
    enabled: !!walletAddress && authenticated, // Only fetch when walletAddress exists and authenticated
    retry: false, // Don't retry on failure; we'll redirect instead
  });

  // Fetch EngageSpot token with React Query
  const { data: userToken, isLoading: isTokenLoading } = useQuery({
    queryKey: ['engageToken', walletAddress],
    queryFn: () => generateUserToken(walletAddress),
    enabled: !!walletAddress && authenticated,
  });

  // Redirect logic
  useEffect(() => {
    if (!authenticated && ready) {
      router.replace('/');
    } else if (walletAddress && !isUserLoading && userError) {
      router.replace('/user/onboarding');
    }
  }, [authenticated, ready, walletAddress, isUserLoading, userError, router]);

  const handleAuthClick = () => {
    authenticated ? logout() : login();
  };

  const engagespotTheme = {
    notificationButton: {
      iconFill: '#5D4037',
      iconSize: '40px',
    },
  };

  return (
    <div className="flex gap-4 items-center">
      {/* Connect Wallet / Logout Button */}
      <button
        onClick={handleAuthClick}
        className="bg-black text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-white rounded w-auto px-6 py-4 text-md transition duration-200"
      >
        {authenticated ? 'Logout' : 'Connect Wallet'}
      </button>

      {/* Dashboard Button */}
      {authenticated && walletAddress && !isUserLoading && !userError && (
        <Link
          href={`/user/dashboard/${walletAddress}`}
          className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brown-700 to-brown-500 px-6 py-3 text-white shadow-lg transition-all hover:shadow-brown-500/25 hover:translate-y-[-2px] active:translate-y-[1px]"
        >
          <span className="relative font-semibold">Profile</span>
          <User size={18} className="transition-transform group-hover:rotate-45" />
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-brown-700/20 to-brown-500/20 blur-xl transition-opacity opacity-0 group-hover:opacity-100" />
        </Link>
      )}

      {/* EngageSpot Notification */}
      {authenticated && walletAddress && userToken && !isTokenLoading && (
        console.log('EngageSpot Notification', userToken, walletAddress, apiKey, engagespotTheme),
        <Engagespot
          apiKey={apiKey as string}
          userId={walletAddress || 'guest'}
          dataRegion="us"
          userToken={userToken as string}
          theme={engagespotTheme}
        />
      )}
    </div>
  );
};

export default AuthControlButton;
