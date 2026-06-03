import { NextResponse } from 'next/server'

// Socket.io is initialized via a custom server (server.ts)
// This route provides socket server info to clients
export async function GET() {
  return NextResponse.json({
    message: 'Socket.io server is running',
    path: '/api/socket',
  })
}
