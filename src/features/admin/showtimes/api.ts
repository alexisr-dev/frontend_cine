import { api } from '@/lib/axios'
import type { FuncionAdminInput, FuncionDetalle, Paginado } from '@/types'

export interface FiltrosFuncionesAdmin {
  pelicula?: number
  sala?: number
  activa?: boolean
  page?: number
  page_size?: number
}

export const listarFuncionesAdmin = async (filtros: FiltrosFuncionesAdmin) => {
  const { data } = await api.get<Paginado<FuncionDetalle>>('/admin/showtimes', { params: filtros })
  return data
}

export const obtenerFuncionAdmin = async (id: number) => {
  const { data } = await api.get<FuncionDetalle>(`/admin/showtimes/${id}`)
  return data
}

export const crearFuncion = async (datos: FuncionAdminInput) => {
  const { data } = await api.post<FuncionDetalle>('/admin/showtimes', datos)
  return data
}

export const actualizarFuncion = async (id: number, datos: FuncionAdminInput) => {
  const { data } = await api.put<FuncionDetalle>(`/admin/showtimes/${id}`, datos)
  return data
}

export const eliminarFuncion = async (id: number) => {
  await api.delete(`/admin/showtimes/${id}`)
}
