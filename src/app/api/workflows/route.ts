import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")
    const repositoryId = searchParams.get("repositoryId")

    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (repositoryId) where.repositoryId = repositoryId

    const workflows = await prisma.workflow.findMany({
      where,
      include: {
        repository: { select: { id: true, name: true } },
        _count: { select: { instances: true } },
      },
      orderBy: { updatedAt: "desc" },
    })

    return NextResponse.json({ workflows })
  } catch (error) {
    console.error("GET /api/workflows error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const { name, description, repositoryId, trigger, steps, template } = body

    if (!name || !repositoryId) {
      return NextResponse.json({ error: "name and repositoryId required" }, { status: 400 })
    }

    const workflow = await prisma.workflow.create({
      data: {
        name,
        description,
        repositoryId,
        trigger: trigger ?? {},
        steps: steps ?? [],
        status: "DRAFT",
        template,
      },
    })

    return NextResponse.json(workflow, { status: 201 })
  } catch (error) {
    console.error("POST /api/workflows error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
