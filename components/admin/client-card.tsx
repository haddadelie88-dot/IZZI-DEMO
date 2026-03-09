"use client"

import { Settings, Trash2, Pencil, Mail, Phone, User } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export interface Client {
  id: string
  companyName: string
  clientName: string
  email: string
  phone: string
  industry: string
  status: "published" | "not_published"
  crmConnected?: boolean
  crmType?: string
}

interface ClientCardProps {
  client: Client
  onConfigure: (client: Client) => void
  onConnectCRM: (client: Client) => void
  onDelete: (client: Client) => void
  onEdit: (client: Client) => void
}

export function ClientCard({ 
  client, 
  onConfigure, 
  onConnectCRM, 
  onDelete,
  onEdit 
}: ClientCardProps) {
  const initials = client.companyName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <Card className="p-5 bg-card border-border relative">
      {/* Status Badges */}
      <div className="flex items-center gap-2 mb-4">
        <Badge 
          variant={client.status === "published" ? "default" : "destructive"}
          className={client.status === "published" 
            ? "bg-green-100 text-green-700 hover:bg-green-100" 
            : "bg-red-100 text-red-700 hover:bg-red-100"
          }
        >
          {client.status === "published" ? "Published" : "× Not Published"}
        </Badge>
        {client.crmConnected && (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            ✓ Connected to {client.crmType}
          </Badge>
        )}
      </div>

      {/* Edit Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        onClick={() => onEdit(client)}
      >
        <Pencil className="h-4 w-4" />
      </Button>

      {/* Client Info */}
      <div className="flex items-center gap-3 mb-4">
        <Avatar className="h-12 w-12 bg-primary text-primary-foreground">
          <AvatarFallback className="bg-primary text-primary-foreground font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold text-foreground">{client.companyName}</h3>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <User className="h-3 w-3" />
            {client.clientName}
          </p>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-4 border-b border-border pb-4">
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <Mail className="h-4 w-4" />
          {client.email}
        </p>
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <Phone className="h-4 w-4" />
          {client.phone}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-foreground border-border text-xs sm:text-sm"
            onClick={() => onConfigure(client)}
          >
            <Settings className="h-4 w-4 mr-1 sm:mr-2 flex-shrink-0" />
            <span className="truncate">Configure Avatar</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-foreground border-border text-xs sm:text-sm"
            onClick={() => onConnectCRM(client)}
          >
            <span className="truncate">Connect with CRM</span>
          </Button>
        </div>
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
            onClick={() => onDelete(client)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
