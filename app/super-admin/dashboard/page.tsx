"use client"

import { Header } from "@/components/admin/header"
import { PortalNav } from "@/components/admin/portal-nav"
import { StatsCard } from "@/components/admin/stats-card"
import { Card } from "@/components/ui/card"
import { Building2, CircleDollarSign, Clock3, Sparkles } from "lucide-react"

export default function SuperAdminDashboardPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <main className="flex-1 flex flex-col">
        <Header />
        <PortalNav area="super" />

        <div className="flex-1 p-8 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Platform Dashboard</h1>
            <p className="text-muted-foreground">Cross-tenant summary for usage, revenue, and health signals.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <StatsCard title="Total Tenants" value={4} description="2 active · 1 trial · 1 suspended" icon={Building2} />
            <StatsCard title="Total Minutes Sold" value={16500} description="Across completed purchases" icon={Clock3} />
            <StatsCard title="Total Revenue" value={"$12,450"} description="POC aggregate mock" icon={CircleDollarSign} />
            <StatsCard title="Active Avatars" value={7} description="Across all tenants" icon={Sparkles} />
          </div>

          <Card className="p-6 border-border">
            <h2 className="text-lg font-semibold text-foreground mb-2">Low Balance Tenants</h2>
            <div className="space-y-2">
              <div className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Sample Agency</span>
                <span className="text-sm text-orange-700">42 min remaining</span>
              </div>
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Alpha Homes</span>
                <span className="text-sm text-red-700">0 min remaining</span>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}

