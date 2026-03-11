"use client"

import { LogOut } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  showSave?: boolean
  onSave?: () => void
}

export function Header({ showSave, onSave }: HeaderProps) {
  const router = useRouter()
  const pathname = usePathname()

  const currentRole: "super" | "tenant" | "none" =
    pathname?.startsWith("/super-admin") ? "super" : pathname?.startsWith("/tenant") ? "tenant" : "none"

  const handleRoleChange = (role: "super" | "tenant") => {
    if (role === currentRole) return
    if (role === "super") {
      router.push("/super-admin/tenants")
    } else {
      router.push("/tenant/dashboard")
    }
  }

  return (
    <header className="flex items-center justify-end gap-3 p-4">
      <div className="flex items-center gap-1 rounded-full border border-border bg-background px-1 py-0.5 text-xs">
        <span className="px-2 text-[11px] text-muted-foreground">Role</span>
        <div className="flex rounded-full bg-card shadow-sm overflow-hidden">
          <Button
            type="button"
            variant="ghost"
            className={`h-7 px-3 text-[11px] rounded-none ${
              currentRole === "super" ? "bg-foreground text-background hover:bg-foreground/90" : "text-muted-foreground"
            }`}
            onClick={() => handleRoleChange("super")}
          >
            Super Admin
          </Button>
          <Button
            type="button"
            variant="ghost"
            className={`h-7 px-3 text-[11px] rounded-none border-l border-border/60 ${
              currentRole === "tenant" ? "bg-foreground text-background hover:bg-foreground/90" : "text-muted-foreground"
            }`}
            onClick={() => handleRoleChange("tenant")}
          >
            Tenant Admin
          </Button>
        </div>
      </div>

      <Button
        variant="outline"
        className="border-foreground text-foreground hover:bg-foreground hover:text-background"
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

