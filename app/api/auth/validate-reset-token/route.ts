import { NextResponse } from "next/server"
import { readStore } from "@/lib/poc-store"

type ResetToken = {
  email: string
  token: string
  expiresAt: string
  createdAt: string
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get("token") || ""
  if (!token) return NextResponse.json({ ok: false, error: "token is required" }, { status: 422 })

  const store = await readStore<ResetToken[]>("auth-password-resets", [])
  const row = store.find((r) => r.token === token)
  if (!row) return NextResponse.json({ ok: false, error: "Invalid token" }, { status: 404 })

  if (new Date(row.expiresAt).getTime() < Date.now()) {
    return NextResponse.json({ ok: false, error: "Token expired" }, { status: 410 })
  }

  return NextResponse.json({ ok: true, email: row.email })
}

