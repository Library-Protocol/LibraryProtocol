// import { http, createConfig, createStorage, cookieStorage } from 'wagmi'
// import { arbitrum } from 'wagmi/chains'
// import { injected, metaMask } from 'wagmi/connectors'

// export const config = createConfig({
//   chains: [arbitrum],
//   ssr: true,
//   storage: createStorage({ storage: cookieStorage }), // Optional: Enable storage for persistence
//   connectors: [
//     injected(),
//     metaMask()
//   ],
//   transports: {
//     [arbitrum.id]: http(),
//   },
// })


// src/configs/wagmiConfig.ts
import { http, createConfig } from 'wagmi';
import { arbitrum } from 'wagmi/chains';
import { injected } from 'wagmi/connectors'; // For MetaMask or other injected wallets

export const config = createConfig({
  chains: [arbitrum], // Only Arbitrum One is supported
  connectors: [injected()], // Supports MetaMask and other injected wallets
  transports: {
    [arbitrum.id]: http('https://arb1.arbitrum.io/rpc'), // Public RPC for Arbitrum One
  },
});
