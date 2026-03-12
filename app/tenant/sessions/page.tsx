"use client"

import { useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { X } from "lucide-react"
import { Header } from "@/components/admin/header"
import { PortalNav } from "@/components/admin/portal-nav"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type SessionRow = {
  id: string
  avatarId: string
  date: string
  avatar: string
  lead: string
  duration: string
  outcome: "Completed" | "Drop-off" | "Flagged"
  readyToBuy: boolean
  stage: "OPEN" | "CONTACTED" | "RTB" | "NEGOTIATING" | "CLOSED" | "LOST" | "OFF_TOPIC"
  summary: string
  transcript: string
}

const sessions: SessionRow[] = [
  {
    id: "s1",
    avatarId: "2",
    date: "2026-03-09 10:30",
    avatar: "Noura",
    lead: "Ahmed Al-Rashid",
    duration: "4:32",
    outcome: "Completed",
    readyToBuy: true,
    stage: "RTB",
    summary: "Lead asked for 4BR villa in Palm Jumeirah with strong buying intent.",
    transcript: "Agent: Welcome. Lead: Looking for premium villa options with sea view.",
  },
  {
    id: "s2",
    avatarId: "2",
    date: "2026-03-09 14:20",
    avatar: "Noura",
    lead: "Maria Santos",
    duration: "2:45",
    outcome: "Completed",
    readyToBuy: false,
    stage: "NEGOTIATING",
    summary: "Lead re-opened via WhatsApp link and requested second viewing details.",
    transcript: "Agent: Glad to continue. Lead: Please compare payment plan options.",
  },
  {
    id: "s3",
    avatarId: "2",
    date: "2026-03-10 09:10",
    avatar: "Noura",
    lead: "Noor Al-Fahim",
    duration: "3:18",
    outcome: "Completed",
    readyToBuy: true,
    stage: "RTB",
    summary: "Strong intent for waterfront apartment with immediate timeline.",
    transcript: "Agent: What timeline do you prefer? Lead: Within 2-3 months.",
  },
  {
    id: "s4",
    avatarId: "2",
    date: "2026-03-10 12:05",
    avatar: "Noura",
    lead: "Yousef Darwish",
    duration: "2:11",
    outcome: "Drop-off",
    readyToBuy: false,
    stage: "LOST",
    summary: "Conversation dropped early; no decision captured.",
    transcript: "Agent: I can help shortlist options. Lead disconnected.",
  },
  {
    id: "s5",
    avatarId: "1",
    date: "2026-03-10 16:35",
    avatar: "Sarah",
    lead: "Dina Farouk",
    duration: "5:02",
    outcome: "Completed",
    readyToBuy: true,
    stage: "CLOSED",
    summary: "Lead converted after follow-up and moved to closed deal stage.",
    transcript: "Agent: Confirming your selected unit. Lead: Yes, proceed.",
  },
  {
    id: "s6",
    avatarId: "2",
    date: "2026-03-11 11:40",
    avatar: "Noura",
    lead: "Leila Haddad",
    duration: "3:56",
    outcome: "Completed",
    readyToBuy: true,
    stage: "NEGOTIATING",
    summary: "Lead requested updated listing bundle and moved to negotiation.",
    transcript: "Agent: Sharing fresh options. Lead: Send comparisons please.",
  },
]

export default function TenantSessionsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tenantId = searchParams.get("tenantId") || "dar-global"
  const [selectedSession, setSelectedSession] = useState<SessionRow | null>(null)

  const stats = useMemo(() => {
    const total = sessions.length
    const rtb = sessions.filter((s) => s.readyToBuy).length
    const closed = sessions.filter((s) => s.stage === "CLOSED").length
    return { total, rtb, closed }
  }, [])

  return (
    <div className="flex min-h-screen bg-background">
      <main className={`flex-1 flex flex-col transition-all duration-300 ${selectedSession ? "mr-[430px]" : ""}`}>
        <Header />
        <PortalNav area="tenant" />

        <div className="flex-1 p-8 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Sessions</h1>
            <p className="text-muted-foreground">
              A session is one AI conversation instance. Multiple sessions can belong to the same lead.
            </p>
          </div>

          <Card className="p-4 bg-muted/20 border-border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <p className="text-foreground">Total Sessions: <span className="font-semibold">{stats.total}</span></p>
              <p className="text-foreground">RTB Sessions: <span className="font-semibold">{stats.rtb}</span></p>
              <p className="text-foreground">Closed Deals: <span className="font-semibold">{stats.closed}</span></p>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Avatar</TableHead>
                  <TableHead>Lead</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Outcome</TableHead>
                  <TableHead>RTB</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.date}</TableCell>
                    <TableCell>{s.avatar}</TableCell>
                    <TableCell>{s.lead}</TableCell>
                    <TableCell>{s.duration}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{s.outcome}</Badge>
                    </TableCell>
                    <TableCell>
                      {s.readyToBuy ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">RTB</Badge>
                      ) : (
                        <Badge variant="outline">-</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedSession(s)}
                      >
                        Open Detail
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      </main>

      <aside
        className={`fixed top-0 right-0 h-full w-[430px] border-l border-border bg-card shadow-xl z-40 transform transition-transform duration-300 ${
          selectedSession ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {selectedSession && (
          <div className="h-full flex flex-col">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Session Detail</h2>
                <p className="text-xs text-muted-foreground">{selectedSession.date}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedSession(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Lead: {selectedSession.lead}</Badge>
                <Badge variant="outline">Stage: {selectedSession.stage}</Badge>
              </div>
              <Card className="p-4 border-border">
                <p className="text-xs text-muted-foreground mb-1">Summary</p>
                <p className="text-sm text-foreground">{selectedSession.summary}</p>
              </Card>
              <Card className="p-4 border-border">
                <p className="text-xs text-muted-foreground mb-1">Transcript Preview</p>
                <p className="text-sm text-foreground">{selectedSession.transcript}</p>
              </Card>
              <Button
                className="w-full"
                onClick={() =>
                  router.push(
                    `/configure/${encodeURIComponent(tenantId)}/call-history?avatarId=${encodeURIComponent(
                      selectedSession.avatarId,
                    )}`,
                  )
                }
              >
                Open Full Session History
              </Button>
            </div>
          </div>
        )}
      </aside>
    </div>
  )
}

