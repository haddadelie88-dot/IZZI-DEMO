"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export interface ClientFormData {
  companyName: string
  domain: string
  email: string
  phone: string
  senderEmail: string
  clientName?: string
  industryType?: string
}

interface CreateClientModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: ClientFormData) => void
  editData?: ClientFormData | null
  mode?: "create" | "edit"
}

const industries = [
  "Real Estate",
  "Retail - Furniture",
  "Retail - Electronics",
  "Healthcare",
  "Finance",
  "Education",
  "Hospitality",
]

export function CreateClientModal({ 
  open, 
  onOpenChange, 
  onSubmit, 
  editData,
  mode = "create" 
}: CreateClientModalProps) {
  const [formData, setFormData] = useState<ClientFormData>({
    companyName: "",
    domain: "",
    email: "",
    phone: "",
    senderEmail: "",
    clientName: "",
    industryType: "",
  })

  // Update form data when editData changes
  useState(() => {
    if (editData && mode === "edit") {
      setFormData(editData)
    }
  })

  // Reset form when modal opens/closes or editData changes
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && editData && mode === "edit") {
      setFormData(editData)
    } else if (!newOpen) {
      setFormData({
        companyName: "",
        domain: "",
        email: "",
        phone: "",
        senderEmail: "",
        clientName: "",
        industryType: "",
      })
    }
    onOpenChange(newOpen)
  }

  // Set initial data when modal opens in edit mode
  if (open && editData && mode === "edit" && formData.companyName !== editData.companyName) {
    setFormData(editData)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    setFormData({
      companyName: "",
      domain: "",
      email: "",
      phone: "",
      senderEmail: "",
      clientName: "",
      industryType: "",
    })
    handleOpenChange(false)
  }

  const isEditMode = mode === "edit"

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md bg-card">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {isEditMode ? "Edit Client" : "Create Client"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? "Update the client account details" 
              : "Fill in the details to create a new client account"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="companyName" className="text-foreground font-medium">
              Company Name
            </Label>
            <Input
              id="companyName"
              placeholder="e.g., Premier Properties Limited"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className="bg-background border-border"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="domain" className="text-foreground font-medium">
              Domain
            </Label>
            <Input
              id="domain"
              placeholder="example.com"
              value={formData.domain}
              onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
              className="bg-background border-border"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john.smith@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-background border-border"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-foreground font-medium">
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="bg-background border-border"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="senderEmail" className="text-foreground font-medium">
              Sender Email (from IZZI)
            </Label>
            <Input
              id="senderEmail"
              type="email"
              placeholder="noreply@darglobal.com"
              value={formData.senderEmail}
              onChange={(e) => setFormData({ ...formData, senderEmail: e.target.value })}
              className="bg-background border-border"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="industryType" className="text-foreground font-medium">
              Industry Type
            </Label>
            <Select
              value={formData.industryType}
              onValueChange={(value) => setFormData({ ...formData, industryType: value })}
            >
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Select Industry Type" />
              </SelectTrigger>
              <SelectContent>
                {industries.map((industry) => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-center gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              className="px-8 border-foreground text-foreground"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="px-8 bg-foreground text-background hover:bg-foreground/90"
            >
              {isEditMode ? "Save Changes" : "Create Client"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
