"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import {
  Calendar,
  ArrowLeft,
  LayoutGrid,
  List,
  Clock,
  User,
  X,
  Play,
  Pause,
  Volume2,
  ShoppingBag,
  MessageSquare,
  CheckCircle,
  XCircle,
  Sparkles,
} from "lucide-react"
import { AvatarSidebar, TenantAvatar } from "@/components/admin/avatar-sidebar"
import { Header } from "@/components/admin/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const crmStages = ["New", "Contacted", "Qualified", "Negotiating", "Closed", "Lost"] as const
type CrmStage = (typeof crmStages)[number]

type WhatsappLogEntry = {
  id: string
  sessionId: string
  messageType: "post_call" | "reengagement" | "test"
  sentAt: string
  status: "Sent" | "Delivered" | "Failed"
  messagePreview: string
  parentSessionId?: string
  engagementPath?: "Converter" | "Returner" | "Phoenix"
  resumeUrl?: string
}

type PostSaleEvent = {
  id: string
  leadId: string
  eventType: "thank_you" | "payment_reminder" | "construction_update"
  scheduledAt: string
  sentAt?: string
  status: "Pending" | "Sent" | "Failed"
  payload: Record<string, any>
}

// Mock data for avatars
const mockAvatars: TenantAvatar[] = [
  {
    id: "1",
    name: "sarah",
    imageUrl: "/avatars/sarah.png",
    industry: "Corporate",
    isPrimary: true,
    callCount: 5,
  },
  {
    id: "2",
    name: "Noura",
    imageUrl: "/avatars/noura.jpeg",
    industry: "Real Estate",
    callCount: 3,
  },
]

interface CallRecord {
  id: string
  date: string
  time: string
  duration: string
  durationSeconds: number
  status: "completed" | "missed" | "ongoing"
  direction: "inbound" | "outbound"
  callerName: string
  callerPhone: string
  productType: string
  summary: string
  transcript: TranscriptEntry[]
  audioUrl?: string
}

interface TranscriptEntry {
  speaker: "agent" | "caller"
  text: string
  timestamp: string
}

// Mock call records with sample data
const mockCalls: CallRecord[] = [
  {
    id: "1",
    date: "2024-03-15",
    time: "10:30 AM",
    duration: "4:32",
    durationSeconds: 272,
    status: "completed",
    direction: "inbound",
    callerName: "Ahmed Al-Rashid",
    callerPhone: "ahmed.alrashid@email.com",
    productType: "Luxury Villa",
    summary: "Caller inquired about a 4-bedroom villa in Palm Jumeirah. Showed interest in properties with sea view and private pool. Budget range discussed was 8-12M AED. Scheduled a property viewing for next Tuesday at 2 PM.",
    transcript: [
      { speaker: "agent", text: "Hello! Thank you for calling. I'm Sarah, your real estate assistant. How can I help you today?", timestamp: "0:00" },
      { speaker: "caller", text: "Hi Sarah, I'm looking for a luxury villa in Palm Jumeirah area. Preferably with a sea view.", timestamp: "0:08" },
      { speaker: "agent", text: "Wonderful choice! Palm Jumeirah has some of the most stunning villas in Dubai. Could you tell me more about what you're looking for? Number of bedrooms, any specific amenities?", timestamp: "0:18" },
      { speaker: "caller", text: "I'd like at least 4 bedrooms, a private pool would be great, and definitely a sea view. My budget is around 8 to 12 million AED.", timestamp: "0:32" },
      { speaker: "agent", text: "Perfect, I have several properties that match your criteria. We have a beautiful 4-bedroom villa with panoramic sea views and a private infinity pool, listed at 9.5 million AED. Would you like to schedule a viewing?", timestamp: "0:48" },
      { speaker: "caller", text: "That sounds exactly what I'm looking for. Yes, I'd love to see it.", timestamp: "1:05" },
      { speaker: "agent", text: "Excellent! When would be a convenient time for you? We have availability this Tuesday at 2 PM or Thursday at 10 AM.", timestamp: "1:12" },
      { speaker: "caller", text: "Tuesday at 2 PM works perfectly for me.", timestamp: "1:22" },
      { speaker: "agent", text: "Wonderful! I've scheduled your viewing for Tuesday at 2 PM. I'll send you the property details and location via WhatsApp. Is there anything else I can help you with?", timestamp: "1:28" },
      { speaker: "caller", text: "No, that's all. Thank you so much for your help!", timestamp: "1:42" },
      { speaker: "agent", text: "My pleasure! Looking forward to seeing you on Tuesday. Have a great day!", timestamp: "1:48" },
    ],
  },
  {
    id: "2",
    date: "2024-03-15",
    time: "2:15 PM",
    duration: "2:45",
    durationSeconds: 165,
    status: "completed",
    direction: "outbound",
    callerName: "Maria Santos",
    callerPhone: "maria.santos@email.com",
    productType: "Apartment",
    summary: "Follow-up call regarding a 2-bedroom apartment in Downtown Dubai. Client confirmed interest and requested a second viewing with their spouse. Meeting scheduled for Friday at 11 AM.",
    transcript: [
      { speaker: "agent", text: "Hello Maria, this is Sarah from IZZI Real Estate. I'm following up on the apartment viewing from yesterday. How did you find the property?", timestamp: "0:00" },
      { speaker: "caller", text: "Hi Sarah! I loved the apartment. The view of Burj Khalifa was stunning.", timestamp: "0:12" },
      { speaker: "agent", text: "I'm so glad to hear that! It's definitely one of our premium units. Have you had a chance to discuss it with your family?", timestamp: "0:22" },
      { speaker: "caller", text: "Yes, my husband is very interested but he'd like to see it as well before we make a decision.", timestamp: "0:32" },
      { speaker: "agent", text: "Of course! I can arrange another viewing. Would Friday at 11 AM work for both of you?", timestamp: "0:42" },
      { speaker: "caller", text: "That would be perfect. We'll both be there.", timestamp: "0:52" },
    ],
  },
  {
    id: "3",
    date: "2024-03-14",
    time: "9:00 AM",
    duration: "0:45",
    durationSeconds: 45,
    status: "missed",
    direction: "inbound",
    callerName: "Unknown",
    callerPhone: "",
    productType: "Unknown",
    summary: "Missed call. No voicemail left.",
    transcript: [],
  },
  {
    id: "4",
    date: "2024-03-14",
    time: "3:30 PM",
    duration: "6:12",
    durationSeconds: 372,
    status: "completed",
    direction: "inbound",
    callerName: "James Wilson",
    callerPhone: "james.wilson@company.com",
    productType: "Commercial Space",
    summary: "Inquiry about commercial office space in DIFC. Client looking for 3000-5000 sq ft for a fintech startup. Discussed available options and sent property brochures via email.",
    transcript: [
      { speaker: "agent", text: "Hello, this is Sarah from IZZI Real Estate. How may I assist you today?", timestamp: "0:00" },
      { speaker: "caller", text: "Hi, I'm looking for commercial office space in DIFC for my company.", timestamp: "0:08" },
      { speaker: "agent", text: "Certainly! DIFC is an excellent choice for businesses. Could you tell me about your space requirements?", timestamp: "0:16" },
      { speaker: "caller", text: "We're a fintech startup with about 25 employees. Looking for something between 3000 to 5000 square feet.", timestamp: "0:26" },
    ],
  },
  {
    id: "5",
    date: "2024-03-13",
    time: "11:45 AM",
    duration: "3:20",
    durationSeconds: 200,
    status: "completed",
    direction: "inbound",
    callerName: "Fatima Hassan",
    callerPhone: "fatima.hassan@example.com",
    productType: "Townhouse",
    summary: "Client interested in townhouses in Arabian Ranches. Provided information about available units and community amenities. Will send virtual tour links.",
    transcript: [
      { speaker: "agent", text: "Welcome to IZZI Real Estate! I'm Sarah, how can I help you?", timestamp: "0:00" },
      { speaker: "caller", text: "Hello, I'm interested in townhouses in Arabian Ranches.", timestamp: "0:08" },
    ],
  },
  {
    id: "6",
    date: "2024-03-13",
    time: "2:20 PM",
    duration: "5:01",
    durationSeconds: 301,
    status: "completed",
    direction: "inbound",
    callerName: "Noor Al-Fahim",
    callerPhone: "noor.alfahim@email.com",
    productType: "Waterfront Apartment",
    summary: "Requested waterfront inventory in Dubai Marina. Asked about payment plans and handover dates.",
    transcript: [
      { speaker: "agent", text: "Welcome back Noor, what would you like to focus on today?", timestamp: "0:00" },
      { speaker: "caller", text: "Show me waterfront options with flexible payment plans.", timestamp: "0:11" },
    ],
  },
  {
    id: "7",
    date: "2024-03-12",
    time: "10:10 AM",
    duration: "2:58",
    durationSeconds: 178,
    status: "completed",
    direction: "inbound",
    callerName: "Khaled Ibrahim",
    callerPhone: "khaled.ibrahim@email.com",
    productType: "Townhouse",
    summary: "Qualified for townhouse purchase, asked for shortlist and booking process details.",
    transcript: [
      { speaker: "agent", text: "Hi Khaled, let's continue your townhouse search.", timestamp: "0:00" },
      { speaker: "caller", text: "I need a 3BR option in a family community.", timestamp: "0:08" },
    ],
  },
  {
    id: "8",
    date: "2024-03-12",
    time: "4:05 PM",
    duration: "1:44",
    durationSeconds: 104,
    status: "missed",
    direction: "inbound",
    callerName: "Rania Mahmoud",
    callerPhone: "rania.mahmoud@email.com",
    productType: "Penthouse",
    summary: "Session ended early. Follow-up was triggered through WhatsApp automation.",
    transcript: [],
  },
  {
    id: "9",
    date: "2024-03-11",
    time: "11:50 AM",
    duration: "4:20",
    durationSeconds: 260,
    status: "completed",
    direction: "outbound",
    callerName: "Yousef Darwish",
    callerPhone: "yousef.darwish@email.com",
    productType: "Apartment",
    summary: "Re-engaged lead after Day 7 message, discussed fresh listings and updated preferences.",
    transcript: [
      { speaker: "agent", text: "Hi Yousef, I have fresh listings matching your request.", timestamp: "0:00" },
      { speaker: "caller", text: "Great, show me options near Downtown and Business Bay.", timestamp: "0:10" },
    ],
  },
  {
    id: "10",
    date: "2024-03-11",
    time: "6:10 PM",
    duration: "3:12",
    durationSeconds: 192,
    status: "completed",
    direction: "inbound",
    callerName: "Sara Al-Mutairi",
    callerPhone: "sara.mutairi@email.com",
    productType: "Villa",
    summary: "Asked for premium villas with payment milestones aligned to project completion.",
    transcript: [
      { speaker: "agent", text: "Sara, I can show premium villa options with staged payments.", timestamp: "0:00" },
      { speaker: "caller", text: "Perfect. I need flexible milestones and strong ROI.", timestamp: "0:13" },
    ],
  },
  {
    id: "11",
    date: "2024-03-10",
    time: "9:35 AM",
    duration: "5:40",
    durationSeconds: 340,
    status: "completed",
    direction: "inbound",
    callerName: "Hassan Malik",
    callerPhone: "hassan.malik@email.com",
    productType: "Commercial Unit",
    summary: "Explored commercial options, shortlisted two units, and moved to negotiating stage.",
    transcript: [
      { speaker: "agent", text: "Let us compare two commercial units based on your team size.", timestamp: "0:00" },
      { speaker: "caller", text: "Please share expected yields for both.", timestamp: "0:09" },
    ],
  },
  {
    id: "12",
    date: "2024-03-10",
    time: "1:25 PM",
    duration: "2:36",
    durationSeconds: 156,
    status: "completed",
    direction: "outbound",
    callerName: "Leila Haddad",
    callerPhone: "leila.haddad@email.com",
    productType: "Luxury Villa",
    summary: "Follow-up on previously shortlisted villas, lead requested updated comparative sheet.",
    transcript: [
      { speaker: "agent", text: "Leila, I prepared your updated luxury villa comparison.", timestamp: "0:00" },
      { speaker: "caller", text: "Great, send me the one with highest rental upside.", timestamp: "0:07" },
    ],
  },
]

export default function CallHistoryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams<{ clientId: string }>()
  const clientId = (params?.clientId as string) || "client"
  const avatarId = searchParams.get("avatarId") || "1"
  
  const [avatars] = useState<TenantAvatar[]>(mockAvatars)
  const [selectedAvatar, setSelectedAvatar] = useState<TenantAvatar>(
    mockAvatars.find(a => a.id === avatarId) || mockAvatars[0]
  )
  const [dateFilter, setDateFilter] = useState("")
  const [durationFilter, setDurationFilter] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioProgress, setAudioProgress] = useState(0)
  const [crmStage, setCrmStage] = useState<CrmStage>("New")
  const [stageUpdating, setStageUpdating] = useState(false)
  const [stageError, setStageError] = useState<string | null>(null)
  const [whatsappLogs, setWhatsappLogs] = useState<WhatsappLogEntry[]>([])
  const [postSaleEvents, setPostSaleEvents] = useState<PostSaleEvent[]>([])
  
  const [calls] = useState<CallRecord[]>(mockCalls)

  const engagementPathForLogs = (logs: WhatsappLogEntry[]): "Converter" | "Returner" | "Phoenix" => {
    if (!logs.length) return "Converter"
    const explicit = logs.find((l) => l.engagementPath)
    if (explicit?.engagementPath) return explicit.engagementPath
    const hasPhoenix =
      logs.some(
        (l) =>
          l.id.toLowerCase().includes("phoenix") ||
          l.messagePreview.toLowerCase().includes("new listings") ||
          l.messagePreview.toLowerCase().includes("fresh villas"),
      )
    if (hasPhoenix) return "Phoenix"
    return "Returner"
  }

  const buildWorkflowWhatsappMocks = (call: CallRecord, avatar: TenantAvatar): WhatsappLogEntry[] => {
    // Only mock for the Dar Global / Real Estate persona
    if (avatar.industry !== "Real Estate") return []

    const baseTime = new Date("2026-03-10T10:00:00Z").getTime()
    const mkTime = (offsetMinutes: number) =>
      new Date(baseTime + offsetMinutes * 60_000).toISOString()

    // Map specific mock calls to workflow paths
    switch (call.id) {
      // Converter: clear RTB during the live call -> no WhatsApp needed
      case "1":
        return []
      // Returner: RTB after WhatsApp follow-up click
      case "2":
        return [
          {
            id: "mock-wp-2-post",
            sessionId: call.id,
            messageType: "post_call",
            sentAt: mkTime(30),
            status: "Sent",
            messagePreview:
              "Hi Maria, thanks for your time earlier about the Downtown apartment. Ready to continue where we left off?",
            engagementPath: "Returner",
          },
          {
            id: "mock-wp-2-returner",
            sessionId: call.id,
            messageType: "reengagement",
            sentAt: mkTime(45),
            status: "Delivered",
            messagePreview:
              "Hi Maria, I’ve shortlisted the 3 apartments you liked — tap to return to IZZI and confirm your preferred unit.",
            engagementPath: "Returner",
            parentSessionId: call.id,
            resumeUrl: `/izzi/session/returner?sessionId=${encodeURIComponent(call.id)}`,
          },
        ]
      // Phoenix: RTB after Day‑7 revival
      case "3":
        return [
          {
            id: "mock-wp-3-post",
            sessionId: call.id,
            messageType: "post_call",
            sentAt: mkTime(20),
            status: "Sent",
            messagePreview:
              "Hi there, thanks for speaking with IZZI earlier. I’m here if you’d like to continue exploring Dubai properties.",
            engagementPath: "Phoenix",
          },
          {
            id: "mock-wp-3-phoenix",
            sessionId: call.id,
            messageType: "reengagement",
            sentAt: mkTime(7 * 24 * 60), // Day 7
            status: "Delivered",
            messagePreview:
              "Hi again, we’ve just added 2 new listings that match your criteria. Tap to see fresh villas and continue with IZZI.",
            engagementPath: "Phoenix",
            parentSessionId: call.id,
            resumeUrl: `/izzi/session/phoenix?sessionId=${encodeURIComponent(call.id)}`,
          },
        ]
      default:
        return []
    }
  }

  // Load CRM stage for the selected lead/session
  useEffect(() => {
    if (!selectedCall?.id) return
    let cancelled = false
    async function load() {
      const res = await fetch(`/api/crm/salesforce/lead/${encodeURIComponent(selectedCall.id)}/status`).catch(
        () => null,
      )
      if (!res || !res.ok) return
      const json = (await res.json().catch(() => null)) as any
      if (cancelled) return
      const stage = (json?.stage as CrmStage) || "New"
      if (crmStages.includes(stage)) setCrmStage(stage)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [selectedCall?.id])

  useEffect(() => {
    if (!selectedCall?.id) return
    let cancelled = false
    async function loadEvents() {
      const res = await fetch(`/api/postsale/events?leadId=${encodeURIComponent(selectedCall.id)}`).catch(
        () => null,
      )
      if (!res || !res.ok) return
      const rows = (await res.json().catch(() => [])) as PostSaleEvent[]
      if (cancelled) return
      setPostSaleEvents(rows)
    }
    loadEvents()
    return () => {
      cancelled = true
    }
  }, [selectedCall?.id])

  useEffect(() => {
    if (!selectedCall?.id) return
    let cancelled = false
    async function loadLogs() {
      const res = await fetch(`/api/whatsapp/log?sessionId=${encodeURIComponent(selectedCall.id)}`).catch(
        () => null,
      )
      if (!res || !res.ok) {
        if (!cancelled) {
          setWhatsappLogs(buildWorkflowWhatsappMocks(selectedCall, selectedAvatar))
        }
        return
      }
      const rows = (await res.json().catch(() => [])) as WhatsappLogEntry[]
      if (cancelled) return
      if (rows.length === 0) {
        setWhatsappLogs(buildWorkflowWhatsappMocks(selectedCall, selectedAvatar))
      } else {
        setWhatsappLogs(rows)
      }
    }
    loadLogs()
    return () => {
      cancelled = true
    }
  }, [selectedCall?.id, selectedAvatar])

  const handleSelectAvatar = (avatar: TenantAvatar) => {
    setSelectedAvatar(avatar)
    setSelectedCall(null)
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
    router.push(`/configure/${encodeURIComponent(clientId)}/analytics?avatarId=${avatar.id}`)
  }

  const handleSelectCall = (call: CallRecord) => {
    setSelectedCall(call)
    setIsPlaying(false)
    setAudioProgress(0)
  }

  const handleClosePanel = () => {
    setSelectedCall(null)
    setIsPlaying(false)
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      year: "numeric" 
    })
  }

  const getStatusBadge = (status: CallRecord["status"]) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-700 border-green-200">Completed</Badge>
      case "missed":
        return <Badge className="bg-red-100 text-red-700 border-red-200">Missed</Badge>
      case "ongoing":
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Ongoing</Badge>
    }
  }

  const filteredCalls = calls.filter(call => {
    if (dateFilter && call.date !== dateFilter) return false
    if (durationFilter === "short" && call.durationSeconds >= 60) return false
    if (durationFilter === "medium" && (call.durationSeconds < 60 || call.durationSeconds > 300)) return false
    if (durationFilter === "long" && call.durationSeconds <= 300) return false
    return true
  })

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
      
      <main className={`flex-1 flex flex-col transition-all duration-300 ${selectedCall ? "mr-[450px]" : ""}`}>
        <Header />
        
        <div className="flex-1 p-8">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Session History - {selectedAvatar.name}
            </h1>
            <p className="text-primary">
              {filteredCalls.length} Total Sessions Recorded
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

          {/* Filters and View Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex flex-wrap items-center gap-4">
              <h2 className="text-lg font-semibold">Filter by date and session length</h2>
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

            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                className={`h-8 w-8 p-0 ${viewMode === "grid" ? "bg-primary text-primary-foreground" : ""}`}
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                className={`h-8 w-8 p-0 ${viewMode === "list" ? "bg-primary text-primary-foreground" : ""}`}
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Call Records or Empty State */}
          {filteredCalls.length === 0 ? (
            <div className="flex justify-center">
              <div className="bg-card rounded-lg border border-border p-12 text-center max-w-lg">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-muted rounded-full">
                        <Sparkles className="h-8 w-8 text-muted-foreground" />
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
          ) : viewMode === "grid" ? (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredCalls.map((call) => (
                <Card
                  key={call.id}
                  className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedCall?.id === call.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => handleSelectCall(call)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      {getStatusBadge(call.status)}
                    </div>
                    <span className="text-sm text-muted-foreground">{call.time}</span>
                  </div>

                  <div className="mb-3">
                    <h4 className="font-semibold text-foreground">{call.callerName}</h4>
                    <p className="text-sm text-muted-foreground">{call.callerPhone}</p>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(call.date)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {call.duration}
                    </div>
                  </div>

                  {call.productType !== "Unknown" && (
                    <div className="flex items-center gap-1">
                      <ShoppingBag className="h-3 w-3 text-primary" />
                      <span className="text-sm text-primary">{call.productType}</span>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            /* List View */
            <div className="bg-card rounded-lg border border-border overflow-hidden">
              <div className="grid grid-cols-[1fr_150px_100px_120px_100px] gap-4 p-4 bg-muted/50 font-medium text-sm text-muted-foreground border-b border-border">
                <div>Visitor</div>
                <div>Date & Time</div>
                <div>Duration</div>
                <div>Product</div>
                <div>Status</div>
              </div>
              {filteredCalls.map((call) => (
                <div
                  key={call.id}
                  className={`grid grid-cols-[1fr_150px_100px_120px_100px] gap-4 p-4 items-center cursor-pointer transition-colors hover:bg-muted/30 border-b border-border last:border-b-0 ${
                    selectedCall?.id === call.id ? "bg-primary/5" : ""
                  }`}
                  onClick={() => handleSelectCall(call)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{call.callerName}</p>
                      {call.callerPhone && (
                        <p className="text-sm text-muted-foreground">Email: {call.callerPhone}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-sm">
                    <p className="text-foreground">{formatDate(call.date)}</p>
                    <p className="text-muted-foreground">{call.time}</p>
                  </div>
                  <div className="text-sm text-foreground">{call.duration}</div>
                  <div className="text-sm text-primary">{call.productType}</div>
                  <div>{getStatusBadge(call.status)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Call Detail Slide Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-[450px] bg-card border-l border-border shadow-xl transform transition-transform duration-300 z-50 ${
          selectedCall ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {selectedCall && (
          <div className="flex flex-col h-full">
            {/* Panel Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Call Details</h2>
                <p className="text-sm text-muted-foreground">
                  {formatDate(selectedCall.date)} at {selectedCall.time}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClosePanel}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6 pb-24">
                {/* Call Info */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted">
                      <User className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{selectedCall.callerName}</p>
                      {selectedCall.callerPhone && (
                        <p className="text-sm text-muted-foreground">Email: {selectedCall.callerPhone}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {getStatusBadge(selectedCall.status)}
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      Web session
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {selectedCall.duration}
                    </Badge>
                    <Badge className="bg-primary/10 text-foreground border-border">
                      CRM Stage: <span className="ml-1 font-semibold">{crmStage}</span>
                    </Badge>
                    {whatsappLogs && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        Path: {engagementPathForLogs(whatsappLogs)}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* CRM Stage Override */}
                <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
                  <div>
                    <p className="font-medium text-foreground">CRM Stage</p>
                    <p className="text-sm text-muted-foreground">
                      Manually override the stage (POC). This updates the stored lead stage for this session.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Select
                      value={crmStage}
                      onValueChange={async (value) => {
                        const nextStage = value as CrmStage
                        const previousStage = crmStage
                        setCrmStage(nextStage)
                        setStageError(null)
                        setStageUpdating(true)
                        try {
                          const res = await fetch(
                            `/api/crm/salesforce/lead/${encodeURIComponent(selectedCall.id)}/status`,
                            {
                              method: "PATCH",
                              headers: { "content-type": "application/json" },
                              body: JSON.stringify({ stage: nextStage }),
                            },
                          )
                          if (!res.ok) {
                            const json = (await res.json().catch(() => null)) as any
                            setCrmStage(previousStage)
                            setStageError(json?.error || "Failed to update stage.")
                          }
                        } finally {
                          setStageUpdating(false)
                        }
                      }}
                    >
                      <SelectTrigger className="bg-card border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {crmStages.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-xs text-muted-foreground">
                      {stageUpdating ? "Updating…" : stageError ? "Error, not saved" : "Saved locally"}
                    </span>
                  </div>
                </div>

                {/* Product Type */}
                {selectedCall.productType !== "Unknown" && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <ShoppingBag className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-muted-foreground">Product Interest</span>
                    </div>
                    <p className="text-foreground font-semibold">{selectedCall.productType}</p>
                  </div>
                )}

                {/* Audio Player */}
                {selectedCall.status === "completed" && (
                  <div className="p-4 bg-foreground/5 rounded-lg space-y-3">
                    <div className="flex items-center gap-2">
                      <Volume2 className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Call Recording</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 rounded-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                        onClick={togglePlayPause}
                      >
                        {isPlaying ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4 ml-0.5" />
                        )}
                      </Button>
                      <div className="flex-1 space-y-1">
                        <Slider
                          value={[audioProgress]}
                          onValueChange={(value) => setAudioProgress(value[0])}
                          max={100}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>0:00</span>
                          <span>{selectedCall.duration}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Summary */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <span className="font-medium text-foreground">Call Summary</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedCall.summary}
                  </p>
                </div>

                {/* WhatsApp Activity */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <span className="font-medium text-foreground">WhatsApp Activity</span>
                  </div>
                  {whatsappLogs.length === 0 ? (
                    <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                      No WhatsApp messages logged for this session yet.
                    </div>
                  ) : (
                    <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-4">
                      {whatsappLogs
                        .slice()
                        .sort((a, b) => b.sentAt.localeCompare(a.sentAt))
                        .map((row) => (
                          <div key={row.id} className="flex items-start gap-3">
                            <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-card border border-border">
                              {row.messageType === "post_call" ? (
                                <MessageSquare className="h-4 w-4 text-primary" />
                              ) : row.messageType === "reengagement" ? (
                                <Sparkles className="h-4 w-4 text-primary" />
                              ) : (
                                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-foreground">
                                  {row.messageType === "post_call"
                                    ? "Post-call follow-up"
                                    : row.messageType === "reengagement"
                                      ? "Re-engagement message"
                                      : "Test message"}
                                </span>
                                <Badge
                                  className={
                                    row.status === "Failed"
                                      ? "bg-red-100 text-red-700 hover:bg-red-100"
                                      : row.status === "Delivered"
                                        ? "bg-green-100 text-green-700 hover:bg-green-100"
                                        : "bg-blue-100 text-blue-700 hover:bg-blue-100"
                                  }
                                >
                                  {row.status}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {new Date(row.sentAt).toLocaleString()}
                              </p>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {row.messagePreview}
                              </p>
                              {row.resumeUrl && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="mt-1 h-8 px-3 text-xs"
                                  onClick={() => {
                                    // POC: we do not actually open a new tab, just surface intent.
                                    window.alert(
                                      "In production, this button opens an IZZI session with full context using the secure link: " +
                                        row.resumeUrl,
                                    )
                                  }}
                                >
                                  Resume with IZZI (mock)
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Re-engagement Sessions (conceptual for POC) */}
                {whatsappLogs.some((l) => l.messageType === "reengagement") && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span className="font-medium text-foreground">Re-engagement Sessions (Returner / Phoenix)</span>
                    </div>
                    <div className="space-y-2">
                      {whatsappLogs
                        .filter((l) => l.messageType === "reengagement")
                        .map((l, idx) => (
                          <div
                            key={l.id}
                            className="rounded-lg border border-border bg-muted/30 p-3 flex items-center justify-between gap-3"
                          >
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                Session #{idx + 2} ·{" "}
                                {l.engagementPath === "Phoenix"
                                  ? "Phoenix (Day 7 revival)"
                                  : "Returner (WhatsApp re-entry)"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Started from WhatsApp link sent on{" "}
                                {new Date(l.sentAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                                .
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 px-3 text-xs"
                              onClick={() => {
                                window.alert(
                                  "In production, this would open the follow-up IZZI session with full context for this lead.",
                                )
                              }}
                            >
                              View journey (mock)
                            </Button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Post-Sale Journey */}
                {crmStage === "Closed" && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="font-medium text-foreground">Post-Sale Journey</span>
                    </div>
                    {postSaleEvents.length === 0 ? (
                      <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                        No post-sale events logged yet for this closed lead.
                      </div>
                    ) : (
                      <div className="rounded-lg border border-border overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/40">
                              <TableHead>Type</TableHead>
                              <TableHead>Scheduled</TableHead>
                              <TableHead>Sent</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {postSaleEvents.map((e) => (
                              <TableRow key={e.id}>
                                <TableCell className="font-medium">
                                  {e.eventType === "thank_you"
                                    ? "Thank You"
                                    : e.eventType === "payment_reminder"
                                      ? "Payment Reminder"
                                      : "Construction Update"}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                  {new Date(e.scheduledAt).toLocaleString()}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                  {e.sentAt ? new Date(e.sentAt).toLocaleString() : "—"}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    className={
                                      e.status === "Failed"
                                        ? "bg-red-100 text-red-700 hover:bg-red-100"
                                        : e.status === "Sent"
                                          ? "bg-green-100 text-green-700 hover:bg-green-100"
                                          : "bg-blue-100 text-blue-700 hover:bg-blue-100"
                                    }
                                  >
                                    {e.status}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                )}

                {/* Transcript */}
                {selectedCall.transcript.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-primary" />
                      <span className="font-medium text-foreground">Full Transcript</span>
                    </div>
                    <div className="space-y-3">
                      {selectedCall.transcript.map((entry, index) => (
                        <div
                          key={index}
                          className={`flex gap-3 ${
                            entry.speaker === "agent" ? "" : "flex-row-reverse"
                          }`}
                        >
                          <div
                            className={`flex-1 p-3 rounded-lg text-sm ${
                              entry.speaker === "agent"
                                ? "bg-primary/10 text-foreground"
                                : "bg-muted text-foreground"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-xs uppercase tracking-wide">
                                {entry.speaker === "agent" ? selectedAvatar.name : "Caller"}
                              </span>
                              <span className="text-xs text-muted-foreground">{entry.timestamp}</span>
                            </div>
                            <p className="leading-relaxed">{entry.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Panel Footer */}
            <div className="p-4 border-t border-border bg-muted/30">
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={handleClosePanel}>
                  Close
                </Button>
                <Button className="flex-1 bg-foreground text-background hover:bg-foreground/90">
                  Download Recording
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
