"use client"

import { useEffect, useMemo, useState } from "react"
import { Link as LinkIcon, X, CheckCircle2, XCircle, Info } from "lucide-react"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"

type CrmType = "odoo" | "salesforce"

type CrmConfig = {
  clientId: string
  crmType: CrmType
  odoo?: { instanceUrl?: string; apiKey?: string }
  salesforce?: {
    instanceUrl?: string
    clientId?: string
    clientSecret?: string
    username?: string
    password?: string
    securityToken?: string
    leadObject?: string
  }
}

interface CRMConnectionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConnect: (crmType: string) => void
  clientName?: string
  clientId?: string
}

export function CRMConnectionModal({ 
  open, 
  onOpenChange, 
  onConnect,
  clientName,
  clientId,
}: CRMConnectionModalProps) {
  const [crmType, setCrmType] = useState<CrmType>("odoo")
  const [odooInstanceUrl, setOdooInstanceUrl] = useState("")
  const [odooApiKey, setOdooApiKey] = useState("")

  const [sfInstanceUrl, setSfInstanceUrl] = useState("")
  const [sfClientId, setSfClientId] = useState("")
  const [sfClientSecret, setSfClientSecret] = useState("")
  const [sfUsername, setSfUsername] = useState("")
  const [sfPassword, setSfPassword] = useState("")
  const [sfSecurityToken, setSfSecurityToken] = useState("")
  const [sfLeadObject, setSfLeadObject] = useState("Lead")

  const [testStatus, setTestStatus] = useState<null | { ok: boolean; message: string }>(null)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)

  const canSave = useMemo(() => {
    if (!clientId) return false
    if (crmType === "odoo") return Boolean(odooInstanceUrl.trim())
    return Boolean(
      sfInstanceUrl.trim() &&
        sfClientId.trim() &&
        sfClientSecret.trim() &&
        sfUsername.trim() &&
        sfPassword.trim() &&
        sfSecurityToken.trim(),
    )
  }, [
    clientId,
    crmType,
    odooInstanceUrl,
    sfInstanceUrl,
    sfClientId,
    sfClientSecret,
    sfUsername,
    sfPassword,
    sfSecurityToken,
  ])

  useEffect(() => {
    if (!open || !clientId) return
    let cancelled = false

    async function load() {
      setTestStatus(null)
      const res = await fetch(`/api/crm/config?clientId=${encodeURIComponent(clientId)}`).catch(() => null)
      if (!res || !res.ok) return
      const cfg = (await res.json()) as CrmConfig | null
      if (cancelled || !cfg) return

      setCrmType(cfg.crmType)
      setOdooInstanceUrl(cfg.odoo?.instanceUrl || "")
      setOdooApiKey(cfg.odoo?.apiKey || "")

      setSfInstanceUrl(cfg.salesforce?.instanceUrl || "")
      setSfClientId(cfg.salesforce?.clientId || "")
      setSfClientSecret(cfg.salesforce?.clientSecret || "")
      setSfUsername(cfg.salesforce?.username || "")
      setSfPassword(cfg.salesforce?.password || "")
      setSfSecurityToken(cfg.salesforce?.securityToken || "")
      setSfLeadObject(cfg.salesforce?.leadObject || "Lead")
    }

    load()
    return () => {
      cancelled = true
    }
  }, [open, clientId])

  const handleTestConnection = async () => {
    if (!clientId) return
    setTesting(true)
    setTestStatus(null)
    try {
      if (crmType === "odoo") {
        const ok = Boolean(odooInstanceUrl.trim())
        setTestStatus({
          ok,
          message: ok ? "Odoo connection looks good (POC stub)." : "Please enter an Odoo instance URL.",
        })
        return
      }

      const res = await fetch(`/api/crm/salesforce/test`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          clientId,
          instanceUrl: sfInstanceUrl,
          clientIdValue: sfClientId,
          clientSecret: sfClientSecret,
          username: sfUsername,
          password: sfPassword,
          securityToken: sfSecurityToken,
        }),
      })
      const json = (await res.json().catch(() => null)) as any
      if (res.ok) {
        setTestStatus({ ok: true, message: json?.message || "Connection successful." })
      } else {
        setTestStatus({ ok: false, message: json?.error || "Connection failed." })
      }
    } finally {
      setTesting(false)
    }
  }

  const handleSave = async () => {
    if (!clientId) return
    setSaving(true)
    try {
      const payload: CrmConfig = {
        clientId,
        crmType,
        odoo: crmType === "odoo" ? { instanceUrl: odooInstanceUrl, apiKey: odooApiKey } : undefined,
        salesforce:
          crmType === "salesforce"
            ? {
                instanceUrl: sfInstanceUrl,
                clientId: sfClientId,
                clientSecret: sfClientSecret,
                username: sfUsername,
                password: sfPassword,
                securityToken: sfSecurityToken,
                leadObject: sfLeadObject || "Lead",
              }
            : undefined,
      }
      await fetch(`/api/crm/config`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      })

      onConnect(crmType === "salesforce" ? "Salesforce" : "Odoo")
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl bg-card p-0">
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
            CRM Integration {clientName ? `— ${clientName}` : ""}
          </h2>

          {!clientId ? (
            <div className="rounded-lg border border-border bg-background p-4 text-sm text-muted-foreground">
              Select a client before configuring CRM.
            </div>
          ) : (
            <>
              {/* CRM Type */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium text-foreground">CRM Type</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Choose which CRM this tenant should push leads to.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <RadioGroup value={crmType} onValueChange={(v) => setCrmType(v as CrmType)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="odoo" id="crm-odoo" />
                    <Label htmlFor="crm-odoo">Odoo</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="salesforce" id="crm-salesforce" />
                    <Label htmlFor="crm-salesforce">Salesforce</Label>
                  </div>
                </RadioGroup>
              </div>

              <Separator className="my-6" />

              {/* Config Form */}
              {crmType === "odoo" ? (
                <div className="space-y-4 mb-6">
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">Instance URL</Label>
                    <Input
                      value={odooInstanceUrl}
                      onChange={(e) => setOdooInstanceUrl(e.target.value)}
                      placeholder="https://your-odoo.example.com"
                      className="bg-background border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">API Key (optional)</Label>
                    <Input
                      value={odooApiKey}
                      onChange={(e) => setOdooApiKey(e.target.value)}
                      placeholder="••••••••"
                      className="bg-background border-border"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4 mb-6">
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">Instance URL</Label>
                    <Input
                      value={sfInstanceUrl}
                      onChange={(e) => setSfInstanceUrl(e.target.value)}
                      placeholder="https://darGlobal.my.salesforce.com"
                      className="bg-background border-border"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">Client ID</Label>
                      <Input
                        value={sfClientId}
                        onChange={(e) => setSfClientId(e.target.value)}
                        placeholder="Salesforce Connected App client id"
                        className="bg-background border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">Client Secret</Label>
                      <Input
                        value={sfClientSecret}
                        onChange={(e) => setSfClientSecret(e.target.value)}
                        placeholder="Salesforce Connected App secret"
                        className="bg-background border-border"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">Username</Label>
                      <Input
                        value={sfUsername}
                        onChange={(e) => setSfUsername(e.target.value)}
                        placeholder="user@company.com"
                        className="bg-background border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">Password</Label>
                      <Input
                        value={sfPassword}
                        onChange={(e) => setSfPassword(e.target.value)}
                        placeholder="••••••••"
                        className="bg-background border-border"
                        type="password"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">Security Token</Label>
                      <Input
                        value={sfSecurityToken}
                        onChange={(e) => setSfSecurityToken(e.target.value)}
                        placeholder="••••••••"
                        className="bg-background border-border"
                        type="password"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">Lead Object</Label>
                      <Input
                        value={sfLeadObject}
                        onChange={(e) => setSfLeadObject(e.target.value)}
                        placeholder="Lead"
                        className="bg-background border-border"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">Notes (POC)</Label>
                    <Textarea
                      value="This is a POC stub. Credentials are stored locally for demo only."
                      readOnly
                      className="bg-muted border-border resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Test Connection result */}
              {testStatus && (
                <div
                  className={`rounded-lg border p-3 text-sm flex items-start gap-2 ${
                    testStatus.ok ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                  }`}
                >
                  {testStatus.ok ? (
                    <CheckCircle2 className="h-4 w-4 text-green-700 mt-0.5" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-700 mt-0.5" />
                  )}
                  <div className={testStatus.ok ? "text-green-800" : "text-red-800"}>{testStatus.message}</div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border-foreground text-foreground"
                  onClick={handleTestConnection}
                  disabled={testing || !clientId}
                >
                  {testing ? "Testing…" : "Test Connection"}
                </Button>
                <Button
                  type="button"
                  className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white"
                  onClick={handleSave}
                  disabled={!canSave || saving}
                >
                  {saving ? "Saving…" : "Save"}
                </Button>
              </div>
            </>
          )}

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
