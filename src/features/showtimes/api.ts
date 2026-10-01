import { api } from '@/lib/axios'
import { resultadosDe } from '@/lib/paginado'
import type { Cine, Funcion, FuncionDetalle, Paginado } from '@/types'

export interface FiltrosFunciones {
  fecha?: string
  cine?: number
  sala?: number
  tipo_sala?: string
}

export const funcionesDePelicula = async (peliculaId: number, filtros: FiltrosFunciones = {}) => {
  const { data } = await api.get<Funcion[] | Paginado<Funcion>>(`/movies/${peliculaId}/showtimes`, {
    params: filtros,
  })
  return resultadosDe(data)
}

export const fechasDePelicula = async (peliculaId: number) => {
  const { data } = await api.get<string[]>(`/movies/${peliculaId}/showtime-dates`)
  return data
}

export const listarFunciones = async (filtros: FiltrosFunciones = {}) => {
  const { data } = await api.get<Funcion[] | Paginado<Funcion>>('/showtimes', { params: filtros })
  return resultadosDe(data)
}

export const obtenerFuncion = async (id: number) => {
  const { data } = await api.get<FuncionDetalle>(`/showtimes/${id}`)
  return data
}

export const listarCines = async () => {
  const { data } = await api.get<Cine[] | Paginado<Cine>>('/cinemas')
  return resultadosDe(data)
}
