import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  console.log("Received webhook payload:", body);

  return NextResponse.json({ message: "Webhook received" });
}
