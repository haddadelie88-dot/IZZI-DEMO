"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Header } from "@/components/admin/header"
import { PortalNav } from "@/components/admin/portal-nav"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type LeadStage = "OPEN" | "RTB" | "OFF_TOPIC" | "CONTACTED" | "NEGOTIATING" | "CLOSED" | "LOST"
type LeadRow = {
  id: string
  name: string
  email: string
  age: number
  phone: string
  product: string
  budget: string
  stage: LeadStage
}
type JourneyNode = {
  id: string
  kind: "call" | "whatsapp" | "crm" | "postsale"
  timestamp: string
  title: string
  stage?: LeadStage
  detail: string
}
type LeadJourney = {
  leadId: string
  avatarId: string
  avatarName: string
  nodes: JourneyNode[]
}

const mockLeadBase: Omit<LeadRow, "stage">[] = [
  { id: "1", name: "Ahmed Al-Rashid", email: "ahmed.alrashid@email.com", age: 39, phone: "+971-50-123-4567", product: "Luxury Villa", budget: "8M - 12M AED" },
  { id: "2", name: "Maria Santos", email: "maria.santos@email.com", age: 34, phone: "+971-55-987-6543", product: "Apartment", budget: "3M - 5M AED" },
  { id: "3", name: "James Wilson", email: "james.wilson@company.com", age: 44, phone: "+971-52-111-9834", product: "Commercial Space", budget: "4M - 7M AED" },
  { id: "4", name: "Noor Al-Fahim", email: "noor.alfahim@email.com", age: 31, phone: "+971-54-220-9911", product: "Waterfront Apartment", budget: "5M - 7M AED" },
  { id: "5", name: "Khaled Ibrahim", email: "khaled.ibrahim@email.com", age: 42, phone: "+971-58-772-1150", product: "Townhouse", budget: "2.8M - 4.2M AED" },
  { id: "6", name: "Rania Mahmoud", email: "rania.mahmoud@email.com", age: 37, phone: "+971-56-336-7804", product: "Penthouse", budget: "9M - 14M AED" },
  { id: "7", name: "Yousef Darwish", email: "yousef.darwish@email.com", age: 29, phone: "+971-52-419-6320", product: "Apartment", budget: "1.6M - 2.4M AED" },
  { id: "8", name: "Sara Al-Mutairi", email: "sara.mutairi@email.com", age: 35, phone: "+971-50-889-2041", product: "Villa", budget: "7M - 10M AED" },
  { id: "9", name: "Hassan Malik", email: "hassan.malik@email.com", age: 46, phone: "+971-55-630-7781", product: "Commercial Unit", budget: "6M - 8M AED" },
  { id: "10", name: "Dina Farouk", email: "dina.farouk@email.com", age: 33, phone: "+971-57-194-5117", product: "Family Villa", budget: "4.5M - 6.5M AED" },
  { id: "11", name: "Omar Qasem", email: "omar.qasem@email.com", age: 40, phone: "+971-59-784-2240", product: "Apartment", budget: "2.2M - 3.3M AED" },
  { id: "12", name: "Leila Haddad", email: "leila.haddad@email.com", age: 38, phone: "+971-53-442-6675", product: "Luxury Villa", budget: "10M - 15M AED" },
]

const mockLeadJourneys: Record<string, LeadJourney> = {
  "1": {
    leadId: "1",
    avatarId: "2",
    avatarName: "Noura",
    nodes: [
      { id: "1-n1", kind: "call", timestamp: "2026-03-09T10:30:00.000Z", title: "First IZZI Call", stage: "OPEN", detail: "Lead explored premium inventory and shared budget/timeline." },
      { id: "1-n2", kind: "whatsapp", timestamp: "2026-03-09T11:00:00.000Z", title: "WhatsApp #1 Sent", detail: "30-min follow-up with shortlist and resume link." },
      { id: "1-n3", kind: "whatsapp", timestamp: "2026-03-09T11:25:00.000Z", title: "Re-engagement Link Clicked", detail: "Lead resumed via contextual link." },
      { id: "1-n4", kind: "call", timestamp: "2026-03-10T13:10:00.000Z", title: "Second IZZI Call", stage: "RTB", detail: "Intent score crossed threshold and lead moved to RTB." },
      { id: "1-n5", kind: "crm", timestamp: "2026-03-11T09:45:00.000Z", title: "Salesforce Webhook", stage: "NEGOTIATING", detail: "Agent marked lead as negotiating." },
      { id: "1-n6", kind: "crm", timestamp: "2026-03-12T16:30:00.000Z", title: "Salesforce Webhook", stage: "CLOSED", detail: "Deal closed by sales team." },
      { id: "1-n7", kind: "postsale", timestamp: "2026-03-12T16:35:00.000Z", title: "Post-Sale Activated", detail: "Thank-you WA sent, payment reminders and construction updates enabled." },
    ],
  },
  "2": {
    leadId: "2",
    avatarId: "2",
    avatarName: "Noura",
    nodes: [
      { id: "2-n1", kind: "call", timestamp: "2026-03-08T11:10:00.000Z", title: "First IZZI Call", stage: "OPEN", detail: "Initial inquiry captured as OPEN." },
      { id: "2-n2", kind: "whatsapp", timestamp: "2026-03-08T11:40:00.000Z", title: "WhatsApp #1 Sent", detail: "Follow-up sent with re-entry link." },
      { id: "2-n3", kind: "call", timestamp: "2026-03-10T14:40:00.000Z", title: "Second IZZI Call", stage: "CONTACTED", detail: "Still evaluating, did not reach RTB." },
      { id: "2-n4", kind: "crm", timestamp: "2026-03-11T10:10:00.000Z", title: "Salesforce Webhook", stage: "NEGOTIATING", detail: "Agent moved lead into negotiation pipeline." },
    ],
  },
  "3": {
    leadId: "3",
    avatarId: "2",
    avatarName: "Noura",
    nodes: [
      { id: "3-n1", kind: "call", timestamp: "2026-03-10T09:05:00.000Z", title: "First IZZI Call", stage: "OFF_TOPIC", detail: "Topic guard triggered, lead marked OFF_TOPIC terminal." },
    ],
  },
  "4": {
    leadId: "4",
    avatarId: "2",
    avatarName: "Noura",
    nodes: [
      { id: "4-n1", kind: "call", timestamp: "2026-03-07T09:20:00.000Z", title: "First IZZI Call", stage: "OPEN", detail: "Lead created and entered automation flow." },
      { id: "4-n2", kind: "whatsapp", timestamp: "2026-03-07T09:50:00.000Z", title: "WhatsApp #1 Sent", detail: "No click in open-to-lost window." },
      { id: "4-n3", kind: "whatsapp", timestamp: "2026-03-14T09:50:00.000Z", title: "Day-X Re-engagement Sent", detail: "Second attempt message with fresh listings." },
      { id: "4-n4", kind: "crm", timestamp: "2026-03-17T09:50:00.000Z", title: "Automation Transition", stage: "LOST", detail: "No response after reattempt; lead marked LOST terminal." },
    ],
  },
}

export default function TenantLeadsPage() {
  const searchParams = useSearchParams()
  const tenantId = searchParams.get("tenantId") || "dar-global"
  const [query, setQuery] = useState("")
  const [rows, setRows] = useState<LeadRow[]>([])
  const [selectedLead, setSelectedLead] = useState<LeadRow | null>(null)
  const [selectedJourney, setSelectedJourney] = useState<LeadJourney | null>(null)
  const [journeyOpen, setJourneyOpen] = useState(false)
  const [journeyLoading, setJourneyLoading] = useState(false)

  const stageLabel = (stage: LeadStage) => (stage === "OFF_TOPIC" ? "OFF TOPIC" : stage)

  useEffect(() => {
    async function load() {
      const stageMap = new Map<string, LeadStage>()
      const leadsRes = await fetch(`/api/leads?tenantId=${encodeURIComponent(tenantId)}`).catch(() => null)
      if (leadsRes?.ok) {
        const leadRows = (await leadsRes.json().catch(() => [])) as { id: string; crmStage: LeadStage }[]
        leadRows.forEach((r) => stageMap.set(r.id, r.crmStage))
      }
      setRows(
        mockLeadBase.map((lead, index) => ({
          ...lead,
          stage:
            stageMap.get(lead.id) ||
            (index % 7 === 0
              ? "RTB"
              : index % 7 === 1
                ? "NEGOTIATING"
                : index % 7 === 2
                  ? "CONTACTED"
                  : index % 7 === 3
                    ? "CLOSED"
                    : index % 7 === 4
                      ? "OPEN"
                      : index % 7 === 5
                        ? "LOST"
                        : "OFF_TOPIC"),
        })),
      )
    }
    load()
  }, [tenantId])

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

  const openJourney = async (lead: LeadRow) => {
    setSelectedLead(lead)
    setJourneyLoading(true)
    setJourneyOpen(true)

    const res = await fetch(`/api/leads/${encodeURIComponent(lead.id)}?tenantId=${encodeURIComponent(tenantId)}`).catch(
      () => null,
    )
    if (res?.ok) {
      const detail = (await res.json().catch(() => null)) as any
      if (detail) {
        const nodes: JourneyNode[] = (detail.interactions || []).map((it: any) => {
          if (it.type === "IZZI_CALL") {
            return {
              id: it.id,
              kind: "call",
              timestamp: it.startedAt,
              title: `Call #${it.interactionIndex || 1}`,
              stage: it.readyToBuySignal ? "RTB" : undefined,
              detail: it.summary || "Call interaction captured.",
            }
          }
          if (it.type === "WHATSAPP") {
            return {
              id: it.id,
              kind: "whatsapp",
              timestamp: it.startedAt,
              title: `${it.waEventType || "WhatsApp Event"} (${it.waStatus || "SENT"})`,
              detail: it.messagePreview || "WhatsApp interaction logged.",
            }
          }
          return { id: it.id, kind: "crm", timestamp: it.startedAt, title: "Lifecycle Update", detail: "CRM lifecycle event." }
        })

        if (`${detail.crmStage || ""}`.toUpperCase() === "CLOSED") {
          nodes.push({
            id: `${detail.id}-postsale`,
            kind: "postsale",
            timestamp: new Date().toISOString(),
            title: "Post-Sale Activated",
            detail: "Deal closed thank-you sent and post-sale engagement is active.",
          })
        }

        setSelectedJourney({
          leadId: detail.id,
          avatarId: detail.avatarId || "2",
          avatarName: detail.avatarName || "Noura",
          nodes: nodes.sort((a, b) => a.timestamp.localeCompare(b.timestamp)),
        })
        setJourneyLoading(false)
        return
      }
    }

    setSelectedJourney(mockLeadJourneys[lead.id] || null)
    setJourneyLoading(false)
  }

  return (
    <div className="flex min-h-screen bg-background">
      <main className="flex-1 flex flex-col">
        <Header />
        <PortalNav area="tenant" />

        <div className="flex-1 p-8 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Lead Activity</h1>
            <p className="text-muted-foreground">
              A lead is a person/account in CRM. A lead can have multiple interactions across the full funnel.
            </p>
          </div>

          <Card className="p-4 bg-muted/20 border-border">
            <p className="text-sm text-foreground">
              Click <span className="font-semibold">See Journey Details</span> to view the full path from first call to post-sale.
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
                      <Badge variant="outline">{stageLabel(row.stage)}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => openJourney(row)}>
                        See Journey Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      </main>

      <Dialog open={journeyOpen} onOpenChange={setJourneyOpen}>
        <DialogContent className="w-[98vw] sm:max-w-[96vw] xl:max-w-[1400px] h-[92vh] overflow-hidden p-0">
          <div className="flex h-full min-h-0 flex-col">
            <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
              <DialogTitle>Lead Journey Path</DialogTitle>
              <DialogDescription>
                Full lifecycle path from first IZZI interaction to closure and post-sale.
              </DialogDescription>
            </DialogHeader>

            {journeyLoading ? (
              <div className="flex flex-1 items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : selectedLead && selectedJourney ? (
              <div className="flex flex-1 min-h-0 flex-col p-6 gap-4">
                <Card className="p-4 border-border">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-6">
                    <div className="xl:col-span-2 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{selectedLead.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{selectedLead.email}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="text-sm text-foreground truncate">{selectedLead.phone}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Avatar</p>
                      <p className="text-sm text-foreground truncate">{selectedJourney.avatarName}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Product</p>
                      <p className="text-sm text-foreground truncate">{selectedLead.product}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Events</p>
                      <p className="text-sm text-foreground">{selectedJourney.nodes.length}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="outline">{stageLabel(selectedLead.stage)}</Badge>
                    <Badge variant="outline">{selectedLead.budget}</Badge>
                  </div>
                </Card>

                <Card className="flex-1 min-h-0 p-5 border-border overflow-hidden">
                  <div className="h-full overflow-y-auto pr-2">
                    <div className="space-y-5">
                      {selectedJourney.nodes.map((node, index) => (
                        <div key={node.id} className="relative pl-8">
                          {index !== selectedJourney.nodes.length - 1 ? (
                            <span className="absolute left-[9px] top-4 h-[calc(100%+12px)] w-px bg-border" />
                          ) : null}
                          <span className="absolute left-0 top-1.5 h-[18px] w-[18px] rounded-full border border-border bg-background" />
                          <div className="space-y-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-base font-medium text-foreground break-words">{node.title}</p>
                              <Badge variant="outline">{node.kind.toUpperCase()}</Badge>
                              {node.stage ? <Badge variant="outline">{stageLabel(node.stage)}</Badge> : null}
                            </div>
                            <p className="text-xs text-muted-foreground">{new Date(node.timestamp).toLocaleString()}</p>
                            <p className="text-sm text-foreground break-words">{node.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>
            ) : (
              <div className="flex-1 p-6 text-sm text-muted-foreground">No journey data available for this lead.</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

