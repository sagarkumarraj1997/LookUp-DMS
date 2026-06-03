import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const whiteboards = await prisma.whiteboard.findMany({
      where: { isPublic: true },
      orderBy: { updatedAt: "desc" },
    })

    return NextResponse.json({ whiteboards })
  } catch (error) {
    console.error("GET /api/whiteboards error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { name, description } = await req.json()

    const whiteboard = await prisma.whiteboard.create({
      data: {
        title: name ?? "Untitled Whiteboard",
        content: { elements: [] },
        isPublic: false,
      },
    })

    return NextResponse.json(whiteboard, { status: 201 })
  } catch (error) {
    console.error("POST /api/whiteboards error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id, content, name } = await req.json()
    const whiteboard = await prisma.whiteboard.update({
      where: { id },
      data: { content, title: name },
    })

    return NextResponse.json(whiteboard)
  } catch (error) {
    console.error("PUT /api/whiteboards error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
