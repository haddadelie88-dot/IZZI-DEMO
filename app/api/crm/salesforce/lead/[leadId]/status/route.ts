import { NextResponse } from "next/server"
import { readStore, writeStore } from "@/lib/poc-store"

const STAGES = ["New", "Contacted", "RTB", "Negotiating", "Closed", "Lost", "Out of Scope"] as const
type Stage = (typeof STAGES)[number]

type StoreShape = Record<string, { leadId: string; stage: Stage; updatedAt: string }>
const STORE_NAME = "crm-lead-stage"

export async function GET(_req: Request, ctx: { params: Promise<{ leadId: string }> }) {
  const { leadId } = await ctx.params
  const store = await readStore<StoreShape>(STORE_NAME, {})
  return NextResponse.json(store[leadId] || { leadId, stage: "New", updatedAt: new Date().toISOString() })
}

export async function PATCH(req: Request, ctx: { params: Promise<{ leadId: string }> }) {
  const { leadId } = await ctx.params
  const body = (await req.json().catch(() => null)) as { stage?: Stage } | null
  const stage = body?.stage
  if (!stage || !STAGES.includes(stage)) {
    return NextResponse.json({ error: `stage must be one of: ${STAGES.join(", ")}` }, { status: 400 })
  }

  const store = await readStore<StoreShape>(STORE_NAME, {})
  store[leadId] = { leadId, stage, updatedAt: new Date().toISOString() }
  await writeStore(STORE_NAME, store)
  return NextResponse.json(store[leadId])
}

