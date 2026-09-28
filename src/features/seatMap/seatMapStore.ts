import { create } from 'zustand'
import type { AsientoMapa } from '@/types'

interface EstadoSeleccion {
  funcionId: number | null
  seleccion: AsientoMapa[]
  maximo: number
  abrirFuncion: (funcionId: number) => void
  alternar: (asiento: AsientoMapa) => void
  quitar: (funcionAsientoId: number) => void
  limpiar: () => void
}

export const MAX_ASIENTOS = 10

export const useSeatMapStore = create<EstadoSeleccion>((set, get) => ({
  funcionId: null,
  seleccion: [],
  maximo: MAX_ASIENTOS,
  abrirFuncion: (funcionId) => {
    if (get().funcionId !== funcionId) set({ funcionId, seleccion: [] })
  },
  alternar: (asiento) => {
    const { seleccion, maximo } = get()
    const existe = seleccion.some((item) => item.funcion_asiento_id === asiento.funcion_asiento_id)
    if (existe) {
      set({
        seleccion: seleccion.filter(
          (item) => item.funcion_asiento_id !== asiento.funcion_asiento_id,
        ),
      })
      return
    }
    if (seleccion.length >= maximo) return
    set({ seleccion: [...seleccion, asiento] })
  },
  quitar: (funcionAsientoId) =>
    set({
      seleccion: get().seleccion.filter((item) => item.funcion_asiento_id !== funcionAsientoId),
    }),
  limpiar: () => set({ seleccion: [] }),
}))
