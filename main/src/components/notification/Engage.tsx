"use client";

import { useEffect, useState } from "react";

import { Engagespot } from "@engagespot/react-component";
import { usePrivy } from "@privy-io/react-auth";

import { generateUserToken } from "@/app/server/actions/engage/library-reader";

const EngageSpotNotification = () => {
  const { user } = usePrivy();
  const [userId, setUserId] = useState<string | null>(null);
  const [userToken, setUserToken] = useState<string | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_ENGAGESPOT_API_KEY;

  useEffect(() => {
    const fetchUserToken = async () => {
      if (user?.wallet?.address) {
        setUserId(user.wallet.address);

        try {
          const token = await generateUserToken(user.wallet.address);

          setUserToken(token);

        } catch (error) {
          console.error("Error fetching user token or updating preferences:", error);
        }
      }
    };

    fetchUserToken();
  }, [user]);

  const theme = {
    // colors: {
    //   brandingPrimary: "#5D4037",
    // },
    notificationButton: {
      iconFill: "#5D4037",
      iconSize: "40px",
    },
  };

  return (
    <Engagespot
      apiKey={apiKey as string}
      userId={userId || 'guest'}
      dataRegion="us"
      userToken={userToken as string}
      theme={theme}
    />
  );
};

export default EngageSpotNotification;
