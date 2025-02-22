// 'use client';

// import { PrivyProvider } from '@privy-io/react-auth';
// import { arbitrumSepolia } from 'viem/chains';

// export default function Providers({ children }: { children: React.ReactNode }) {

//   return (
//     <PrivyProvider
//       appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
//       config={{
//         appearance: {
//           theme: 'light',
//           accentColor: '#795548',
//           logo: 'https://backend.sovereignfrontier.xyz/assets/logo/image.png',
//         },
//         defaultChain: arbitrumSepolia,
//         embeddedWallets: {
//           createOnLogin: 'users-without-wallets',
//         },
//       }}
//     >
//       {children}
//     </PrivyProvider>
//   );
// }

'use client'

import { PrivyProvider } from '@privy-io/react-auth'
import { arbitrum } from 'viem/chains'

if (!process.env.NEXT_PUBLIC_PRIVY_APP_ID) {
  throw new Error('NEXT_PUBLIC_PRIVY_APP_ID is not defined')
}

export default function PrivyProviderWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <PrivyProvider
    appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
      config={{
        loginMethods: ['email', 'wallet'],
        appearance: {
          theme: 'light',
          accentColor: '#795548',
          logo: 'https://backend.sovereignfrontier.xyz/assets/logo/image.png',
        },
        defaultChain: arbitrum,
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
      }}
    >
      {children}
    </PrivyProvider>
  )
}
