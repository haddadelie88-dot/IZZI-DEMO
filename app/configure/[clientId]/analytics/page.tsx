"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { BarChart3, ArrowLeft, TrendingUp, Clock, Phone, Users } from "lucide-react"
import { AvatarSidebar, TenantAvatar } from "@/components/admin/avatar-sidebar"
import { Header } from "@/components/admin/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

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

export default function AnalyticsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const avatarId = searchParams.get("avatarId") || "1"
  
  const [avatars] = useState<TenantAvatar[]>(mockAvatars)
  const [selectedAvatar, setSelectedAvatar] = useState<TenantAvatar>(
    mockAvatars.find(a => a.id === avatarId) || mockAvatars[0]
  )

  const stats: AnalyticsStat[] = [
    {
      label: "Total Calls",
      value: "0",
      change: "+0%",
      icon: <Phone className="h-5 w-5" />,
    },
    {
      label: "Avg Duration",
      value: "0:00",
      change: "+0%",
      icon: <Clock className="h-5 w-5" />,
    },
    {
      label: "Unique Callers",
      value: "0",
      change: "+0%",
      icon: <Users className="h-5 w-5" />,
    },
    {
      label: "Conversion Rate",
      value: "0%",
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
    router.push(`/configure/client/call-history?avatarId=${avatar.id}`)
  }

  const handleViewAnalytics = (avatar: TenantAvatar) => {
    setSelectedAvatar(avatar)
  }

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
              Call Analytics - {selectedAvatar.name}
            </h1>
            <p className="text-muted-foreground">
              View performance metrics and insights for this avatar
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

          {/* Empty State */}
          <div className="flex justify-center">
            <div className="bg-card rounded-lg border border-border p-12 text-center max-w-lg">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-muted rounded-full">
                  <BarChart3 className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No analytics data yet
              </h3>
              <p className="text-muted-foreground">
                Analytics will appear here once {selectedAvatar.name} starts making calls
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
