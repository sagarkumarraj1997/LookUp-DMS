import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

function getDateRange(range: string): Date {
  const now = new Date()
  const days = parseInt(range.replace("d", "")) || 30
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const metric = searchParams.get("metric") || "activity"
    const range = searchParams.get("range") || "30d"
    const orgId = searchParams.get("orgId")
    const since = getDateRange(range)

    switch (metric) {
      case "storage": {
        const docs = await prisma.document.findMany({
          where: { ...(orgId && { repository: { organizationId: orgId } }), status: "ACTIVE" },
          select: { fileSize: true, mimeType: true, createdAt: true },
        })
        const byType: Record<string, number> = {}
        docs.forEach(d => {
          const type = d.mimeType.split("/")[0] || "other"
          byType[type] = (byType[type] || 0) + Number(d.fileSize)
        })
        const totalBytes = docs.reduce((sum, d) => sum + Number(d.fileSize), 0)
        return NextResponse.json({
          total: totalBytes,
          totalGB: (totalBytes / 1073741824).toFixed(2),
          byType: Object.entries(byType).map(([type, bytes]) => ({ type, bytes })),
        })
      }

      case "activity": {
        const logs = await prisma.auditLog.findMany({
          where: {
            createdAt: { gte: since },
            ...(orgId && { organizationId: orgId }),
          },
          select: { createdAt: true, action: true },
          orderBy: { createdAt: "asc" },
        })
        const byDay: Record<string, number> = {}
        logs.forEach(l => {
          const day = l.createdAt.toISOString().split("T")[0]
          byDay[day] = (byDay[day] || 0) + 1
        })
        const data = Object.entries(byDay).map(([date, count]) => ({ date, count }))
        return NextResponse.json({ data, total: logs.length })
      }

      case "files": {
        const [total, active, archived] = await Promise.all([
          prisma.document.count({ where: { ...(orgId && { repository: { organizationId: orgId } }) } }),
          prisma.document.count({ where: { status: "ACTIVE", ...(orgId && { repository: { organizationId: orgId } }) } }),
          prisma.document.count({ where: { status: "ARCHIVED", ...(orgId && { repository: { organizationId: orgId } }) } }),
        ])
        const recent = await prisma.document.findMany({
          where: { createdAt: { gte: since }, ...(orgId && { repository: { organizationId: orgId } }) },
          select: { createdAt: true },
          orderBy: { createdAt: "asc" },
        })
        const byDay: Record<string, number> = {}
        recent.forEach(d => {
          const day = d.createdAt.toISOString().split("T")[0]
          byDay[day] = (byDay[day] || 0) + 1
        })
        return NextResponse.json({ total, active, archived, data: Object.entries(byDay).map(([date, count]) => ({ date, count })) })
      }

      case "users": {
        const [total, active] = await Promise.all([
          orgId
            ? prisma.userOrganization.count({ where: { organizationId: orgId } })
            : prisma.user.count(),
          prisma.user.count({ where: { isActive: true, lastLogin: { gte: since } } }),
        ])
        return NextResponse.json({ total, activeLastPeriod: active })
      }

      default:
        return NextResponse.json({ error: "Invalid metric" }, { status: 400 })
    }
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
