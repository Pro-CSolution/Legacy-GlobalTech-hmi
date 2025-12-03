import { io, Socket, ManagerOptions, SocketOptions } from 'socket.io-client'

export interface ISocketService {
  connect(): void
  disconnect(): void
  on(event: string, callback: (...args: any[]) => void): void
  off(event: string, callback?: (...args: any[]) => void): void
  emit(event: string, data: any): void
  isConnected(): boolean
}

export class SocketService implements ISocketService {
  private socket: Socket | null = null
  private readonly url: string
  private readonly options: Partial<ManagerOptions & SocketOptions>

  constructor(url: string, options: Partial<ManagerOptions & SocketOptions> = {}) {
    this.url = url
    this.options = options
  }

  public connect(): void {
    if (this.socket && this.socket.connected) return

    this.socket = io(this.url, this.options)

    this.setupListeners()
  }

  private setupListeners(): void {
    if (!this.socket) return

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id)
    })

    this.socket.on('disconnect', (reason) => {
      console.warn('Socket disconnected:', reason)
    })

    this.socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err)
    })
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  public on(event: string, callback: (...args: any[]) => void): void {
    if (!this.socket) {
      console.warn(
        `Cannot listen to event "${event}": Socket not initialized. Call connect() first.`
      )
      return
    }
    this.socket.on(event, callback)
  }

  public off(event: string, callback?: (...args: any[]) => void): void {
    if (!this.socket) return
    this.socket.off(event, callback)
  }

  public emit(event: string, data: any): void {
    if (!this.socket) {
      console.warn(`Cannot emit event "${event}": Socket not initialized. Call connect() first.`)
      return
    }
    this.socket.emit(event, data)
  }

  public isConnected(): boolean {
    return this.socket?.connected || false
  }
}
