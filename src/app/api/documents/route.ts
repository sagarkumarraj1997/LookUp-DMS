import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { uploadFile } from "@/lib/google-drive"
import crypto from "crypto"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const repositoryId = searchParams.get("repositoryId")
    const folderId = searchParams.get("folderId")
    const search = searchParams.get("search")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")

    const where: Record<string, unknown> = { status: "ACTIVE" }
    if (repositoryId) where.repositoryId = repositoryId
    if (folderId !== undefined) where.folderId = folderId || null
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { has: search } },
      ]
    }

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        include: {
          uploadedBy: { select: { id: true, name: true, image: true } },
          ownedBy: { select: { id: true, name: true, image: true } },
          _count: { select: { comments: true, versions: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.document.count({ where }),
    ])

    return NextResponse.json({
      documents,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("GET /api/documents error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File
    const repositoryId = formData.get("repositoryId") as string
    const folderId = formData.get("folderId") as string | null
    const description = formData.get("description") as string | null
    const tags = formData.get("tags") as string | null

    if (!file || !repositoryId) {
      return NextResponse.json({ error: "File and repositoryId are required" }, { status: 400 })
    }

    const repository = await prisma.repository.findUnique({
      where: { id: repositoryId },
    })

    if (!repository) {
      return NextResponse.json({ error: "Repository not found" }, { status: 404 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const checksum = crypto.createHash("md5").update(buffer).digest("hex")
    const extension = file.name.split(".").pop()?.toLowerCase()

    let driveFileId = `placeholder-${Date.now()}`
    let driveWebViewLink: string | undefined
    let driveDownloadLink: string | undefined

    try {
      const driveFile = await uploadFile(
        buffer,
        file.name,
        file.type,
        repository.driveRootFolderId || undefined
      )
      driveFileId = driveFile.id
      driveWebViewLink = driveFile.webViewLink
      driveDownloadLink = driveFile.webContentLink
    } catch (driveError) {
      console.error("Drive upload failed:", driveError)
      // Continue with placeholder in development
    }

    const document = await prisma.document.create({
      data: {
        name: file.name,
        description: description || undefined,
        repositoryId,
        folderId: folderId || undefined,
        driveFileId,
        driveWebViewLink,
        driveDownloadLink,
        mimeType: file.type,
        fileSize: BigInt(file.size),
        extension,
        tags: tags ? tags.split(",").map((t) => t.trim()) : [],
        uploadedById: session.user.id,
        ownedById: session.user.id,
        checksum,
      },
      include: {
        uploadedBy: { select: { id: true, name: true, image: true } },
      },
    })

    await prisma.auditLog.create({
      data: {
        action: "FILE_UPLOAD",
        userId: session.user.id,
        organizationId: repository.organizationId,
        resourceId: document.id,
        resourceType: "document",
        details: { name: file.name, size: file.size },
      },
    }).catch(() => {})

    return NextResponse.json(document, { status: 201 })
  } catch (error) {
    console.error("POST /api/documents error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
