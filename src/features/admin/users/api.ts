import { api } from '@/lib/axios'
import type { Paginado, UsuarioAdmin, UsuarioAdminCreateInput, UsuarioAdminInput } from '@/types'

export interface FiltrosUsuariosAdmin {
  search?: string
  page?: number
  page_size?: number
}

export const listarUsuariosAdmin = async (filtros: FiltrosUsuariosAdmin) => {
  const { data } = await api.get<Paginado<UsuarioAdmin>>('/admin/users', { params: filtros })
  return data
}

export const actualizarUsuarioAdmin = async (id: number, datos: UsuarioAdminInput) => {
  const { data } = await api.patch<UsuarioAdmin>(`/admin/users/${id}`, datos)
  return data
}

export const crearUsuarioAdmin = async (datos: UsuarioAdminCreateInput) => {
  const { data } = await api.post<UsuarioAdmin>('/admin/users', datos)
  return data
}
