import { NextResponse } from "next/server"
import { readStore } from "@/lib/poc-store"

type InviteRecord = {
  token: string
  email: string
  tenantId: string
  tenantName: string
  role: "ADMIN" | "MEMBER"
  personalMessage?: string
  expiresAt: string
}

const defaultInvite: InviteRecord = {
  token: "demo-invite-token",
  email: "new.member@dar-global.com",
  tenantId: "dar-global",
  tenantName: "Dar Global",
  role: "MEMBER",
  personalMessage: "Welcome to the Dar Global IZZI workspace.",
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get("token") || ""
  if (!token) return NextResponse.json({ ok: false, error: "token is required" }, { status: 422 })

  const store = await readStore<InviteRecord[]>("auth-invites", [defaultInvite])
  const row = store.find((r) => r.token === token)
  if (!row) return NextResponse.json({ ok: false, error: "Invalid invite token" }, { status: 404 })

  if (new Date(row.expiresAt).getTime() < Date.now()) {
    return NextResponse.json({ ok: false, error: "Invite token expired" }, { status: 410 })
  }

  return NextResponse.json({
    ok: true,
    email: row.email,
    tenantId: row.tenantId,
    tenantName: row.tenantName,
    role: row.role,
    personalMessage: row.personalMessage || "",
  })
}

