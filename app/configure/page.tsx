"use client"

import { useState } from "react"
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
  })

  const handleSave = () => {
    console.log("Saving configuration:", { 
      ...formData, 
      avatar: selectedTenantAvatar,
      allAvatars: tenantAvatars 
    })
    setIsDraftMode(false)
    router.push("/")
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
    setFormData({ ...formData, agentName: template.name.toLowerCase() })
    setIsDraftMode(true) // Enter draft mode for configuration
    setAvatarModalOpen(false)
  }

  const handleSelectTenantAvatar = (avatar: TenantAvatar) => {
    setSelectedTenantAvatar(avatar)
    setFormData({ ...formData, agentName: avatar.name })
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
