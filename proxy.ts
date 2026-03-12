import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

const PUBLIC_PATHS = ["/login", "/forgot-password", "/reset-password", "/invite/accept"]
const AUTH_SECRET = process.env.NEXTAUTH_SECRET || "izzi-dev-secret-change-me"

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const demoRole = req.cookies.get("izzi_demo_role")?.value

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    const token = await getToken({ req, secret: AUTH_SECRET })
    if (token && pathname === "/login") {
      const url = req.nextUrl.clone()
      url.pathname = token.isSuperAdmin ? "/super-admin/tenants" : "/tenant/dashboard"
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  const token = await getToken({ req, secret: AUTH_SECRET })

  if (!token) {
    if (pathname.startsWith("/super-admin") && demoRole === "super") {
      return NextResponse.next()
    }
    if (pathname.startsWith("/tenant") && (demoRole === "tenant" || demoRole === "super")) {
      return NextResponse.next()
    }
    if (pathname.startsWith("/configure") && (demoRole === "tenant" || demoRole === "super")) {
      return NextResponse.next()
    }
    const url = req.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  if (pathname.startsWith("/super-admin") && !token.isSuperAdmin) {
    const url = req.nextUrl.clone()
    url.pathname = "/tenant/dashboard"
    return NextResponse.redirect(url)
  }

  if (pathname.startsWith("/tenant") && !token.activeTenantId && !token.isSuperAdmin) {
    const url = req.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}

