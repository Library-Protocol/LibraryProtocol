'use client';

import React, { useEffect, useState } from 'react';

import { useParams } from 'next/navigation';

import CuratorDashboard from '@/views/library/curator/dashboard';

function LibraryCuratorPage() {
  const [curator, setCurator] = useState<any>({}); // Or use your Curator type instead of any
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const id = params.id;

  useEffect(() => {
    const fetchCurator = async () => {
      try {
        const response = await fetch(`/api/library/curator/${id}`);

        if (!response.ok) {

          throw new Error('Failed to fetch curator data');

        }

        const data = await response.json();

        setCurator(data);

      } catch (error: any) {
        setError(error.message);
      }
    };

    fetchCurator();
  }, [id]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  // Only render LibraryDetails if curator has an id
  return curator.id ? <CuratorDashboard Curator={curator} /> : null;
}

export default LibraryCuratorPage;
