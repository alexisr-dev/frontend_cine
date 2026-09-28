import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { guardarTokens, limpiarTokens } from '@/lib/axios'
import type { Usuario } from '@/types'

interface EstadoAuth {
  usuario: Usuario | null
  cargando: boolean
  iniciarSesion: (usuario: Usuario, access: string, refresh: string) => void
  actualizarUsuario: (usuario: Usuario) => void
  cerrarSesion: () => void
  marcarListo: () => void
}

export const useAuthStore = create<EstadoAuth>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,
      iniciarSesion: (usuario, access, refresh) => {
        guardarTokens(access, refresh)
        set({ usuario, cargando: false })
      },
      actualizarUsuario: (usuario) => set({ usuario }),
      cerrarSesion: () => {
        limpiarTokens()
        set({ usuario: null, cargando: false })
      },
      marcarListo: () => set({ cargando: false }),
    }),
    {
      name: 'cine.usuario',
      partialize: (estado) => ({ usuario: estado.usuario }),
      onRehydrateStorage: () => (estado) => estado?.marcarListo(),
    },
  ),
)
