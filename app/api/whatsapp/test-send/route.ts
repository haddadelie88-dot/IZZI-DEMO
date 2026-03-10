import { NextResponse } from "next/server"
import { readStore } from "@/lib/poc-store"
import type { WhatsappAutomationConfig } from "@/app/api/whatsapp/config/route"
import { writeStore } from "@/lib/poc-store"
import type { WhatsappLogEntry } from "@/app/api/whatsapp/log/route"

type Payload = {
  agentId: string
  toNumber: string
  message: string
  sessionId?: string
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Payload | null
  const agentId = body?.agentId || ""
  const toNumber = body?.toNumber || ""
  const message = body?.message || ""
  if (!agentId) return NextResponse.json({ ok: false, error: "agentId is required" }, { status: 400 })
  if (!toNumber) return NextResponse.json({ ok: false, error: "toNumber is required" }, { status: 400 })
  if (!message) return NextResponse.json({ ok: false, error: "message is required" }, { status: 400 })

  const cfgStore = await readStore<Record<string, WhatsappAutomationConfig>>("whatsapp-config", {})
  const cfg = cfgStore[agentId]
  if (!cfg) {
    return NextResponse.json({ ok: false, error: "WhatsApp config not found for this agent" }, { status: 400 })
  }

  // POC: do not call external providers, just log it.
  const logStore = await readStore<WhatsappLogEntry[]>("whatsapp-log", [])
  const entry: WhatsappLogEntry = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    sessionId: body?.sessionId || `test-${agentId}`,
    messageType: "test",
    sentAt: new Date().toISOString(),
    status: "Sent",
    leadPhone: toNumber,
    messagePreview: message.slice(0, 240),
  }
  logStore.push(entry)
  await writeStore("whatsapp-log", logStore)

  return NextResponse.json({
    ok: true,
    message: "Test message queued (POC stub).",
    provider: cfg.whatsappProvider,
    from: cfg.whatsappFromNumber,
    to: toNumber,
    logId: entry.id,
  })
}

