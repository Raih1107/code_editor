"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import crypto from "crypto";

export const handleCashfree = action({
  args: {
    bodyText: v.string(),
    headers: v.record(v.string(), v.string()),
  },
  handler: async (ctx, { bodyText, headers }) => {
    // 🚨 TEMP: Disable signature check for setup
    console.warn("⚠ Skipping Cashfree signature verification for webhook setup");

    const event = JSON.parse(bodyText);
    console.log("Cashfree event:", event);

    // TODO: Add your DB update logic here if needed
    return { status: 200, message: "Webhook processed (setup mode)" };
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
