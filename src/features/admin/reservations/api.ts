import { api } from '@/lib/axios'
import type { Paginado, ReservaAdmin } from '@/types'

export { cancelarReserva } from '@/features/reservations/api'

export interface FiltrosReservasAdmin {
  estado?: string
  page?: number
  page_size?: number
}

export const listarReservasAdmin = async (filtros: FiltrosReservasAdmin) => {
  const { data } = await api.get<Paginado<ReservaAdmin>>('/admin/reservations', {
    params: filtros,
  })
  return data
}
