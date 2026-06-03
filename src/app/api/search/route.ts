import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const q = searchParams.get("q") ?? ""
    const type = searchParams.get("type") // documents, notes, repositories
    const repositoryId = searchParams.get("repositoryId")
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")
    const sortBy = searchParams.get("sortBy") ?? "relevance"

    if (!q) return NextResponse.json({ results: {} })

    const dateFilter: Record<string, unknown> = {}
    if (dateFrom || dateTo) {
      if (dateFrom) dateFilter.gte = new Date(dateFrom)
      if (dateTo) dateFilter.lte = new Date(dateTo)
    }

    const results: Record<string, unknown[]> = {}

    if (!type || type === "documents") {
      const docWhere: Record<string, unknown> = {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { tags: { has: q } },
        ],
        status: "ACTIVE",
      }
      if (repositoryId) docWhere.repositoryId = repositoryId
      if (dateFrom || dateTo) docWhere.createdAt = dateFilter

      results.documents = await prisma.document.findMany({
        where: docWhere,
        include: {
          uploadedBy: { select: { id: true, name: true, image: true } },
          repository: { select: { id: true, name: true } },
        },
        orderBy: sortBy === "date" ? { createdAt: "desc" } : { updatedAt: "desc" },
        take: 20,
      })
    }

    if (!type || type === "notes") {
      results.notes = await prisma.note.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 10,
        orderBy: { updatedAt: "desc" },
      })
    }

    if (!type || type === "repositories") {
      results.repositories = await prisma.repository.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        },
        include: { _count: { select: { documents: true } } },
        take: 10,
      })
    }

    return NextResponse.json({ results, query: q })
  } catch (error) {
    console.error("GET /api/search error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
