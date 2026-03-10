import { NextResponse } from "next/server"
import { readStore, writeStore } from "@/lib/poc-store"

export type CrmType = "odoo" | "salesforce"

export type CrmConfig = {
  clientId: string
  crmType: CrmType
  odoo?: {
    instanceUrl?: string
    apiKey?: string
  }
  salesforce?: {
    instanceUrl?: string
    clientId?: string
    clientSecret?: string
    username?: string
    password?: string
    securityToken?: string
    leadObject?: string
  }
  updatedAt: string
}

type StoreShape = Record<string, CrmConfig>
const STORE_NAME = "crm-config"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const clientId = searchParams.get("clientId") || ""
  if (!clientId) {
    return NextResponse.json({ error: "clientId is required" }, { status: 400 })
  }

  const store = await readStore<StoreShape>(STORE_NAME, {})
  return NextResponse.json(store[clientId] || null)
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Partial<CrmConfig> | null
  const clientId = body?.clientId || ""
  const crmType = body?.crmType as CrmType | undefined

  if (!clientId) return NextResponse.json({ error: "clientId is required" }, { status: 400 })
  if (crmType !== "odoo" && crmType !== "salesforce") {
    return NextResponse.json({ error: "crmType must be odoo|salesforce" }, { status: 400 })
  }

  const store = await readStore<StoreShape>(STORE_NAME, {})
  const nextValue: CrmConfig = {
    clientId,
    crmType,
    odoo: body?.odoo,
    salesforce: body?.salesforce,
    updatedAt: new Date().toISOString(),
  }
  store[clientId] = nextValue
  await writeStore(STORE_NAME, store)
  return NextResponse.json(nextValue)
}

