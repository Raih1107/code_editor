import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/nextjs/server";
import { api } from "./_generated/api";
import crypto from "crypto";

const http = httpRouter();

/**
 * Cashfree Webhook
 */
http.route({
  path: "/cashfree-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const signature = request.headers.get("x-webhook-signature");
    const clientSecret = process.env.CASHFREE_CLIENT_SECRET;

    if (!signature || !clientSecret) {
      return new Response("Missing signature or secret", { status: 400 });
    }

    const bodyText = await request.text();

    // Verify Cashfree signature (HMAC-SHA256 → base64)
    const expectedSignature = crypto
      .createHmac("sha256", clientSecret)
      .update(bodyText)
      .digest("base64");

    if (signature !== expectedSignature) {
      return new Response("Invalid signature", { status: 400 });
    }

    const eventData = JSON.parse(bodyText);

    // Handle successful payments
    if (eventData.type === "PAYMENT_SUCCESS") {
      const { orderId, orderAmount, customerEmail, customerId } = eventData.data;

      await ctx.runMutation(api.users.upgradeToPro, {
        email: customerEmail,
        cashfreeCustomerId: customerId || null,
        cashfreeOrderId: orderId,
        amount: orderAmount,
      });
    }

    return new Response("Webhook processed successfully", { status: 200 });
  }),
});

/**
 * Clerk Webhook
 */
http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error("Missing CLERK_WEBHOOK_SECRET environment variable");
    }

    const svix_id = request.headers.get("svix-id");
    const svix_signature = request.headers.get("svix-signature");
    const svix_timestamp = request.headers.get("svix-timestamp");

    if (!svix_id || !svix_signature || !svix_timestamp) {
      return new Response("Error occurred -- no svix headers", { status: 400 });
    }

    const payload = await request.json();
    const body = JSON.stringify(payload);

    const wh = new Webhook(webhookSecret);
    let evt: WebhookEvent;

    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error("Error verifying webhook:", err);
      return new Response("Error occurred", { status: 400 });
    }

    const eventType = evt.type;

    if (eventType === "user.created") {
      const { id, email_addresses, first_name, last_name } = evt.data;
      const email = email_addresses[0].email_address;
      const name = `${first_name || ""} ${last_name || ""}`.trim();

      try {
        await ctx.runMutation(api.users.syncUser, {
          userId: id,
          email,
          name,
        });
      } catch (error) {
        console.error("Error creating user:", error);
        return new Response("Error creating user", { status: 500 });
      }
    }

    return new Response("Webhook processed successfully", { status: 200 });
  }),
});

export default http;
