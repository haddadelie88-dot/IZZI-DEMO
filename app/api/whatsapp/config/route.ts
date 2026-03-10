import { NextResponse } from "next/server"
import { readStore, writeStore } from "@/lib/poc-store"

export type WhatsappProvider = "twilio" | "360dialog"

export type WhatsappAutomationConfig = {
  id: string
  agentId: string
  followUpEnabled: boolean
  followUpDelayMinutes: number
  followUpMessageTemplate: string
  lostReengagementEnabled: boolean
  lostReengagementDelayDays: number
  lostReengagementMessageTemplate: string
  whatsappProvider: WhatsappProvider
  whatsappApiKey: string
  whatsappFromNumber: string
  updatedAt: string
}

type StoreShape = Record<string, WhatsappAutomationConfig>
const STORE_NAME = "whatsapp-config"

function defaultConfig(agentId: string): WhatsappAutomationConfig {
  return {
    id: agentId,
    agentId,
    followUpEnabled: true,
    followUpDelayMinutes: 30,
    followUpMessageTemplate:
      "Hi {{lead_name}}, thanks for your time today. Based on your interest in {{property_type}} around {{location}} with a budget of {{budget}}, here’s a link to continue: {{izzi_link}}",
    lostReengagementEnabled: true,
    lostReengagementDelayDays: 7,
    lostReengagementMessageTemplate:
      "Hi {{lead_name}}, just checking in. We have new listings: {{new_listings}}. Want me to share options? {{izzi_link}}",
    whatsappProvider: "twilio",
    whatsappApiKey: "",
    whatsappFromNumber: "",
    updatedAt: new Date().toISOString(),
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const agentId = searchParams.get("agentId") || ""
  if (!agentId) return NextResponse.json({ error: "agentId is required" }, { status: 400 })
  const store = await readStore<StoreShape>(STORE_NAME, {})
  return NextResponse.json(store[agentId] || defaultConfig(agentId))
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Partial<WhatsappAutomationConfig> | null
  const agentId = body?.agentId || ""
  if (!agentId) return NextResponse.json({ error: "agentId is required" }, { status: 400 })

  const store = await readStore<StoreShape>(STORE_NAME, {})
  const prev = store[agentId] || defaultConfig(agentId)
  const nextValue: WhatsappAutomationConfig = {
    ...prev,
    ...body,
    id: agentId,
    agentId,
    updatedAt: new Date().toISOString(),
  }
  store[agentId] = nextValue
  await writeStore(STORE_NAME, store)
  return NextResponse.json(nextValue)
}

export async function PATCH(req: Request) {
  return POST(req)
}

