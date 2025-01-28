'use client'

// Third-party Imports
import classnames from 'classnames'

// Component Imports
import NavToggle from './NavToggle'

// Util Imports
import { horizontalLayoutClasses } from '@layouts/utils/layoutClasses'
import ConnectWalletButton from '@/components/wallet/ConnectWalletButton'

const NavbarContent = () => {

  return (
    <div
      className={classnames(horizontalLayoutClasses.navbarContent, 'flex items-center justify-between gap-4 is-full')}
    >
      <div className='flex items-center gap-4'>
        <NavToggle />
      </div>
      <div className='flex items-center'>
        <div className='flex items-center gap-4'><ConnectWalletButton /></div>
      </div>
    </div>
  )
}

export default NavbarContent
