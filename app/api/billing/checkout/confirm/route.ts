import { NextResponse } from "next/server"
import { readStore, writeStore } from "@/lib/poc-store"

type CheckoutConfirmBody = {
  tenantId: string
  packageId: string
  packageName: string
  mediaType?: "audio" | "video"
  minutes: number
  amount: number
  currency?: string
}

type QuotaBalance = {
  tenantId: string
  totalMinutes: number
  usedMinutes: number
}

type MediaType = "audio" | "video"
type TypeBalance = { totalMinutes: number; usedMinutes: number }
type TypedQuotaBalance = {
  tenantId: string
  byType: Record<MediaType, TypeBalance>
}

type PurchaseRow = {
  id: string
  tenantId: string
  packageName: string
  mediaType?: "audio" | "video"
  minutes: number
  amount: number
  currency: string
  status: "PENDING" | "COMPLETED" | "FAILED"
  createdAt: string
}

type TransactionRow = {
  id: string
  tenantId: string
  type: "PURCHASE" | "USAGE" | "ADMIN_GRANT" | "ADJUSTMENT"
  mediaType?: "audio" | "video"
  minutes: number
  runningBalance: number
  note?: string
  createdAt: string
}

const DEFAULT_BALANCE = { totalMinutes: 5000, usedMinutes: 3420 }

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as CheckoutConfirmBody | null
  if (!body?.tenantId || !body.packageId || !body.minutes || !body.amount) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const mediaType: MediaType = body.mediaType === "video" ? "video" : "audio"
  const quotaStore = await readStore<Record<string, QuotaBalance>>("quota-balance", {})
  const typedQuotaStore = await readStore<Record<string, TypedQuotaBalance>>("quota-balance-v2", {})
  const purchaseStore = await readStore<PurchaseRow[]>("billing-purchases", [])
  const txStore = await readStore<TransactionRow[]>("quota-transactions", [])

  const current = quotaStore[body.tenantId] || {
    tenantId: body.tenantId,
    ...DEFAULT_BALANCE,
  }
  const typedCurrent = typedQuotaStore[body.tenantId] || {
    tenantId: body.tenantId,
    byType: {
      audio: { totalMinutes: current.totalMinutes, usedMinutes: current.usedMinutes },
      video: { totalMinutes: 0, usedMinutes: 0 },
    },
  }
  const currentType = typedCurrent.byType[mediaType] || { totalMinutes: 0, usedMinutes: 0 }
  const nextTypeBalance = currentType.totalMinutes - currentType.usedMinutes + body.minutes

  const purchase: PurchaseRow = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    tenantId: body.tenantId,
    packageName: body.packageName,
    mediaType: body.mediaType,
    minutes: body.minutes,
    amount: body.amount,
    currency: body.currency || "USD",
    status: "COMPLETED",
    createdAt: new Date().toISOString(),
  }
  purchaseStore.unshift(purchase)

  const tx: TransactionRow = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    tenantId: body.tenantId,
    type: "PURCHASE",
    mediaType,
    minutes: body.minutes,
    runningBalance: nextTypeBalance,
    note: `Top-up via ${body.packageName}`,
    createdAt: new Date().toISOString(),
  }
  txStore.unshift(tx)

  typedQuotaStore[body.tenantId] = {
    tenantId: body.tenantId,
    byType: {
      audio: typedCurrent.byType.audio || { totalMinutes: 0, usedMinutes: 0 },
      video: typedCurrent.byType.video || { totalMinutes: 0, usedMinutes: 0 },
      [mediaType]: {
        totalMinutes: currentType.totalMinutes + body.minutes,
        usedMinutes: currentType.usedMinutes,
      },
    },
  }

  const mergedAudio = typedQuotaStore[body.tenantId].byType.audio
  const mergedVideo = typedQuotaStore[body.tenantId].byType.video
  quotaStore[body.tenantId] = {
    tenantId: body.tenantId,
    totalMinutes: mergedAudio.totalMinutes + mergedVideo.totalMinutes,
    usedMinutes: mergedAudio.usedMinutes + mergedVideo.usedMinutes,
  }

  await Promise.all([
    writeStore("quota-balance", quotaStore),
    writeStore("quota-balance-v2", typedQuotaStore),
    writeStore("billing-purchases", purchaseStore),
    writeStore("quota-transactions", txStore),
  ])

  return NextResponse.json({
    ok: true,
    purchase,
    balance: {
      ...quotaStore[body.tenantId],
      remainingMinutes: quotaStore[body.tenantId].totalMinutes - quotaStore[body.tenantId].usedMinutes,
    },
  })
}

