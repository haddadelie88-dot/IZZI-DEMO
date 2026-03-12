"use client"

import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  showSave?: boolean
  onSave?: () => void
}

export function Header({ showSave, onSave }: HeaderProps) {
  const handleLogout = () => {
    document.cookie = "izzi_demo_role=; path=/; max-age=0"
    document.cookie = "izzi_demo_tenant=; path=/; max-age=0"
    document.cookie = "izzi_demo_tenant_role=; path=/; max-age=0"
    window.location.assign("/login")
  }

  return (
    <header className="flex items-center justify-end gap-3 p-4">
      <Button
        variant="outline"
        className="border-foreground text-foreground hover:bg-foreground hover:text-background"
        onClick={handleLogout}
      >
        Logout
        <LogOut className="h-4 w-4 ml-2" />
      </Button>
      {showSave && (
        <Button
          onClick={onSave}
          className="bg-foreground text-background hover:bg-foreground/90"
        >
          Save
          <span className="ml-1">→</span>
        </Button>
      )}
    </header>
  )
}

