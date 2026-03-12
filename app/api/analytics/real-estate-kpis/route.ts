import { NextResponse } from "next/server"
import { readStore } from "@/lib/poc-store"

type LeadStage = "New" | "Contacted" | "RTB" | "Negotiating" | "Closed" | "Lost" | "Out of Scope"
type LeadStageStore = Record<string, { leadId: string; stage: LeadStage; updatedAt: string }>

type WhatsappLogEntry = {
  sessionId: string
  messageType: "post_call" | "reengagement" | "test"
  sentAt: string
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const agentId = searchParams.get("agent_id") || searchParams.get("agentId") || ""
  if (!agentId) {
    // POC: metrics are global; still require agentId so UI can scope.
    return NextResponse.json({ error: "agent_id is required" }, { status: 400 })
  }

  const stageStore = await readStore<LeadStageStore>("crm-lead-stage", {})
  const leads = Object.values(stageStore)
  const totalLeads = leads.length
  const rtbLeads = leads.filter((l) => ["RTB", "Negotiating", "Closed"].includes(l.stage)).length
  const leadQualificationRate = totalLeads ? rtbLeads / totalLeads : 0

  const whatsappLogs = await readStore<WhatsappLogEntry[]>("whatsapp-log", [])
  const totalWhatsappSent = whatsappLogs.filter((l) => l.messageType !== "test").length

  // POC: treat re-engagement messages as “response/click”.
  const whatsappResponse = whatsappLogs.filter((l) => l.messageType === "reengagement").length
  const whatsappResponseRate = totalWhatsappSent ? whatsappResponse / totalWhatsappSent : 0

  const lostLeads = leads.filter((l) => l.stage === "Lost").map((l) => l.leadId)
  const lostReengaged = new Set(
    whatsappLogs.filter((l) => l.messageType === "reengagement" && lostLeads.includes(l.sessionId)).map((l) => l.sessionId),
  )
  const lostReengagementRate = lostLeads.length ? lostReengaged.size / lostLeads.length : 0

  return NextResponse.json({
    agentId,
    lead_qualification_rate: leadQualificationRate,
    whatsapp_response_rate: whatsappResponseRate,
    lost_reengagement_rate: lostReengagementRate,
  })
}

