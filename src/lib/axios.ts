import axios from 'axios'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'
import type { ErrorApi } from '@/types'

const baseURL = import.meta.env.VITE_API_URL ?? '/api/v1'

export const CLAVE_ACCESS = 'cine.access'
export const CLAVE_REFRESH = 'cine.refresh'

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
})

export const leerToken = (clave: string) => localStorage.getItem(clave)

export const guardarTokens = (access: string, refresh?: string) => {
  localStorage.setItem(CLAVE_ACCESS, access)
  if (refresh) localStorage.setItem(CLAVE_REFRESH, refresh)
}

export const limpiarTokens = () => {
  localStorage.removeItem(CLAVE_ACCESS)
  localStorage.removeItem(CLAVE_REFRESH)
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = leerToken(CLAVE_ACCESS)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let refrescando: Promise<string | null> | null = null

const pedirNuevoAccess = async (): Promise<string | null> => {
  const refresh = leerToken(CLAVE_REFRESH)
  if (!refresh) return null
  try {
    const { data } = await axios.post<{ access: string; refresh?: string }>(
      `${baseURL}/auth/refresh`,
      { refresh },
    )
    guardarTokens(data.access, data.refresh)
    return data.access
  } catch {
    limpiarTokens()
    return null
  }
}

api.interceptors.response.use(
  (respuesta) => respuesta,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _reintento?: boolean }
    const esAuth = original?.url?.includes('/auth/login') || original?.url?.includes('/auth/refresh')

    if (error.response?.status === 401 && original && !original._reintento && !esAuth) {
      original._reintento = true
      refrescando = refrescando ?? pedirNuevoAccess()
      const nuevo = await refrescando
      refrescando = null
      if (nuevo) {
        original.headers.Authorization = `Bearer ${nuevo}`
        return api(original)
      }
      window.dispatchEvent(new CustomEvent('cine:sesion-expirada'))
    }
    return Promise.reject(error)
  },
)

export const mensajeDeError = (error: unknown, respaldo = 'Algo salio mal') => {
  if (axios.isAxiosError(error)) {
    const cuerpo = error.response?.data as { error?: ErrorApi } | undefined
    if (cuerpo?.error?.mensaje) return cuerpo.error.mensaje
    if (!error.response) return 'No hay conexion con el servidor'
  }
  return respaldo
}

export const detallesDeError = (error: unknown): Record<string, string> => {
  if (!axios.isAxiosError(error)) return {}
  const detalles = (error.response?.data as { error?: ErrorApi } | undefined)?.error?.detalles
  if (!detalles || Array.isArray(detalles)) return {}
  return Object.fromEntries(
    Object.entries(detalles).map(([campo, valores]) => [
      campo,
      Array.isArray(valores) ? valores[0] : String(valores),
    ]),
  )
}

export const codigoDeError = (error: unknown): string | null => {
  if (!axios.isAxiosError(error)) return null
  return (error.response?.data as { error?: ErrorApi } | undefined)?.error?.codigo ?? null
}
