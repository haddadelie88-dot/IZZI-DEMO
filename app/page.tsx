"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Users, Eye, Settings, Plus, Search, LayoutGrid, List } from "lucide-react"
// Sidebar is only shown on Configure Avatar page
import { Header } from "@/components/admin/header"
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

// Mock data
const initialClients: Client[] = [
  {
    id: "1",
    companyName: "Azilen",
    clientName: "Raksha Jain",
    email: "raksha@yopmail.com",
    phone: "1234566789",
    industry: "Real Estate",
    status: "not_published",
  },
  {
    id: "2",
    companyName: "Dar Global",
    clientName: "John Doe",
    email: "john.doe@hotmail.com",
    phone: "+9712233465",
    industry: "Real Estate",
    status: "not_published",
  },
  {
    id: "3",
    companyName: "SSUP World",
    clientName: "SSUP",
    email: "hello@ssupworld.com",
    phone: "+12345678901",
    industry: "Real Estate",
    status: "not_published",
  },
  {
    id: "4",
    companyName: "SSUP",
    clientName: "SSUP",
    email: "admin@ssup.com",
    phone: "+1987654321",
    industry: "Retail - Furniture",
    status: "not_published",
    crmConnected: true,
    crmType: "Zoho",
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

const statusOptions = [
  "All Clients",
  "Published",
  "Not Published",
]

export default function ClientsManagement() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>(initialClients)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All Clients")
  const [industryFilter, setIndustryFilter] = useState("All Industries")
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [crmModalOpen, setCrmModalOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [modalMode, setModalMode] = useState<"create" | "edit">("create")

  // Computed stats
  const totalClients = clients.length
  const publishedCount = clients.filter((c) => c.status === "published").length
  const pendingCount = clients.filter((c) => c.status === "not_published").length

  // Filtered clients
  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.clientName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus =
      statusFilter === "All Clients" ||
      (statusFilter === "Published" && client.status === "published") ||
      (statusFilter === "Not Published" && client.status === "not_published")
    const matchesIndustry =
      industryFilter === "All Industries" || client.industry === industryFilter
    return matchesSearch && matchesStatus && matchesIndustry
  })

  const handleCreateClient = (data: ClientFormData) => {
    if (modalMode === "edit" && editingClient) {
      // Update existing client
      setClients(clients.map(c => 
        c.id === editingClient.id 
          ? {
              ...c,
              companyName: data.companyName,
              clientName: data.clientName,
              email: data.email,
              phone: data.phone,
              industry: data.industryType,
            }
          : c
      ))
      setEditingClient(null)
      setModalMode("create")
    } else {
      // Create new client
      const newClient: Client = {
        id: Date.now().toString(),
        companyName: data.companyName,
        clientName: data.clientName,
        email: data.email,
        phone: data.phone,
        industry: data.industryType,
        status: "not_published",
      }
      setClients([...clients, newClient])
    }
  }

  const handleConfigure = (client: Client) => {
    router.push(`/configure?clientId=${client.id}`)
  }

  const handleConnectCRM = (client: Client) => {
    setSelectedClient(client)
    setCrmModalOpen(true)
  }

  const handleCRMConnect = (crmType: string) => {
    if (!selectedClient) return
    setClients(
      clients.map((c) =>
        c.id === selectedClient.id ? { ...c, crmConnected: true, crmType } : c
      )
    )
  }

  const handleDelete = (client: Client) => {
    setClients(clients.filter((c) => c.id !== client.id))
  }

  const handleEdit = (client: Client) => {
    setEditingClient(client)
    setModalMode("edit")
    setCreateModalOpen(true)
  }

  const handleOpenCreateModal = () => {
    setEditingClient(null)
    setModalMode("create")
    setCreateModalOpen(true)
  }

  const handleModalClose = (open: boolean) => {
    setCreateModalOpen(open)
    if (!open) {
      setEditingClient(null)
      setModalMode("create")
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <main className="flex-1 flex flex-col">
        <Header />
        
        <div className="flex-1 p-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Clients Management
            </h1>
            <p className="text-muted-foreground">
              Set up your AI avatar&apos;s knowledge, personality, and interaction style
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatsCard
              title="Total Client"
              value={totalClients}
              description="Active accounts in your portal"
              icon={Users}
            />
            <StatsCard
              title="Avatar Published"
              value={publishedCount}
              description="Live and engaging visitors"
              icon={Eye}
            />
            <StatsCard
              title="Pending Setup"
              value={pendingCount}
              description="Awaiting configuration"
              icon={Settings}
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <div className="flex-1 min-w-[250px] max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by company name or client name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-card border-border"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Status Filter</span>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] bg-card border-border">
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
              <span className="text-sm text-muted-foreground">Industry Filter</span>
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

            {/* View Toggle */}
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
              Add Client
            </Button>
          </div>

          {/* Clients Grid/List View */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredClients.map((client) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  onConfigure={handleConfigure}
                  onConnectCRM={handleConnectCRM}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredClients.map((client) => (
                <ClientListItem
                  key={client.id}
                  client={client}
                  onConfigure={handleConfigure}
                  onConnectCRM={handleConnectCRM}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          )}

          {filteredClients.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No clients found matching your filters.</p>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <CreateClientModal
        open={createModalOpen}
        onOpenChange={handleModalClose}
        onSubmit={handleCreateClient}
        mode={modalMode}
        editData={editingClient ? {
          companyName: editingClient.companyName,
          clientName: editingClient.clientName,
          domain: editingClient.domain || "",
          email: editingClient.email,
          phone: editingClient.phone,
          industryType: editingClient.industry,
        } : null}
      />
      
      <CRMConnectionModal
        open={crmModalOpen}
        onOpenChange={setCrmModalOpen}
        onConnect={handleCRMConnect}
        clientName={selectedClient?.companyName}
        clientId={selectedClient?.id}
      />
    </div>
  )
}
