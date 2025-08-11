export async function POST(req) {
  try {
    const body = await req.json(); 
    console.log("📩 Received Pabbly Webhook:", body);

    // TODO: Update your Convex DB here with payment info
    // Example: await convex.mutation("payments:addPayment", body);

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    return new Response(JSON.stringify({ error: "Something went wrong" }), { status: 500 });
  }
}
