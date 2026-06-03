import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search")
    const page = parseInt(searchParams.get("page") ?? "1")
    const limit = parseInt(searchParams.get("limit") ?? "20")

    const where: Record<string, unknown> = {}
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ]
    }

    const [organizations, total] = await Promise.all([
      prisma.organization.findMany({
        where,
        include: {
          _count: { select: { users: true, repositories: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.organization.count({ where }),
    ])

    return NextResponse.json({ organizations, total, page, limit })
  } catch (error) {
    console.error("GET /api/admin/organizations error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const { name, slug, description, plan, adminEmail } = body

    if (!name || !slug) {
      return NextResponse.json({ error: "name and slug required" }, { status: 400 })
    }

    const org = await prisma.organization.create({
      data: {
        name,
        slug,
        description,
        plan: plan ?? "FREE",
        isActive: true,
        settings: {},
      },
    })

    return NextResponse.json(org, { status: 201 })
  } catch (error) {
    console.error("POST /api/admin/organizations error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
