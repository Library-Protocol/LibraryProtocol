'use server';

export async function sendNotification({ workflowIdentifier, recipient }: { workflowIdentifier: string, recipient: string }) {
    const ENGAGESPOT_API_KEY = process.env.ENGAGESPOT_API_KEY;
    const ENGAGESPOT_API_SECRET = process.env.ENGAGESPOT_API_SECRET;

    if (!ENGAGESPOT_API_KEY || !ENGAGESPOT_API_SECRET) {
        throw new Error("Engagespot API credentials are missing.");
    }

    const response = await fetch('https://api.engagespot.co/v3/notifications', {
        method: 'POST',
        headers: {
            'X-ENGAGESPOT-API-KEY': ENGAGESPOT_API_KEY,
            'X-ENGAGESPOT-API-SECRET': ENGAGESPOT_API_SECRET,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            notification: {
                workflow: { identifier: workflowIdentifier },
                sendTo: {
                    recipients: [recipient],
                },
            },
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to send notification: ${errorData.message || response.statusText}`);
    }

    return await response.json();
}
