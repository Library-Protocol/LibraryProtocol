'use client';
import React from 'react';

import { useRouter } from 'next/navigation';

import { usePrivy } from '@privy-io/react-auth';

const WalletButton = () => {
  const router = useRouter();
  const { user, authenticated, ready, login, logout } = usePrivy();

  // Combined async operation using React Query or SWR would be even better
  React.useEffect(() => {
    const checkUserExists = async () => {
      if (!authenticated || !user?.wallet?.address) return;

      try {
        const response = await fetch(`/api/user/fetch-details?wallet=${user.wallet.address}`);

        if (!response.ok) {
          router.replace('/user/onboarding');
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        router.replace('/user/onboarding');
      }
    };

    checkUserExists();
  }, [authenticated, user?.wallet?.address, router]);

  // Handle logout redirect
  React.useEffect(() => {
    if (!authenticated && ready) {
      router.replace('/');
    }
  }, [authenticated, ready, router]);

  const handleClick = () => {
    authenticated ? logout() : login();
  };

  return (
    <div className="flex gap-4 items-center">
      <button
        onClick={handleClick}
        className="bg-black text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-white rounded w-auto px-6 py-4 text-md transition duration-200"
      >
        {authenticated ? 'Logout' : 'Connect Wallet'}
      </button>
    </div>
  );
};

export default WalletButton;
