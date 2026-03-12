import { NextResponse } from "next/server"
import { readStore } from "@/lib/poc-store"

type SessionRow = {
  id: string
  startedAt?: string
  leadName?: string
  leadEmail?: string
  age?: number
  product?: string
  leadPhone?: string
  crmStage?: string
}

export async function GET() {
  const sessions = await readStore<SessionRow[]>("sessions", [])
  const normalizeStage = (value?: string) => {
    const raw = (value || "").trim().toUpperCase().replace(/\s+/g, "_")
    if (raw === "NEW") return "OPEN"
    if (raw === "OUT_OF_SCOPE") return "OFF_TOPIC"
    return raw || ""
  }
  const header = ["sessionId", "startedAt", "leadName", "leadEmail", "age", "product", "leadPhone", "crmStage"]
  const rows = sessions.map((s) =>
    [s.id, s.startedAt || "", s.leadName || "", s.leadEmail || "", s.age ?? "", s.product || "", s.leadPhone || "", normalizeStage(s.crmStage)]
      .map((cell) => `"${`${cell}`.replace(/"/g, '""')}"`)
      .join(","),
  )
  const csv = [header.join(","), ...rows].join("\n")

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="izzi-analytics-export.csv"`,
    },
  })
}

