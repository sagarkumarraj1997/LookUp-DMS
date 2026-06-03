import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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

    const repository = await prisma.repository.findUnique({
      where: { id },
      include: {
        _count: { select: { documents: true, folders: true } },
        department: { select: { id: true, name: true } },
        folders: {
          where: { parentId: null, isArchived: false },
          include: {
            _count: { select: { documents: true, children: true } },
          },
        },
        documents: {
          where: { folderId: null, status: "ACTIVE" },
          take: 20,
          orderBy: { createdAt: "desc" },
          include: {
            uploadedBy: { select: { id: true, name: true, image: true } },
          },
        },
      },
    })

    if (!repository) {
      return NextResponse.json({ error: "Repository not found" }, { status: 404 })
    }

    return NextResponse.json(repository)
  } catch (error) {
    console.error("GET /api/repositories/[id] error:", error)
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
    const { name, description, departmentId, isPublic, isArchived, template, retentionDays } = body

    const repository = await prisma.repository.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(departmentId !== undefined && { departmentId }),
        ...(isPublic !== undefined && { isPublic }),
        ...(isArchived !== undefined && { isArchived }),
        ...(template !== undefined && { template }),
        ...(retentionDays !== undefined && { retentionDays }),
      },
    })

    return NextResponse.json(repository)
  } catch (error) {
    console.error("PATCH /api/repositories/[id] error:", error)
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

    await prisma.repository.update({
      where: { id },
      data: { isArchived: true },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/repositories/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
