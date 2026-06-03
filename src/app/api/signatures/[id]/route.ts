import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const request = await prisma.signatureRequest.findUnique({
      where: { id },
      include: {
        document: { select: { id: true, name: true, mimeType: true, driveWebViewLink: true } },
        requestedBy: { select: { id: true, name: true, image: true, email: true } },
        signatures: {
          include: { signer: { select: { id: true, name: true, image: true, email: true } } },
          orderBy: { order: "asc" },
        },
      },
    })

    if (!request) return NextResponse.json({ error: "Not found" }, { status: 404 })

    return NextResponse.json(request)
  } catch (error) {
    console.error("GET /api/signatures/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const body = await req.json()

    const request = await prisma.signatureRequest.update({
      where: { id },
      data: { status: body.status, dueDate: body.dueDate ? new Date(body.dueDate) : undefined },
    })

    return NextResponse.json(request)
  } catch (error) {
    console.error("PUT /api/signatures/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    await prisma.signatureRequest.update({
      where: { id, requestedById: session.user.id },
      data: { status: "CANCELLED" },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/signatures/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
