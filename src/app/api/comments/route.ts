import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const documentId = searchParams.get("documentId")
    if (!documentId) return NextResponse.json({ error: "documentId required" }, { status: 400 })

    const comments = await prisma.comment.findMany({
      where: { documentId, parentId: null },
      include: {
        author: { select: { id: true, name: true, email: true, image: true } },
        replies: {
          include: { author: { select: { id: true, name: true, email: true, image: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ comments })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const { content, documentId, parentId } = body

    if (!content || !documentId) return NextResponse.json({ error: "content and documentId required" }, { status: 400 })

    const comment = await prisma.comment.create({
      data: { content, documentId, authorId: session.user.id, parentId: parentId || null },
      include: { author: { select: { id: true, name: true, email: true, image: true } } },
    })

    return NextResponse.json({ comment }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
