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
        { title: { contains: search, mode: "insensitive" } },
      ]
    }

    const [notes, total] = await Promise.all([
      prisma.note.findMany({
        where,
        select: {
          id: true,
          title: true,
          content: true,
          tags: true,
          isPublic: true,
          template: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.note.count({ where }),
    ])

    return NextResponse.json({ notes, total, page, limit })
  } catch (error) {
    console.error("GET /api/notes error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const { title, content, tags, color, isPinned } = body

    const note = await prisma.note.create({
      data: {
        title: title ?? "Untitled Note",
        content: content ? { text: content } : { text: "" },
        tags: tags ?? [],
        isPublic: false,
      },
    })

    return NextResponse.json(note, { status: 201 })
  } catch (error) {
    console.error("POST /api/notes error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
