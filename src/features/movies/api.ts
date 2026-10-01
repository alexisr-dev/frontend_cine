import { api } from '@/lib/axios'
import { resultadosDe } from '@/lib/paginado'
import type { Genero, Paginado, Pelicula, PeliculaDetalle } from '@/types'

export interface FiltrosCatalogo {
  search?: string
  genero?: string
  ordering?: string
  page?: number
  page_size?: number
}

export const listarPeliculas = async (filtros: FiltrosCatalogo) => {
  const { data } = await api.get<Paginado<Pelicula>>('/movies', { params: filtros })
  return data
}

export const obtenerPelicula = async (id: number) => {
  const { data } = await api.get<PeliculaDetalle>(`/movies/${id}`)
  return data
}

export const listarGeneros = async () => {
  const { data } = await api.get<Genero[] | Paginado<Genero>>('/genres')
  return resultadosDe(data)
}
