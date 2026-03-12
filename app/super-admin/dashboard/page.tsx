"use client"

import { useMemo, useState } from "react"
import { Header } from "@/components/admin/header"
import { PortalNav } from "@/components/admin/portal-nav"
import { StatsCard } from "@/components/admin/stats-card"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, CircleDollarSign, Clock3, Sparkles } from "lucide-react"

type TenantDashboardMetrics = {
  id: string
  name: string
  status: "ACTIVE" | "TRIAL" | "SUSPENDED"
  activeAvatars: number
  minutesSold: number
  revenue: number
  leads: number
  remainingMinutes: number
  funnel: {
    OPEN: number
    CONTACTED: number
    RTB: number
    NEGOTIATING: number
    CLOSED: number
    LOST: number
    OFF_TOPIC: number
  }
}

const tenantMetrics: TenantDashboardMetrics[] = [
  {
    id: "dar-global",
    name: "Dar Global",
    status: "ACTIVE",
    activeAvatars: 4,
    minutesSold: 8500,
    revenue: 6400,
    leads: 112,
    remainingMinutes: 1260,
    funnel: { OPEN: 21, CONTACTED: 18, RTB: 24, NEGOTIATING: 17, CLOSED: 14, LOST: 11, OFF_TOPIC: 7 },
  },
  {
    id: "blue-oak",
    name: "Blue Oak Properties",
    status: "ACTIVE",
    activeAvatars: 2,
    minutesSold: 4300,
    revenue: 3250,
    leads: 58,
    remainingMinutes: 540,
    funnel: { OPEN: 12, CONTACTED: 10, RTB: 11, NEGOTIATING: 8, CLOSED: 7, LOST: 6, OFF_TOPIC: 4 },
  },
  {
    id: "summit-retail",
    name: "Summit Retail Group",
    status: "TRIAL",
    activeAvatars: 1,
    minutesSold: 2100,
    revenue: 1800,
    leads: 31,
    remainingMinutes: 110,
    funnel: { OPEN: 8, CONTACTED: 6, RTB: 5, NEGOTIATING: 4, CLOSED: 3, LOST: 3, OFF_TOPIC: 2 },
  },
  {
    id: "aurora-health",
    name: "Aurora Health",
    status: "ACTIVE",
    activeAvatars: 1,
    minutesSold: 1600,
    revenue: 1000,
    leads: 26,
    remainingMinutes: 42,
    funnel: { OPEN: 5, CONTACTED: 4, RTB: 4, NEGOTIATING: 3, CLOSED: 3, LOST: 5, OFF_TOPIC: 2 },
  },
]

export default function SuperAdminDashboardPage() {
  const [selectedTenantId, setSelectedTenantId] = useState("all")

  const scopedTenants = useMemo(
    () => (selectedTenantId === "all" ? tenantMetrics : tenantMetrics.filter((t) => t.id === selectedTenantId)),
    [selectedTenantId],
  )

  const aggregated = useMemo(() => {
    const scopeName = selectedTenantId === "all" ? "All clients" : scopedTenants[0]?.name || "Selected client"
    const totals = scopedTenants.reduce(
      (acc, t) => {
        acc.tenants += 1
        acc.activeAvatars += t.activeAvatars
        acc.minutesSold += t.minutesSold
        acc.revenue += t.revenue
        acc.leads += t.leads
        acc.funnel.OPEN += t.funnel.OPEN
        acc.funnel.CONTACTED += t.funnel.CONTACTED
        acc.funnel.RTB += t.funnel.RTB
        acc.funnel.NEGOTIATING += t.funnel.NEGOTIATING
        acc.funnel.CLOSED += t.funnel.CLOSED
        acc.funnel.LOST += t.funnel.LOST
        acc.funnel.OFF_TOPIC += t.funnel.OFF_TOPIC
        return acc
      },
      {
        tenants: 0,
        activeAvatars: 0,
        minutesSold: 0,
        revenue: 0,
        leads: 0,
        funnel: { OPEN: 0, CONTACTED: 0, RTB: 0, NEGOTIATING: 0, CLOSED: 0, LOST: 0, OFF_TOPIC: 0 },
      },
    )
    return {
      ...totals,
      scopeName,
      rtbLeads: totals.funnel.RTB + totals.funnel.NEGOTIATING + totals.funnel.CLOSED,
      lowBalance: scopedTenants.filter((t) => t.remainingMinutes <= 120),
    }
  }, [scopedTenants, selectedTenantId])

  return (
    <div className="flex min-h-screen bg-background">
      <main className="flex-1 flex flex-col">
        <Header />
        <PortalNav area="super" />

        <div className="flex-1 p-8 space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Platform Dashboard</h1>
              <p className="text-muted-foreground">Cross-tenant summary for usage, revenue, and health signals.</p>
            </div>
            <div className="min-w-[220px]">
              <p className="text-xs text-muted-foreground mb-1">Client Scope</p>
              <Select value={selectedTenantId} onValueChange={setSelectedTenantId}>
                <SelectTrigger className="w-full bg-card border-border">
                  <SelectValue placeholder="All Clients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clients</SelectItem>
                  {tenantMetrics.map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <StatsCard
              title="Total Tenants"
              value={aggregated.tenants}
              description={`${aggregated.scopeName} scope`}
              icon={Building2}
            />
            <StatsCard
              title="Total Minutes Sold"
              value={aggregated.minutesSold}
              description={`${aggregated.scopeName} minutes sold`}
              icon={Clock3}
            />
            <StatsCard
              title="Total Revenue"
              value={`$${aggregated.revenue.toLocaleString()}`}
              description={`${aggregated.scopeName} revenue`}
              icon={CircleDollarSign}
            />
            <StatsCard
              title="Active Avatars"
              value={aggregated.activeAvatars}
              description={`${aggregated.scopeName} active avatars`}
              icon={Sparkles}
            />
          </div>

          <Card className="p-6 border-border">
            <h2 className="text-lg font-semibold text-foreground mb-2">Lifecycle Funnel Summary</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Unified lifecycle: OPEN {"->"} CONTACTED {"->"} RTB {"->"} NEGOTIATING {"->"} CLOSED, with LOST and OFF TOPIC outcomes.
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="outline">OPEN: {aggregated.funnel.OPEN}</Badge>
              <Badge variant="outline">CONTACTED: {aggregated.funnel.CONTACTED}</Badge>
              <Badge variant="outline">RTB: {aggregated.funnel.RTB}</Badge>
              <Badge variant="outline">NEGOTIATING: {aggregated.funnel.NEGOTIATING}</Badge>
              <Badge variant="outline">CLOSED: {aggregated.funnel.CLOSED}</Badge>
              <Badge variant="outline">LOST: {aggregated.funnel.LOST}</Badge>
              <Badge variant="outline">OFF TOPIC: {aggregated.funnel.OFF_TOPIC}</Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              Leads: <span className="font-medium text-foreground">{aggregated.leads}</span> · RTB Pipeline (RTB/NEGOTIATING/CLOSED):{" "}
              <span className="font-medium text-foreground">{aggregated.rtbLeads}</span>
            </div>
          </Card>

          <Card className="p-6 border-border">
            <h2 className="text-lg font-semibold text-foreground mb-2">Low Balance Tenants</h2>
            <p className="text-sm text-muted-foreground mb-4">Filtered by selected client scope.</p>
            <div className="space-y-2">
              {aggregated.lowBalance.length === 0 ? (
                <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2">
                  <span className="text-sm text-green-700">No low-balance clients in this scope.</span>
                </div>
              ) : null}
              {aggregated.lowBalance.map((tenant) => (
                <div
                  key={tenant.id}
                  className={`px-3 py-2 flex items-center justify-between rounded-lg border ${
                    tenant.remainingMinutes <= 60 ? "border-red-200 bg-red-50" : "border-orange-200 bg-orange-50"
                  }`}
                >
                  <span className="text-sm font-medium text-foreground">{tenant.name}</span>
                  <span className={`text-sm ${tenant.remainingMinutes <= 60 ? "text-red-700" : "text-orange-700"}`}>
                    {tenant.remainingMinutes} min remaining
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}

