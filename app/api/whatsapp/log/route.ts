import { NextResponse } from "next/server"
import { readStore, writeStore } from "@/lib/poc-store"

export type WhatsappLogEntry = {
  id: string
  sessionId: string
  messageType: "post_call" | "reengagement" | "test"
  sentAt: string
  status: "Sent" | "Delivered" | "Failed"
  leadPhone?: string
  messagePreview: string
}

type StoreShape = WhatsappLogEntry[]
const STORE_NAME = "whatsapp-log"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get("sessionId") || ""
  const store = await readStore<StoreShape>(STORE_NAME, [])
  const rows = sessionId ? store.filter((e) => e.sessionId === sessionId) : store
  return NextResponse.json(rows.sort((a, b) => b.sentAt.localeCompare(a.sentAt)))
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Partial<WhatsappLogEntry> | null
  if (!body?.sessionId) return NextResponse.json({ error: "sessionId is required" }, { status: 400 })
  if (!body?.messagePreview) return NextResponse.json({ error: "messagePreview is required" }, { status: 400 })

  const store = await readStore<StoreShape>(STORE_NAME, [])
  const entry: WhatsappLogEntry = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    sessionId: body.sessionId,
    messageType: body.messageType || "post_call",
    sentAt: new Date().toISOString(),
    status: body.status || "Sent",
    leadPhone: body.leadPhone,
    messagePreview: body.messagePreview,
  }
  store.push(entry)
  await writeStore(STORE_NAME, store)
  return NextResponse.json(entry)
}

