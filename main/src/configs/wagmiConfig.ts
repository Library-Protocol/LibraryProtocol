import { http, createConfig, createStorage, cookieStorage } from 'wagmi'
import { arbitrumSepolia } from 'wagmi/chains'
import { injected, metaMask } from 'wagmi/connectors'

export const config = createConfig({
  chains: [arbitrumSepolia],
  ssr: true,
  storage: createStorage({ storage: cookieStorage }), // Optional: Enable storage for persistence
  connectors: [
    injected(),
    metaMask()
  ],
  transports: {
    [arbitrumSepolia.id]: http(),
  },
})
