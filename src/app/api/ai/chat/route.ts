import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { chatWithDMS, type Message, type DMSContext } from "@/lib/ai"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const { messages, context }: { messages: Message[]; context: DMSContext } = body

    if (!messages?.length) {
      return NextResponse.json({ error: "messages required" }, { status: 400 })
    }

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of chatWithDMS(messages, context ?? {})) {
            controller.enqueue(new TextEncoder().encode(chunk))
          }
          controller.close()
        } catch (err) {
          controller.error(err)
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
      },
    })
  } catch (error) {
    console.error("POST /api/ai/chat error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
