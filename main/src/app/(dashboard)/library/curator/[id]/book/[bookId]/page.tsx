'use client';

import React, { useEffect, useState } from 'react';

import { useParams } from 'next/navigation';

import BookDetails from '@/views/library/book/details';

function BookDetailsPage() {
  const [curator, setCurator] = useState<any>({}); // Or use your Curator type instead of any
  const [book, setBook] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);


  const { id, bookId } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/library/curator/${id}`);

        if (!response.ok) {
          throw new Error('Failed to fetch curator data');
        }

        const data = await response.json();

        console.log('Fetched data:', data); // Log the response

        if (!data || data.id !== id) {
          throw new Error('Curator data not found');
        }

        setCurator(data);

        const specificBook = data.books.find((b: any) => b.isbn === bookId);

        if (!specificBook) {
          throw new Error('Book not found');
        }

        setBook(specificBook);
      } catch (error: any) {
        setError(error.message);
      }
    };

    if (id && bookId) {
      fetchData();
    }
  }, [id, bookId]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (curator && book) {
    return <BookDetails Curator={curator} Book={book} />;
  }

}

export default BookDetailsPage;
