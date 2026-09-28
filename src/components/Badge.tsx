import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import type { EstadoReserva } from '@/types'

const tonos = {
  neutro: 'border-borde text-tenue',
  haz: 'border-haz/40 text-haz',
  menta: 'border-menta/40 text-menta',
  alerta: 'border-alerta/40 text-alerta',
} as const

export const Badge = ({
  children,
  tono = 'neutro',
  className,
}: {
  children: ReactNode
  tono?: keyof typeof tonos
  className?: string
}) => (
  <span
    className={cn(
      'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[0.6875rem] font-medium tracking-widest uppercase',
      tonos[tono],
      className,
    )}
  >
    {children}
  </span>
)

const estadoReserva: Record<EstadoReserva, { texto: string; tono: keyof typeof tonos }> = {
  pendiente: { texto: 'Por pagar', tono: 'haz' },
  confirmada: { texto: 'Confirmada', tono: 'menta' },
  cancelada: { texto: 'Cancelada', tono: 'neutro' },
  expirada: { texto: 'Expirada', tono: 'alerta' },
}

export const BadgeReserva = ({ estado }: { estado: EstadoReserva }) => {
  const config = estadoReserva[estado]
  return <Badge tono={config.tono}>{config.texto}</Badge>
}
