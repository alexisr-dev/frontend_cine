import { api } from '@/lib/axios'
import type { Paginado, Reserva, ReservaResumen } from '@/types'

export const crearReserva = async (funcionId: number, funcionAsientoIds: number[]) => {
  const { data } = await api.post<Reserva>('/reservations', {
    funcion_id: funcionId,
    funcion_asiento_ids: funcionAsientoIds,
  })
  return data
}

export const obtenerReserva = async (id: number) => {
  const { data } = await api.get<Reserva>(`/reservations/${id}`)
  return data
}

export const cancelarReserva = async (id: number) => {
  const { data } = await api.delete<Reserva>(`/reservations/${id}`)
  return data
}

export const misReservas = async (estado?: string) => {
  const { data } = await api.get<Paginado<ReservaResumen>>('/users/me/reservations', {
    params: estado ? { estado, page_size: 50 } : { page_size: 50 },
  })
  return data
}
