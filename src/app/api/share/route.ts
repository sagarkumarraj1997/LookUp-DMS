import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { randomBytes } from "crypto"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { documentId, expiresAt, password, allowDownload, allowView } = await req.json()

    if (!documentId) return NextResponse.json({ error: "documentId required" }, { status: 400 })

    const token = randomBytes(24).toString("hex")

    const link = await prisma.sharedLink.create({
      data: {
        token,
        documentId,
        createdById: session.user.id,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        password: password ?? null,
        permissions: allowDownload ? ["DOWNLOAD", "VIEW"] : ["VIEW"],
        isActive: true,
      },
    })

    const url = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/share/${token}`
    return NextResponse.json({ link, url }, { status: 201 })
  } catch (error) {
    console.error("POST /api/share error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
