import { NextResponse } from "next/server"
import { readStore, writeStore } from "@/lib/poc-store"

type AgentConfig = {
  avatarId: string
  industry?: string
  leadQualification?: {
    budgetMin?: string
    budgetMax?: string
    locationPreference?: string
    propertyType?: "Villa" | "Apartment" | "Commercial" | "Penthouse"
    purchaseTimeline?: "0–3 months" | "3–6 months" | "6–12 months" | "12+ months"
    financingType?: "Cash" | "Mortgage" | "Undecided"
  }
  preCall?: {
    categoryEnabled?: boolean
    categories?: string[]
  }
}

type StoreShape = Record<string, AgentConfig>

const STORE_NAME = "agent-config"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const avatarId = searchParams.get("avatarId") || ""
  if (!avatarId) {
    return NextResponse.json({ error: "avatarId is required" }, { status: 400 })
  }

  const store = await readStore<StoreShape>(STORE_NAME, {})
  return NextResponse.json(store[avatarId] || { avatarId })
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Partial<AgentConfig> | null
  const avatarId = body?.avatarId || ""

  if (!avatarId) {
    return NextResponse.json({ error: "avatarId is required" }, { status: 400 })
  }

  const store = await readStore<StoreShape>(STORE_NAME, {})
  const nextValue: AgentConfig = {
    avatarId,
    industry: body?.industry,
    leadQualification: body?.leadQualification || {},
    preCall: body?.preCall || {},
  }
  store[avatarId] = nextValue
  await writeStore(STORE_NAME, store)

  return NextResponse.json(nextValue)
}

