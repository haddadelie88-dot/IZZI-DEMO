"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { BarChart3, ArrowLeft, TrendingUp, Clock, Users, Sparkles } from "lucide-react"
import { AvatarSidebar, TenantAvatar } from "@/components/admin/avatar-sidebar"
import { Header } from "@/components/admin/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

// Mock data for avatars
const mockAvatars: TenantAvatar[] = [
  {
    id: "1",
    name: "sarah",
    imageUrl: "/avatars/sarah.png",
    industry: "Corporate",
    isPrimary: true,
    callCount: 0,
  },
  {
    id: "2",
    name: "Noura",
    imageUrl: "/avatars/noura.jpeg",
    industry: "Real Estate",
    callCount: 0,
  },
]

interface AnalyticsStat {
  label: string
  value: string
  change?: string
  icon: React.ReactNode
}

type RealEstateKpis = {
  lead_qualification_rate: number
  whatsapp_response_rate: number
  lost_reengagement_rate: number
}

type PipelineResponse = {
  stages: { stage: string; count: number }[]
}

type MockAnalytics = {
  totalCalls: number
  avgDuration: string
  uniqueCallers: number
  conversionRate: string
  reKpis?: RealEstateKpis
  pipeline?: { stage: string; count: number }[]
}

const mockAnalyticsByAvatar: Record<string, MockAnalytics> = {
  // Corporate example
  "1": {
    totalCalls: 18,
    avgDuration: "3:05",
    uniqueCallers: 14,
    conversionRate: "22%",
  },
  // Noura – Real Estate persona aligned with Dar Global workflow
  "2": {
    totalCalls: 32,
    avgDuration: "4:10",
    uniqueCallers: 24,
    conversionRate: "31%",
    reKpis: {
      // RTB and later over total
      lead_qualification_rate: 0.56,
      // Re-engagement responses over total WhatsApp sends
      whatsapp_response_rate: 0.48,
      // Day 7 revival conversions over Lost leads
      lost_reengagement_rate: 0.32,
    },
    pipeline: [
      { stage: "New", count: 10 },
      { stage: "Contacted", count: 7 },
      { stage: "RTB", count: 6 },
      { stage: "Negotiating", count: 4 },
      { stage: "Closed", count: 3 },
      { stage: "Lost", count: 2 },
    ],
  },
}

export default function AnalyticsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams<{ clientId: string }>()
  const clientId = (params?.clientId as string) || "client"
  const avatarId = searchParams.get("avatarId") || "1"
  
  const [avatars] = useState<TenantAvatar[]>(mockAvatars)
  const [selectedAvatar, setSelectedAvatar] = useState<TenantAvatar>(
    mockAvatars.find(a => a.id === avatarId) || mockAvatars[0]
  )

  const isRealEstate = useMemo(() => selectedAvatar.industry === "Real Estate", [selectedAvatar.industry])
  const [reKpis, setReKpis] = useState<RealEstateKpis | null>(null)
  const [pipeline, setPipeline] = useState<PipelineResponse | null>(null)

  const stats: AnalyticsStat[] = [
    {
      label: "Total Sessions",
      value: (mockAnalyticsByAvatar[selectedAvatar.id]?.totalCalls ?? 0).toString(),
      change: "+0%",
      icon: <Sparkles className="h-5 w-5" />,
    },
    {
      label: "Avg Session Length",
      value: mockAnalyticsByAvatar[selectedAvatar.id]?.avgDuration ?? "0:00",
      change: "+0%",
      icon: <Clock className="h-5 w-5" />,
    },
    {
      label: "Unique Visitors",
      value: (mockAnalyticsByAvatar[selectedAvatar.id]?.uniqueCallers ?? 0).toString(),
      change: "+0%",
      icon: <Users className="h-5 w-5" />,
    },
    {
      label: "Session → Lead Conversion",
      value: mockAnalyticsByAvatar[selectedAvatar.id]?.conversionRate ?? "0%",
      change: "+0%",
      icon: <TrendingUp className="h-5 w-5" />,
    },
  ]

  const handleSelectAvatar = (avatar: TenantAvatar) => {
    setSelectedAvatar(avatar)
  }

  const handleAddAvatar = () => {
    router.push("/configure?mode=add")
  }

  const handleDeleteAvatar = (avatar: TenantAvatar) => {
    console.log("Delete avatar:", avatar)
  }

  const handleViewCallHistory = (avatar: TenantAvatar) => {
    router.push(`/configure/${encodeURIComponent(clientId)}/call-history?avatarId=${avatar.id}`)
  }

  const handleViewAnalytics = (avatar: TenantAvatar) => {
    setSelectedAvatar(avatar)
  }

  useEffect(() => {
    if (!isRealEstate) {
      setReKpis(null)
      setPipeline(null)
      return
    }
    let cancelled = false

    async function load() {
      const [kRes, pRes] = await Promise.all([
        fetch(`/api/analytics/real-estate-kpis?agent_id=${encodeURIComponent(selectedAvatar.id)}`).catch(() => null),
        fetch(`/api/analytics/lead-pipeline?agent_id=${encodeURIComponent(selectedAvatar.id)}`).catch(() => null),
      ])

      if (cancelled) return

      if (kRes?.ok) {
        const json = (await kRes.json().catch(() => null)) as RealEstateKpis | null
        if (json) setReKpis(json)
      }
      if (pRes?.ok) {
        const json = (await pRes.json().catch(() => null)) as PipelineResponse | null
        if (json) setPipeline(json)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [isRealEstate, selectedAvatar.id])

  const percent = (v: number | undefined | null) =>
    typeof v === "number" ? `${Math.round(v * 100)}%` : "—"

  return (
    <div className="flex min-h-screen bg-background">
      <AvatarSidebar
        avatars={avatars}
        selectedAvatarId={selectedAvatar.id}
        onSelectAvatar={handleSelectAvatar}
        onAddAvatar={handleAddAvatar}
        onDeleteAvatar={handleDeleteAvatar}
        onViewCallHistory={handleViewCallHistory}
        onViewAnalytics={handleViewAnalytics}
      />
      
      <main className="flex-1 flex flex-col">
        <Header />
        
        <div className="flex-1 p-8">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Conversation Analytics - {selectedAvatar.name}
            </h1>
            <p className="text-muted-foreground">
              View AI session metrics and insights for this avatar (sessions started from the website CTA).
            </p>
          </div>

          {/* Back Button */}
          <Button
            variant="outline"
            onClick={() => router.push("/configure")}
            className="mb-6 border-foreground text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Configure
          </Button>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="p-6 bg-card border-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    {stat.icon}
                  </div>
                  <span className="text-sm text-green-600">{stat.change}</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </Card>
            ))}
          </div>

          {/* Real Estate KPI cards */}
          {isRealEstate && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Real Estate KPIs</h2>
                <p className="text-sm text-muted-foreground">
                  Additional metrics for the Real Estate persona, aligned to lifecycle stages and re-engagement.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(() => {
                  const mock = mockAnalyticsByAvatar[selectedAvatar.id]?.reKpis
                  const effective = reKpis || mock || {
                    lead_qualification_rate: 0,
                    whatsapp_response_rate: 0,
                    lost_reengagement_rate: 0,
                  }
                  return (
                    <>
                      <Card className="p-6 bg-card border-border">
                        <p className="text-sm text-muted-foreground">Lead Qualification Rate</p>
                        <p className="text-3xl font-bold text-foreground mt-2">
                          {percent(effective.lead_qualification_rate)}
                        </p>
                      </Card>
                      <Card className="p-6 bg-card border-border">
                        <p className="text-sm text-muted-foreground">WhatsApp Response Rate</p>
                        <p className="text-3xl font-bold text-foreground mt-2">
                          {percent(effective.whatsapp_response_rate)}
                        </p>
                      </Card>
                      <Card className="p-6 bg-card border-border">
                        <p className="text-sm text-muted-foreground">Lost Re-engagement Rate</p>
                        <p className="text-3xl font-bold text-foreground mt-2">
                          {percent(effective.lost_reengagement_rate)}
                        </p>
                      </Card>
                    </>
                  )
                })()}
              </div>

              {/* Lead Pipeline */}
              <Card className="p-6 bg-card border-border">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Lead Pipeline</h3>
                    <p className="text-sm text-muted-foreground">
                      Lead counts by CRM stage (POC uses locally stored stages).
                    </p>
                  </div>
                </div>
                {pipeline?.stages?.length || mockAnalyticsByAvatar[selectedAvatar.id]?.pipeline?.length ? (
                  <ChartContainer
                    id="lead-pipeline"
                    className="h-[320px] w-full"
                    config={{
                      count: { label: "Leads", color: "var(--chart-1)" },
                    }}
                  >
                    <BarChart
                      data={
                        pipeline?.stages?.length
                          ? pipeline.stages
                          : mockAnalyticsByAvatar[selectedAvatar.id]?.pipeline || []
                      }
                      layout="vertical"
                      margin={{ left: 16, right: 16 }}
                    >
                      <CartesianGrid horizontal={false} />
                      <YAxis dataKey="stage" type="category" width={110} tickLine={false} axisLine={false} />
                      <XAxis type="number" tickLine={false} axisLine={false} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="count" fill="var(--color-count)" radius={6} />
                    </BarChart>
                  </ChartContainer>
                ) : (
                  <div className="rounded-lg border border-border bg-muted/30 p-10 text-center">
                    <div className="flex justify-center mb-4">
                      <div className="p-4 bg-muted rounded-full">
                        <BarChart3 className="h-8 w-8 text-muted-foreground" />
                      </div>
                    </div>
                    <p className="text-muted-foreground">No pipeline data yet. Update lead stages to populate.</p>
                  </div>
                )}
              </Card>
            </div>
          )}

          {!isRealEstate && (
            <div className="flex justify-center">
              <div className="bg-card rounded-lg border border-border p-12 text-center max-w-lg">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-muted rounded-full">
                    <BarChart3 className="h-8 w-8 text-muted-foreground" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No analytics data yet</h3>
                <p className="text-muted-foreground">
                  Analytics will appear here once {selectedAvatar.name} starts making calls
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
