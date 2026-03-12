import { NextResponse } from "next/server"
import { readStore } from "@/lib/poc-store"

type TransactionRow = {
  id: string
  tenantId: string
  type: "PURCHASE" | "USAGE" | "ADMIN_GRANT" | "ADJUSTMENT"
  mediaType?: "audio" | "video"
  minutes: number
  runningBalance: number
  note?: string
  createdAt: string
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const tenantId = searchParams.get("tenantId") || "dar-global"
  const store = await readStore<TransactionRow[]>("quota-transactions", [])
  return NextResponse.json(store.filter((row) => row.tenantId === tenantId))
}

