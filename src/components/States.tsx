import type { ReactNode } from 'react'
import { Button } from './Button'

interface Props {
  titulo: string
  descripcion: string
  accion?: ReactNode
}

export const EmptyState = ({ titulo, descripcion, accion }: Props) => (
  <div className="panel flex flex-col items-center gap-3 px-6 py-16 text-center">
    <div className="mb-1 h-px w-16 bg-haz" />
    <h3 className="text-2xl sm:text-3xl">{titulo}</h3>
    <p className="max-w-md text-sm text-tenue">{descripcion}</p>
    {accion ? <div className="mt-3">{accion}</div> : null}
  </div>
)

export const ErrorState = ({
  titulo = 'No se pudo cargar',
  descripcion,
  onReintentar,
}: {
  titulo?: string
  descripcion: string
  onReintentar?: () => void
}) => (
  <div className="panel flex flex-col items-center gap-3 border-alerta/30 px-6 py-16 text-center">
    <div className="mb-1 h-px w-16 bg-alerta" />
    <h3 className="text-2xl sm:text-3xl">{titulo}</h3>
    <p className="max-w-md text-sm text-tenue">{descripcion}</p>
    {onReintentar ? (
      <Button variante="secundario" tamano="sm" className="mt-3" onClick={onReintentar}>
        Reintentar
      </Button>
    ) : null}
  </div>
)
