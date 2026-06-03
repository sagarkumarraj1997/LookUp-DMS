import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // Generate a long-lived token for desktop app
    const token = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days

    // Store as a session
    await prisma.session.create({
      data: {
        sessionToken: `desktop_${token}`,
        userId: session.user.id,
        expires: expiresAt,
      },
    })

    return NextResponse.json({
      token,
      expiresAt: expiresAt.toISOString(),
      userId: session.user.id,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const token = searchParams.get("token")
    if (token) {
      await prisma.session.delete({ where: { sessionToken: `desktop_${token}` } })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
