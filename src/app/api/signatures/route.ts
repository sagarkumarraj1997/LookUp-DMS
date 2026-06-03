import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notifySignatureRequest } from "@/lib/notifications"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")

    const where: Record<string, unknown> = { requestedById: session.user.id }
    if (status) where.status = status

    const [requests, total] = await Promise.all([
      prisma.signatureRequest.findMany({
        where,
        include: {
          document: { select: { id: true, name: true, mimeType: true } },
          requestedBy: { select: { id: true, name: true, image: true } },
          signatures: { include: { signer: { select: { id: true, name: true, image: true, email: true } } } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.signatureRequest.count({ where }),
    ])

    return NextResponse.json({ requests, total, page, limit })
  } catch (error) {
    console.error("GET /api/signatures error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const { documentId, title, message, dueDate, signers } = body

    if (!documentId || !title || !signers?.length) {
      return NextResponse.json({ error: "documentId, title, and signers required" }, { status: 400 })
    }

    const request = await prisma.signatureRequest.create({
      data: {
        documentId,
        requestedById: session.user.id,
        title,
        message,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        signatures: {
          create: signers.map((s: { userId: string; order: number }) => ({
            signerId: s.userId,
            order: s.order,
            status: "PENDING",
          })),
        },
      },
      include: {
        document: true,
        signatures: { include: { signer: true } },
      },
    })

    await notifySignatureRequest(request.id).catch(console.error)

    return NextResponse.json(request, { status: 201 })
  } catch (error) {
    console.error("POST /api/signatures error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
