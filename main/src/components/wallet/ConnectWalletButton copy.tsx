'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';


const SkeletonLoader = ({ width, height }: { width: string; height: string }) => (
  <div className="animate-pulse bg-gray-700 rounded" style={{ width, height }}></div>
);

const WalletButton = () => {
  const router = useRouter();
  const { ready, authenticated, login, logout } = usePrivy();

  useEffect(() => {
    if (!authenticated) {
      router.push('/');
    }
  }, [authenticated, router]);

  const handleClick = () => {
    authenticated ? logout() : login();
  };

  if (!ready) {
    return <SkeletonLoader width="180px" height="50px" />;
  }

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
