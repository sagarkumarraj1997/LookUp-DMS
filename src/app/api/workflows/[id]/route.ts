import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const { id } = await params

    const workflow = await prisma.workflow.findUnique({
      where: { id },
      include: {
        repository: { select: { id: true, name: true } },
        instances: {
          orderBy: { startedAt: "desc" },
          take: 10,
          include: { triggeredBy: { select: { id: true, name: true } } },
        },
      },
    })

    if (!workflow) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(workflow)
  } catch (error) {
    console.error("GET /api/workflows/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const { id } = await params
    const body = await req.json()

    const workflow = await prisma.workflow.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        trigger: body.trigger,
        steps: body.steps,
        status: body.status,
      },
    })

    return NextResponse.json(workflow)
  } catch (error) {
    console.error("PUT /api/workflows/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const { id } = await params
    await prisma.workflow.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/workflows/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
