import { NextResponse } from "next/server"

export async function POST() {
  // POC stub: real Stripe Checkout session creation comes next.
  return NextResponse.json({
    ok: true,
    checkoutSessionId: `mock_cs_${Date.now()}`,
    clientSecret: `mock_secret_${Date.now()}`,
  })
}

