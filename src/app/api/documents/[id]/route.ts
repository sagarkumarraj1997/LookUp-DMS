import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { deleteFile } from "@/lib/google-drive"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        uploadedBy: { select: { id: true, name: true, image: true } },
        ownedBy: { select: { id: true, name: true, image: true } },
        versions: { orderBy: { version: "desc" }, take: 10 },
        comments: {
          where: { parentId: null },
          include: {
            author: { select: { id: true, name: true, image: true } },
            replies: {
              include: { author: { select: { id: true, name: true, image: true } } },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        aiSummaries: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    })

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    await prisma.auditLog.create({
      data: {
        action: "FILE_VIEW",
        userId: session.user.id,
        resourceId: id,
        resourceType: "document",
        details: { name: document.name },
      },
    }).catch(() => {})

    return NextResponse.json(document)
  } catch (error) {
    console.error("GET /api/documents/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { name, description, tags, folderId, status, isPublic } = body

    const document = await prisma.document.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(tags && { tags }),
        ...(folderId !== undefined && { folderId }),
        ...(status && { status }),
        ...(isPublic !== undefined && { isPublic }),
      },
    })

    return NextResponse.json(document)
  } catch (error) {
    console.error("PATCH /api/documents/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const document = await prisma.document.findUnique({ where: { id } })
    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    try {
      if (!document.driveFileId.startsWith("placeholder-")) {
        await deleteFile(document.driveFileId)
      }
    } catch (driveError) {
      console.error("Drive delete failed:", driveError)
    }

    await prisma.document.update({
      where: { id },
      data: { status: "DELETED" },
    })

    await prisma.auditLog.create({
      data: {
        action: "FILE_DELETE",
        userId: session.user.id,
        resourceId: id,
        resourceType: "document",
        details: { name: document.name },
      },
    }).catch(() => {})

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/documents/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
