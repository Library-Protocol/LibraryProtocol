'use client'

// Third-party Imports
import classnames from 'classnames'

import NavToggle from './NavToggle'

// Util Imports
import { horizontalLayoutClasses } from '@layouts/utils/layoutClasses'
import ConnectWalletButton from '@/components/wallet/ConnectWalletButton'
import DashboardButton from '@/components/library/DashboardButton'
import EngageSpotNotification from '../../notification/Engage';

const NavbarContent = () => {


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
        <EngageSpotNotification />
      </div>
    </div>
  )
}

export default NavbarContent
