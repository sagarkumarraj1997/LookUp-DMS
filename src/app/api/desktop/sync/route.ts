import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const since = searchParams.get("since")
    const repositoryId = searchParams.get("repositoryId")

    const since_date = since ? new Date(since) : new Date(Date.now() - 24 * 60 * 60 * 1000)

    const changes = await prisma.document.findMany({
      where: {
        updatedAt: { gte: since_date },
        ...(repositoryId && { repositoryId }),
        status: "ACTIVE",
      },
      select: {
        id: true, name: true, driveFileId: true, mimeType: true, fileSize: true,
        updatedAt: true, createdAt: true, folderId: true, repositoryId: true,
      },
      orderBy: { updatedAt: "desc" },
      take: 500,
    })

    return NextResponse.json({
      changes,
      syncedAt: new Date().toISOString(),
      count: changes.length,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const { changes } = body

    if (!Array.isArray(changes)) return NextResponse.json({ error: "changes array required" }, { status: 400 })

    const results: { id: string; status: string }[] = []
    for (const change of changes) {
      try {
        if (change.type === "delete" && change.id) {
          await prisma.document.update({ where: { id: change.id }, data: { status: "DELETED" } })
          results.push({ id: change.id, status: "deleted" })
        } else {
          results.push({ id: change.id, status: "skipped" })
        }
      } catch {
        results.push({ id: change.id, status: "error" })
      }
    }

    return NextResponse.json({ results, processedAt: new Date().toISOString() })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
