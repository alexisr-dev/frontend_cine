import { api } from '@/lib/axios'
import type { MapaAsientos } from '@/types'

export const obtenerMapa = async (funcionId: number) => {
  const { data } = await api.get<MapaAsientos>(`/showtimes/${funcionId}/seats`)
  return data
}
