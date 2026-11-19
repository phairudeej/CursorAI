const configuredBase = import.meta.env.VITE_API_BASE_URL?.trim() ?? ''

export function apiBase(): string {
  return configuredBase.replace(/\/$/, '')
}

export function apiUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${apiBase()}${normalized}`
}

export function mediaUrl(path: string | null | undefined): string | null {
  if (!path) return null
  if (/^https?:\/\//i.test(path) || path.startsWith('blob:') || path.startsWith('/')) return path
  return apiUrl(path.startsWith('/') ? path : `/${path}`)
}

export class ApiError extends Error {
  readonly status: number
  readonly fields: string[]

  constructor(status: number, message: string, fields: string[] = []) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fields = fields
  }
}

export function messageOf(error: unknown): string {
  if (error instanceof ApiError) return error.message
  return 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้'
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(apiUrl(path), init)
  } catch {
    throw new ApiError(0, 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้')
  }

  if (response.status === 204) return undefined as T

  const text = await response.text()
  let payload: unknown = null
  if (text) {
    try {
      payload = JSON.parse(text)
    } catch {
      payload = null
    }
  }

  if (!response.ok) {
    const record =
      payload && typeof payload === 'object'
        ? (payload as { error?: unknown; fields?: unknown })
        : {}
    const message = typeof record.error === 'string' ? record.error : 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์'
    const fields = Array.isArray(record.fields)
      ? record.fields.filter((field): field is string => typeof field === 'string')
      : []
    throw new ApiError(response.status, message, fields)
  }

  return payload as T
}
