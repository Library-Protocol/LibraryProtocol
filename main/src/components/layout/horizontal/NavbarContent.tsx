'use client';

import classnames from 'classnames';

import NavToggle from './NavToggle';
import { horizontalLayoutClasses } from '@layouts/utils/layoutClasses';
import AuthControlButton from '@/components/wallet/AuthControlButton';

const NavbarContent = () => {
  return (
    <div
      className={classnames(horizontalLayoutClasses.navbarContent, 'flex items-center justify-between gap-4 is-full')}
    >
      <div className="flex items-center gap-4">
        <NavToggle />
      </div>
      <div className="flex items-center gap-4">
        <AuthControlButton />
      </div>
    </div>
  );
};

export default NavbarContent;
