import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const { origin } = new URL(req.url)
  const tenantId = new URL(req.url).searchParams.get("tenantId") || "dar-global"
  return NextResponse.json({
    tenantId,
    endpointUrl: `${origin}/api/webhooks/crm/stage-change`,
    webhookSecret: process.env.CRM_WEBHOOK_SECRET || "whsec_demo_change_me",
  })
}

