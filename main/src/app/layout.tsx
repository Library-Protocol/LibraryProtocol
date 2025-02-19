// MUI Imports
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript'

// Third-party Imports
import 'react-perfect-scrollbar/dist/css/styles.css'

// Type Imports
import type { ChildrenType } from '@core/types'

// Util Imports
import { getSystemMode } from '@core/utils/serverHelpers'

// Style Imports
import '@/app/globals.css'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'
import Providers from '@/context/wagmiProvider'
import ClientNetworkCheck from '@/components/network/ClientNetworkCheck'
import ConnectionStatus from '@/components/network/ConnectionStatus'

export const metadata = {
  title: 'Library Protocol',
  description:
    'Library Protocol is a blockchain-based platform empowering librarians, book owners, and readers to manage, share, and access both digital and physical books. With features like staking and decentralized records, it fosters a transparent and secure ecosystem for the preservation, lending, and exchange of knowledge.'
}

const RootLayout = async (props: ChildrenType) => {
  const { children } = props

  const systemMode = await getSystemMode()
  const direction = 'ltr'

  return (
    <html id='__next' lang='en' dir={direction} suppressHydrationWarning>
      <body className='flex is-full min-bs-full flex-auto flex-col'>
        <InitColorSchemeScript attribute='data' defaultMode={systemMode} />
            <Providers>
              <ClientNetworkCheck />
                  {children}
              <ConnectionStatus />
            </Providers>
      </body>
    </html>
  )
}

export default RootLayout
