"use client"

import { Sparkles, X } from "lucide-react"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
        <DialogHeader className="mb-4">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span>Configure Avatar</span>
          </DialogTitle>
          <DialogDescription>
            Set up your AI avatar&apos;s knowledge, personality, and interaction style.
          </DialogDescription>
        </DialogHeader>

        {/* Custom close button (DialogContent still renders its own accessible close button) */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 p-1 text-muted-foreground hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

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
              <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                <Image
                  src={avatar.imageUrl}
                  alt={avatar.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 300px"
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
      </DialogContent>
    </Dialog>
  )
}
