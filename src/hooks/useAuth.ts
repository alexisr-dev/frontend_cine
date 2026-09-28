import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/authStore'

export const useAuth = () => {
  const usuario = useAuthStore((estado) => estado.usuario)
  const cargando = useAuthStore((estado) => estado.cargando)
  const cerrarSesion = useAuthStore((estado) => estado.cerrarSesion)
  return { usuario, cargando, autenticado: Boolean(usuario), cerrarSesion }
}

export const useSesionExpirada = () => {
  const cerrarSesion = useAuthStore((estado) => estado.cerrarSesion)
  const navegar = useNavigate()

  useEffect(() => {
    const manejar = () => {
      cerrarSesion()
      navegar('/entrar', { replace: true })
    }
    window.addEventListener('cine:sesion-expirada', manejar)
    return () => window.removeEventListener('cine:sesion-expirada', manejar)
  }, [cerrarSesion, navegar])
}
