import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const orgId = searchParams.get("orgId")
    const search = searchParams.get("search") || ""
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    if (!orgId) {
      return NextResponse.json({ error: "orgId required" }, { status: 400 })
    }

    const where = {
      organizations: { some: { organizationId: orgId } },
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          isActive: true,
          lastLogin: true,
          createdAt: true,
          organizations: {
            where: { organizationId: orgId },
            select: { role: true, permissions: true, joinedAt: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ])

    return NextResponse.json({
      users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error("GET /api/users error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, email, role, orgId, password } = body

    if (!email || !orgId) {
      return NextResponse.json({ error: "email and orgId required" }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      // Add to org if not already member
      const membership = await prisma.userOrganization.findUnique({
        where: { userId_organizationId: { userId: existing.id, organizationId: orgId } },
      })
      if (membership) {
        return NextResponse.json({ error: "User already in organization" }, { status: 409 })
      }
      await prisma.userOrganization.create({
        data: { userId: existing.id, organizationId: orgId, role: role || "VIEWER" },
      })
      return NextResponse.json({ user: existing, added: true })
    }

    let hashedPassword: string | undefined
    if (password) {
      const bcrypt = await import("bcryptjs")
      hashedPassword = await bcrypt.hash(password, 12)
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "VIEWER",
        organizations: {
          create: { organizationId: orgId, role: role || "VIEWER" },
        },
      },
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    console.error("POST /api/users error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
