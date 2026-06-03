import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateSlug } from "@/lib/utils"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const organizations = await prisma.organization.findMany({
      where: {
        users: { some: { userId: session.user.id } },
        isActive: true,
      },
      include: {
        _count: { select: { repositories: true, users: true } },
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json(organizations)
  } catch (error) {
    console.error("GET /api/organizations error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, description, domain, logo } = body

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const slug = generateSlug(name)

    const existing = await prisma.organization.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json({ error: "Organization with this name already exists" }, { status: 409 })
    }

    const organization = await prisma.organization.create({
      data: {
        name,
        slug,
        description,
        domain,
        logo,
        users: {
          create: {
            userId: session.user.id,
            role: "ORG_ADMIN",
            isDefault: true,
            permissions: ["VIEW", "CREATE", "EDIT", "DELETE", "SHARE", "DOWNLOAD", "APPROVE", "SIGN", "ARCHIVE", "MANAGE_USERS"],
          },
        },
      },
      include: {
        _count: { select: { repositories: true, users: true } },
      },
    })

    return NextResponse.json(organization, { status: 201 })
  } catch (error) {
    console.error("POST /api/organizations error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
