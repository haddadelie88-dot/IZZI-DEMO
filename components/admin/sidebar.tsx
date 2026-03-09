"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sparkles, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 bg-sidebar text-sidebar-foreground min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-wider text-white">IZZI</h1>
          <p className="text-sm text-sidebar-foreground/70 mt-1">Admin Panel</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <Link
          href="/"
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
            pathname === "/" 
              ? "bg-sidebar-accent text-sidebar-accent-foreground" 
              : "hover:bg-sidebar-accent/50 text-sidebar-foreground/80"
          )}
        >
          <Sparkles className="h-5 w-5" />
          <span className="font-medium">Avatars</span>
        </Link>
      </nav>

      {/* Add Avatar Button */}
      <div className="p-4">
        <Button 
          className="w-full bg-sidebar-accent hover:bg-sidebar-accent/80 text-sidebar-accent-foreground"
          asChild
        >
          <Link href="/configure">
            <Plus className="h-4 w-4 mr-2" />
            Add Avatar
          </Link>
        </Button>
      </div>
    </aside>
  )
}
