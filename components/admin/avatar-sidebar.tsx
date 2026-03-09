"use client"

import Link from "next/link"
import { Sparkles, Plus, Trash2, Phone, BarChart3, ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState } from "react"

export interface TenantAvatar {
  id: string
  name: string
  imageUrl: string
  industry: string
  isPrimary?: boolean
  callCount?: number
}

interface AvatarSidebarProps {
  avatars: TenantAvatar[]
  selectedAvatarId?: string
  onSelectAvatar: (avatar: TenantAvatar) => void
  onAddAvatar: () => void
  onDeleteAvatar: (avatar: TenantAvatar) => void
  onViewCallHistory: (avatar: TenantAvatar) => void
  onViewAnalytics: (avatar: TenantAvatar) => void
  clientId?: string
}

export function AvatarSidebar({
  avatars,
  selectedAvatarId,
  onSelectAvatar,
  onAddAvatar,
  onDeleteAvatar,
  onViewCallHistory,
  onViewAnalytics,
}: AvatarSidebarProps) {
  const [expandedAvatarId, setExpandedAvatarId] = useState<string | null>(null)

  const toggleExpand = (avatarId: string) => {
    setExpandedAvatarId(expandedAvatarId === avatarId ? null : avatarId)
  }

  return (
    <aside className="w-56 bg-sidebar text-sidebar-foreground min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-wider text-white">IZZI</h1>
          <p className="text-sm text-sidebar-foreground/70 mt-1">Admin Panel</p>
        </div>
      </div>

      {/* Avatars Label */}
      <div className="px-4 pt-4">
        <div className="flex items-center gap-2 px-4 py-2 text-sidebar-foreground/80">
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-medium">Avatars</span>
        </div>
      </div>

      {/* Add Avatar Button */}
      <div className="px-4 py-2">
        <Button 
          className="w-full bg-sidebar-accent hover:bg-sidebar-accent/80 text-sidebar-accent-foreground"
          onClick={onAddAvatar}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Avatar
        </Button>
      </div>

      {/* Avatars List */}
      <nav className="flex-1 px-4 py-2 space-y-2 overflow-y-auto">
        {avatars.map((avatar) => (
          <div key={avatar.id} className="space-y-1">
            {/* Avatar Item */}
            <div
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer",
                selectedAvatarId === avatar.id
                  ? "bg-card text-foreground"
                  : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
              )}
              onClick={() => {
                onSelectAvatar(avatar)
                toggleExpand(avatar.id)
              }}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={avatar.imageUrl} alt={avatar.name} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {avatar.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="flex-1 font-medium text-sm truncate">{avatar.name}</span>
              
              <div className="flex items-center gap-1">
                <button
                  className="p-1 text-destructive hover:text-destructive/80 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteAvatar(avatar)
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                {expandedAvatarId === avatar.id ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>

            {/* Expanded Options */}
            {expandedAvatarId === avatar.id && (
              <div className="ml-4 space-y-1">
                <button
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/30 rounded-lg transition-colors"
                  onClick={() => onViewCallHistory(avatar)}
                >
                  <Phone className="h-4 w-4" />
                  <span>Call History</span>
                  <span className="ml-auto text-muted-foreground">→</span>
                </button>
                <button
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/30 rounded-lg transition-colors"
                  onClick={() => onViewAnalytics(avatar)}
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Call Analytics</span>
                  <span className="ml-auto text-muted-foreground">→</span>
                </button>
              </div>
            )}
          </div>
        ))}

        {avatars.length === 0 && (
          <div className="text-center py-8 text-sidebar-foreground/60">
            <p className="text-sm">No avatars yet</p>
            <p className="text-xs mt-1">Click Add Avatar to get started</p>
          </div>
        )}
      </nav>
    </aside>
  )
}
