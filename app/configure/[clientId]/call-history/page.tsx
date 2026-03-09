"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Phone, Calendar, ArrowLeft } from "lucide-react"
import { AvatarSidebar, TenantAvatar } from "@/components/admin/avatar-sidebar"
import { Header } from "@/components/admin/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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

interface CallRecord {
  id: string
  date: string
  duration: string
  status: "completed" | "missed" | "ongoing"
  callerName?: string
}

export default function CallHistoryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const avatarId = searchParams.get("avatarId") || "1"
  
  const [avatars] = useState<TenantAvatar[]>(mockAvatars)
  const [selectedAvatar, setSelectedAvatar] = useState<TenantAvatar>(
    mockAvatars.find(a => a.id === avatarId) || mockAvatars[0]
  )
  const [dateFilter, setDateFilter] = useState("")
  const [durationFilter, setDurationFilter] = useState("all")
  
  // Mock call records (empty for now)
  const [calls] = useState<CallRecord[]>([])

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
    setSelectedAvatar(avatar)
  }

  const handleViewAnalytics = (avatar: TenantAvatar) => {
    router.push(`/configure/analytics?avatarId=${avatar.id}`)
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
              Call History - {selectedAvatar.name}
            </h1>
            <p className="text-primary">
              {calls.length} Total Calls Recorded
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

          {/* Filters */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Filter by Date and Duration</h2>
            <div className="flex gap-4">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  placeholder="Select Date"
                  className="pl-10 bg-card border-border w-48"
                />
              </div>
              <Select value={durationFilter} onValueChange={setDurationFilter}>
                <SelectTrigger className="w-48 bg-card border-border">
                  <SelectValue placeholder="All Durations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Durations</SelectItem>
                  <SelectItem value="short">{"< 1 min"}</SelectItem>
                  <SelectItem value="medium">1-5 mins</SelectItem>
                  <SelectItem value="long">{"> 5 mins"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Call Records or Empty State */}
          {calls.length === 0 ? (
            <div className="flex justify-center">
              <div className="bg-card rounded-lg border border-border p-12 text-center max-w-lg">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-muted rounded-full">
                    <Phone className="h-8 w-8 text-muted-foreground" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No calls for this avatar yet
                </h3>
                <p className="text-muted-foreground">
                  When {selectedAvatar.name} makes calls, they will appear here
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Call records would render here */}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
