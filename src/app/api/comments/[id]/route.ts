import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const { id } = await params
    const body = await req.json()
    const { content, isResolved } = body
    const comment = await prisma.comment.findUnique({ where: { id } })
    if (!comment) return NextResponse.json({ error: "Not found" }, { status: 404 })
    if (comment.authorId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    const updated = await prisma.comment.update({
      where: { id },
      data: { ...(content && { content }), ...(isResolved !== undefined && { isResolved }) },
    })
    return NextResponse.json({ comment: updated })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const { id } = await params
    const comment = await prisma.comment.findUnique({ where: { id } })
    if (!comment) return NextResponse.json({ error: "Not found" }, { status: 404 })
    if (comment.authorId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    await prisma.comment.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
