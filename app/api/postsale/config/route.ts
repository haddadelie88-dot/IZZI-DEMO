import { NextResponse } from "next/server"
import { readStore, writeStore } from "@/lib/poc-store"

export type PostSaleConfig = {
  id: string
  agentId: string
  thankYouEnabled: boolean
  thankYouMessageTemplate: string
  paymentRemindersEnabled: boolean
  paymentReminderDaysBefore: number[]
  paymentReminderTemplate: string
  constructionUpdatesEnabled: boolean
  constructionUpdateTemplate: string
  updatedAt: string
}

type StoreShape = Record<string, PostSaleConfig>
const STORE_NAME = "postsale-config"

function defaultConfig(agentId: string): PostSaleConfig {
  return {
    id: agentId,
    agentId,
    thankYouEnabled: true,
    thankYouMessageTemplate:
      "Hi {{lead_name}}, thank you for choosing us for your {{property_type}}. We’re excited to welcome you to {{property_name}}.",
    paymentRemindersEnabled: true,
    paymentReminderDaysBefore: [7, 3, 1],
    paymentReminderTemplate:
      "Hi {{lead_name}}, reminder: {{amount}} is due on {{due_date}}. {{payment_instructions}}",
    constructionUpdatesEnabled: true,
    constructionUpdateTemplate:
      "Hi {{lead_name}}, construction update for {{project_name}}: {{milestone}} ({{completion_percentage}}% complete).",
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
  const body = (await req.json().catch(() => null)) as Partial<PostSaleConfig> | null
  const agentId = body?.agentId || ""
  if (!agentId) return NextResponse.json({ error: "agentId is required" }, { status: 400 })

  const store = await readStore<StoreShape>(STORE_NAME, {})
  const prev = store[agentId] || defaultConfig(agentId)
  const nextValue: PostSaleConfig = {
    ...prev,
    ...body,
    id: agentId,
    agentId,
    paymentReminderDaysBefore:
      Array.isArray(body?.paymentReminderDaysBefore) ? body!.paymentReminderDaysBefore : prev.paymentReminderDaysBefore,
    updatedAt: new Date().toISOString(),
  }
  store[agentId] = nextValue
  await writeStore(STORE_NAME, store)
  return NextResponse.json(nextValue)
}

export async function PATCH(req: Request) {
  return POST(req)
}

