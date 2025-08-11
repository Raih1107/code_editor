// convex/webhooks.ts
"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { createHmac } from "node:crypto";
import { api } from "./_generated/api";

export const handlePabbly = action({
  args: {
    body: v.any(),
  },
  handler: async (ctx, { body }) => {
    console.log("📦 Pabbly event received");

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
      const webhookSecret = process.env.CASHFREE_WEBHOOK_SECRET;
      if (!webhookSecret) {
        throw new Error("CASHFREE_WEBHOOK_SECRET is not set in environment");
      }

      // Normalize header keys to lowercase
      const normalizedHeaders = Object.fromEntries(
        Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v])
      );

      const signature = normalizedHeaders["x-webhook-signature"];
      if (!signature) {
        return { status: 400, message: "Missing signature" };
      }

      // ✅ Verify HMAC-SHA256 in base64
      const computedSignature = createHmac("sha256", webhookSecret)
        .update(bodyText)
        .digest("base64");

      if (signature !== computedSignature) {
        console.error("❌ Invalid Cashfree signature");
        return { status: 400, message: "Invalid signature" };
      }

      // Now safe to parse
      const event = JSON.parse(bodyText);
      console.log("✅ Verified Cashfree event type:", event.type);

      if (event.type?.toUpperCase() === "PAYMENT_SUCCESS_WEBHOOK") {
        const email = event.data?.customer_details?.customer_email;
        const orderId = event.data?.order_id;
        const customerId = event.data?.customer_details?.customer_id;
        const amount = parseFloat(event.data?.order_amount);

        if (email && orderId && customerId && !isNaN(amount)) {
          await ctx.runMutation(api.users.upgradeToPro, {
            email,
            cashfreeCustomerId: customerId,
            cashfreeOrderId: orderId,
            amount,
          });
        }
      }

      return { status: 200, message: "Cashfree webhook processed" };
    } catch (err) {
      console.error("Error in Cashfree webhook:", err);
      return { status: 500, message: "Server error" };
    }
  },
});


