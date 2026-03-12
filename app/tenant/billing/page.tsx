"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/admin/header"
import { PortalNav } from "@/components/admin/portal-nav"
import { QuotaBar } from "@/components/shared/quota-bar"
import { PackageCard } from "@/components/shared/package-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type Balance = {
  totalMinutes: number
  usedMinutes: number
  remainingMinutes: number
  byType?: {
    audio: { totalMinutes: number; usedMinutes: number; remainingMinutes: number }
    video: { totalMinutes: number; usedMinutes: number; remainingMinutes: number }
  }
}
type Pkg = {
  id: string
  name: string
  minutes: number
  price: number
  currency: string
  mediaType?: "audio" | "video"
  ratePerMinute: number
  rangeLabel: string
  benefit: string
  isFeatured?: boolean
}
type Purchase = {
  id: string
  packageName: string
  mediaType?: "audio" | "video"
  minutes: number
  amount: number
  currency: string
  status: "PENDING" | "COMPLETED" | "FAILED"
  createdAt: string
}
type Tx = {
  id: string
  type: "PURCHASE" | "USAGE" | "ADMIN_GRANT" | "ADJUSTMENT"
  mediaType?: "audio" | "video"
  minutes: number
  runningBalance: number
  note?: string
  createdAt: string
}

export default function TenantBillingPage() {
  const params = useSearchParams()
  const tenantId = params.get("tenantId") || "dar-global"
  const demoRole = typeof document !== "undefined" && document.cookie.includes("izzi_demo_tenant_role=member") ? "member" : "admin"

  const [balance, setBalance] = useState<Balance>({
    totalMinutes: 5000,
    usedMinutes: 3420,
    remainingMinutes: 1580,
    byType: {
      audio: { totalMinutes: 5000, usedMinutes: 3420, remainingMinutes: 1580 },
      video: { totalMinutes: 0, usedMinutes: 0, remainingMinutes: 0 },
    },
  })
  const [packages, setPackages] = useState<Pkg[]>([])
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [transactions, setTransactions] = useState<Tx[]>([])
  const [buyOpen, setBuyOpen] = useState(false)
  const [selectedPkg, setSelectedPkg] = useState<Pkg | null>(null)
  const [selectedMediaType, setSelectedMediaType] = useState<"audio" | "video">("audio")
  const [loading, setLoading] = useState(false)

  const normalizePackage = (row: any, index: number): Pkg => {
    const mediaType: "audio" | "video" =
      row?.mediaType === "audio" || row?.mediaType === "video"
        ? row.mediaType
        : index % 2 === 0
          ? "audio"
          : "video"
    const minutes = Number(row?.minutes ?? 0)
    const price = Number(row?.price ?? 0)
    return {
      id: row?.id || `pkg-${index + 1}`,
      name: row?.name || `Tier ${index + 1}`,
      minutes,
      price,
      currency: row?.currency || "USD",
      mediaType,
      ratePerMinute: Number(row?.ratePerMinute ?? (minutes > 0 ? price / minutes : 0)),
      rangeLabel: row?.rangeLabel || `${minutes.toLocaleString()} minutes`,
      benefit: row?.benefit || "IZZI usage package",
      isFeatured: Boolean(row?.isFeatured),
    }
  }

  const load = async () => {
    const [b, p, pu, tx] = await Promise.all([
      fetch(`/api/billing/balance?tenantId=${encodeURIComponent(tenantId)}`).then((r) => r.json()).catch(() => null),
      fetch(`/api/billing/packages`).then((r) => r.json()).catch(() => []),
      fetch(`/api/billing/purchases?tenantId=${encodeURIComponent(tenantId)}`).then((r) => r.json()).catch(() => []),
      fetch(`/api/billing/transactions?tenantId=${encodeURIComponent(tenantId)}`).then((r) => r.json()).catch(() => []),
    ])
    if (b) setBalance(b)
    setPackages(Array.isArray(p) ? p.map(normalizePackage) : [])
    setPurchases(Array.isArray(pu) ? pu : [])
    setTransactions(Array.isArray(tx) ? tx : [])
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId])

  const handlePurchase = async () => {
    if (!selectedPkg) return
    setLoading(true)
    await fetch("/api/billing/checkout/confirm", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        tenantId,
        packageId: selectedPkg.id,
        packageName: selectedPkg.name,
        mediaType: selectedPkg.mediaType,
        minutes: selectedPkg.minutes,
        amount: selectedPkg.price,
        currency: selectedPkg.currency,
      }),
    }).catch(() => null)
    setLoading(false)
    setBuyOpen(false)
    setSelectedPkg(null)
    await load()
  }

  const newBalancePreview = useMemo(() => {
    if (!selectedPkg) return 0
    const type = selectedPkg.mediaType === "video" ? "video" : "audio"
    const current = balance.byType?.[type]?.remainingMinutes || 0
    return current + selectedPkg.minutes
  }, [balance.byType, selectedPkg])

  const audioPackages = packages.filter((p) => p.mediaType === "audio")
  const videoPackages = packages.filter((p) => p.mediaType === "video")
  const visibleModalPackages = packages.filter((p) => p.mediaType === selectedMediaType)

  const inferPurchaseType = (row: Purchase): "audio" | "video" | null => {
    if (row.mediaType === "audio" || row.mediaType === "video") return row.mediaType
    const label = row.packageName.toLowerCase()
    if (label.includes("audio")) return "audio"
    if (label.includes("video")) return "video"
    return null
  }
  const latestCompleted = [...purchases]
    .filter((p) => p.status === "COMPLETED")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
  const activePackageType = latestCompleted ? inferPurchaseType(latestCompleted) : null
  const activeAudio = (balance.byType?.audio?.remainingMinutes || 0) > 0
  const activeVideo = (balance.byType?.video?.remainingMinutes || 0) > 0
  const inferTxType = (row: Tx): "audio" | "video" | null => {
    if (row.mediaType === "audio" || row.mediaType === "video") return row.mediaType
    const label = (row.note || "").toLowerCase()
    if (label.includes("video")) return "video"
    if (label.includes("audio")) return "audio"
    return null
  }

  return (
    <div className="flex min-h-screen bg-background">
      <main className="flex-1 flex flex-col">
        <Header />
        <PortalNav area="tenant" />

        <div className="flex-1 p-8 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Billing & Minutes</h1>
            <p className="text-muted-foreground">
              Manage prepaid minutes, purchases, and usage transactions.
            </p>
          </div>

          <Card className="p-6 border-border space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Remaining minutes</p>
                <p className="text-3xl font-bold text-foreground">{balance.remainingMinutes.toLocaleString()}</p>
              </div>
              <div className="flex gap-2">
                {(activeAudio || activeVideo || activePackageType) && (
                  <Badge variant="outline">
                    Active Package Type:{" "}
                    {activeAudio && activeVideo
                      ? "Audio + Video"
                      : activeAudio
                        ? "Audio"
                        : activeVideo
                          ? "Video"
                          : activePackageType === "video"
                            ? "Video"
                            : "Audio"}
                  </Badge>
                )}
                {demoRole === "member" && <Badge variant="outline">Read-only</Badge>}
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Audio Minutes</p>
                <QuotaBar
                  totalMinutes={balance.byType?.audio?.totalMinutes || 0}
                  usedMinutes={balance.byType?.audio?.usedMinutes || 0}
                  onTopUp={() => {
                    setSelectedMediaType("audio")
                    setBuyOpen(true)
                    setSelectedPkg(null)
                  }}
                  compact
                />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Video Minutes</p>
                <QuotaBar
                  totalMinutes={balance.byType?.video?.totalMinutes || 0}
                  usedMinutes={balance.byType?.video?.usedMinutes || 0}
                  onTopUp={() => {
                    setSelectedMediaType("video")
                    setBuyOpen(true)
                    setSelectedPkg(null)
                  }}
                  compact
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Combined purchased: {balance.totalMinutes.toLocaleString()} min · Combined used:{" "}
              {balance.usedMinutes.toLocaleString()} min
            </p>
          </Card>

          {demoRole === "admin" ? (
            <>
              <Card className="p-6 border-border space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-foreground">Top Up Your Minutes</h2>
                  <Dialog open={buyOpen} onOpenChange={setBuyOpen}>
                    <DialogTrigger asChild>
                      <Button
                        className="bg-foreground text-background hover:bg-foreground/90"
                        onClick={() => {
                          setSelectedMediaType(activePackageType || "audio")
                          setSelectedPkg(null)
                        }}
                      >
                        Buy Additional Minutes
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-xl">
                      <DialogHeader>
                        <DialogTitle>Complete Purchase</DialogTitle>
                        <DialogDescription>Stripe card input is mocked in this POC.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-3">
                        {visibleModalPackages.map((pkg) => (
                          <button
                            key={pkg.id}
                            className={`w-full rounded-lg border p-3 text-left transition ${
                              selectedPkg?.id === pkg.id ? "border-foreground bg-muted/30" : "border-border"
                            }`}
                            onClick={() => setSelectedPkg(pkg)}
                            type="button"
                          >
                            <div className="flex items-center justify-between">
                              <p className="font-semibold text-foreground">
                                {(pkg.mediaType || "audio").toUpperCase()} · {pkg.name}{" "}
                                {pkg.isFeatured ? "· Most Popular" : ""}
                              </p>
                              <p className="font-semibold text-foreground">${pkg.price}</p>
                            </div>
                            <p className="text-sm text-muted-foreground">{pkg.rangeLabel}</p>
                            <p className="text-sm text-foreground">${pkg.ratePerMinute.toFixed(2)} / min</p>
                          </button>
                        ))}
                        {selectedPkg && (
                          <div className="rounded-lg border border-border bg-muted/20 p-3 text-sm">
                            Current {selectedMediaType === "audio" ? "audio" : "video"} balance:{" "}
                            {(balance.byType?.[selectedMediaType]?.remainingMinutes || 0).toLocaleString()} min → New balance:{" "}
                            <span className="font-semibold text-foreground">{newBalancePreview.toLocaleString()} min</span>
                          </div>
                        )}
                      </div>
                      <DialogFooter>
                        <Button variant="ghost" onClick={() => setBuyOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handlePurchase} disabled={!selectedPkg || loading}>
                          {loading ? "Processing..." : "Complete Purchase"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="space-y-5">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-3">Audio Pricing</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {audioPackages.map((pkg) => (
                        <PackageCard
                          key={pkg.id}
                          name={pkg.name}
                          minutes={pkg.minutes}
                          price={pkg.price}
                          currency={pkg.currency}
                          mediaType={pkg.mediaType}
                          rangeLabel={pkg.rangeLabel}
                          ratePerMinute={pkg.ratePerMinute}
                          benefit={pkg.benefit}
                          featured={Boolean(pkg.isFeatured)}
                          onSelect={() => {
                            setSelectedMediaType("audio")
                            setSelectedPkg(pkg)
                            setBuyOpen(true)
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-3">Video Pricing</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {videoPackages.map((pkg) => (
                        <PackageCard
                          key={pkg.id}
                          name={pkg.name}
                          minutes={pkg.minutes}
                          price={pkg.price}
                          currency={pkg.currency}
                          mediaType={pkg.mediaType}
                          rangeLabel={pkg.rangeLabel}
                          ratePerMinute={pkg.ratePerMinute}
                          benefit={pkg.benefit}
                          featured={Boolean(pkg.isFeatured)}
                          onSelect={() => {
                            setSelectedMediaType("video")
                            setSelectedPkg(pkg)
                            setBuyOpen(true)
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-border">
                <h2 className="text-lg font-semibold text-foreground mb-4">Purchase History</h2>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Package</TableHead>
                      <TableHead>Minutes</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchases.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>{new Date(row.createdAt).toLocaleString()}</TableCell>
                        <TableCell>{inferPurchaseType(row)?.toUpperCase() || "-"}</TableCell>
                        <TableCell>{row.packageName}</TableCell>
                        <TableCell>{row.minutes.toLocaleString()}</TableCell>
                        <TableCell>${row.amount}</TableCell>
                        <TableCell>
                          <Badge variant={row.status === "COMPLETED" ? "default" : "outline"}>{row.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>

              <Card className="p-6 border-border">
                <h2 className="text-lg font-semibold text-foreground mb-4">Usage History</h2>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Minutes</TableHead>
                      <TableHead>Running Balance</TableHead>
                      <TableHead>Note</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>{new Date(row.createdAt).toLocaleString()}</TableCell>
                        <TableCell>{inferTxType(row)?.toUpperCase() || "-"}</TableCell>
                        <TableCell>{row.type}</TableCell>
                        <TableCell>{row.minutes > 0 ? `+${row.minutes}` : row.minutes}</TableCell>
                        <TableCell>{row.runningBalance}</TableCell>
                        <TableCell>{row.note || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </>
          ) : (
            <Card className="p-6 border-border">
              <p className="text-muted-foreground">Contact your administrator to top up your account balance.</p>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}

