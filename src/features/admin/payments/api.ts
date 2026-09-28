import { api } from '@/lib/axios'
import type { Paginado, PagoAdmin } from '@/types'

export interface FiltrosPagosAdmin {
  estado?: string
  page?: number
  page_size?: number
}

export const listarPagosAdmin = async (filtros: FiltrosPagosAdmin) => {
  const { data } = await api.get<Paginado<PagoAdmin>>('/admin/payments', { params: filtros })
  return data
}

export const reembolsarPago = async (id: number) => {
  const { data } = await api.post<PagoAdmin>(`/admin/payments/${id}/refund`)
  return data
}
