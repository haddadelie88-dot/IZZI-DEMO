"use client"

import { useEffect, useMemo, useState } from "react"
import { X } from "lucide-react"
import { Header } from "@/components/admin/header"
import { PortalNav } from "@/components/admin/portal-nav"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type LeadRow = {
  id: string
  name: string
  email: string
  age: number
  phone: string
  product: string
  budget: string
  stage: "New" | "Contacted" | "RTB" | "Negotiating" | "Closed" | "Lost" | "Out of Scope"
}

type LeadSession = {
  id: string
  leadId: string
  avatarId: string
  avatarName: string
  avatarDeleted?: boolean
  startedAt: string
  duration: string
  stageAtSession: LeadRow["stage"]
  summary: string
  transcriptPreview: string
  whatsappEvents: string[]
}

const mockLeadBase: Omit<LeadRow, "stage">[] = [
  {
    id: "1",
    name: "Ahmed Al-Rashid",
    email: "ahmed.alrashid@email.com",
    age: 39,
    phone: "+971-50-123-4567",
    product: "Luxury Villa",
    budget: "8M - 12M AED",
  },
  {
    id: "2",
    name: "Maria Santos",
    email: "maria.santos@email.com",
    age: 34,
    phone: "+971-55-987-6543",
    product: "Apartment",
    budget: "3M - 5M AED",
  },
  {
    id: "3",
    name: "James Wilson",
    email: "james.wilson@company.com",
    age: 44,
    phone: "+971-52-111-9834",
    product: "Commercial Space",
    budget: "4M - 7M AED",
  },
  {
    id: "4",
    name: "Noor Al-Fahim",
    email: "noor.alfahim@email.com",
    age: 31,
    phone: "+971-54-220-9911",
    product: "Waterfront Apartment",
    budget: "5M - 7M AED",
  },
  {
    id: "5",
    name: "Khaled Ibrahim",
    email: "khaled.ibrahim@email.com",
    age: 42,
    phone: "+971-58-772-1150",
    product: "Townhouse",
    budget: "2.8M - 4.2M AED",
  },
  {
    id: "6",
    name: "Rania Mahmoud",
    email: "rania.mahmoud@email.com",
    age: 37,
    phone: "+971-56-336-7804",
    product: "Penthouse",
    budget: "9M - 14M AED",
  },
  {
    id: "7",
    name: "Yousef Darwish",
    email: "yousef.darwish@email.com",
    age: 29,
    phone: "+971-52-419-6320",
    product: "Apartment",
    budget: "1.6M - 2.4M AED",
  },
  {
    id: "8",
    name: "Sara Al-Mutairi",
    email: "sara.mutairi@email.com",
    age: 35,
    phone: "+971-50-889-2041",
    product: "Villa",
    budget: "7M - 10M AED",
  },
  {
    id: "9",
    name: "Hassan Malik",
    email: "hassan.malik@email.com",
    age: 46,
    phone: "+971-55-630-7781",
    product: "Commercial Unit",
    budget: "6M - 8M AED",
  },
  {
    id: "10",
    name: "Dina Farouk",
    email: "dina.farouk@email.com",
    age: 33,
    phone: "+971-57-194-5117",
    product: "Family Villa",
    budget: "4.5M - 6.5M AED",
  },
  {
    id: "11",
    name: "Omar Qasem",
    email: "omar.qasem@email.com",
    age: 40,
    phone: "+971-59-784-2240",
    product: "Apartment",
    budget: "2.2M - 3.3M AED",
  },
  {
    id: "12",
    name: "Leila Haddad",
    email: "leila.haddad@email.com",
    age: 38,
    phone: "+971-53-442-6675",
    product: "Luxury Villa",
    budget: "10M - 15M AED",
  },
]

const mockLeadSessions: LeadSession[] = [
  {
    id: "s-101",
    leadId: "1",
    avatarId: "2",
    avatarName: "Noura",
    startedAt: "2026-03-09 10:30",
    duration: "4:32",
    stageAtSession: "Contacted",
    summary: "Initial discovery conversation. Lead asked for Palm Jumeirah inventory and shared budget.",
    transcriptPreview: "Lead asked for 4BR sea-view villa options and requested shortlisting.",
    whatsappEvents: ["Post-call follow-up sent (30 min)", "Lead clicked re-entry link"],
  },
  {
    id: "s-102",
    leadId: "1",
    avatarId: "1",
    avatarName: "Sarah",
    startedAt: "2026-03-10 13:10",
    duration: "3:54",
    stageAtSession: "RTB",
    summary: "Follow-up session with contextual resume. Strong buying intent confirmed and RTB flagged.",
    transcriptPreview: "Lead confirmed preferred unit type and requested payment plan details.",
    whatsappEvents: ["RTB handover notification sent to sales"],
  },
  {
    id: "s-103",
    leadId: "1",
    avatarId: "9",
    avatarName: "Maya",
    avatarDeleted: true,
    startedAt: "2026-03-11 16:20",
    duration: "2:45",
    stageAtSession: "Negotiating",
    summary: "Legacy avatar session from before avatar retirement. Negotiation notes captured.",
    transcriptPreview: "Lead discussed preferred payment milestones and timeline flexibility.",
    whatsappEvents: ["Negotiation reminder delivered"],
  },
  {
    id: "s-201",
    leadId: "2",
    avatarId: "2",
    avatarName: "Noura",
    startedAt: "2026-03-08 11:10",
    duration: "2:51",
    stageAtSession: "Contacted",
    summary: "Lead requested Downtown apartment comparison.",
    transcriptPreview: "Lead shortlisted 2 units and asked for ROI details.",
    whatsappEvents: ["Post-call follow-up sent"],
  },
  {
    id: "s-202",
    leadId: "2",
    avatarId: "2",
    avatarName: "Noura",
    startedAt: "2026-03-10 14:40",
    duration: "3:12",
    stageAtSession: "Negotiating",
    summary: "Lead returned from WhatsApp and moved into negotiation.",
    transcriptPreview: "Discussion focused on final pricing and payment sequence.",
    whatsappEvents: ["Re-engagement link clicked", "Sales handover prepared"],
  },
]

export default function TenantLeadsPage() {
  const [query, setQuery] = useState("")
  const [rows, setRows] = useState<LeadRow[]>([])
  const [selectedLead, setSelectedLead] = useState<LeadRow | null>(null)
  const [avatarFilter, setAvatarFilter] = useState<string>("all")

  useEffect(() => {
    async function load() {
      const stageMap = new Map<string, LeadRow["stage"]>()
      const res = await fetch("/api/analytics/lead-pipeline?agent_id=noura").catch(() => null)
      if (res?.ok) {
        // pipeline endpoint is aggregate only; we keep per-lead mock stage defaults for POC.
      }

      setRows(
        mockLeadBase.map((lead, index) => ({
          ...lead,
          stage:
            stageMap.get(lead.id) ||
            (index % 7 === 0
              ? "RTB"
              : index % 7 === 1
                ? "Negotiating"
                : index % 7 === 2
                  ? "Contacted"
                  : index % 7 === 3
                    ? "Closed"
                    : index % 7 === 4
                      ? "New"
                      : index % 7 === 5
                        ? "Lost"
                        : "Out of Scope"),
        })),
      )
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.product.toLowerCase().includes(q) ||
        r.stage.toLowerCase().includes(q),
    )
  }, [query, rows])

  const selectedLeadSessions = useMemo(() => {
    if (!selectedLead) return []
    const sessions = mockLeadSessions
      .filter((s) => s.leadId === selectedLead.id)
      .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
    return avatarFilter === "all" ? sessions : sessions.filter((s) => s.avatarId === avatarFilter)
  }, [selectedLead, avatarFilter])

  const selectedLeadAvatarOptions = useMemo(() => {
    if (!selectedLead) return []
    const seen = new Set<string>()
    return mockLeadSessions
      .filter((s) => s.leadId === selectedLead.id)
      .filter((s) => {
        if (seen.has(s.avatarId)) return false
        seen.add(s.avatarId)
        return true
      })
  }, [selectedLead])

  return (
    <div className="flex min-h-screen bg-background">
      <main className={`flex-1 flex flex-col transition-all duration-300 ${selectedLead ? "mr-[430px]" : ""}`}>
        <Header />
        <PortalNav area="tenant" />

        <div className="flex-1 p-8 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Lead Activity</h1>
            <p className="text-muted-foreground">
              A lead is a person/account in CRM. A lead can have multiple sessions over time.
            </p>
          </div>

          <Card className="p-4 bg-muted/20 border-border">
            <p className="text-sm text-foreground">
              Use this page for CRM lead lifecycle. Use <span className="font-semibold">Sessions</span> page for each individual conversation instance.
            </p>
          </Card>

          <div className="max-w-sm">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search lead, email, product, or stage..."
              className="bg-card border-border"
            />
          </div>

          <Card className="p-6 bg-card border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{row.age}</TableCell>
                    <TableCell>{row.phone}</TableCell>
                    <TableCell>{row.product}</TableCell>
                    <TableCell>{row.budget}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{row.stage}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedLead(row)
                          setAvatarFilter("all")
                        }}
                      >
                        View Session Detail
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
          selectedLead ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {selectedLead && (
          <div className="h-full flex flex-col">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Lead Detail</h2>
                <p className="text-xs text-muted-foreground">{selectedLead.name}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedLead(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{selectedLead.stage}</Badge>
                <Badge variant="outline">{selectedLead.product}</Badge>
              </div>
              <Card className="p-4 border-border">
                <p className="text-xs text-muted-foreground mb-1">Profile</p>
                <p className="text-sm text-foreground">Email: {selectedLead.email}</p>
                <p className="text-sm text-foreground">Age: {selectedLead.age}</p>
                <p className="text-sm text-foreground">Phone: {selectedLead.phone}</p>
                <p className="text-sm text-foreground">Budget: {selectedLead.budget}</p>
              </Card>

              <Card className="p-4 border-border space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">Lead Journey Sessions</p>
                    <p className="text-xs text-muted-foreground">
                      A single lead can have multiple sessions over time across different avatars.
                    </p>
                  </div>
                  <Badge variant="outline">{selectedLeadSessions.length} sessions</Badge>
                </div>

                <div className="max-w-[220px]">
                  <Select value={avatarFilter} onValueChange={setAvatarFilter}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Filter by avatar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All avatars</SelectItem>
                      {selectedLeadAvatarOptions.map((avatar) => (
                        <SelectItem key={avatar.avatarId} value={avatar.avatarId}>
                          {avatar.avatarName}
                          {avatar.avatarDeleted ? " (Deleted)" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedLeadSessions.length === 0 ? (
                  <div className="rounded-lg border border-border bg-muted/20 p-3 text-sm text-muted-foreground">
                    No sessions found for this lead under the selected avatar filter.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedLeadSessions.map((session) => (
                      <div key={session.id} className="rounded-lg border border-border bg-muted/20 p-3 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline">{session.startedAt}</Badge>
                          <Badge variant="outline">Duration: {session.duration}</Badge>
                          <Badge variant="outline">Stage: {session.stageAtSession}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Avatar: <span className="text-foreground font-medium">{session.avatarName}</span>
                          {session.avatarDeleted ? (
                            <span className="ml-2 inline-flex rounded border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-[10px] text-amber-700">
                              Deleted avatar (history preserved)
                            </span>
                          ) : null}
                        </p>
                        <p className="text-sm text-foreground">{session.summary}</p>
                        <p className="text-xs text-muted-foreground">Transcript: {session.transcriptPreview}</p>
                        {session.whatsappEvents.length > 0 ? (
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-foreground">WhatsApp timeline</p>
                            {session.whatsappEvents.map((evt) => (
                              <p key={`${session.id}-${evt}`} className="text-xs text-muted-foreground">
                                - {evt}
                              </p>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}
      </aside>
    </div>
  )
}

