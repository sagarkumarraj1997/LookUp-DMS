import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { NotificationType } from "@/types"

export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  data?: Record<string, unknown>
) {
  return prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      data: (data ?? {}) as Prisma.InputJsonValue,
    },
  })
}

export async function sendEmailNotification(
  to: string,
  subject: string,
  template: string,
  data: Record<string, unknown>
) {
  // Resend integration
  try {
    const { Resend } = await import("resend")
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: "LookUp DMS <noreply@lookupdms.com>",
      to,
      subject,
      html: buildEmailHtml(template, data),
    })
  } catch (err) {
    console.error("Email send error:", err)
  }
}

function buildEmailHtml(template: string, data: Record<string, unknown>): string {
  const templates: Record<string, (d: Record<string, unknown>) => string> = {
    signature_request: (d) => `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <h2>Signature Requested</h2>
        <p>You have been requested to sign: <strong>${d.documentName}</strong></p>
        <p>Message: ${d.message || "Please review and sign."}</p>
        <a href="${d.signUrl}" style="background:#06B6D4;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;">Sign Document</a>
      </div>
    `,
    file_shared: (d) => `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <h2>File Shared With You</h2>
        <p><strong>${d.sharedBy}</strong> shared <strong>${d.fileName}</strong> with you.</p>
        <a href="${d.fileUrl}" style="background:#06B6D4;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;">View File</a>
      </div>
    `,
    workflow_complete: (d) => `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <h2>Workflow Completed</h2>
        <p>Workflow <strong>${d.workflowName}</strong> has completed.</p>
      </div>
    `,
  }
  return templates[template]?.(data) ?? `<p>${JSON.stringify(data)}</p>`
}

export async function notifySignatureRequest(signatureRequestId: string) {
  const request = await prisma.signatureRequest.findUnique({
    where: { id: signatureRequestId },
    include: {
      document: true,
      requestedBy: true,
      signatures: { include: { signer: true } },
    },
  })
  if (!request) return

  for (const sig of request.signatures) {
    await createNotification(
      sig.signerId,
      "SIGNATURE_REQUEST",
      "Signature Requested",
      `${request.requestedBy.name} has requested your signature on "${request.document.name}"`,
      { signatureRequestId, documentId: request.documentId }
    )
    if (sig.signer.email) {
      await sendEmailNotification(sig.signer.email, "Signature Requested", "signature_request", {
        documentName: request.document.name,
        message: request.message,
        signUrl: `${process.env.NEXTAUTH_URL}/signatures/${signatureRequestId}`,
      })
    }
  }
}

export async function notifyFileShared(documentId: string, sharedWithId: string) {
  const doc = await prisma.document.findUnique({
    where: { id: documentId },
    include: { uploadedBy: true },
  })
  if (!doc) return

  await createNotification(
    sharedWithId,
    "FILE_SHARED",
    "File Shared With You",
    `${doc.uploadedBy.name} shared "${doc.name}" with you`,
    { documentId }
  )
}

export async function notifyWorkflowComplete(workflowInstanceId: string) {
  const instance = await prisma.workflowInstance.findUnique({
    where: { id: workflowInstanceId },
    include: { workflow: true },
  })
  if (!instance) return

  await createNotification(
    instance.triggeredById,
    "WORKFLOW_COMPLETE",
    "Workflow Completed",
    `Workflow "${instance.workflow.name}" has completed successfully`,
    { workflowInstanceId }
  )
}
