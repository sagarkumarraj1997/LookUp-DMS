import { PrismaClient, UserRole, AuditAction } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Starting database seed...")

  // Create super admin
  const adminPassword = await bcrypt.hash("Admin123!", 12)
  const admin = await prisma.user.upsert({
    where: { email: "admin@lookupdms.com" },
    update: {},
    create: {
      name: "Super Admin",
      email: "admin@lookupdms.com",
      password: adminPassword,
      role: UserRole.SUPER_ADMIN,
      isActive: true,
      emailVerified: new Date(),
    },
  })
  console.log("Created admin:", admin.email)

  // Create demo organization
  const org = await prisma.organization.upsert({
    where: { slug: "acme-corporation" },
    update: {},
    create: {
      name: "Acme Corporation",
      slug: "acme-corporation",
      description: "A demo enterprise organization",
      plan: "enterprise",
      isActive: true,
    },
  })
  console.log("Created org:", org.name)

  // Link admin to org
  await prisma.userOrganization.upsert({
    where: { userId_organizationId: { userId: admin.id, organizationId: org.id } },
    update: {},
    create: { userId: admin.id, organizationId: org.id, role: UserRole.ORG_ADMIN, isDefault: true },
  })

  // Create departments
  const deptNames = ["Engineering", "Finance", "HR", "Legal"]
  const departments = await Promise.all(
    deptNames.map(name =>
      prisma.department.upsert({
        where: { id: `dept-${name.toLowerCase()}-${org.id}` },
        update: {},
        create: {
          id: `dept-${name.toLowerCase()}-${org.id}`,
          name,
          organizationId: org.id,
        },
      })
    )
  )
  console.log("Created departments:", deptNames.join(", "))

  // Create demo users
  const demoUsers = [
    { name: "Alice Johnson", email: "alice@acme.com", role: UserRole.REPO_ADMIN },
    { name: "Bob Smith", email: "bob@acme.com", role: UserRole.MANAGER },
    { name: "Carol White", email: "carol@acme.com", role: UserRole.CONTRIBUTOR },
    { name: "David Brown", email: "david@acme.com", role: UserRole.REVIEWER },
    { name: "Eve Davis", email: "eve@acme.com", role: UserRole.VIEWER },
  ]

  const userPassword = await bcrypt.hash("Demo123!", 12)
  for (const u of demoUsers) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        name: u.name,
        email: u.email,
        password: userPassword,
        role: u.role,
        isActive: true,
        emailVerified: new Date(),
      },
    })
    await prisma.userOrganization.upsert({
      where: { userId_organizationId: { userId: user.id, organizationId: org.id } },
      update: {},
      create: { userId: user.id, organizationId: org.id, role: u.role },
    })
  }
  console.log("Created demo users")

  // Create repositories
  const repoData = [
    { name: "Engineering Docs", description: "Technical documentation and specs", departmentId: departments[0].id },
    { name: "Finance Records", description: "Financial reports and compliance docs", departmentId: departments[1].id },
    { name: "HR Policies", description: "Human resources documents and policies", departmentId: departments[2].id },
  ]

  for (const r of repoData) {
    await prisma.repository.create({
      data: {
        name: r.name,
        description: r.description,
        organizationId: org.id,
        departmentId: r.departmentId,
        isPublic: false,
        settings: { versioning: true, requireApproval: false },
      },
    })
  }
  console.log("Created repositories")

  // Create sample audit logs
  const auditActions = [
    AuditAction.LOGIN,
    AuditAction.FILE_UPLOAD,
    AuditAction.FILE_VIEW,
    AuditAction.FILE_DOWNLOAD,
    AuditAction.REPO_CREATE,
  ]

  for (let i = 0; i < 20; i++) {
    await prisma.auditLog.create({
      data: {
        action: auditActions[i % auditActions.length],
        userId: admin.id,
        organizationId: org.id,
        resourceType: "document",
        resourceId: `sample-resource-${i}`,
        ipAddress: "127.0.0.1",
        userAgent: "Mozilla/5.0 (seed script)",
        details: { note: "Seeded audit log entry" },
        createdAt: new Date(Date.now() - i * 60 * 60 * 1000),
      },
    })
  }
  console.log("Created sample audit logs")

  console.log("\nSeed completed successfully!")
  console.log("\nLogin credentials:")
  console.log("  Admin: admin@lookupdms.com / Admin123!")
  console.log("  Demo users: alice@acme.com, bob@acme.com, etc. / Demo123!")
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
