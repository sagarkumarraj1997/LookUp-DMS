'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'

let socketInstance: Socket | null = null

function getSocket(): Socket {
  if (!socketInstance) {
    socketInstance = io({
      path: '/api/socket',
      transports: ['websocket', 'polling'],
      autoConnect: true,
    })
  }
  return socketInstance
}

export function useSocket(room: string) {
  const [isConnected, setIsConnected] = useState(false)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    const socket = getSocket()
    socketRef.current = socket

    function onConnect() {
      setIsConnected(true)
      socket.emit(`join:${room.split(':')[0]}`, room.split(':')[1])
    }

    function onDisconnect() {
      setIsConnected(false)
    }

    if (socket.connected) {
      onConnect()
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
    }
  }, [room])

  const emit = useCallback((event: string, data: unknown) => {
    socketRef.current?.emit(event, data)
  }, [])

  return { socket: socketRef.current, isConnected, emit }
}

export interface PresenceUser {
  socketId: string
  userId?: string
  name?: string
  avatar?: string
  joinedAt: string
}

export function usePresence(documentId: string) {
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([])
  const { socket } = useSocket(`doc:${documentId}`)

  useEffect(() => {
    if (!socket) return

    function onUserJoined(user: PresenceUser) {
      setOnlineUsers((prev) => [...prev.filter((u) => u.socketId !== user.socketId), user])
    }

    function onUserLeft(data: { socketId: string }) {
      setOnlineUsers((prev) => prev.filter((u) => u.socketId !== data.socketId))
    }

    socket.on('user:presence', (data: PresenceUser & { action: string }) => {
      if (data.action === 'joined') {
        onUserJoined(data)
      } else {
        onUserLeft(data)
      }
    })

    return () => {
      socket.off('user:presence')
      socket.emit('leave:doc', documentId)
    }
  }, [socket, documentId])

  const currentUser = onlineUsers.find((u) => u.socketId === socket?.id)

  return { onlineUsers, currentUser }
}

export interface RealtimeNotification {
  id: string
  type: string
  title: string
  message: string
  data?: Record<string, unknown>
  createdAt: string
}

export function useRealTimeNotifications(userId: string) {
  const [newNotifications, setNewNotifications] = useState<RealtimeNotification[]>([])
  const { socket } = useSocket(`user:${userId}`)

  useEffect(() => {
    if (!socket) return

    function onNotification(notification: RealtimeNotification) {
      setNewNotifications((prev) => [notification, ...prev.slice(0, 49)])
    }

    socket.on('notification', onNotification)

    return () => {
      socket.off('notification', onNotification)
    }
  }, [socket])

  const clearNotifications = useCallback(() => {
    setNewNotifications([])
  }, [])

  return { newNotifications, clearNotifications }
}
