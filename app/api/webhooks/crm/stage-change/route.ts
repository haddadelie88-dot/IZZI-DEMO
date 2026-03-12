import { NextResponse } from "next/server"
import { readStore, writeStore } from "@/lib/poc-store"

type StageChangeBody = {
  secret?: string
  leadId?: string
  newStage?: "NEGOTIATING" | "CLOSED"
  metadata?: Record<string, unknown>
}

type LeadStageStore = Record<string, { leadId: string; stage: string; updatedAt: string }>

type WebhookLog = {
  id: string
  direction: "IN" | "OUT"
  system: "WHATSAPP" | "SALESFORCE" | "STRIPE"
  eventType: string
  status: "RECEIVED" | "PROCESSED" | "FAILED" | "IGNORED"
  payload: unknown
  createdAt: string
}

type WhatsappLogEntry = {
  id: string
  sessionId: string
  messageType: "post_call" | "reengagement" | "test"
  sentAt: string
  status: "Sent" | "Delivered" | "Failed"
  messagePreview: string
}

const STAGE_MAP: Record<"NEGOTIATING" | "CLOSED", "Negotiating" | "Closed"> = {
  NEGOTIATING: "Negotiating",
  CLOSED: "Closed",
}

export async function POST(req: Request) {
  const startedAt = Date.now()
  const body = (await req.json().catch(() => null)) as StageChangeBody | null
  const logs = await readStore<WebhookLog[]>("webhook-events", [])

  const incoming: WebhookLog = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    direction: "IN",
    system: "SALESFORCE",
    eventType: "crm_stage_change",
    status: "RECEIVED",
    payload: body || {},
    createdAt: new Date().toISOString(),
  }

  const expectedSecret = process.env.CRM_WEBHOOK_SECRET || "whsec_demo_change_me"
  if (!body?.secret || body.secret !== expectedSecret) {
    incoming.status = "FAILED"
    logs.unshift(incoming)
    await writeStore("webhook-events", logs.slice(0, 500))
    return NextResponse.json({ error: "Invalid webhook secret" }, { status: 401 })
  }

  if (!body?.leadId || !body?.newStage || !(body.newStage in STAGE_MAP)) {
    incoming.status = "FAILED"
    logs.unshift(incoming)
    await writeStore("webhook-events", logs.slice(0, 500))
    return NextResponse.json({ error: "leadId and newStage (NEGOTIATING|CLOSED) are required" }, { status: 422 })
  }

  const stageStore = await readStore<LeadStageStore>("crm-lead-stage", {})
  stageStore[body.leadId] = {
    leadId: body.leadId,
    stage: STAGE_MAP[body.newStage],
    updatedAt: new Date().toISOString(),
  }
  await writeStore("crm-lead-stage", stageStore)

  if (body.newStage === "CLOSED") {
    const waLogs = await readStore<WhatsappLogEntry[]>("whatsapp-log", [])
    waLogs.unshift({
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      sessionId: body.leadId,
      messageType: "reengagement",
      sentAt: new Date().toISOString(),
      status: "Sent",
      messagePreview: "Thank you for your purchase. Your post-sale journey with IZZI is now active.",
    })
    await writeStore("whatsapp-log", waLogs.slice(0, 1000))
  }

  incoming.status = "PROCESSED"
  logs.unshift(incoming)
  logs.unshift({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    direction: "OUT",
    system: "SALESFORCE",
    eventType: `crm_stage_set_${body.newStage.toLowerCase()}`,
    status: "PROCESSED",
    payload: {
      leadId: body.leadId,
      newStage: body.newStage,
      metadata: body.metadata || {},
      processingMs: Date.now() - startedAt,
    },
    createdAt: new Date().toISOString(),
  })
  await writeStore("webhook-events", logs.slice(0, 500))

  return NextResponse.json({
    success: true,
    leadId: body.leadId,
    newStage: body.newStage,
  })
}

