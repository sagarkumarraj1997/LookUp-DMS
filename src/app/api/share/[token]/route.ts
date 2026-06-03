import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params

    const link = await prisma.sharedLink.findUnique({
      where: { token },
      include: {
        document: {
          select: {
            id: true,
            name: true,
            mimeType: true,
            driveWebViewLink: true,
            driveDownloadLink: true,
            fileSize: true,
            createdAt: true,
          },
        },
        createdBy: { select: { id: true, name: true, image: true } },
      },
    })

    if (!link) return NextResponse.json({ error: "Link not found" }, { status: 404 })
    if (!link.isActive) return NextResponse.json({ error: "Link is no longer active" }, { status: 410 })
    if (link.expiresAt && link.expiresAt < new Date()) {
      return NextResponse.json({ error: "Link has expired" }, { status: 410 })
    }

    // If password protected, don't return document details yet
    if (link.password) {
      return NextResponse.json({
        requiresPassword: true,
        documentName: link.document.name,
        createdBy: link.createdBy,
      })
    }

    // Increment download count as proxy for view count
    await prisma.sharedLink.update({
      where: { token },
      data: { downloadCount: { increment: 1 } },
    })

    const perms = link.permissions as string[]
    return NextResponse.json({
      document: link.document,
      allowDownload: perms.includes("DOWNLOAD"),
      allowView: perms.includes("VIEW"),
      createdBy: link.createdBy,
      expiresAt: link.expiresAt,
    })
  } catch (error) {
    console.error("GET /api/share/[token] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params
    const { password } = await req.json()

    const link = await prisma.sharedLink.findUnique({
      where: { token },
      include: { document: true, createdBy: { select: { id: true, name: true } } },
    })

    if (!link) return NextResponse.json({ error: "Not found" }, { status: 404 })
    if (link.password !== password) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 401 })
    }

    await prisma.sharedLink.update({ where: { token }, data: { downloadCount: { increment: 1 } } })

    const perms = link.permissions as string[]
    return NextResponse.json({
      document: link.document,
      allowDownload: perms.includes("DOWNLOAD"),
      allowView: perms.includes("VIEW"),
    })
  } catch (error) {
    console.error("POST /api/share/[token] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
