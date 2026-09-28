import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { ButtonLink } from '@/components/Button'
import { EmptyState } from '@/components/States'
import { Loader } from '@/components/Loader'
import { useAuth } from '@/hooks/useAuth'

export const RutaAdmin = ({ children }: { children: ReactNode }) => {
  const { usuario, autenticado, cargando } = useAuth()
  const ubicacion = useLocation()

  if (cargando) return <Loader etiqueta="Abriendo tu sesion" />
  if (!autenticado) {
    return <Navigate to="/entrar" replace state={{ desde: ubicacion.pathname + ubicacion.search }} />
  }
  if (usuario?.rol !== 'admin') {
    return (
      <div className="contenedor py-20">
        <EmptyState
          titulo="Acceso restringido"
          descripcion="Esta seccion es solo para administradores del cine."
          accion={<ButtonLink to="/">Volver al inicio</ButtonLink>}
        />
      </div>
    )
  }
  return <>{children}</>
}
