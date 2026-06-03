import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import OpenAI from "openai"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { query, repositoryId, limit = 10 } = await req.json()
    if (!query) return NextResponse.json({ error: "query required" }, { status: 400 })

    // Generate embedding for the query
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: query,
    })
    const queryEmbedding = embeddingResponse.data[0].embedding

    // Fallback to text search since pgvector may not be configured
    const where: Record<string, unknown> = {}
    if (repositoryId) where.repositoryId = repositoryId

    const documents = await prisma.document.findMany({
      where: {
        ...where,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { tags: { has: query } },
        ],
      },
      include: {
        uploadedBy: { select: { id: true, name: true, image: true } },
        repository: { select: { id: true, name: true } },
      },
      take: limit,
    })

    return NextResponse.json({
      results: documents,
      query,
      embeddingDimensions: queryEmbedding.length,
    })
  } catch (error) {
    console.error("POST /api/ai/search error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
