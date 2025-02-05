// Example in a Next.js page (pages/notifications.tsx or app/notifications/page.tsx)
'use client';

import React from 'react';

import { Engagespot } from '@engagespot/react-component';

export default function NotificationsPage() {
  return (
    <div>
      <h1>Notification Feed</h1>
      <Engagespot
        apiKey={process.env.NEXT_PUBLIC_ENGAGESPOT_API_KEY!}
        userId="unique-user-id" // Replace with your logic to obtain the user ID
        dataRegion="us"
        userToken="your-secure-user-token" // Include only if secure auth is enabled
      />
    </div>
  );
}
