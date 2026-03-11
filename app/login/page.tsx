"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"

const SUPER_ADMIN_EMAIL = "superadmin@izzi.ai"
const TENANT_ADMIN_EMAIL = "tenantadmin@dar-global.com"
const DEMO_PASSWORD = "demo123"
const DEFAULT_TENANT_ID = "dar-global"

export default function LoginPage() {
  const [role, setRole] = useState<"super" | "tenant">("tenant")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const expectedEmail = role === "super" ? SUPER_ADMIN_EMAIL : TENANT_ADMIN_EMAIL
    if (email.trim().toLowerCase() === expectedEmail.toLowerCase() && password === DEMO_PASSWORD) {
      document.cookie = `izzi_demo_role=${role}; path=/; max-age=${60 * 60 * 24}`
      if (role === "tenant") {
        document.cookie = `izzi_demo_tenant=${DEFAULT_TENANT_ID}; path=/; max-age=${60 * 60 * 24}`
      }
      window.location.assign(
        role === "super"
          ? "/super-admin/tenants"
          : `/tenant/dashboard?tenantId=${encodeURIComponent(DEFAULT_TENANT_ID)}`,
      )
      return
    }

    const result = await signIn("credentials", { email, password, redirect: false })
    if (result?.ok) {
      document.cookie = `izzi_demo_role=${role}; path=/; max-age=${60 * 60 * 24}`
      if (role === "tenant") {
        document.cookie = `izzi_demo_tenant=${DEFAULT_TENANT_ID}; path=/; max-age=${60 * 60 * 24}`
      }
      window.location.assign(
        role === "super"
          ? "/super-admin/tenants"
          : `/tenant/dashboard?tenantId=${encodeURIComponent(DEFAULT_TENANT_ID)}`,
      )
      return
    }

    if ((result?.error || "").toLowerCase().includes("suspended")) {
      setError("Account suspended. Contact your administrator.")
    } else {
      setError("Invalid credentials. Please try again.")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted px-4">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3 text-primary" />
            <span>Dar Global POC · IZZI Admin Portal</span>
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Sign in to manage your <span className="text-primary">AI real estate journeys</span>
            </h1>
            <p className="mt-3 text-sm md:text-base text-muted-foreground leading-relaxed">
              Use the demo credentials to explore both the <span className="font-medium">Super Admin</span> and{" "}
              <span className="font-medium">Tenant Admin</span> experiences.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 text-xs md:text-sm text-muted-foreground">
            <Card className="p-3 bg-card/60 border-border">
              <p className="font-semibold text-foreground mb-1">Super Admin (Platform Owner)</p>
              <p>
                Email: <span className="font-mono text-xs">{SUPER_ADMIN_EMAIL}</span>
              </p>
              <p>
                Password: <span className="font-mono text-xs">{DEMO_PASSWORD}</span>
              </p>
            </Card>
            <Card className="p-3 bg-card/60 border-border">
              <p className="font-semibold text-foreground mb-1">Tenant Admin (Dar Global)</p>
              <p>
                Email: <span className="font-mono text-xs">{TENANT_ADMIN_EMAIL}</span>
              </p>
              <p>
                Password: <span className="font-mono text-xs">{DEMO_PASSWORD}</span>
              </p>
            </Card>
          </div>
        </div>

        <Card className="p-8 bg-card/80 border border-border shadow-lg shadow-black/5">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-foreground">Welcome back</h2>
              <p className="text-xs text-muted-foreground">Choose a role and sign in.</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Sign in as</label>
              <Select value={role} onValueChange={(v) => setRole(v as "super" | "tenant")}>
                <SelectTrigger className="bg-background border-border h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super">Super Admin (Platform)</SelectItem>
                  <SelectItem value="tenant">Tenant Admin (Dar Global)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Email</label>
                <Input
                  type="email"
                  placeholder={role === "super" ? SUPER_ADMIN_EMAIL : TENANT_ADMIN_EMAIL}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 bg-background border-border"
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Password</label>
                <Input
                  type="password"
                  placeholder={DEMO_PASSWORD}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 bg-background border-border"
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error && <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded px-2 py-1">{error}</p>}

            <Button type="submit" className="w-full h-10 bg-foreground text-background hover:bg-foreground/90" disabled={loading}>
              {loading ? "Signing in..." : "Sign in to dashboard"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}

