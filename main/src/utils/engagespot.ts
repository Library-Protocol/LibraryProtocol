// lib/engagespot.ts
"use server";

type SendNotificationParams = {
  workflowIdentifier: string;
  cancellationKey?: string;
  data: Record<string, any>;
  recipients: string[];
};

export async function sendEngageSpotNotification({
  workflowIdentifier,
  cancellationKey,
  data,
  recipients,
}: SendNotificationParams) {

  console.log('SendNotificationParams',{
    "workflowIdentifier": workflowIdentifier,
    "cancellationKey": cancellationKey,
    "data":  data,
    "recipients": recipients
  })
  const ENGAGESPOT_API_KEY = process.env.ENGAGESPOT_API_KEY;
  const ENGAGESPOT_API_SECRET = process.env.ENGAGESPOT_API_SECRET;

  if (!ENGAGESPOT_API_KEY || !ENGAGESPOT_API_SECRET) {
    throw new Error("Engagespot API credentials are missing");
  }

  const response = await fetch("https://api.engagespot.co/v3/notifications", {
    method: "POST",
    headers: {
      "X-ENGAGESPOT-API-KEY": ENGAGESPOT_API_KEY,
      "X-ENGAGESPOT-API-SECRET": ENGAGESPOT_API_SECRET,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      notification: {
        workflow: {
          identifier: workflowIdentifier,
          ...(cancellationKey && { cancellationKey }),
        },
      },
      data,
      sendTo: {
        recipients,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();

    throw new Error(`Engagespot API error: ${error.message}`);
  }

  return response.json();
}
