import { NextResponse } from "next/server"
import { readStore } from "@/lib/poc-store"
import type { WhatsappLogEntry } from "@/app/api/whatsapp/log/route"

type SessionRow = {
  id: string
  startedAt: string
  durationSec?: number
  durationSeconds?: number
  language?: "EN" | "AR"
  crmStage?: string
  leadStatus?: string
  readyToBuy?: boolean
  topicGuardTriggered?: boolean
  topicFlagged?: boolean
}

export async function GET() {
  const sessions = await readStore<SessionRow[]>("sessions", [])
  const wa = await readStore<WhatsappLogEntry[]>("whatsapp-log", [])
  const stageOf = (value?: string) => (value || "").trim().toUpperCase().replace(/\s+/g, "_")

  const totalCalls = sessions.length || 1
  const readyToBuyCount = sessions.filter((s) => s.readyToBuy).length
  const dropOffCount = sessions.filter(
    (s) =>
      stageOf(s.crmStage) === "OFF_TOPIC" ||
      stageOf(s.leadStatus) === "OFF_TOPIC" ||
      s.crmStage === "Drop-off" ||
      s.leadStatus === "Drop-off",
  ).length
  const topicGuardCount = sessions.filter((s) => s.topicGuardTriggered || s.topicFlagged).length
  const rtbCount = sessions.filter((s) => stageOf(s.crmStage) === "RTB" || stageOf(s.leadStatus) === "RTB" || s.readyToBuy).length
  const closedCount = sessions.filter((s) => stageOf(s.crmStage) === "CLOSED" || stageOf(s.leadStatus) === "CLOSED").length
  const avgSeconds =
    sessions.reduce((sum, row) => sum + (row.durationSeconds || row.durationSec || 0), 0) / totalCalls

  const waSent = wa.filter((w) => w.messageType === "post_call" || w.messageType === "reengagement").length
  const waReengagement = wa.filter((w) => w.messageType === "reengagement").length

  const fmtSeconds = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${`${s}`.padStart(2, "0")}`
  }

  return NextResponse.json({
    headline: {
      totalCalls: sessions.length,
      readyToBuyRate: Math.round((readyToBuyCount / totalCalls) * 100),
      reengagementRate: Math.round((waReengagement / (waSent || 1)) * 100),
      qualifiedToClosedRate: Math.round((closedCount / (rtbCount || 1)) * 100),
    },
    sections: {
      conversation: [
        { label: "Avg Session Duration", value: fmtSeconds(avgSeconds) },
        { label: "Drop-off Rate", value: `${Math.round((dropOffCount / totalCalls) * 100)}%` },
        { label: "Topic Guard Flag Rate", value: `${Math.round((topicGuardCount / totalCalls) * 100)}%` },
        { label: "Avg Calls per Avatar", value: "12" },
      ],
      leadQuality: [
        { label: "Ready-to-Buy Leads", value: `${readyToBuyCount}` },
        { label: "RTB Lead Rate", value: `${Math.round((rtbCount / totalCalls) * 100)}%` },
        { label: "Avg Qualification Score", value: "7.6 / 10" },
        { label: "CRM Push Success Rate", value: "100%" },
      ],
      reengagement: [
        { label: "WhatsApp Sent (30 min)", value: `${waSent}` },
        { label: "WhatsApp Click Rate", value: "41%" },
        { label: "Day 7 Response Rate", value: "19%" },
        { label: "Lost Lead Recovery Rate", value: "28%" },
      ],
      postsale: [
        { label: "RTB-to-Closed Rate", value: `${Math.round((closedCount / (rtbCount || 1)) * 100)}%` },
        { label: "Avg Deal Cycle Time", value: "13 days" },
        { label: "Payment Reminders Sent", value: "34" },
        { label: "Construction Updates Sent", value: "12" },
      ],
    },
  })
}

