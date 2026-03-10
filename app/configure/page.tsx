"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Upload, Share2, Mic } from "lucide-react"
import { AvatarSidebar, TenantAvatar } from "@/components/admin/avatar-sidebar"
import { Header } from "@/components/admin/header"
import { AvatarSelectionModal, AvatarOption } from "@/components/admin/avatar-selection-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Available avatar templates to choose from
const availableAvatarTemplates: AvatarOption[] = [
  {
    id: "template-1",
    name: "Sarah",
    role: "Professional Business Agent",
    industry: "Corporate",
    imageUrl: "/avatars/sarah.png",
  },
  {
    id: "template-2",
    name: "Noura",
    role: "Professional Real Estate Agent",
    industry: "Real Estate",
    imageUrl: "/avatars/noura.jpeg",
  },
]

const industries = [
  "Real Estate",
  "Healthcare",
  "Corporate",
  "Retail",
  "Finance",
  "Technology",
]

const languages = [
  "English",
  "Arabic",
  "English & Arabic",
]

const interactionModes = [
  "Audio Only",
  "Video & Audio",
  "Text Only",
]

const propertyTypes = ["Villa", "Apartment", "Commercial", "Penthouse"] as const
const purchaseTimelines = ["0–3 months", "3–6 months", "6–12 months", "12+ months"] as const
const financingTypes = ["Cash", "Mortgage", "Undecided"] as const

type AgentConfigPayload = {
  avatarId: string
  industry?: string
  leadQualification?: {
    budgetMin?: string
    budgetMax?: string
    locationPreference?: string
    propertyType?: (typeof propertyTypes)[number]
    purchaseTimeline?: (typeof purchaseTimelines)[number]
    financingType?: (typeof financingTypes)[number]
  }
  preCall?: {
    categoryEnabled?: boolean
    categories?: string[]
  }
}

type WhatsappProvider = "twilio" | "360dialog"
type WhatsappConfigPayload = {
  agentId: string
  followUpEnabled: boolean
  followUpDelayMinutes: number
  followUpMessageTemplate: string
  lostReengagementEnabled: boolean
  lostReengagementDelayDays: number
  lostReengagementMessageTemplate: string
  whatsappProvider: WhatsappProvider
  whatsappApiKey: string
  whatsappFromNumber: string
}

type PostSaleConfigPayload = {
  agentId: string
  thankYouEnabled: boolean
  thankYouMessageTemplate: string
  paymentRemindersEnabled: boolean
  paymentReminderDaysBefore: number[]
  paymentReminderTemplate: string
  constructionUpdatesEnabled: boolean
  constructionUpdateTemplate: string
}

export default function ConfigureAvatar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = searchParams.get("mode")
  
  const [avatarModalOpen, setAvatarModalOpen] = useState(mode === "add")
  const [isDraftMode, setIsDraftMode] = useState(mode === "add")
  
  // Client's avatars (multiple avatars per tenant)
  const [tenantAvatars, setTenantAvatars] = useState<TenantAvatar[]>([
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
  ])
  
  const [selectedTenantAvatar, setSelectedTenantAvatar] = useState<TenantAvatar | null>(
    tenantAvatars[0] || null
  )
  
  const selectedAvatarId = selectedTenantAvatar?.id || ""

  const [formData, setFormData] = useState({
    industry: "Healthcare",
    openingPhrase: "test",
    knowledgeBase: "test",
    goals: "1. Qualify leads based on budget\n2. Schedule property viewings",
    agentName: "sarah",
    language: "English",
    interaction: "Audio Only",
    enableCallTimer: true,
    totalMonthlyMinutes: "5000",
    minutesPerCall: "",
    leadQualification: {
      budgetMin: "",
      budgetMax: "",
      locationPreference: "",
      propertyType: "" as "" | (typeof propertyTypes)[number],
      purchaseTimeline: "" as "" | (typeof purchaseTimelines)[number],
      financingType: "" as "" | (typeof financingTypes)[number],
    },
    preCall: {
      categoryEnabled: false,
      categories: ["Villa", "Apartment", "Commercial"],
    },
  })

  const isRealEstate = useMemo(() => formData.industry === "Real Estate", [formData.industry])
  const [newCategory, setNewCategory] = useState("")
  const [loadingConfig, setLoadingConfig] = useState(false)
  const [whatsappConfig, setWhatsappConfig] = useState<WhatsappConfigPayload>({
    agentId: "",
    followUpEnabled: true,
    followUpDelayMinutes: 30,
    followUpMessageTemplate:
      "Hi {{lead_name}}, thanks for your time today. Based on your interest in {{property_type}} around {{location}} with a budget of {{budget}}, here’s a link to continue: {{izzi_link}}",
    lostReengagementEnabled: true,
    lostReengagementDelayDays: 7,
    lostReengagementMessageTemplate:
      "Hi {{lead_name}}, just checking in. We have new listings: {{new_listings}}. Want me to share options? {{izzi_link}}",
    whatsappProvider: "twilio",
    whatsappApiKey: "",
    whatsappFromNumber: "",
  })
  const [testToNumber, setTestToNumber] = useState("")
  const [whatsappTestResult, setWhatsappTestResult] = useState<null | { ok: boolean; message: string }>(null)
  const [postSaleConfig, setPostSaleConfig] = useState<PostSaleConfigPayload>({
    agentId: "",
    thankYouEnabled: true,
    thankYouMessageTemplate:
      "Hi {{lead_name}}, thank you for choosing us for your {{property_type}}. We’re excited to welcome you to {{property_name}}.",
    paymentRemindersEnabled: true,
    paymentReminderDaysBefore: [7, 3, 1],
    paymentReminderTemplate:
      "Hi {{lead_name}}, reminder: {{amount}} is due on {{due_date}}. {{payment_instructions}}",
    constructionUpdatesEnabled: true,
    constructionUpdateTemplate:
      "Hi {{lead_name}}, construction update for {{project_name}}: {{milestone}} ({{completion_percentage}}% complete).",
  })
  const [newReminderDay, setNewReminderDay] = useState("")

  const handleSave = () => {
    if (!selectedAvatarId) return

    const payload: AgentConfigPayload = {
      avatarId: selectedAvatarId,
      industry: formData.industry,
      leadQualification: isRealEstate
        ? {
            budgetMin: formData.leadQualification.budgetMin,
            budgetMax: formData.leadQualification.budgetMax,
            locationPreference: formData.leadQualification.locationPreference,
            propertyType: formData.leadQualification.propertyType || undefined,
            purchaseTimeline: formData.leadQualification.purchaseTimeline || undefined,
            financingType: formData.leadQualification.financingType || undefined,
          }
        : undefined,
      preCall: isRealEstate
        ? {
            categoryEnabled: formData.preCall.categoryEnabled,
            categories: formData.preCall.categories,
          }
        : undefined,
    }

    fetch(`/api/agent-config`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => {
      // POC: best-effort persistence, UI still stays responsive
    })

    if (isRealEstate) {
      fetch(`/api/whatsapp/config`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...whatsappConfig, agentId: selectedAvatarId }),
      }).catch(() => {
        // best-effort
      })

      fetch(`/api/postsale/config`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...postSaleConfig, agentId: selectedAvatarId }),
      }).catch(() => {
        // best-effort
      })
    }

    console.log("Saving configuration:", {
      ...formData,
      avatar: selectedTenantAvatar,
      allAvatars: tenantAvatars,
    })
    setIsDraftMode(false)
    router.push("/")
  }

  useEffect(() => {
    if (!selectedAvatarId) return
    let cancelled = false

    async function load() {
      setLoadingConfig(true)
      try {
        const res = await fetch(`/api/agent-config?avatarId=${encodeURIComponent(selectedAvatarId)}`)
        if (!res.ok) return
        const cfg = (await res.json()) as AgentConfigPayload
        if (cancelled) return

        setFormData((prev) => ({
          ...prev,
          industry: cfg.industry || prev.industry,
          leadQualification: {
            ...prev.leadQualification,
            ...cfg.leadQualification,
            propertyType: (cfg.leadQualification?.propertyType as any) || prev.leadQualification.propertyType,
            purchaseTimeline:
              (cfg.leadQualification?.purchaseTimeline as any) || prev.leadQualification.purchaseTimeline,
            financingType: (cfg.leadQualification?.financingType as any) || prev.leadQualification.financingType,
          },
          preCall: {
            ...prev.preCall,
            categoryEnabled: cfg.preCall?.categoryEnabled ?? prev.preCall.categoryEnabled,
            categories: cfg.preCall?.categories ?? prev.preCall.categories,
          },
        }))
      } finally {
        if (!cancelled) setLoadingConfig(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [selectedAvatarId])

  useEffect(() => {
    if (!selectedAvatarId) return
    if (formData.industry !== "Real Estate") return
    let cancelled = false

    async function loadWhatsApp() {
      setWhatsappTestResult(null)
      const res = await fetch(`/api/whatsapp/config?agentId=${encodeURIComponent(selectedAvatarId)}`).catch(
        () => null,
      )
      if (!res || !res.ok) return
      const cfg = (await res.json().catch(() => null)) as any
      if (cancelled || !cfg) return

      setWhatsappConfig((prev) => ({
        agentId: selectedAvatarId,
        followUpEnabled: Boolean(cfg.followUpEnabled),
        followUpDelayMinutes: Number(cfg.followUpDelayMinutes ?? 30),
        followUpMessageTemplate: cfg.followUpMessageTemplate || prev.followUpMessageTemplate,
        lostReengagementEnabled: Boolean(cfg.lostReengagementEnabled),
        lostReengagementDelayDays: Number(cfg.lostReengagementDelayDays ?? 7),
        lostReengagementMessageTemplate: cfg.lostReengagementMessageTemplate || prev.lostReengagementMessageTemplate,
        whatsappProvider: (cfg.whatsappProvider as WhatsappProvider) || "twilio",
        whatsappApiKey: cfg.whatsappApiKey || "",
        whatsappFromNumber: cfg.whatsappFromNumber || "",
      }))
    }

    loadWhatsApp()
    return () => {
      cancelled = true
    }
  }, [selectedAvatarId, formData.industry])

  useEffect(() => {
    if (!selectedAvatarId) return
    if (formData.industry !== "Real Estate") return
    let cancelled = false

    async function loadPostSale() {
      const res = await fetch(`/api/postsale/config?agentId=${encodeURIComponent(selectedAvatarId)}`).catch(
        () => null,
      )
      if (!res || !res.ok) return
      const cfg = (await res.json().catch(() => null)) as any
      if (cancelled || !cfg) return

      setPostSaleConfig((prev) => ({
        agentId: selectedAvatarId,
        thankYouEnabled: Boolean(cfg.thankYouEnabled),
        thankYouMessageTemplate: cfg.thankYouMessageTemplate || prev.thankYouMessageTemplate,
        paymentRemindersEnabled: Boolean(cfg.paymentRemindersEnabled),
        paymentReminderDaysBefore: Array.isArray(cfg.paymentReminderDaysBefore)
          ? cfg.paymentReminderDaysBefore
          : prev.paymentReminderDaysBefore,
        paymentReminderTemplate: cfg.paymentReminderTemplate || prev.paymentReminderTemplate,
        constructionUpdatesEnabled: Boolean(cfg.constructionUpdatesEnabled),
        constructionUpdateTemplate: cfg.constructionUpdateTemplate || prev.constructionUpdateTemplate,
      }))
    }

    loadPostSale()
    return () => {
      cancelled = true
    }
  }, [selectedAvatarId, formData.industry])

  const renderTemplatePreview = (tpl: string) => {
    const vars: Record<string, string> = {
      lead_name: "Ahmed",
      property_type: "Villa",
      location: "Palm Jumeirah",
      budget: "8–12M AED",
      izzi_link: "https://izzi.example/re-engage",
      new_listings: "3 new villas in Palm Jumeirah",
      property_name: "DarGlobal_Residences",
      amount: "250,000 AED",
      due_date: "2026-04-01",
      payment_instructions: "Please use the bank transfer details in your contract.",
      project_name: "DarGlobal_Residences",
      milestone: "Facade completion",
      completion_percentage: "65",
    }
    return tpl.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, key) => vars[key] ?? match)
  }

  const handleAvatarTemplateSelect = (template: AvatarOption) => {
    // Create a new tenant avatar from the template
    const newAvatar: TenantAvatar = {
      id: Date.now().toString(),
      name: template.name,
      imageUrl: template.imageUrl,
      industry: template.industry,
      isPrimary: tenantAvatars.length === 0,
      callCount: 0,
    }
    
    setTenantAvatars([...tenantAvatars, newAvatar])
    setSelectedTenantAvatar(newAvatar)
    setFormData((prev) => ({ ...prev, agentName: template.name.toLowerCase() }))
    setIsDraftMode(true) // Enter draft mode for configuration
    setAvatarModalOpen(false)
  }

  const handleSelectTenantAvatar = (avatar: TenantAvatar) => {
    setSelectedTenantAvatar(avatar)
    setFormData((prev) => ({ ...prev, agentName: avatar.name }))
  }

  const handleDeleteTenantAvatar = (avatar: TenantAvatar) => {
    const updated = tenantAvatars.filter(a => a.id !== avatar.id)
    setTenantAvatars(updated)
    if (selectedTenantAvatar?.id === avatar.id) {
      setSelectedTenantAvatar(updated[0] || null)
    }
  }

  const handleViewCallHistory = (avatar: TenantAvatar) => {
    router.push(`/configure/client/call-history?avatarId=${avatar.id}`)
  }

  const handleViewAnalytics = (avatar: TenantAvatar) => {
    router.push(`/configure/client/analytics?avatarId=${avatar.id}`)
  }

  const handleAddAvatar = () => {
    setAvatarModalOpen(true)
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AvatarSidebar
        avatars={tenantAvatars}
        selectedAvatarId={selectedTenantAvatar?.id}
        onSelectAvatar={handleSelectTenantAvatar}
        onAddAvatar={handleAddAvatar}
        onDeleteAvatar={handleDeleteTenantAvatar}
        onViewCallHistory={handleViewCallHistory}
        onViewAnalytics={handleViewAnalytics}
      />
      
      <main className="flex-1 flex flex-col">
        <Header showSave onSave={handleSave} />
        
        <div className="flex-1 p-8">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Configure Avatar
              {isDraftMode && (
                <span className="ml-3 text-sm font-normal text-primary bg-primary/10 px-2 py-1 rounded">
                  Draft Mode
                </span>
              )}
            </h1>
            <p className="text-muted-foreground">
              Set up your AI avatar&apos;s knowledge, personality, and interaction style
            </p>
          </div>

          {/* Back Button */}
          <Button
            variant="outline"
            onClick={() => router.push("/")}
            className="mb-8 border-foreground text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {selectedTenantAvatar ? (
            <div className="flex gap-8">
              {/* Configuration Form */}
              <div className="flex-1 max-w-2xl">
                <div className="bg-card rounded-lg p-6 border border-border space-y-6">
                  {/* Industry */}
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">
                      Industry
                    </Label>
                    <Select
                      value={formData.industry}
                      onValueChange={(value) => setFormData({ ...formData, industry: value })}
                    >
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue placeholder="Select Industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map((ind) => (
                          <SelectItem key={ind} value={ind}>
                            {ind}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Opening Phrase */}
                  <div className="space-y-2">
                    <Label htmlFor="openingPhrase" className="text-foreground font-medium">
                      Opening Phrase
                    </Label>
                    <Textarea
                      id="openingPhrase"
                      value={formData.openingPhrase}
                      onChange={(e) => setFormData({ ...formData, openingPhrase: e.target.value })}
                      placeholder="Enter the opening phrase for your avatar..."
                      className="min-h-[80px] bg-background border-border resize-none"
                    />
                  </div>

                  {/* Knowledge Base */}
                  <div className="space-y-2">
                    <Label htmlFor="knowledgeBase" className="text-foreground font-medium">
                      Knowledge base
                    </Label>
                    <Textarea
                      id="knowledgeBase"
                      value={formData.knowledgeBase}
                      onChange={(e) => setFormData({ ...formData, knowledgeBase: e.target.value })}
                      placeholder="Add text that helps your Avatar understand context and nuances of your business."
                      className="min-h-[80px] bg-background border-border resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                      {formData.knowledgeBase.length} / 5000 characters
                    </p>
                  </div>

                  {/* External Resources */}
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">
                      Add External Resources
                    </Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                      <div className="flex justify-center mb-4">
                        <div className="p-3 bg-muted rounded-full">
                          <Upload className="h-6 w-6 text-muted-foreground" />
                        </div>
                      </div>
                      <p className="text-sm text-primary mb-2">
                        Upload or link external data your Avatar can use for reasoning and information retrieval.
                      </p>
                      <p className="text-xs text-muted-foreground mb-1">Examples:</p>
                      <p className="text-xs text-muted-foreground">
                        - Structured datasets (e.g., property listings, pricing tables, FAQs, product catalogs)
                      </p>
                      <p className="text-xs text-muted-foreground">
                        - Unstructured content (e.g., guides, policy docs, theoretical papers)
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Supported file types: CSV, PDF (max 10 MB)
                      </p>
                    </div>
                  </div>

                  {/* Goals */}
                  <div className="space-y-2">
                    <Label htmlFor="goals" className="text-foreground font-medium">
                      Set Goals
                    </Label>
                    <Textarea
                      id="goals"
                      value={formData.goals}
                      onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                      placeholder="1. Qualify leads based on budget
2. Schedule property viewings"
                      className="min-h-[80px] bg-background border-border resize-none"
                    />
                  </div>

                  {/* Real Estate persona config */}
                  {isRealEstate && (
                    <div className="space-y-6 pt-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            Real Estate Persona Settings
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Configure what IZZI extracts from conversations and how the pre-call form behaves.
                          </p>
                        </div>
                        {loadingConfig && (
                          <span className="text-xs text-muted-foreground">Loading saved config…</span>
                        )}
                      </div>

                      {/* Lead Qualification Fields */}
                      <div className="rounded-lg border border-border bg-background p-4 space-y-4">
                        <div>
                          <h4 className="font-medium text-foreground">Lead Qualification Fields</h4>
                          <p className="text-sm text-muted-foreground">
                            These fields configure what will be extracted and pushed to CRM.
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-foreground font-medium">Budget Range (Min)</Label>
                            <Input
                              value={formData.leadQualification.budgetMin}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  leadQualification: {
                                    ...formData.leadQualification,
                                    budgetMin: e.target.value,
                                  },
                                })
                              }
                              placeholder="e.g. 8M AED"
                              className="bg-card border-border"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-foreground font-medium">Budget Range (Max)</Label>
                            <Input
                              value={formData.leadQualification.budgetMax}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  leadQualification: {
                                    ...formData.leadQualification,
                                    budgetMax: e.target.value,
                                  },
                                })
                              }
                              placeholder="e.g. 12M AED"
                              className="bg-card border-border"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-foreground font-medium">Location Preference</Label>
                          <Input
                            value={formData.leadQualification.locationPreference}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                leadQualification: {
                                  ...formData.leadQualification,
                                  locationPreference: e.target.value,
                                },
                              })
                            }
                            placeholder="e.g. Palm Jumeirah, Downtown Dubai"
                            className="bg-card border-border"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-foreground font-medium">Property Type</Label>
                            <Select
                              value={formData.leadQualification.propertyType}
                              onValueChange={(value) =>
                                setFormData({
                                  ...formData,
                                  leadQualification: {
                                    ...formData.leadQualification,
                                    propertyType: value as any,
                                  },
                                })
                              }
                            >
                              <SelectTrigger className="bg-card border-border">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                {propertyTypes.map((t) => (
                                  <SelectItem key={t} value={t}>
                                    {t}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-foreground font-medium">Purchase Timeline</Label>
                            <Select
                              value={formData.leadQualification.purchaseTimeline}
                              onValueChange={(value) =>
                                setFormData({
                                  ...formData,
                                  leadQualification: {
                                    ...formData.leadQualification,
                                    purchaseTimeline: value as any,
                                  },
                                })
                              }
                            >
                              <SelectTrigger className="bg-card border-border">
                                <SelectValue placeholder="Select timeline" />
                              </SelectTrigger>
                              <SelectContent>
                                {purchaseTimelines.map((t) => (
                                  <SelectItem key={t} value={t}>
                                    {t}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-foreground font-medium">Financing Type</Label>
                          <Select
                            value={formData.leadQualification.financingType}
                            onValueChange={(value) =>
                              setFormData({
                                ...formData,
                                leadQualification: {
                                  ...formData.leadQualification,
                                  financingType: value as any,
                                },
                              })
                            }
                          >
                            <SelectTrigger className="bg-card border-border">
                              <SelectValue placeholder="Select financing" />
                            </SelectTrigger>
                            <SelectContent>
                              {financingTypes.map((t) => (
                                <SelectItem key={t} value={t}>
                                  {t}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Pre-call form category selection */}
                      <div className="rounded-lg border border-border bg-background p-4 space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h4 className="font-medium text-foreground">
                              Pre-call Form: Property Category Selection
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Enable category selection and define which categories appear on the pre-call form.
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={formData.preCall.categoryEnabled}
                              onCheckedChange={(checked) =>
                                setFormData({
                                  ...formData,
                                  preCall: { ...formData.preCall, categoryEnabled: checked },
                                })
                              }
                            />
                            <span className="text-sm text-foreground">Enable</span>
                          </div>
                        </div>

                        {formData.preCall.categoryEnabled && (
                          <div className="space-y-3">
                            <div className="flex gap-2">
                              <Input
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                placeholder="Add category (e.g. Townhouse)"
                                className="bg-card border-border"
                              />
                              <Button
                                type="button"
                                className="bg-foreground text-background hover:bg-foreground/90"
                                onClick={() => {
                                  const v = newCategory.trim()
                                  if (!v) return
                                  if (formData.preCall.categories.includes(v)) return
                                  setFormData({
                                    ...formData,
                                    preCall: {
                                      ...formData.preCall,
                                      categories: [...formData.preCall.categories, v],
                                    },
                                  })
                                  setNewCategory("")
                                }}
                              >
                                Add
                              </Button>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {formData.preCall.categories.map((c) => (
                                <Badge
                                  key={c}
                                  variant="secondary"
                                  className="cursor-pointer"
                                  onClick={() =>
                                    setFormData({
                                      ...formData,
                                      preCall: {
                                        ...formData.preCall,
                                        categories: formData.preCall.categories.filter((x) => x !== c),
                                      },
                                    })
                                  }
                                  title="Click to remove"
                                >
                                  {c}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* WhatsApp Automation */}
                      <div className="rounded-lg border border-border bg-background p-4 space-y-6">
                        <div>
                          <h4 className="font-medium text-foreground">WhatsApp Automation</h4>
                          <p className="text-sm text-muted-foreground">
                            Configure post-call follow-ups and lost-lead re-engagement templates.
                          </p>
                        </div>

                        {/* Post-call follow-up */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Post-call Follow-Up</p>
                              <p className="text-sm text-muted-foreground">Send a follow-up after the call.</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={whatsappConfig.followUpEnabled}
                                onCheckedChange={(checked) =>
                                  setWhatsappConfig((p) => ({ ...p, followUpEnabled: checked }))
                                }
                              />
                              <span className="text-sm">Enable</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-foreground font-medium">Delay (minutes)</Label>
                              <Input
                                type="number"
                                value={whatsappConfig.followUpDelayMinutes}
                                onChange={(e) =>
                                  setWhatsappConfig((p) => ({
                                    ...p,
                                    followUpDelayMinutes: Number(e.target.value || 0),
                                  }))
                                }
                                className="bg-card border-border"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-foreground font-medium">Template Preview</Label>
                              <div className="rounded-md border border-border bg-muted/30 p-3 text-sm text-foreground">
                                {renderTemplatePreview(whatsappConfig.followUpMessageTemplate)}
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-foreground font-medium">
                              Message Template (variables: {"{{lead_name}} {{property_type}} {{location}} {{budget}} {{izzi_link}}"})
                            </Label>
                            <Textarea
                              value={whatsappConfig.followUpMessageTemplate}
                              onChange={(e) =>
                                setWhatsappConfig((p) => ({ ...p, followUpMessageTemplate: e.target.value }))
                              }
                              className="min-h-[100px] bg-card border-border resize-none"
                            />
                          </div>
                        </div>

                        {/* Lost re-engagement */}
                        <div className="space-y-3 pt-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Lost Lead Re-engagement</p>
                              <p className="text-sm text-muted-foreground">
                                Send a message some days after the lead is marked Lost.
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={whatsappConfig.lostReengagementEnabled}
                                onCheckedChange={(checked) =>
                                  setWhatsappConfig((p) => ({ ...p, lostReengagementEnabled: checked }))
                                }
                              />
                              <span className="text-sm">Enable</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-foreground font-medium">Delay (days)</Label>
                              <Input
                                type="number"
                                value={whatsappConfig.lostReengagementDelayDays}
                                onChange={(e) =>
                                  setWhatsappConfig((p) => ({
                                    ...p,
                                    lostReengagementDelayDays: Number(e.target.value || 0),
                                  }))
                                }
                                className="bg-card border-border"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-foreground font-medium">Template Preview</Label>
                              <div className="rounded-md border border-border bg-muted/30 p-3 text-sm text-foreground">
                                {renderTemplatePreview(whatsappConfig.lostReengagementMessageTemplate)}
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-foreground font-medium">
                              Message Template (variables: {"{{lead_name}} {{new_listings}} {{izzi_link}}"})
                            </Label>
                            <Textarea
                              value={whatsappConfig.lostReengagementMessageTemplate}
                              onChange={(e) =>
                                setWhatsappConfig((p) => ({
                                  ...p,
                                  lostReengagementMessageTemplate: e.target.value,
                                }))
                              }
                              className="min-h-[100px] bg-card border-border resize-none"
                            />
                          </div>
                        </div>

                        {/* Provider config */}
                        <div className="space-y-3 pt-2">
                          <div>
                            <p className="font-medium">Provider</p>
                            <p className="text-sm text-muted-foreground">POC: provider calls are stubbed.</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-foreground font-medium">Provider</Label>
                              <Select
                                value={whatsappConfig.whatsappProvider}
                                onValueChange={(value) =>
                                  setWhatsappConfig((p) => ({ ...p, whatsappProvider: value as WhatsappProvider }))
                                }
                              >
                                <SelectTrigger className="bg-card border-border">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="twilio">Twilio</SelectItem>
                                  <SelectItem value="360dialog">360dialog</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-foreground font-medium">From Number</Label>
                              <Input
                                value={whatsappConfig.whatsappFromNumber}
                                onChange={(e) =>
                                  setWhatsappConfig((p) => ({ ...p, whatsappFromNumber: e.target.value }))
                                }
                                placeholder="+971 50 000 0000"
                                className="bg-card border-border"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-foreground font-medium">API Key</Label>
                            <Input
                              value={whatsappConfig.whatsappApiKey}
                              onChange={(e) =>
                                setWhatsappConfig((p) => ({ ...p, whatsappApiKey: e.target.value }))
                              }
                              placeholder="••••••••"
                              className="bg-card border-border"
                              type="password"
                            />
                          </div>

                          <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
                            <div className="space-y-2">
                              <Label className="text-foreground font-medium">Test Send To</Label>
                              <Input
                                value={testToNumber}
                                onChange={(e) => setTestToNumber(e.target.value)}
                                placeholder="+971 50 123 4567"
                                className="bg-card border-border"
                              />
                            </div>
                            <Button
                              type="button"
                              className="bg-foreground text-background hover:bg-foreground/90"
                              onClick={async () => {
                                if (!selectedAvatarId) return
                                setWhatsappTestResult(null)
                                const res = await fetch(`/api/whatsapp/test-send`, {
                                  method: "POST",
                                  headers: { "content-type": "application/json" },
                                  body: JSON.stringify({
                                    agentId: selectedAvatarId,
                                    toNumber: testToNumber,
                                    message: renderTemplatePreview(whatsappConfig.followUpMessageTemplate),
                                  }),
                                }).catch(() => null)
                                const json = res ? await res.json().catch(() => null) : null
                                if (res?.ok) {
                                  setWhatsappTestResult({ ok: true, message: json?.message || "Sent." })
                                } else {
                                  setWhatsappTestResult({ ok: false, message: json?.error || "Failed." })
                                }
                              }}
                            >
                              Test Send
                            </Button>
                          </div>

                          {whatsappTestResult && (
                            <div
                              className={`rounded-lg border p-3 text-sm ${
                                whatsappTestResult.ok ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                              }`}
                            >
                              <span className={whatsappTestResult.ok ? "text-green-800" : "text-red-800"}>
                                {whatsappTestResult.message}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Post-Sale Journey */}
                      <div className="rounded-lg border border-border bg-background p-4 space-y-6">
                        <div>
                          <h4 className="font-medium text-foreground">Post-Sale Journey</h4>
                          <p className="text-sm text-muted-foreground">
                            Configure post-sale messages and reminders (visible for Closed leads).
                          </p>
                        </div>

                        {/* Thank You */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Thank You Message</p>
                              <p className="text-sm text-muted-foreground">Sent when stage changes to Closed.</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={postSaleConfig.thankYouEnabled}
                                onCheckedChange={(checked) =>
                                  setPostSaleConfig((p) => ({ ...p, thankYouEnabled: checked }))
                                }
                              />
                              <span className="text-sm">Enable</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-foreground font-medium">
                                Template (variables: {"{{lead_name}} {{property_name}} {{property_type}}"})
                              </Label>
                              <Textarea
                                value={postSaleConfig.thankYouMessageTemplate}
                                onChange={(e) =>
                                  setPostSaleConfig((p) => ({ ...p, thankYouMessageTemplate: e.target.value }))
                                }
                                className="min-h-[90px] bg-card border-border resize-none"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-foreground font-medium">Preview</Label>
                              <div className="rounded-md border border-border bg-muted/30 p-3 text-sm text-foreground">
                                {renderTemplatePreview(postSaleConfig.thankYouMessageTemplate)}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Payment reminders */}
                        <div className="space-y-3 pt-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Payment Reminders</p>
                              <p className="text-sm text-muted-foreground">
                                Schedule reminders X days before due date.
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={postSaleConfig.paymentRemindersEnabled}
                                onCheckedChange={(checked) =>
                                  setPostSaleConfig((p) => ({ ...p, paymentRemindersEnabled: checked }))
                                }
                              />
                              <span className="text-sm">Enable</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-foreground font-medium">Reminder days</Label>
                            <div className="flex gap-2">
                              <Input
                                value={newReminderDay}
                                onChange={(e) => setNewReminderDay(e.target.value)}
                                placeholder="e.g. 7"
                                className="bg-card border-border"
                              />
                              <Button
                                type="button"
                                className="bg-foreground text-background hover:bg-foreground/90"
                                onClick={() => {
                                  const n = Number(newReminderDay)
                                  if (!Number.isFinite(n) || n <= 0) return
                                  if (postSaleConfig.paymentReminderDaysBefore.includes(n)) return
                                  setPostSaleConfig((p) => ({
                                    ...p,
                                    paymentReminderDaysBefore: [...p.paymentReminderDaysBefore, n].sort((a, b) => b - a),
                                  }))
                                  setNewReminderDay("")
                                }}
                              >
                                Add
                              </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {postSaleConfig.paymentReminderDaysBefore.map((d) => (
                                <Badge
                                  key={d}
                                  variant="secondary"
                                  className="cursor-pointer"
                                  onClick={() =>
                                    setPostSaleConfig((p) => ({
                                      ...p,
                                      paymentReminderDaysBefore: p.paymentReminderDaysBefore.filter((x) => x !== d),
                                    }))
                                  }
                                  title="Click to remove"
                                >
                                  {d} days
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-foreground font-medium">
                                Template (variables: {"{{lead_name}} {{amount}} {{due_date}} {{payment_instructions}}"})
                              </Label>
                              <Textarea
                                value={postSaleConfig.paymentReminderTemplate}
                                onChange={(e) =>
                                  setPostSaleConfig((p) => ({ ...p, paymentReminderTemplate: e.target.value }))
                                }
                                className="min-h-[90px] bg-card border-border resize-none"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-foreground font-medium">Preview</Label>
                              <div className="rounded-md border border-border bg-muted/30 p-3 text-sm text-foreground">
                                {renderTemplatePreview(postSaleConfig.paymentReminderTemplate)}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Construction updates */}
                        <div className="space-y-3 pt-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Construction Updates</p>
                              <p className="text-sm text-muted-foreground">Send updates to Closed leads.</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={postSaleConfig.constructionUpdatesEnabled}
                                onCheckedChange={(checked) =>
                                  setPostSaleConfig((p) => ({ ...p, constructionUpdatesEnabled: checked }))
                                }
                              />
                              <span className="text-sm">Enable</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-foreground font-medium">
                                Template (variables: {"{{lead_name}} {{project_name}} {{milestone}} {{completion_percentage}}"})
                              </Label>
                              <Textarea
                                value={postSaleConfig.constructionUpdateTemplate}
                                onChange={(e) =>
                                  setPostSaleConfig((p) => ({ ...p, constructionUpdateTemplate: e.target.value }))
                                }
                                className="min-h-[90px] bg-card border-border resize-none"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-foreground font-medium">Preview</Label>
                              <div className="rounded-md border border-border bg-muted/30 p-3 text-sm text-foreground">
                                {renderTemplatePreview(postSaleConfig.constructionUpdateTemplate)}
                              </div>
                            </div>
                          </div>

                          {/* Broadcast panel (POC) */}
                          <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="font-medium text-foreground">Broadcast Panel (POC)</p>
                                <p className="text-sm text-muted-foreground">
                                  Demo list of closed leads. Sends a construction update event + logs it.
                                </p>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                className="border-foreground text-foreground"
                                onClick={async () => {
                                  if (!selectedAvatarId) return
                                  const leadIds = ["closed-1", "closed-2", "closed-3"]
                                  await Promise.all(
                                    leadIds.map((leadId) =>
                                      fetch(`/api/postsale/events`, {
                                        method: "POST",
                                        headers: { "content-type": "application/json" },
                                        body: JSON.stringify({
                                          agentId: selectedAvatarId,
                                          leadId,
                                          eventType: "construction_update",
                                          payload: {
                                            message: renderTemplatePreview(postSaleConfig.constructionUpdateTemplate),
                                          },
                                        }),
                                      }),
                                    ),
                                  ).catch(() => {})
                                }}
                              >
                                Broadcast to All
                              </Button>
                            </div>

                            <div className="grid gap-2">
                              {[
                                { id: "closed-1", name: "Ahmed Al-Rashid" },
                                { id: "closed-2", name: "Maria Santos" },
                                { id: "closed-3", name: "James Wilson" },
                              ].map((lead) => (
                                <div
                                  key={lead.id}
                                  className="flex items-center justify-between gap-3 rounded-md border border-border bg-background p-3"
                                >
                                  <div>
                                    <p className="font-medium text-foreground">{lead.name}</p>
                                    <p className="text-sm text-muted-foreground">Lead ID: {lead.id}</p>
                                  </div>
                                  <Button
                                    type="button"
                                    className="bg-foreground text-background hover:bg-foreground/90"
                                    onClick={() => {
                                      if (!selectedAvatarId) return
                                      fetch(`/api/postsale/events`, {
                                        method: "POST",
                                        headers: { "content-type": "application/json" },
                                        body: JSON.stringify({
                                          agentId: selectedAvatarId,
                                          leadId: lead.id,
                                          eventType: "construction_update",
                                          payload: {
                                            message: renderTemplatePreview(postSaleConfig.constructionUpdateTemplate),
                                          },
                                        }),
                                      }).catch(() => {})
                                    }}
                                  >
                                    Send Update
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Avatar Preview Panel */}
              <div className="w-80">
                <div className="bg-card rounded-lg border border-border overflow-hidden">
                  {/* Avatar Image */}
                  <div 
                    className="aspect-[4/3] bg-muted relative cursor-pointer group"
                    onClick={() => setAvatarModalOpen(true)}
                  >
                    <img
                      src={selectedTenantAvatar.imageUrl}
                      alt={selectedTenantAvatar.name}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Click to change overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <span className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Click to change avatar
                      </span>
                    </div>
                    
                    {/* Overlay buttons */}
                    <div className="absolute bottom-4 right-4 flex gap-2">
                      <button className="p-2 bg-white/80 rounded-lg hover:bg-white transition-colors">
                        <Share2 className="h-4 w-4 text-foreground" />
                      </button>
                      <button className="p-2 bg-white/80 rounded-lg hover:bg-white transition-colors">
                        <Mic className="h-4 w-4 text-foreground" />
                      </button>
                    </div>
                  </div>

                  {/* Avatar Settings */}
                  <div className="p-4 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="agentName" className="text-sm text-muted-foreground">
                        Agent Name
                      </Label>
                      <Input
                        id="agentName"
                        value={formData.agentName}
                        onChange={(e) => setFormData({ ...formData, agentName: e.target.value })}
                        className="bg-background border-border"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">
                        Language
                      </Label>
                      <Select
                        value={formData.language}
                        onValueChange={(value) => setFormData({ ...formData, language: value })}
                      >
                        <SelectTrigger className="bg-background border-border">
                          <SelectValue placeholder="Select Language" />
                        </SelectTrigger>
                        <SelectContent>
                          {languages.map((lang) => (
                            <SelectItem key={lang} value={lang}>
                              {lang}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">
                        Interaction
                      </Label>
                      <Select
                        value={formData.interaction}
                        onValueChange={(value) => setFormData({ ...formData, interaction: value })}
                      >
                        <SelectTrigger className="bg-background border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {interactionModes.map((mode) => (
                            <SelectItem key={mode} value={mode}>
                              {mode}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Call Timer Toggle */}
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">
                        Enable Call Timer
                      </Label>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={formData.enableCallTimer}
                          onCheckedChange={(checked) => 
                            setFormData({ ...formData, enableCallTimer: checked })
                          }
                        />
                        <span className="text-sm">Enable</span>
                      </div>
                    </div>

                    {/* Total Monthly Minutes */}
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">
                        Total monthly Minutes
                      </Label>
                      <Input
                        type="number"
                        value={formData.totalMonthlyMinutes}
                        onChange={(e) => setFormData({ ...formData, totalMonthlyMinutes: e.target.value })}
                        className="bg-background border-border"
                      />
                    </div>

                    {/* Minutes Per Call */}
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">
                        Minutes per call
                      </Label>
                      <Input
                        type="number"
                        value={formData.minutesPerCall}
                        onChange={(e) => setFormData({ ...formData, minutesPerCall: e.target.value })}
                        placeholder="No limit"
                        className="bg-background border-border"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Empty state when no avatar is selected
            <div className="flex justify-center items-center py-16">
              <div className="bg-card rounded-lg border border-border p-12 text-center max-w-lg">
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No avatar configured yet
                </h3>
                <p className="text-muted-foreground mb-6">
                  Add an avatar to get started with your AI assistant configuration.
                </p>
                <Button onClick={() => setAvatarModalOpen(true)} className="bg-primary text-primary-foreground">
                  Add Your First Avatar
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Avatar Selection Modal */}
      <AvatarSelectionModal
        open={avatarModalOpen}
        onOpenChange={setAvatarModalOpen}
        onSelect={handleAvatarTemplateSelect}
        avatars={availableAvatarTemplates}
      />
    </div>
  )
}
