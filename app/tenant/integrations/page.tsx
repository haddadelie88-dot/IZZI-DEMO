"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/admin/header"
import { PortalNav } from "@/components/admin/portal-nav"
import { AccessDenied } from "@/components/shared/access-denied"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type IntegrationStatus = {
  salesforce: "Connected" | "Disconnected" | "Error"
  whatsapp: "Connected" | "Disconnected" | "Error"
  webhooks: "Healthy" | "Warning" | "Critical"
}

export default function IntegrationsPage() {
  const isMemberOnly = typeof document !== "undefined" && document.cookie.includes("izzi_demo_tenant_role=member")
  const [status, setStatus] = useState<IntegrationStatus>({
    salesforce: "Connected",
    whatsapp: "Connected",
    webhooks: "Healthy",
  })

  useEffect(() => {
    let active = true
    async function load() {
      const [sRes, wRes] = await Promise.all([
        fetch("/api/integrations/salesforce/status").catch(() => null),
        fetch("/api/integrations/whatsapp/status").catch(() => null),
      ])
      if (!active) return
      const next = { ...status }
      if (sRes?.ok) {
        const sJson = (await sRes.json().catch(() => null)) as any
        next.salesforce = sJson?.status || next.salesforce
      }
      if (wRes?.ok) {
        const wJson = (await wRes.json().catch(() => null)) as any
        next.whatsapp = wJson?.status || next.whatsapp
      }
      setStatus(next)
    }
    load()
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const statusBadge = (label: string) => {
    const cls =
      label === "Connected" || label === "Healthy"
        ? "bg-green-100 text-green-700 hover:bg-green-100"
        : label === "Warning"
          ? "bg-amber-100 text-amber-700 hover:bg-amber-100"
          : "bg-red-100 text-red-700 hover:bg-red-100"
    return <Badge className={cls}>{label}</Badge>
  }

  return (
    <div className="flex min-h-screen bg-background">
      <main className="flex-1 flex flex-col">
        <Header />
        <PortalNav area="tenant" />

        <div className="flex-1 p-8 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Integrations</h1>
            <p className="text-sm text-muted-foreground">
              Manage Salesforce, WhatsApp, Post-Sale automations, and webhook health.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 border-border flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Salesforce</span>
              {statusBadge(status.salesforce)}
            </Card>
            <Card className="p-4 border-border flex items-center justify-between">
              <span className="text-sm text-muted-foreground">WhatsApp Business</span>
              {statusBadge(status.whatsapp)}
            </Card>
            <Card className="p-4 border-border flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Webhook Health</span>
              {statusBadge(status.webhooks)}
            </Card>
          </div>

          {isMemberOnly ? (
            <AccessDenied
              title="Integrations access is admin-only"
              message="Contact your Tenant Admin to configure Salesforce, WhatsApp, and webhook automation."
            />
          ) : (
          <Tabs defaultValue="salesforce">
            <TabsList>
              <TabsTrigger value="salesforce">Salesforce CRM</TabsTrigger>
              <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
              <TabsTrigger value="postsale">Post-Sale</TabsTrigger>
              <TabsTrigger value="webhooks">Webhook Monitor</TabsTrigger>
            </TabsList>

            <TabsContent value="salesforce">
              <Card className="p-6 border-border mt-4 space-y-4">
                <h2 className="text-lg font-semibold">Salesforce Connection</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="sf-instance-url">Instance URL</Label>
                    <Input
                      id="sf-instance-url"
                      placeholder="Instance URL"
                      defaultValue="https://darglobal.my.salesforce.com"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="sf-client-id">Client ID</Label>
                    <Input id="sf-client-id" placeholder="Client ID" defaultValue="sf-client-id" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="sf-client-secret">Client Secret</Label>
                    <Input id="sf-client-secret" placeholder="Client Secret" defaultValue="********" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="sf-security-token">Security Token</Label>
                    <Input id="sf-security-token" placeholder="Security Token" defaultValue="********" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={async () => {
                      await fetch("/api/integrations/salesforce/test", { method: "POST" }).catch(() => null)
                    }}
                  >
                    Test Connection
                  </Button>
                  <Button>Save Credentials</Button>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="whatsapp">
              <Card className="p-6 border-border mt-4 space-y-4">
                <h2 className="text-lg font-semibold">WhatsApp Templates</h2>
                <p className="text-sm text-muted-foreground">
                  10 required templates with approval status and resubmit flow.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    ["follow_up_30min", "Approved"],
                    ["day7_reengagement", "Pending"],
                    ["deal_closed_thankyou", "Rejected"],
                    ["payment_reminder", "Approved"],
                  ].map(([name, st]) => (
                    <div key={name} className="rounded-lg border border-border p-3 flex items-center justify-between">
                      <span className="text-sm">{name}</span>
                      {statusBadge(st)}
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="postsale">
              <Card className="p-6 border-border mt-4 space-y-4">
                <h2 className="text-lg font-semibold">Post-Sale Automation</h2>
                <p className="text-sm text-muted-foreground">
                  Configure payment schedules and construction milestone broadcasts.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline">Upload Payment Schedule CSV</Button>
                  <Button>Send Milestone Broadcast</Button>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="webhooks">
              <Card className="p-6 border-border mt-4 space-y-4">
                <h2 className="text-lg font-semibold">Webhook Health Monitor</h2>
                <p className="text-sm text-muted-foreground">
                  Unified inbound/outbound events, latency, and failure alerts.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline">Export Logs CSV</Button>
                  <Button variant="destructive">Clear Old Logs</Button>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
          )}
        </div>
      </main>
    </div>
  )
}

