"use client"

import { Header } from "@/components/admin/header"
import { PortalNav } from "@/components/admin/portal-nav"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

export default function TenantSettingsPage() {
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

          <Card className="p-6 bg-card border-border space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Workspace Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Tenant Name</label>
                <Input defaultValue="Dar Global" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Default Language</label>
                <Input defaultValue="English + Arabic" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <span className="text-sm text-foreground">Email me when balance drops below 60 minutes</span>
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
        </div>
      </main>
    </div>
  )
}

