import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Loader } from '@/components/Loader'
import { useAuth } from '@/hooks/useAuth'

export const RutaPrivada = ({ children }: { children: ReactNode }) => {
  const { autenticado, cargando } = useAuth()
  const ubicacion = useLocation()

  if (cargando) return <Loader etiqueta="Abriendo tu sesion" />
  if (!autenticado) {
    return <Navigate to="/entrar" replace state={{ desde: ubicacion.pathname + ubicacion.search }} />
  }
  return <>{children}</>
}
