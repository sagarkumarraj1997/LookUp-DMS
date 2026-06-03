import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getOrCreateRepoFolder } from "@/lib/google-drive"
import { generateSlug } from "@/lib/utils"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const organizationId = searchParams.get("organizationId")

    const where: Record<string, unknown> = { isArchived: false }
    if (organizationId) where.organizationId = organizationId

    const repositories = await prisma.repository.findMany({
      where,
      include: {
        _count: { select: { documents: true, folders: true } },
        department: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(repositories)
  } catch (error) {
    console.error("GET /api/repositories error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, description, organizationId, departmentId, template, isPublic, retentionDays } = body

    if (!name || !organizationId) {
      return NextResponse.json(
        { error: "Name and organizationId are required" },
        { status: 400 }
      )
    }

    // Get the org's drive folder
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
    })

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 })
    }

    // Create repo in DB first to get ID
    const repoId = `${generateSlug(name)}-${Date.now()}`
    let driveRootFolderId: string | undefined
    let driveRootFolderPath: string | undefined

    try {
      const driveFolder = await getOrCreateRepoFolder(name, repoId, org.settings && (org.settings as Record<string, unknown>).driveFolderId as string || process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID || "")
      driveRootFolderId = driveFolder.id
      driveRootFolderPath = driveFolder.webViewLink
    } catch (driveError) {
      console.error("Drive folder creation failed:", driveError)
      // Continue without drive folder in development
    }

    const repository = await prisma.repository.create({
      data: {
        name,
        description,
        organizationId,
        departmentId: departmentId || undefined,
        template: template || undefined,
        isPublic: isPublic ?? false,
        retentionDays: retentionDays || undefined,
        driveRootFolderId,
        driveRootFolderPath,
      },
      include: {
        _count: { select: { documents: true, folders: true } },
        department: { select: { id: true, name: true } },
      },
    })

    await prisma.auditLog.create({
      data: {
        action: "REPO_CREATE",
        userId: session.user.id,
        organizationId,
        resourceId: repository.id,
        resourceType: "repository",
        details: { name },
      },
    }).catch(() => {})

    return NextResponse.json(repository, { status: 201 })
  } catch (error) {
    console.error("POST /api/repositories error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
