import { NextResponse } from "next/server"
import { readStore } from "@/lib/poc-store"
import type { CrmConfig } from "@/app/api/crm/config/route"

type Payload = {
  clientId: string
  instanceUrl?: string
  clientIdValue?: string
  clientSecret?: string
  username?: string
  password?: string
  securityToken?: string
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Payload | null
  const clientId = body?.clientId || ""

  if (!clientId) {
    return NextResponse.json({ ok: false, error: "clientId is required" }, { status: 400 })
  }

  // POC behavior: validate presence + minimal URL shape
  const instanceUrl =
    body?.instanceUrl ||
    (await (async () => {
      const store = await readStore<Record<string, CrmConfig>>("crm-config", {})
      return store[clientId]?.salesforce?.instanceUrl
    })())

  const missing: string[] = []
  if (!instanceUrl) missing.push("instanceUrl")
  if (!body?.clientIdValue) missing.push("clientId")
  if (!body?.clientSecret) missing.push("clientSecret")
  if (!body?.username) missing.push("username")
  if (!body?.password) missing.push("password")
  if (!body?.securityToken) missing.push("securityToken")

  if (missing.length) {
    return NextResponse.json(
      { ok: false, error: `Missing required fields: ${missing.join(", ")}` },
      { status: 400 },
    )
  }

  const looksLikeUrl = /^https:\/\/.+/i.test(instanceUrl)
  if (!looksLikeUrl) {
    return NextResponse.json({ ok: false, error: "Instance URL must start with https://" }, { status: 400 })
  }

  // Stubbed success response
  return NextResponse.json({
    ok: true,
    message: "Connection successful (POC stub).",
    details: {
      instanceUrl,
      authFlow: "username-password",
    },
  })
}

