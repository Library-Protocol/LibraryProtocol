'use client'

import React, { useEffect, useState } from 'react'

import LandingPage from '@/views/landing'

function HomePage() {
  const [curators, setCurators] = useState<any[]>([])

  useEffect(() => {
    // Fetch curators from the API
    async function fetchCurators() {
      const response = await fetch('/api/library/curator/list')
      if (response.ok) {
        const data = await response.json()
        setCurators(data)
      } else {
        console.error('Error fetching curators')
      }
    }
    fetchCurators()
  }, [])

  return <LandingPage curators={curators} />
}

export default HomePage
