'use client'

// Next Imports
import Link from 'next/link'

// Third-party Imports
import classnames from 'classnames'

// Util Imports
import { horizontalLayoutClasses } from '@layouts/utils/layoutClasses'

const FooterContent = () => {
  // Hooks

  return (
    <div
      className={classnames(horizontalLayoutClasses.footerContent, 'flex items-center justify-between flex-wrap gap-4')}
    >
      <p>
        <span className='text-textSecondary'>{`An Open Source `}</span>
        <Link href='#' target='_blank' className='text-primary'>
          Library Protocol
        </Link>
        <span>{` ❤️ `}</span>
      </p>
    </div>
  )
}

export default FooterContent
