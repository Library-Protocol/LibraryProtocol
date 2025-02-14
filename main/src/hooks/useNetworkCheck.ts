import { useEffect, useState } from 'react';

import { useWallets } from '@privy-io/react-auth';
import { arbitrumSepolia } from 'viem/chains';

export const useNetworkCheck = () => {
  const { wallets } = useWallets();
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(true);

  useEffect(() => {
    if (wallets.length > 0) {
      const connectedWallet = wallets[0];

      const chainId = parseInt(connectedWallet.chainId);

      if (chainId !== arbitrumSepolia.id) {
        setIsCorrectNetwork(false);
      } else {
        setIsCorrectNetwork(true);
      }
    }
  }, [wallets]);

  const switchNetwork = async () => {
    if (wallets.length > 0) {
      try {
        await wallets[0].switchChain(arbitrumSepolia.id);
        setIsCorrectNetwork(true);
      } catch (error) {
        console.error('Failed to switch network:', error);
      }
    }
  };

  return { isCorrectNetwork, switchNetwork };
};
