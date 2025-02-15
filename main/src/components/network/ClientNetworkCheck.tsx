'use client';

import { useEffect, useState } from 'react';

import { useAccount, useSwitchChain } from 'wagmi';
import { arbitrumSepolia } from 'viem/chains';

const ClientNetworkCheck = () => {
  const { chain, isConnected } = useAccount();
  const { switchChain } = useSwitchChain();
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    const isWrongNetwork = chain?.id !== arbitrumSepolia.id;

    if (isConnected && isWrongNetwork) {
      setShouldShow(true);
    } else {
      setShouldShow(false);
    }
  }, [chain, isConnected]);

  if (!shouldShow) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80">
        <h2 className="text-xl font-bold mb-4">Unsupported Network</h2>
        <p className="mb-4">We currently don&apos;t support the chain you are on. Please switch to continue.</p>
        <button
          onClick={() => switchChain({ chainId: arbitrumSepolia.id })}
          className="w-full bg-brown-500 text-white px-4 py-2 rounded hover:bg-brown-600"
        >
          Switch to Arbitrum Sepolia
        </button>
      </div>
    </div>
  );
};

export default ClientNetworkCheck;
