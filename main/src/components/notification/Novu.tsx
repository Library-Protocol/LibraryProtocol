"use client";

import { useRouter } from "next/navigation";

import { Inbox } from "@novu/react";

function Novu() {

const router = useRouter();

  const tabs = [
    {
      label: 'General',
      filter: { tags: ['general'] },
    },
    {
      label: 'Blockchain',
      filter: { tags: ['blockchain'] },
    },
    {
      label: 'Borrow',
      filter: { tags: ['borrow'] },
    },
    {
      label: 'Lend',
      filter: { tags: ['lend'] },
    },
  ];

  const appearance = {
    variables: {
      colorPrimary: "#DD2450",
      colorForeground: "#0E121B"
    },
    elements: {
     bellIcon: {
      fontSize: "64px", // Increase icon size
      transform: "scale(2)" // Scale up the icon
    },
    notification: {
      backgroundColor: "white",
      borderRadius: "2.5rem",
      boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    },
    },

  };

  return (
      <Inbox
        applicationIdentifier={process.env.NEXT_PUBLIC_NOVU_APPLICATION_ID || ""}
        subscriberId={process.env.NEXT_PUBLIC_NOVU_SUBCRIBER_ID || ""}
        tabs={tabs}
        routerPush={(path: string) => router.push(path)}
        appearance={appearance}
      />
  );
}

export default Novu;
