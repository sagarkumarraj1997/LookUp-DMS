import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const repositoryId = searchParams.get("repositoryId")
    const parentId = searchParams.get("parentId") || null

    if (!repositoryId) return NextResponse.json({ error: "repositoryId required" }, { status: 400 })

    const folders = await prisma.folder.findMany({
      where: { repositoryId, parentId, isArchived: false },
      include: { _count: { select: { children: true, documents: true } } },
      orderBy: { name: "asc" },
    })

    return NextResponse.json({ folders })
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
    const { name, repositoryId, parentId } = body

    if (!name || !repositoryId) return NextResponse.json({ error: "name and repositoryId required" }, { status: 400 })

    let path = `/${name}`
    if (parentId) {
      const parent = await prisma.folder.findUnique({ where: { id: parentId } })
      if (parent) path = `${parent.path}/${name}`
    }

    const folder = await prisma.folder.create({
      data: { name, repositoryId, parentId: parentId || null, path },
    })

    return NextResponse.json({ folder }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
