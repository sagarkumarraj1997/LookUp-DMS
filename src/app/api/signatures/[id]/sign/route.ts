import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createNotification } from "@/lib/notifications"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const body = await req.json()
    const { signatureData, action } = body // action: "sign" | "decline"

    const signature = await prisma.signature.findFirst({
      where: { signatureRequestId: id, signerId: session.user.id },
    })
    if (!signature) return NextResponse.json({ error: "Signature not found" }, { status: 404 })

    const status = action === "decline" ? "DECLINED" : "SIGNED"
    await prisma.signature.update({
      where: { id: signature.id },
      data: {
        status,
        signedAt: new Date(),
        signatureData: signatureData ?? null,
        ipAddress: req.headers.get("x-forwarded-for") ?? "unknown",
      },
    })

    // Check if all parties have signed
    const allSignatures = await prisma.signature.findMany({
      where: { signatureRequestId: id },
    })

    const allSigned = allSignatures.every((s) => s.status === "SIGNED")
    const anyDeclined = allSignatures.some((s) => s.status === "DECLINED")

    if (allSigned || anyDeclined) {
      const requestStatus = allSigned ? "COMPLETED" : "CANCELLED"
      const request = await prisma.signatureRequest.update({
        where: { id },
        data: {
          status: requestStatus,
          completedAt: allSigned ? new Date() : undefined,
        },
        include: { requestedBy: true, document: true },
      })

      // Notify requester
      await createNotification(
        request.requestedById,
        "SIGNATURE_REQUEST",
        allSigned ? "All Signatures Collected" : "Signature Declined",
        allSigned
          ? `"${request.document.name}" has been signed by all parties`
          : `A signer declined to sign "${request.document.name}"`,
        { signatureRequestId: id }
      )
    }

    return NextResponse.json({ success: true, status })
  } catch (error) {
    console.error("POST /api/signatures/[id]/sign error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
