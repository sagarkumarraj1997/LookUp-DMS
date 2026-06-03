import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const format = searchParams.get("format") || "csv"
    const type = searchParams.get("type") || "documents"
    const orgId = searchParams.get("orgId")

    if (format === "csv") {
      let csvData = ""
      if (type === "documents") {
        const docs = await prisma.document.findMany({
          where: { ...(orgId && { repository: { organizationId: orgId } }), status: "ACTIVE" },
          select: {
            id: true, name: true, mimeType: true, fileSize: true, createdAt: true,
            uploadedBy: { select: { name: true, email: true } },
            repository: { select: { name: true } },
          },
          take: 1000,
        })
        const headers = "ID,Name,Type,Size (bytes),Repository,Uploaded By,Date\n"
        const rows = docs.map(d =>
          `"${d.id}","${d.name}","${d.mimeType}",${d.fileSize},"${d.repository.name}","${d.uploadedBy.name || d.uploadedBy.email}","${d.createdAt.toISOString()}"`
        ).join("\n")
        csvData = headers + rows
      } else if (type === "users") {
        const users = await prisma.user.findMany({
          where: orgId ? { organizations: { some: { organizationId: orgId } } } : {},
          select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true, lastLogin: true },
          take: 1000,
        })
        const headers = "ID,Name,Email,Role,Active,Created,Last Login\n"
        const rows = users.map(u =>
          `"${u.id}","${u.name || ""}","${u.email}","${u.role}",${u.isActive},"${u.createdAt.toISOString()}","${u.lastLogin?.toISOString() || ""}"`
        ).join("\n")
        csvData = headers + rows
      } else if (type === "audit") {
        const logs = await prisma.auditLog.findMany({
          where: { ...(orgId && { organizationId: orgId }) },
          select: { id: true, action: true, createdAt: true, ipAddress: true, resourceType: true, resourceId: true, user: { select: { email: true } } },
          orderBy: { createdAt: "desc" },
          take: 1000,
        })
        const headers = "ID,Action,User,Resource Type,Resource ID,IP,Date\n"
        const rows = logs.map(l =>
          `"${l.id}","${l.action}","${l.user?.email || "system"}","${l.resourceType || ""}","${l.resourceId || ""}","${l.ipAddress || ""}","${l.createdAt.toISOString()}"`
        ).join("\n")
        csvData = headers + rows
      }

      return new NextResponse(csvData, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${type}-export-${Date.now()}.csv"`,
        },
      })
    }

    return NextResponse.json({ error: "Unsupported format" }, { status: 400 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
