import { api } from '@/lib/axios'
import type { Paginado, PeliculaAdminInput, PeliculaDetalle } from '@/types'

export interface FiltrosAdminPeliculas {
  search?: string
  genero?: string
  activa?: boolean
  ordering?: string
  page?: number
  page_size?: number
}

export const listarPeliculasAdmin = async (filtros: FiltrosAdminPeliculas) => {
  const { data } = await api.get<Paginado<PeliculaDetalle>>('/admin/movies', { params: filtros })
  return data
}

export const obtenerPeliculaAdmin = async (id: number) => {
  const { data } = await api.get<PeliculaDetalle>(`/admin/movies/${id}`)
  return data
}

export const crearPelicula = async (datos: PeliculaAdminInput) => {
  const { data } = await api.post<PeliculaDetalle>('/admin/movies', datos)
  return data
}

export const actualizarPelicula = async (id: number, datos: PeliculaAdminInput) => {
  const { data } = await api.put<PeliculaDetalle>(`/admin/movies/${id}`, datos)
  return data
}

export const eliminarPelicula = async (id: number) => {
  await api.delete(`/admin/movies/${id}`)
}
