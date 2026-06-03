import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  generateDocumentSummary,
  analyzeContract,
  detectRisks,
  extractKeyPoints,
  suggestTags,
} from "@/lib/ai"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { documentId, analysisType } = await req.json()
    if (!documentId) return NextResponse.json({ error: "documentId required" }, { status: 400 })

    const document = await prisma.document.findUnique({ where: { id: documentId } })
    if (!document) return NextResponse.json({ error: "Document not found" }, { status: 404 })

    // Use stored description/metadata as text placeholder
    const text = document.description ?? document.name ?? "No text content available."

    let result: unknown

    switch (analysisType) {
      case "summary":
        result = await generateDocumentSummary(text)
        break
      case "contract":
        result = await analyzeContract(text)
        break
      case "risks":
        result = await detectRisks(text)
        break
      case "keypoints":
        result = { keyPoints: await extractKeyPoints(text) }
        break
      case "tags":
        result = { tags: await suggestTags(text, document.tags) }
        break
      default:
        result = await generateDocumentSummary(text)
    }

    // Store summary in metadata
    await prisma.document.update({
      where: { id: documentId },
      data: {
        metadata: {
          ...(document.metadata as Record<string, unknown>),
          aiAnalysis: { ...(result as Record<string, unknown>), analyzedAt: new Date().toISOString(), type: analysisType },
        },
      },
    })

    return NextResponse.json(result as Record<string, unknown>)
  } catch (error) {
    console.error("POST /api/ai/analyze error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
