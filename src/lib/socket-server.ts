import { Server as SocketIOServer } from 'socket.io'
import type { Server as HTTPServer } from 'http'

let io: SocketIOServer | null = null

export function getSocketServer(): SocketIOServer | null {
  return io
}

export function initSocketServer(httpServer: HTTPServer): SocketIOServer {
  if (io) return io

  io = new SocketIOServer(httpServer, {
    path: '/api/socket',
    addTrailingSlash: false,
    cors: {
      origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  })

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`)

    // Join rooms
    socket.on('join:org', (orgId: string) => {
      socket.join(`org:${orgId}`)
    })

    socket.on('join:repo', (repoId: string) => {
      socket.join(`repo:${repoId}`)
    })

    socket.on('join:doc', (docId: string) => {
      socket.join(`doc:${docId}`)
      // Broadcast presence
      socket.to(`doc:${docId}`).emit('user:presence', {
        socketId: socket.id,
        action: 'joined',
        timestamp: new Date().toISOString(),
      })
    })

    socket.on('join:user', (userId: string) => {
      socket.join(`user:${userId}`)
    })

    socket.on('leave:doc', (docId: string) => {
      socket.leave(`doc:${docId}`)
      socket.to(`doc:${docId}`).emit('user:presence', {
        socketId: socket.id,
        action: 'left',
        timestamp: new Date().toISOString(),
      })
    })

    // Typing indicators
    socket.on('typing:start', ({ docId, user }: { docId: string; user: { id: string; name: string } }) => {
      socket.to(`doc:${docId}`).emit('typing:start', { user, socketId: socket.id })
    })

    socket.on('typing:stop', ({ docId }: { docId: string }) => {
      socket.to(`doc:${docId}`).emit('typing:stop', { socketId: socket.id })
    })

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`)
    })
  })

  return io
}

// Emit helpers
export function emitToOrg(orgId: string, event: string, data: unknown) {
  io?.to(`org:${orgId}`).emit(event, data)
}

export function emitToRepo(repoId: string, event: string, data: unknown) {
  io?.to(`repo:${repoId}`).emit(event, data)
}

export function emitToDoc(docId: string, event: string, data: unknown) {
  io?.to(`doc:${docId}`).emit(event, data)
}

export function emitToUser(userId: string, event: string, data: unknown) {
  io?.to(`user:${userId}`).emit(event, data)
}
