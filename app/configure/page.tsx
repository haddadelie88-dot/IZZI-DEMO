"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Upload, Share2, Mic } from "lucide-react"
import { Sidebar } from "@/components/admin/sidebar"
import { Header } from "@/components/admin/header"
import { AvatarSelectionModal, AvatarOption } from "@/components/admin/avatar-selection-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Available avatars
const availableAvatars: AvatarOption[] = [
  {
    id: "1",
    name: "Sarah",
    role: "Professional Business Agent",
    industry: "Corporate",
    imageUrl: "/avatars/sarah.png",
  },
  {
    id: "2",
    name: "Noura",
    role: "Professional Real Estate Agent",
    industry: "Real Estate",
    imageUrl: "/avatars/noura.jpeg",
  },
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
  const [avatarModalOpen, setAvatarModalOpen] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarOption | null>(null)
  
  const [formData, setFormData] = useState({
    openingPhrase: "Hi! I'm Alex, your AI estate assistant. I'm here to help you find the perfect property. What kind of home are you looking for?",
    knowledgeBase: "",
    goals: "1. Qualify leads based on budget\n2. Schedule property viewings",
    agentName: "sarah",
    language: "",
    interaction: "Audio Only",
  })

  const handleSave = () => {
    console.log("Saving configuration:", { ...formData, avatar: selectedAvatar })
    // In production, save to backend
    router.push("/")
  }

  const handleAvatarSelect = (avatar: AvatarOption) => {
    setSelectedAvatar(avatar)
    setFormData({ ...formData, agentName: avatar.name.toLowerCase() })
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 flex flex-col">
        <Header showSave onSave={handleSave} />
        
        <div className="flex-1 p-8">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Configure Avatar
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

          <div className="flex gap-8">
            {/* Configuration Form */}
            <div className="flex-1 max-w-2xl">
              <div className="bg-card rounded-lg p-6 border border-border space-y-6">
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
                    placeholder="Add text that helps your Avatar understand context and nuances of your business.
Examples:"
                    className="min-h-[80px] bg-background border-border resize-none"
                  />
                  <p className="text-xs text-muted-foreground">0 / 5000 characters</p>
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
                  {selectedAvatar ? (
                    <img
                      src={selectedAvatar.imageUrl}
                      alt={selectedAvatar.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <img
                        src="/avatars/noura.jpeg"
                        alt="Default Avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
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
                </div>
              </div>

              {/* Select Avatar Button */}
              <Button
                variant="outline"
                className="w-full mt-4 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                onClick={() => setAvatarModalOpen(true)}
              >
                Select Avatar
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Avatar Selection Modal */}
      <AvatarSelectionModal
        open={avatarModalOpen}
        onOpenChange={setAvatarModalOpen}
        onSelect={handleAvatarSelect}
        avatars={availableAvatars}
      />
    </div>
  )
}
