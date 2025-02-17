'use client'

// Third-party Imports
import classnames from 'classnames'

// Component Imports
import { Engagespot } from '@engagespot/react-component';

import { usePrivy } from '@privy-io/react-auth'

import NavToggle from './NavToggle'

// Util Imports
import { horizontalLayoutClasses } from '@layouts/utils/layoutClasses'
import ConnectWalletButton from '@/components/wallet/ConnectWalletButton'
import DashboardButton from '@/components/library/DashboardButton'
// import EngageSpotNotification from '../../notification/Engage';



const theme = {
  colors: { colorPrimary: "#864727"},
  notificationButton: {
        iconFill: "#864727",
        iconSize: "34px",
        borderWidth: "11px",
        hoverBackground: "#ffffff",
    }
  };

const NavbarContent = () => {

  const { user} = usePrivy();

  console.log('User Address', user?.wallet?.address);

  return (
    <div
      className={classnames(horizontalLayoutClasses.navbarContent, 'flex items-center justify-between gap-4 is-full')}
    >
      <div className='flex items-center gap-4'>
        <NavToggle />
      </div>
      <div className='flex items-center gap-4'>
        <ConnectWalletButton />
        <DashboardButton />
        {/* <EngageSpotNotification /> */}
        <Engagespot
            apiKey={'x5ryc9xex19hovqogv824v'}
            userId={user?.wallet?.address || 'guest'}
            textOverrides={{
               header: {
                  headerText: 'Jam',
               },
            }}
            theme={theme}
         />
      </div>
    </div>
  )
}

export default NavbarContent
