"use client"

import { useState } from "react"
import { Header } from "@/components/admin/header"
import { PortalNav } from "@/components/admin/portal-nav"
import { AccessDenied } from "@/components/shared/access-denied"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

export default function TenantSettingsPage() {
  const isMemberOnly = typeof document !== "undefined" && document.cookie.includes("izzi_demo_tenant_role=member")
  const [extraEmail, setExtraEmail] = useState("")
  const [recipients, setRecipients] = useState<string[]>(["tenantadmin@dar-global.com"])
  return (
    <div className="flex min-h-screen bg-background">
      <main className="flex-1 flex flex-col">
        <Header />
        <PortalNav area="tenant" />

        <div className="flex-1 p-8 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Tenant Settings</h1>
            <p className="text-muted-foreground">
              Workspace profile and notification preferences for Dar Global.
            </p>
          </div>

          {isMemberOnly ? (
            <AccessDenied
              title="Settings access is admin-only"
              message="Contact your Tenant Admin for workspace and notification settings."
            />
          ) : (
          <>
          <Card className="p-6 bg-card border-border space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Workspace Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Tenant Name</label>
                <Input defaultValue="Dar Global" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Domain</label>
                <Input defaultValue="darglobal.com" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Admin Email</label>
                <Input defaultValue="tenantadmin@dar-global.com" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Phone Number</label>
                <Input defaultValue="+971-50-111-2222" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm text-muted-foreground">IZZI Sender Email</label>
                <Input defaultValue="noreply@darglobal.com" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
            <div className="rounded-lg border border-border p-3 space-y-3">
              <p className="text-sm text-foreground">
                Alert Recipients (default admin email included)
              </p>
              <div className="flex flex-wrap gap-2">
                {recipients.map((email) => (
                  <span key={email} className="rounded-full bg-muted px-3 py-1 text-xs text-foreground">
                    {email}
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add additional recipient email"
                  value={extraEmail}
                  onChange={(e) => setExtraEmail(e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const email = extraEmail.trim().toLowerCase()
                    if (!email || recipients.includes(email)) return
                    setRecipients((prev) => [...prev, email])
                    setExtraEmail("")
                  }}
                >
                  Add
                </Button>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <span className="text-sm text-foreground">Email me when balance drops below 60 minutes</span>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <span className="text-sm text-foreground">Email me when quota is 70% depleted</span>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <span className="text-sm text-foreground">Email me when quota is 100% depleted</span>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <span className="text-sm text-foreground">Email me when a new member joins</span>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <span className="text-sm text-foreground">Email me when a purchase is completed</span>
                <Switch defaultChecked />
              </div>
            </div>
            <Button className="bg-foreground text-background hover:bg-foreground/90">Save Settings</Button>
          </Card>
          </>
          )}
        </div>
      </main>
    </div>
  )
}

