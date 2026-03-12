"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { BarChart3, Sparkles, TrendingUp, Users, MessageCircle, CheckCircle2 } from "lucide-react"
import { Header } from "@/components/admin/header"
import { PortalNav } from "@/components/admin/portal-nav"
import { QuotaBar } from "@/components/shared/quota-bar"
import { Card } from "@/components/ui/card"

type PipelineStage = { stage: string; count: number }

export default function TenantDashboardPage() {
  const searchParams = useSearchParams()
  const tenantId = searchParams.get("tenantId") || "dar-global"

  const [pipeline, setPipeline] = useState<PipelineStage[]>([])
  const [leadKpis, setLeadKpis] = useState<{
    totalLeads: number
    rtbLeads: number
    closedDeals: number
  }>({ totalLeads: 0, rtbLeads: 0, closedDeals: 0 })
  const [whatsappKpis, setWhatsappKpis] = useState<{
    whatsappResponseRate: number
    lostReengagementRate: number
  }>({ whatsappResponseRate: 0, lostReengagementRate: 0 })
  const [quota, setQuota] = useState<{ totalMinutes: number; usedMinutes: number; remainingMinutes: number }>({
    totalMinutes: 5000,
    usedMinutes: 3420,
    remainingMinutes: 1580,
  })

  useEffect(() => {
    async function load() {
      const [pipelineRes, kpiRes] = await Promise.all([
        fetch("/api/analytics/lead-pipeline?agent_id=noura").catch(() => null),
        fetch("/api/analytics/real-estate-kpis?agent_id=noura").catch(() => null),
      ])
      const quotaRes = await fetch(`/api/billing/balance?tenantId=${encodeURIComponent(tenantId)}`).catch(() => null)

      if (pipelineRes?.ok) {
        const json = (await pipelineRes.json().catch(() => null)) as { stages?: PipelineStage[] } | null
        if (json?.stages) setPipeline(json.stages)
      }

      if (kpiRes?.ok) {
        const json = (await kpiRes.json().catch(() => null)) as {
          lead_qualification_rate?: number
          whatsapp_response_rate?: number
          lost_reengagement_rate?: number
        } | null
        if (json) {
          setWhatsappKpis({
            whatsappResponseRate: json.whatsapp_response_rate ?? 0,
            lostReengagementRate: json.lost_reengagement_rate ?? 0,
          })
        }
      }
      if (quotaRes?.ok) {
        const json = (await quotaRes.json().catch(() => null)) as typeof quota | null
        if (json) setQuota(json)
      }
    }

    load()
  }, [tenantId])

  useEffect(() => {
    if (!pipeline.length) return
    const total = pipeline.reduce((sum, p) => sum + p.count, 0)
    const rtbStages = new Set(["RTB", "Negotiating", "Closed"])
    const rtb = pipeline
      .filter((p) => rtbStages.has(p.stage))
      .reduce((sum, p) => sum + p.count, 0)
    const closed = pipeline.find((p) => p.stage === "Closed")?.count ?? 0

    setLeadKpis({
      totalLeads: total,
      rtbLeads: rtb,
      closedDeals: closed,
    })
  }, [pipeline])

  const percent = (value: number, total?: number) => {
    if (typeof total === "number" && total > 0) {
      return `${Math.round((value / total) * 100)}%`
    }
    if (!total && value) {
      return `${Math.round(value * 100)}%`
    }
    return "0%"
  }

  const rtbCount = pipeline.find((p) => p.stage === "RTB")?.count ?? leadKpis.rtbLeads
  const negotiatingCount = pipeline.find((p) => p.stage === "Negotiating")?.count ?? 0
  const outOfScopeCount = pipeline.find((p) => p.stage === "Out of Scope")?.count ?? 0

  return (
    <div className="flex min-h-screen bg-background">
      <main className="flex-1 flex flex-col">
        <Header />
        <PortalNav area="tenant" />

        <div className="flex-1 p-8 space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">Dar Global Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Tenant: <span className="font-medium text-foreground">{tenantId}</span> · Real Estate workflow overview
              with unified lifecycle stages.
            </p>
          </div>

          {/* Top KPI row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-5 bg-card border-border">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Total Leads Generated
                </span>
                <Users className="h-4 w-4 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">{leadKpis.totalLeads}</p>
            </Card>

            <Card className="p-5 bg-card border-border">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  AI Conversations Completed
                </span>
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">
                {Math.max(leadKpis.totalLeads, leadKpis.rtbLeads)}
              </p>
            </Card>

            <Card className="p-5 bg-card border-border">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">RTB Leads</span>
                <CheckCircle2 className="h-4 w-4 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">{leadKpis.rtbLeads}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Lead Qualification Rate: {percent(leadKpis.rtbLeads, leadKpis.totalLeads)}
              </p>
            </Card>

            <Card className="p-5 bg-card border-border">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Deals Closed
                </span>
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">{leadKpis.closedDeals}</p>
            </Card>
          </div>

          <Card className="p-5 bg-card border-border">
            <QuotaBar
              totalMinutes={quota.totalMinutes}
              usedMinutes={quota.usedMinutes}
              onTopUp={() => {
                window.location.assign(`/tenant/billing?tenantId=${encodeURIComponent(tenantId)}`)
              }}
            />
          </Card>

          {/* Engagement KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-5 bg-card border-border">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  WhatsApp Follow-up Response Rate
                </span>
                <MessageCircle className="h-4 w-4 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">
                {percent(whatsappKpis.whatsappResponseRate)}
              </p>
            </Card>

            <Card className="p-5 bg-card border-border">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Lost Lead Re-engagement Rate</span>
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">
                {percent(whatsappKpis.lostReengagementRate)}
              </p>
            </Card>

            <Card className="p-5 bg-card border-border">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Negotiation Pipeline
                </span>
                <BarChart3 className="h-4 w-4 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">
                {pipeline.find((p) => p.stage === "Negotiating")?.count ?? 0}
              </p>
            </Card>
          </div>

          {/* Lifecycle Stage Focus */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Lifecycle Stage Focus</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-5 bg-card border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-foreground">RTB</span>
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <p className="text-2xl font-bold text-foreground">{rtbCount}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Leads that reached Ready-to-Buy and can be handed to sales.
                </p>
              </Card>

              <Card className="p-5 bg-card border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-foreground">Negotiating</span>
                  <MessageCircle className="h-4 w-4 text-primary" />
                </div>
                <p className="text-2xl font-bold text-foreground">{negotiatingCount}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Leads currently in active human negotiation pipeline.
                </p>
              </Card>

              <Card className="p-5 bg-card border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-foreground">Out of Scope</span>
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <p className="text-2xl font-bold text-foreground">{outOfScopeCount}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Sessions flagged by topic guard or non-sales intent.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

