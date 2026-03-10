import { NextResponse } from "next/server"
import { readStore, writeStore } from "@/lib/poc-store"
import type { WhatsappLogEntry } from "@/app/api/whatsapp/log/route"

type Payload = {
  sessionId: string
  messageType: "post_call" | "reengagement"
  messagePreview: string
  leadPhone?: string
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Payload | null
  if (!body?.sessionId) return NextResponse.json({ ok: false, error: "sessionId is required" }, { status: 400 })
  if (!body?.messagePreview) {
    return NextResponse.json({ ok: false, error: "messagePreview is required" }, { status: 400 })
  }

  const store = await readStore<WhatsappLogEntry[]>("whatsapp-log", [])
  const entry: WhatsappLogEntry = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    sessionId: body.sessionId,
    messageType: body.messageType || "post_call",
    sentAt: new Date().toISOString(),
    status: "Sent",
    leadPhone: body.leadPhone,
    messagePreview: body.messagePreview.slice(0, 240),
  }
  store.push(entry)
  await writeStore("whatsapp-log", store)

  return NextResponse.json({ ok: true, logId: entry.id })
}

