import { NextResponse } from "next/server"
import { readStore } from "@/lib/poc-store"

const STAGES = ["New", "Contacted", "RTB", "Negotiating", "Closed", "Lost", "Out of Scope"] as const
type Stage = (typeof STAGES)[number]

type StoreShape = Record<string, { leadId: string; stage: Stage; updatedAt: string }>

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const agentId = searchParams.get("agent_id") || searchParams.get("agentId") || ""
  if (!agentId) return NextResponse.json({ error: "agent_id is required" }, { status: 400 })

  const store = await readStore<StoreShape>("crm-lead-stage", {})
  const counts = STAGES.reduce((acc, s) => {
    acc[s] = 0
    return acc
  }, {} as Record<Stage, number>)

  for (const v of Object.values(store)) {
    if (STAGES.includes(v.stage)) counts[v.stage] += 1
  }

  return NextResponse.json({
    agentId,
    stages: STAGES.map((s) => ({ stage: s, count: counts[s] })),
  })
}

