import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { sendEmailNotification, createNotification } from "@/lib/notifications"

export interface WorkflowContext {
  documentId?: string
  folderId?: string
  repositoryId?: string
  userId?: string
  organizationId?: string
  triggeredBy?: string
  [key: string]: unknown
}

export interface WorkflowStep {
  id: string
  type: "EMAIL" | "APPROVAL" | "MOVE_FILE" | "ARCHIVE" | "TAG" | "WEBHOOK"
  config: Record<string, unknown>
}

export async function executeWorkflow(workflowId: string, context: WorkflowContext) {
  const workflow = await prisma.workflow.findUnique({ where: { id: workflowId } })
  if (!workflow || workflow.status !== "ACTIVE") return

  const instance = await prisma.workflowInstance.create({
    data: {
      workflowId,
      triggeredById: context.userId ?? context.triggeredBy ?? "",
      status: "ACTIVE",
      context: context as Prisma.InputJsonValue,
    },
  })

  const steps = workflow.steps as unknown as WorkflowStep[]

  try {
    for (const step of steps) {
      await executeStep(step, context)
    }

    await prisma.workflowInstance.update({
      where: { id: instance.id },
      data: { status: "COMPLETED", completedAt: new Date() },
    })
  } catch (err) {
    console.error("Workflow execution error:", err)
    await prisma.workflowInstance.update({
      where: { id: instance.id },
      data: { status: "CANCELLED" },
    })
  }
}

async function executeStep(step: WorkflowStep, context: WorkflowContext) {
  switch (step.type) {
    case "EMAIL":
      await executeEmailAction(step, context)
      break
    case "MOVE_FILE":
      await executeMoveFileAction(step, context)
      break
    case "APPROVAL":
      await executeApprovalAction(step, context)
      break
    case "ARCHIVE":
      await executeArchiveAction(step, context)
      break
    case "TAG":
      await executeTagAction(step, context)
      break
    case "WEBHOOK":
      await executeWebhookAction(step, context)
      break
  }
}

async function executeEmailAction(step: WorkflowStep, context: WorkflowContext) {
  const { to, subject, template, message } = step.config as {
    to: string
    subject: string
    template: string
    message: string
  }
  await sendEmailNotification(to, subject, template ?? "workflow_complete", {
    message,
    documentId: context.documentId,
    ...context,
  })
}

async function executeMoveFileAction(step: WorkflowStep, context: WorkflowContext) {
  if (!context.documentId) return
  const { targetFolderId } = step.config as { targetFolderId: string }
  await prisma.document.update({
    where: { id: context.documentId },
    data: { folderId: targetFolderId || null },
  })
}

async function executeApprovalAction(step: WorkflowStep, context: WorkflowContext) {
  const { approverUserId } = step.config as { approverUserId: string }
  if (!approverUserId || !context.documentId) return

  await createNotification(
    approverUserId,
    "APPROVAL_REQUEST",
    "Document Approval Required",
    "A document requires your approval",
    { documentId: context.documentId, workflowContext: context }
  )
}

async function executeArchiveAction(step: WorkflowStep, context: WorkflowContext) {
  if (!context.documentId) return
  await prisma.document.update({
    where: { id: context.documentId },
    data: { status: "ARCHIVED" },
  })
}

async function executeTagAction(step: WorkflowStep, context: WorkflowContext) {
  if (!context.documentId) return
  const { tags } = step.config as { tags: string[] }
  const doc = await prisma.document.findUnique({ where: { id: context.documentId } })
  if (!doc) return
  const merged = Array.from(new Set([...doc.tags, ...tags]))
  await prisma.document.update({
    where: { id: context.documentId },
    data: { tags: merged },
  })
}

async function executeWebhookAction(step: WorkflowStep, context: WorkflowContext) {
  const { url, method, headers } = step.config as {
    url: string
    method: string
    headers: Record<string, string>
  }
  await fetch(url, {
    method: method ?? "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(context),
  })
}

export async function handleFileUploadTrigger(documentId: string) {
  const doc = await prisma.document.findUnique({
    where: { id: documentId },
    include: { repository: { include: { workflows: { where: { status: "ACTIVE" } } } } },
  })
  if (!doc) return

  for (const workflow of doc.repository.workflows) {
    const trigger = workflow.trigger as { type: string; config: Record<string, unknown> }
    if (trigger.type === "FILE_UPLOAD") {
      await executeWorkflow(workflow.id, {
        documentId,
        repositoryId: doc.repositoryId,
        organizationId: doc.repository.organizationId,
        userId: doc.uploadedById,
      })
    }
  }
}

export async function handleApprovalTrigger(requestId: string) {
  const approval = await prisma.workflowInstance.findUnique({
    where: { id: requestId },
    include: { workflow: { include: { repository: true } } },
  })
  if (!approval) return

  const trigger = approval.workflow.trigger as { type: string }
  if (trigger.type === "APPROVAL_REQUEST") {
    await executeWorkflow(approval.workflowId, {
      ...(approval.context as WorkflowContext),
      triggeredBy: approval.triggeredById,
    })
  }
}
