"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

type InviteData = {
  email: string
  tenantName: string
  role: "ADMIN" | "MEMBER"
  personalMessage?: string
}

export default function InviteAcceptPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = useMemo(() => searchParams.get("token") || "", [searchParams])

  const [loading, setLoading] = useState(true)
  const [invalid, setInvalid] = useState(false)
  const [invite, setInvite] = useState<InviteData | null>(null)
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true
    async function load() {
      if (!token) {
        setInvalid(true)
        setLoading(false)
        return
      }
      const res = await fetch(`/api/auth/invite/validate?token=${encodeURIComponent(token)}`).catch(() => null)
      if (!active) return
      if (!res?.ok) {
        setInvalid(true)
      } else {
        const json = (await res.json().catch(() => null)) as InviteData | null
        setInvite(json)
      }
      setLoading(false)
    }
    load()
    return () => {
      active = false
    }
  }, [token])

  const accept = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)
    const res = await fetch("/api/auth/invite/accept", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, name, password }),
    }).catch(() => null)
    setSubmitting(false)
    if (!res?.ok) {
      setError("Unable to accept invitation. Please try again.")
      return
    }
    document.cookie = `izzi_demo_role=tenant; path=/; max-age=${60 * 60 * 24}`
    document.cookie = `izzi_demo_tenant=dar-global; path=/; max-age=${60 * 60 * 24}`
    document.cookie = `izzi_demo_tenant_role=member; path=/; max-age=${60 * 60 * 24}`
    router.push("/tenant/dashboard?tenantId=dar-global")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-lg p-6 space-y-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">Validating invitation...</p>
        ) : invalid || !invite ? (
          <>
            <h1 className="text-2xl font-semibold text-foreground">Invite Invalid</h1>
            <p className="text-sm text-red-600">
              This invite link has expired or is invalid. Contact your administrator.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold text-foreground">
              You are invited to join {invite.tenantName}
            </h1>
            <p className="text-sm text-muted-foreground">
              Role: {invite.role === "ADMIN" ? "Tenant Admin" : "Tenant Member"}
            </p>
            <p className="text-sm text-muted-foreground">Email: {invite.email}</p>
            {invite.personalMessage && (
              <blockquote className="rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
                {invite.personalMessage}
              </blockquote>
            )}
            <form className="space-y-3" onSubmit={accept}>
              <Input
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="Set password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Joining..." : "Accept Invitation & Join"}
              </Button>
            </form>
          </>
        )}
      </Card>
    </div>
  )
}

