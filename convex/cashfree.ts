"use node";
import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { createHmac } from "crypto";

const webhookSecret = process.env.CASHFREE_WEBHOOK_SECRET!;

function verifySignature(payload: string, signature: string): boolean {
  const hmac = createHmac("sha256", webhookSecret);
  const computedSignature = hmac.update(payload).digest("base64");
  return signature === computedSignature;
}

export const verifyWebhook = internalAction({
  args: {
    payload: v.string(), // raw request body as string
    signature: v.string(), // from x-webhook-signature header
  },
  handler: async (ctx, args) => {
    const isValid = verifySignature(args.payload, args.signature);

    if (!isValid) {
      throw new Error("Invalid signature");
    }

    // Only parse JSON AFTER verifying
    return JSON.parse(args.payload);
  },
});
