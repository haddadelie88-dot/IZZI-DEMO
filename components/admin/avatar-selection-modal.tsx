"use client"

import { Sparkles, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

export interface AvatarOption {
  id: string
  name: string
  role: string
  industry: string
  imageUrl: string
}

interface AvatarSelectionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (avatar: AvatarOption) => void
  avatars: AvatarOption[]
}

export function AvatarSelectionModal({
  open,
  onOpenChange,
  onSelect,
  avatars,
}: AvatarSelectionModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-card">
        <div className="relative">
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-0 top-0 p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Configure Avatar</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Set up your AI avatar&apos;s knowledge, personality, and interaction style
          </p>

          {/* Avatar Grid */}
          <div className="grid grid-cols-2 gap-4">
            {avatars.map((avatar) => (
              <button
                key={avatar.id}
                onClick={() => {
                  onSelect(avatar)
                  onOpenChange(false)
                }}
                className="group relative rounded-lg overflow-hidden border border-border hover:border-primary transition-colors bg-card"
              >
                {/* Industry Badge */}
                <Badge className="absolute top-3 right-3 z-10 bg-foreground/80 text-background text-xs">
                  {avatar.industry}
                </Badge>
                
                {/* Avatar Image */}
                <div className="aspect-[4/3] bg-muted">
                  <img
                    src={avatar.imageUrl}
                    alt={avatar.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Avatar Info */}
                <div className="p-3 text-left">
                  <h3 className="font-medium text-foreground">{avatar.name}</h3>
                  <p className="text-sm text-primary">{avatar.role}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
