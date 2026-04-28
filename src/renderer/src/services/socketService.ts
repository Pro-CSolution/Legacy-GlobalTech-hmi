import { io, Socket, ManagerOptions, SocketOptions } from 'socket.io-client'

// Singleton socket to survive HMR/StrictMode and avoid multiple connections
let globalSocket: Socket | null = null

const logToMain = (level: 'INFO' | 'WARN' | 'ERROR', message: string, meta?: unknown): void => {
  if (typeof window === 'undefined') return

  try {
    window.api?.log?.(level, message, meta)
  } catch {
    // ignore logging failures
  }
}

export interface ISocketService {
  connect(): void
  disconnect(): void
  on<TArgs extends unknown[]>(event: string, callback: (...args: TArgs) => void): void
  off<TArgs extends unknown[]>(event: string, callback?: (...args: TArgs) => void): void
  emit<TData = unknown>(event: string, data: TData): void
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
    if (globalSocket) {
      this.socket = globalSocket
      if (!this.socket.connected) {
        logToMain('INFO', 'socket.connect.retry', {
          url: this.url,
          path: this.options.path
        })
        this.socket.connect()
      }
      return
    }

    logToMain('INFO', 'socket.connect.init', {
      url: this.url,
      path: this.options.path,
      transports: this.options.transports
    })
    this.socket = io(this.url, this.options)
    globalSocket = this.socket
    this.setupListeners()
  }

  private setupListeners(): void {
    if (!this.socket) return

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id)
      logToMain('INFO', 'socket.connected', {
        id: this.socket?.id,
        url: this.url,
        path: this.options.path
      })
    })

    this.socket.on('disconnect', (reason) => {
      console.warn('Socket disconnected:', reason)
      logToMain('WARN', 'socket.disconnected', {
        reason,
        url: this.url,
        path: this.options.path
      })
    })

    this.socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err)
      const socketError = err as Error & {
        description?: unknown
        context?: unknown
      }
      logToMain('ERROR', 'socket.connect_error', {
        message: socketError.message,
        description: socketError.description,
        context: socketError.context,
        stack: socketError.stack,
        url: this.url,
        path: this.options.path
      })
    })

    this.socket.on('error', (err) => {
      console.error('Socket error:', err)
      logToMain('ERROR', 'socket.error', {
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
        url: this.url,
        path: this.options.path
      })
    })

    this.socket.io.on('reconnect_attempt', (attempt) => {
      console.warn('Socket reconnect attempt:', attempt)
      logToMain('WARN', 'socket.reconnect_attempt', {
        attempt,
        url: this.url,
        path: this.options.path
      })
    })

    this.socket.io.on('reconnect_failed', () => {
      console.error('Socket reconnect failed')
      logToMain('ERROR', 'socket.reconnect_failed', {
        url: this.url,
        path: this.options.path
      })
    })
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
    globalSocket = null
  }

  public on<TArgs extends unknown[]>(event: string, callback: (...args: TArgs) => void): void {
    if (!this.socket) {
      console.warn(
        `Cannot listen to event "${event}": Socket not initialized. Call connect() first.`
      )
      return
    }
    this.socket.on(event, callback)
  }

  public off<TArgs extends unknown[]>(event: string, callback?: (...args: TArgs) => void): void {
    if (!this.socket) return
    this.socket.off(event, callback)
  }

  public emit<TData = unknown>(event: string, data: TData): void {
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
