// convex/webhooks.ts
"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

export const handlePabbly = action({
  args: {
    body: v.any(),
  },
  handler: async (ctx, { body }) => {
    console.log("📦 Pabbly event:", body);

    // Adjust field names based on Pabbly's payload mapping
    const email = body.email;
    const orderId = body.order_id;
    const customerId = body.customer_id;
    const amount = parseFloat(body.amount);

    if (email && orderId && customerId && !isNaN(amount)) {
      await ctx.runMutation(api.users.upgradeToPro, {
        email,
        cashfreeCustomerId: customerId,
        cashfreeOrderId: orderId,
        amount,
      });
    }

    return { status: 200, message: "Pabbly webhook processed" };
  },
});

export const handleCashfree = action({
  args: {
    bodyText: v.string(),
    headers: v.record(v.string(), v.string()),
  },
  handler: async (ctx, { bodyText, headers }) => {
    try {
      const signature = headers["x-webhook-signature"];
      if (!signature) {
        return { status: 400, message: "Missing signature" };
      }

      // ✅ Verify HMAC-SHA256 in base64 (Cashfree docs)
      const computedSignature = crypto
        .createHmac("sha256", process.env.CASHFREE_WEBHOOK_SECRET as string)
        .update(bodyText)
        .digest("base64");

      if (signature !== computedSignature) {
        console.error("❌ Invalid Cashfree signature");
        return { status: 400, message: "Invalid signature" };
      }

      // Now safe to parse
      const event = JSON.parse(bodyText);
      console.log("✅ Verified Cashfree event:", event);

      if (event.type === "PAYMENT_SUCCESS_WEBHOOK") {
        const email = event.data?.customer_details?.customer_email;
        const orderId = event.data?.order_id;
        const customerId = event.data?.customer_details?.customer_id;
        const amount = parseFloat(event.data?.order_amount);

        if (email && orderId && customerId && !isNaN(amount)) {
          // Update Convex DB
          await ctx.runMutation(api.users.upgradeToPro, {
            email,
            cashfreeCustomerId: customerId,
            cashfreeOrderId: orderId,
            amount,
          });
        }
      }

      return { status: 200, message: "Webhook processed successfully" };
    } catch (err) {
      console.error("Error in Cashfree webhook:", err);
      return { status: 500, message: "Server error" };
    }
  },
});
