import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const bodyText = JSON.stringify(req.body);
  const headers = req.headers;

  try {
    // Call your Convex action via fetch or Convex client SDK
    // Here, let's call Convex HTTP API or internal function (example below)

    // Example: forwarding to your Convex HTTP route if you have one deployed
    const convexWebhookUrl = process.env.CONVEX_WEBHOOK_URL || "https://your-convex-endpoint/api/cashfree-webhook";

    const convexResponse = await fetch(convexWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ bodyText, headers }),
    });

    if (!convexResponse.ok) {
      const errorText = await convexResponse.text();
      console.error("Convex webhook error:", errorText);
      return res.status(500).json({ message: "Error forwarding webhook to Convex" });
    }

    const result = await convexResponse.json();

    return res.status(result.status || 200).json({ message: result.message || "Webhook handled" });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
