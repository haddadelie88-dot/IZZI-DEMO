type SessionLike = {
  isSuperAdmin?: boolean
  activeTenantId?: string | null
  activeTenantRole?: "ADMIN" | "MEMBER" | null
}

export function requireSuperAdmin(session: SessionLike | null | undefined) {
  if (!session?.isSuperAdmin) {
    throw new Error("Forbidden: super admin access required")
  }
}

export function requireTenantAdmin(session: SessionLike | null | undefined, tenantId: string) {
  if (!session) throw new Error("Unauthorized")
  if (session.isSuperAdmin) return
  if (!session.activeTenantId || session.activeTenantId !== tenantId || session.activeTenantRole !== "ADMIN") {
    throw new Error("Forbidden: tenant admin access required")
  }
}

export function requireTenantMember(session: SessionLike | null | undefined, tenantId: string) {
  if (!session) throw new Error("Unauthorized")
  if (session.isSuperAdmin) return
  if (!session.activeTenantId || session.activeTenantId !== tenantId) {
    throw new Error("Forbidden: tenant membership required")
  }
}

export function getTenantId(session: SessionLike | null | undefined) {
  if (!session?.activeTenantId) {
    throw new Error("No active tenant")
  }
  return session.activeTenantId
}

