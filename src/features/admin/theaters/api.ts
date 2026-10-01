import { api } from '@/lib/axios'
import { resultadosDe } from '@/lib/paginado'
import type { Cine, CineAdminInput, Paginado, Sala, SalaAdminInput } from '@/types'

export const listarCinesAdmin = async () => {
  const { data } = await api.get<Cine[] | Paginado<Cine>>('/admin/cinemas')
  return resultadosDe(data)
}

export const obtenerCineAdmin = async (id: number) => {
  const { data } = await api.get<Cine>(`/admin/cinemas/${id}`)
  return data
}

export const crearCine = async (datos: CineAdminInput) => {
  const { data } = await api.post<Cine>('/admin/cinemas', datos)
  return data
}

export const actualizarCine = async (id: number, datos: CineAdminInput) => {
  const { data } = await api.put<Cine>(`/admin/cinemas/${id}`, datos)
  return data
}

export const eliminarCine = async (id: number) => {
  await api.delete(`/admin/cinemas/${id}`)
}

export interface FiltrosSalasAdmin {
  page?: number
  page_size?: number
}

export const listarSalasAdmin = async (filtros: FiltrosSalasAdmin) => {
  const { data } = await api.get<Paginado<Sala>>('/admin/rooms', { params: filtros })
  return data
}

export const obtenerSalaAdmin = async (id: number) => {
  const { data } = await api.get<Sala>(`/admin/rooms/${id}`)
  return data
}

export const crearSala = async (datos: SalaAdminInput) => {
  const { data } = await api.post<Sala>('/admin/rooms', datos)
  return data
}

export const actualizarSala = async (id: number, datos: SalaAdminInput) => {
  const { data } = await api.put<Sala>(`/admin/rooms/${id}`, datos)
  return data
}

export const eliminarSala = async (id: number) => {
  await api.delete(`/admin/rooms/${id}`)
}
