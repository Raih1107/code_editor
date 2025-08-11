"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import crypto from "crypto";

export const handleCashfree = action({
  args: {
    bodyText: v.string(), // ✅ Correct Convex validator
    headers: v.record(v.string(), v.string()), // ✅ key:string, value:string
  },
  handler: async (ctx, { bodyText, headers }) => {
    const signature = headers["x-webhook-signature"];

    const computedSignature = crypto
      .createHmac("sha256", process.env.CASHFREE_WEBHOOK_SECRET as string)
      .update(bodyText)
      .digest("hex");

    if (signature !== computedSignature) {
      return { status: 400, message: "Invalid signature" };
    }

    const event = JSON.parse(bodyText);
    console.log("Cashfree event:", event);

    return { status: 200, message: "Webhook processed" };
  },
});

export const handleClerk = action({
  args: {
    bodyText: v.string(),
    headers: v.record(v.string(), v.string()),
  },
  handler: async (ctx, { bodyText, headers }) => {
    const svixId = headers["svix-id"];
    const svixTimestamp = headers["svix-timestamp"];
    const svixSignature = headers["svix-signature"];

    // You can verify Clerk webhook here
    const event = JSON.parse(bodyText);
    console.log("Clerk event:", event);

    return { status: 200, message: "Webhook processed" };
  },
});
