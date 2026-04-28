/**
 * Tipos estándar para manejo de errores en el proyecto
 */

/**
 * Tipo para errores que tienen una propiedad message
 */
export interface ErrorWithMessage {
  message: string
}

/**
 * Type guard para verificar si un error tiene una propiedad message
 */
export function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  )
}

/**
 * Obtiene el mensaje de error de forma segura
 * @param error - El error a procesar
 * @param fallback - Mensaje por defecto si no se puede obtener el mensaje
 * @returns El mensaje de error o el mensaje por defecto
 */
export function getErrorMessage(error: unknown, fallback = 'An unknown error occurred'): string {
  if (isErrorWithMessage(error)) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return fallback
}

/**
 * Tipo para errores de Axios (común en el proyecto)
 */
export interface AxiosErrorLike {
  message: string
  code?: string
  config?: {
    method?: string
    url?: string
    baseURL?: string
  }
  response?: {
    data?: unknown
    status?: number
    statusText?: string
  }
}

/**
 * Type guard para verificar si es un error de Axios
 */
export function isAxiosErrorLike(error: unknown): error is AxiosErrorLike {
  return typeof error === 'object' && error !== null && 'message' in error && 'response' in error
}
