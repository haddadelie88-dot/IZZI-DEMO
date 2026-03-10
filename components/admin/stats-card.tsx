import { LucideIcon } from "lucide-react"
import { Card } from "@/components/ui/card"

interface StatsCardProps {
  title: string
  value: string | number
  description: string
  icon: LucideIcon
}

export function StatsCard({ title, value, description, icon: Icon }: StatsCardProps) {
  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <div className="p-2 bg-muted rounded-lg w-fit">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-muted-foreground mt-3">{title}</p>
          <p className="text-xs text-muted-foreground/70">{description}</p>
        </div>
        <span className="text-3xl font-bold text-foreground">{value}</span>
      </div>
    </Card>
  )
}
