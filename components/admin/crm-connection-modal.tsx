"use client"

import { useState } from "react"
import { Link as LinkIcon, X, ExternalLink, Info } from "lucide-react"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface CRMConnectionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConnect: (domainExtension: string) => void
  clientName?: string
}

export function CRMConnectionModal({ 
  open, 
  onOpenChange, 
  onConnect,
}: CRMConnectionModalProps) {
  const [domainExtension, setDomainExtension] = useState("")

  const handleConnect = () => {
    onConnect(domainExtension)
    setDomainExtension("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card p-0">
        <div className="relative p-6">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-lg border border-border">
              <LinkIcon className="h-6 w-6 text-cyan-500" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl font-semibold text-center mb-8">
            Link Zoho CRM Account
          </h2>

          {/* Form */}
          <div className="space-y-2 mb-6">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium text-foreground">
                Domain Extension
              </Label>
              <span className="text-sm text-cyan-500">optional</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>The domain extension of your Zoho CRM account</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              The domain extension of your Zoho CRM account
            </p>
            <div className="flex items-center gap-0">
              <div className="px-3 py-2 bg-muted border border-r-0 border-border rounded-l-md text-sm text-muted-foreground">
                https://crm.zoho.
              </div>
              <Input
                value={domainExtension}
                onChange={(e) => setDomainExtension(e.target.value)}
                placeholder="com"
                className="rounded-l-none border-border"
              />
              <div className="px-3 py-2 bg-muted border border-l-0 border-border rounded-r-md text-sm text-muted-foreground">
                /
              </div>
            </div>
          </div>

          {/* Connect Button */}
          <Button
            onClick={handleConnect}
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white"
          >
            Connect
          </Button>

          {/* Help Link */}
          <div className="text-center mt-6">
            <a
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              Need help? View connection guide
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {/* Secured By */}
          <div className="flex items-center justify-center gap-2 mt-6 text-sm text-muted-foreground">
            <span>Secured by</span>
            <span className="font-semibold flex items-center gap-1">
              <span className="text-cyan-500">⟲</span> nango
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
