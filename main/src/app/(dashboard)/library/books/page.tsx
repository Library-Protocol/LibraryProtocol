'use client';

import React, { useEffect, useState } from 'react'

import BooksPage from '@/views/library/book/list'

interface Curator {
  onChainUniqueId: string;
  name: string;
  country: string;
  city: string;
}

function LibraryBooksPage() {
    const [, setCurators] = useState<Curator[]>([])
    const [books, setBooks] = useState<any[]>([])

    useEffect(() => {
      async function fetchBooks() {
        const response = await fetch('/api/library/curator/list')

        if (response.ok) {
          const res = await response.json()

          setBooks(res)
        } else {
          const res = await response.json()

          console.log('curator response', res)
          setCurators(res)
        }
      }

      fetchBooks()
    }, [])

  return <BooksPage data={books} />
}

export default LibraryBooksPage
