import { memo } from 'react'
import { cn } from '@/lib/cn'
import type { AsientoMapa } from '@/types'

interface Props {
  asiento: AsientoMapa
  seleccionado: boolean
  bloqueadoPorLimite: boolean
  onAlternar: (asiento: AsientoMapa) => void
}

const IconoAccesible = () => (
  <svg viewBox="0 0 24 24" className="h-2.5 w-2.5" fill="currentColor" aria-hidden>
    <circle cx="12" cy="4" r="2" />
    <path d="M11 8v5h5l3 6-1.8.9L14.8 15H9V8z" />
  </svg>
)

export const Seat = memo(({ asiento, seleccionado, bloqueadoPorLimite, onAlternar }: Props) => {
  const libre = asiento.estado === 'disponible' && asiento.activo
  const tomado = asiento.estado === 'ocupado' || asiento.estado === 'reservado'
  const inhabilitado = !libre || (bloqueadoPorLimite && !seleccionado)

  const etiquetaAccesible = seleccionado
    ? `Butaca ${asiento.etiqueta} seleccionada, toca para soltarla`
    : tomado
      ? `Butaca ${asiento.etiqueta} ocupada`
      : `Butaca ${asiento.etiqueta}, ${asiento.tipo}, ${Number(asiento.precio).toFixed(0)} pesos`

  return (
    <button
      type="button"
      disabled={inhabilitado}
      onClick={() => onAlternar(asiento)}
      aria-pressed={seleccionado}
      aria-label={etiquetaAccesible}
      title={`${asiento.etiqueta} · ${asiento.tipo}`}
      className={cn(
        'group relative flex items-center justify-center rounded-t-md rounded-b-sm border transition-all duration-200',
        'h-[var(--asiento)] w-[var(--asiento)] shrink-0',
        seleccionado &&
          'z-10 -translate-y-0.5 border-haz bg-haz text-noche shadow-[0_0_0_3px_rgba(255,194,75,0.22)]',
        !seleccionado && libre && 'border-borde bg-sala-alta text-tenue hover:border-haz hover:bg-haz/15 hover:text-haz',
        !seleccionado && asiento.estado === 'ocupado' && 'cursor-not-allowed border-terciopelo/50 bg-terciopelo/35 text-terciopelo',
        !seleccionado && asiento.estado === 'reservado' && 'cursor-not-allowed border-dashed border-tenue/40 bg-sala text-tenue/50',
        !asiento.activo && 'cursor-not-allowed border-borde/40 bg-transparent opacity-25',
        inhabilitado && libre && 'cursor-not-allowed opacity-40',
        asiento.tipo === 'vip' && !seleccionado && libre && 'border-haz/35',
      )}
    >
      {asiento.tipo === 'discapacitado' ? (
        <IconoAccesible />
      ) : (
        <span className="font-mono text-[0.5rem] leading-none font-medium sm:text-[0.5625rem]">
          {asiento.numero}
        </span>
      )}
      <span
        className={cn(
          'absolute inset-x-0.5 -bottom-0.5 h-0.5 rounded-full transition-colors',
          seleccionado ? 'bg-haz' : asiento.tipo === 'vip' && libre ? 'bg-haz/40' : 'bg-transparent',
        )}
        aria-hidden
      />
    </button>
  )
})

Seat.displayName = 'Seat'
