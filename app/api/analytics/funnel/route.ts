import { NextResponse } from "next/server"
import { readStore } from "@/lib/poc-store"
import type { WhatsappLogEntry } from "@/app/api/whatsapp/log/route"

type SessionRow = {
  id: string
  readyToBuy?: boolean
  crmStage?: string
  leadStatus?: string
}

export async function GET() {
  const sessions = await readStore<SessionRow[]>("sessions", [])
  const wa = await readStore<WhatsappLogEntry[]>("whatsapp-log", [])

  const visitors = Math.max(120, sessions.length * 2)
  const conversations = sessions.length
  const followupSent = wa.filter((w) => w.messageType === "post_call").length
  const reengaged = wa.filter((w) => w.messageType === "reengagement").length
  const rtb = sessions.filter((s) => s.readyToBuy || s.crmStage === "RTB" || s.leadStatus === "RTB").length
  const closed = sessions.filter((s) => s.crmStage === "Closed" || s.leadStatus === "Closed").length
  const postSale = Math.max(0, closed - 1)

  const raw = [
    { label: "Website Visitors", count: visitors },
    { label: "AI Conversations", count: conversations },
    { label: "WhatsApp Follow-up Sent", count: followupSent },
    { label: "Re-engagement Link Clicked", count: reengaged },
    { label: "RTB Leads", count: rtb },
    { label: "Deals Closed", count: closed },
    { label: "Post-Sale Journey Active", count: postSale },
  ]

  return NextResponse.json({
    stages: raw.map((stage, index) => {
      if (index === 0) return { ...stage, conversionFromPrevious: 100 }
      const prev = raw[index - 1].count || 1
      return { ...stage, conversionFromPrevious: Math.round((stage.count / prev) * 100) }
    }),
  })
}

