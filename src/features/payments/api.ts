import { api } from '@/lib/axios'
import type { MetodoPago, RespuestaPago, Ticket } from '@/types'

export interface DatosPago {
  metodo_pago: MetodoPago
  nombre_titular?: string
  numero_tarjeta?: string
  expiracion?: string
  cvv?: string
}

export const pagarReserva = async (
  reservaId: number,
  datos: DatosPago,
  idempotencyKey: string,
) => {
  const { data } = await api.post<RespuestaPago>(`/reservations/${reservaId}/payment`, datos, {
    headers: { 'Idempotency-Key': idempotencyKey },
  })
  return data
}

export const obtenerTicket = async (reservaId: number) => {
  const { data } = await api.get<Ticket>(`/reservations/${reservaId}/ticket`)
  return data
}
