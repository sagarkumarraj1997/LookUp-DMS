import { NextRequest, NextResponse } from "next/server"

const PUBLIC_PATHS = ["/", "/login", "/register", "/forgot-password", "/offline"]
const AUTH_PATHS = ["/login", "/register", "/forgot-password"]

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/share") ||
    pathname.match(/\.(ico|png|svg|jpg|jpeg|webp|woff2?)$/)
  ) {
    return NextResponse.next()
  }

  const sessionToken =
    req.cookies.get("next-auth.session-token")?.value ||
    req.cookies.get("__Secure-next-auth.session-token")?.value

  const isLoggedIn = !!sessionToken
  const isPublic = PUBLIC_PATHS.includes(pathname)
  const isAuthPath = AUTH_PATHS.includes(pathname)

  if (isAuthPath && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }
  if (!isLoggedIn && !isPublic) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
