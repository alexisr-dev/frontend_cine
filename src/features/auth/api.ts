import { api } from '@/lib/axios'
import type { Usuario } from '@/types'

export interface RespuestaSesion {
  usuario: Usuario
  access: string
  refresh: string
}

export interface DatosRegistro {
  email: string
  nombre: string
  apellido: string
  telefono?: string
  password: string
  password_confirm: string
}

export const login = async (email: string, password: string) => {
  const { data } = await api.post<RespuestaSesion>('/auth/login', { email, password })
  return data
}

export const registrar = async (datos: DatosRegistro) => {
  const { data } = await api.post<RespuestaSesion>('/auth/register', datos)
  return data
}

export const perfil = async () => {
  const { data } = await api.get<Usuario>('/auth/me')
  return data
}

export const actualizarPerfil = async (datos: Partial<Usuario>) => {
  const { data } = await api.patch<Usuario>('/auth/me', datos)
  return data
}
