import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

interface MigrationJob {
  id: string
  source: string
  status: "pending" | "running" | "completed" | "failed"
  totalFiles: number
  processedFiles: number
  errors: string[]
  createdAt: string
  completedAt?: string
}

// In-memory store for migration jobs (in production, use DB)
const migrationJobs = new Map<string, MigrationJob>()

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const jobs = Array.from(migrationJobs.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    return NextResponse.json({ jobs })
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
    const { source, repositoryId, mapping } = body

    if (!source || !repositoryId) {
      return NextResponse.json({ error: "source and repositoryId required" }, { status: 400 })
    }

    const jobId = `job_${Date.now()}`
    const job: MigrationJob = {
      id: jobId,
      source,
      status: "pending",
      totalFiles: 0,
      processedFiles: 0,
      errors: [],
      createdAt: new Date().toISOString(),
    }

    migrationJobs.set(jobId, job)

    // Simulate async job start
    setTimeout(() => {
      const j = migrationJobs.get(jobId)
      if (j) {
        j.status = "running"
        j.totalFiles = Math.floor(Math.random() * 100) + 10
      }
    }, 1000)

    return NextResponse.json({ job }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
