import React from 'react';

import { useNetworkCheck } from '@/hooks/useNetworkCheck';

const NetworkGuard = () => {
  const { isCorrectNetwork, switchNetwork } = useNetworkCheck();

  return (
    !isCorrectNetwork && (
      <div className="fixed top-4 right-4 bg-red-500 text-white p-4 rounded-md shadow-lg">
        <p>You are on the wrong network!</p>
        <button
          onClick={switchNetwork}
          className="mt-2 px-4 py-2 bg-white text-red-500 rounded-md"
        >
          Switch to Arbitrum Sepolia
        </button>
      </div>
    )
  );
};

export default NetworkGuard;
