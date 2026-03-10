import { NextResponse } from "next/server"
import { readStore, writeStore } from "@/lib/poc-store"

export type PostSaleEvent = {
  id: string
  agentId: string
  leadId: string
  eventType: "thank_you" | "payment_reminder" | "construction_update"
  scheduledAt: string
  sentAt?: string
  status: "Pending" | "Sent" | "Failed"
  payload: Record<string, any>
}

type StoreShape = PostSaleEvent[]
const STORE_NAME = "postsale-events"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const leadId = searchParams.get("leadId") || ""
  const agentId = searchParams.get("agentId") || ""
  const store = await readStore<StoreShape>(STORE_NAME, [])
  const rows = store.filter((e) => (leadId ? e.leadId === leadId : true) && (agentId ? e.agentId === agentId : true))
  return NextResponse.json(rows.sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt)))
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Partial<PostSaleEvent> | null
  const agentId = body?.agentId || ""
  const leadId = body?.leadId || ""
  const eventType = body?.eventType as PostSaleEvent["eventType"] | undefined
  if (!agentId) return NextResponse.json({ ok: false, error: "agentId is required" }, { status: 400 })
  if (!leadId) return NextResponse.json({ ok: false, error: "leadId is required" }, { status: 400 })
  if (!eventType) return NextResponse.json({ ok: false, error: "eventType is required" }, { status: 400 })

  const store = await readStore<StoreShape>(STORE_NAME, [])
  const event: PostSaleEvent = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    agentId,
    leadId,
    eventType,
    scheduledAt: body?.scheduledAt || new Date().toISOString(),
    sentAt: body?.sentAt,
    status: body?.status || "Pending",
    payload: body?.payload || {},
  }

  // POC shortcut: mark as sent immediately if not explicitly pending
  if (event.status === "Pending") {
    event.status = "Sent"
    event.sentAt = new Date().toISOString()
  }

  store.push(event)
  await writeStore(STORE_NAME, store)
  return NextResponse.json({ ok: true, event })
}

