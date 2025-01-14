// Next Imports
import type { Metadata } from 'next'

// Component Imports
import ComingSoon from '@/views/ComingSoon'

export const metadata: Metadata = {
  title: 'Library Protocol - Coming Soon',
  description: 'Protocol For Everyone, Everywhere'
}

const ComingSoonPage = async () => {
  return <ComingSoon />
}

export default ComingSoonPage
