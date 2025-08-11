import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/pabbly-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    const result = await ctx.runAction(api.webhooks.handlePabbly, { body });
    return new Response(result.message, { status: result.status });
  }),
});



http.route({
  path: "/cashfree-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const bodyText = await request.text();

    const headers: Record<string, string> = {};
    for (const [key, value] of request.headers as any) {
      headers[key] = value;
    }

    const result = await ctx.runAction(api.webhooks.handleCashfree, {
      bodyText,
      headers,
    });

    return new Response(result.message, { status: result.status });
  }),
});

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const bodyText = await request.text();

    const headers: Record<string, string> = {};
    for (const [key, value] of request.headers as any) {
      headers[key] = value;
    }

    const result = await ctx.runAction(api.webhooks.handleClerk, {
      bodyText,
      headers,
    });

    return new Response(result.message, { status: result.status });
  }),
});

export default http;
