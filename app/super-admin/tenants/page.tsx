"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Users, Eye, Settings, Plus, Search, LayoutGrid, List } from "lucide-react"
import { Header } from "@/components/admin/header"
import { PortalNav } from "@/components/admin/portal-nav"
import { StatsCard } from "@/components/admin/stats-card"
import { ClientCard, Client } from "@/components/admin/client-card"
import { ClientListItem } from "@/components/admin/client-list-item"
import { CreateClientModal, ClientFormData } from "@/components/admin/create-client-modal"
import { CRMConnectionModal } from "@/components/admin/crm-connection-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const initialTenants: Client[] = [
  {
    id: "dar-global",
    companyName: "Dar Global",
    clientName: "Dar Global Admin",
    email: "tenantadmin@dar-global.com",
    phone: "",
    industry: "Real Estate",
    status: "not_published",
  },
]

const industries = [
  "All Industries",
  "Real Estate",
  "Retail - Furniture",
  "Retail - Electronics",
  "Healthcare",
  "Finance",
]

const statusOptions = ["All Tenants", "Published", "Not Published"]

export default function SuperAdminTenantsPage() {
  const router = useRouter()
  const [tenants, setTenants] = useState<Client[]>(initialTenants)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All Tenants")
  const [industryFilter, setIndustryFilter] = useState("All Industries")
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [crmModalOpen, setCrmModalOpen] = useState(false)
  const [selectedTenant, setSelectedTenant] = useState<Client | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [editingTenant, setEditingTenant] = useState<Client | null>(null)
  const [modalMode, setModalMode] = useState<"create" | "edit">("create")

  const totalTenants = tenants.length
  const publishedCount = tenants.filter((t) => t.status === "published").length
  const pendingCount = tenants.filter((t) => t.status === "not_published").length

  const filteredTenants = tenants.filter((tenant) => {
    const matchesSearch =
      tenant.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.clientName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus =
      statusFilter === "All Tenants" ||
      (statusFilter === "Published" && tenant.status === "published") ||
      (statusFilter === "Not Published" && tenant.status === "not_published")
    const matchesIndustry = industryFilter === "All Industries" || tenant.industry === industryFilter
    return matchesSearch && matchesStatus && matchesIndustry
  })

  const handleCreateTenant = (data: ClientFormData) => {
    if (modalMode === "edit" && editingTenant) {
      setTenants(
        tenants.map((t) =>
          t.id === editingTenant.id
            ? {
                ...t,
                companyName: data.companyName,
                clientName: data.clientName,
                email: data.email,
                phone: data.phone,
                industry: data.industryType,
              }
            : t,
        ),
      )
      setEditingTenant(null)
      setModalMode("create")
    } else {
      const newTenant: Client = {
        id: Date.now().toString(),
        companyName: data.companyName,
        clientName: data.clientName,
        email: data.email,
        phone: data.phone,
        industry: data.industryType,
        status: "not_published",
      }
      setTenants([...tenants, newTenant])
    }
  }

  const handleViewTenantDashboard = (tenant: Client) => {
    router.push(`/tenant/dashboard?tenantId=${encodeURIComponent(tenant.id)}`)
  }

  const handleConnectCRM = (tenant: Client) => {
    setSelectedTenant(tenant)
    setCrmModalOpen(true)
  }

  const handleCRMConnect = (crmType: string) => {
    if (!selectedTenant) return
    setTenants(
      tenants.map((t) =>
        t.id === selectedTenant.id ? { ...t, crmConnected: true, crmType } : t,
      ),
    )
  }

  const handleDelete = (tenant: Client) => {
    setTenants(tenants.filter((t) => t.id !== tenant.id))
  }

  const handleEdit = (tenant: Client) => {
    setEditingTenant(tenant)
    setModalMode("edit")
    setCreateModalOpen(true)
  }

  const handleOpenCreateModal = () => {
    setEditingTenant(null)
    setModalMode("create")
    setCreateModalOpen(true)
  }

  const handleModalClose = (open: boolean) => {
    setCreateModalOpen(open)
    if (!open) {
      setEditingTenant(null)
      setModalMode("create")
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <main className="flex-1 flex flex-col">
        <Header />
        <PortalNav area="super" />

        <div className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Tenants</h1>
            <p className="text-muted-foreground">
              Manage tenants, quotas, and CRM connections across your IZZI platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatsCard
              title="Total Tenants"
              value={totalTenants}
              description="Accounts onboarded on the platform"
              icon={Users}
            />
            <StatsCard
              title="Published"
              value={publishedCount}
              description="Live and actively using IZZI"
              icon={Eye}
            />
            <StatsCard
              title="Pending Setup"
              value={pendingCount}
              description="Awaiting configuration"
              icon={Settings}
            />
          </div>

          <div className="flex flex-wrap items-center gap-4 mb-8">
            <div className="flex-1 min-w-[250px] max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by tenant or admin name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-card border-border"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Status</span>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px] bg-card border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Industry</span>
              <Select value={industryFilter} onValueChange={setIndustryFilter}>
                <SelectTrigger className="w-[150px] bg-card border-border">
                  <SelectValue />
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

            <div className="flex-1" />

            <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                className={`h-8 w-8 p-0 ${viewMode === "grid" ? "bg-primary text-primary-foreground" : ""}`}
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                className={`h-8 w-8 p-0 ${viewMode === "list" ? "bg-primary text-primary-foreground" : ""}`}
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            <Button
              onClick={handleOpenCreateModal}
              className="bg-foreground text-background hover:bg-foreground/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Tenant
            </Button>
          </div>

          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredTenants.map((tenant) => (
                <ClientCard
                  key={tenant.id}
                  client={tenant}
                  onConfigure={handleViewTenantDashboard}
                  onConnectCRM={handleConnectCRM}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredTenants.map((tenant) => (
                <ClientListItem
                  key={tenant.id}
                  client={tenant}
                  onConfigure={handleViewTenantDashboard}
                  onConnectCRM={handleConnectCRM}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          )}

          {filteredTenants.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No tenants found matching your filters.</p>
            </div>
          )}
        </div>
      </main>

      <CreateClientModal
        open={createModalOpen}
        onOpenChange={handleModalClose}
        onSubmit={handleCreateTenant}
        mode={modalMode}
        editData={
          editingTenant
            ? {
                companyName: editingTenant.companyName,
                clientName: editingTenant.clientName,
                domain: editingTenant.domain || "",
                email: editingTenant.email,
                phone: editingTenant.phone,
                industryType: editingTenant.industry,
              }
            : null
        }
      />

      <CRMConnectionModal
        open={crmModalOpen}
        onOpenChange={setCrmModalOpen}
        onConnect={handleCRMConnect}
        clientName={selectedTenant?.companyName}
        clientId={selectedTenant?.id}
      />
    </div>
  )
}

