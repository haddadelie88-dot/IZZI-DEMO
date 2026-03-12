"use client"

import { Settings, Trash2, Pencil, Mail, Phone, User, Link2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Client } from "./client-card"

interface ClientListItemProps {
  client: Client
  onConfigure: (client: Client) => void
  onConnectCRM: (client: Client) => void
  onDelete: (client: Client) => void
  onEdit: (client: Client) => void
}

export function ClientListItem({ 
  client, 
  onConfigure, 
  onConnectCRM, 
  onDelete,
  onEdit 
}: ClientListItemProps) {
  const initials = client.companyName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-card rounded-lg border border-border hover:shadow-sm transition-shadow">
      {/* Left: Avatar & Company Info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Avatar className="h-10 w-10 bg-primary text-primary-foreground flex-shrink-0">
          <AvatarFallback className="bg-primary text-primary-foreground font-medium text-sm">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-foreground truncate">{client.companyName}</h3>
            <Badge 
              variant={client.status === "published" ? "default" : "destructive"}
              className={`text-xs flex-shrink-0 ${client.status === "published" 
                ? "bg-green-100 text-green-700 hover:bg-green-100" 
                : "bg-red-100 text-red-700 hover:bg-red-100"
              }`}
            >
              {client.status === "published" ? "Published" : "Not Published"}
            </Badge>
            {client.crmConnected && (
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs flex-shrink-0">
                {client.crmType}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
            <User className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{client.clientName}</span>
          </p>
          {client.domain && <p className="text-xs text-muted-foreground">Domain: {client.domain}</p>}
        </div>
      </div>

      {/* Middle: Contact Info */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground sm:flex-shrink-0">
        <span className="flex items-center gap-1.5">
          <Mail className="h-4 w-4 flex-shrink-0" />
          <span className="truncate max-w-[180px]">{client.email}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Phone className="h-4 w-4 flex-shrink-0" />
          <span>{client.phone}</span>
        </span>
        {client.senderEmail && (
          <span className="flex items-center gap-1.5">
            <Mail className="h-4 w-4 flex-shrink-0" />
            <span className="truncate max-w-[220px]">Sender: {client.senderEmail}</span>
          </span>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 flex-shrink-0 sm:ml-auto">
        <Button
          variant="outline"
          size="sm"
          className="text-foreground border-border h-8 text-xs"
          onClick={() => onConfigure(client)}
        >
          <Settings className="h-3.5 w-3.5 mr-1.5" />
          Configure
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-foreground border-border h-8 text-xs"
          onClick={() => onConnectCRM(client)}
        >
          <Link2 className="h-3.5 w-3.5 mr-1.5" />
          CRM
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground h-8 w-8"
          onClick={() => onEdit(client)}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
          onClick={() => onDelete(client)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}
