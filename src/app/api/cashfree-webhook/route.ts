import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log("Cashfree webhook received:", body);

    // TODO: Verify signature, forward to Convex, etc.

    return NextResponse.json({ message: "Webhook received" }, { status: 200 });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }
}

// Optionally support other methods to avoid 405

export async function GET() {
  return NextResponse.json({ message: "Method GET not allowed" }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ message: "Method PUT not allowed" }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ message: "Method DELETE not allowed" }, { status: 405 });
}
