import { Link } from 'react-router-dom'
import { formatearHora } from '@/lib/format'
import { usePrefiereMenosMovimiento } from '@/hooks/useMediaQuery'
import type { Funcion } from '@/types'

export const Marquesina = ({ funciones }: { funciones: Funcion[] }) => {
  const menosMovimiento = usePrefiereMenosMovimiento()
  if (funciones.length === 0) return null

  const tira = [...funciones, ...funciones]

  return (
    <div className="relative overflow-hidden border-y border-borde bg-sala/60 py-3">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-noche to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-noche to-transparent" />
      <div
        className="flex w-max items-center gap-8 sm:gap-12"
        style={
          menosMovimiento
            ? undefined
            : { animation: `marquesina ${funciones.length * 5}s linear infinite` }
        }
      >
        {tira.map((funcion, indice) => (
          <Link
            key={`${funcion.id}-${indice}`}
            to={`/funciones/${funcion.id}/asientos`}
            className="group flex shrink-0 items-center gap-3 font-mono text-xs tracking-widest whitespace-nowrap uppercase"
          >
            <span className="text-haz">{formatearHora(funcion.fecha_hora_inicio)}</span>
            <span className="text-pantalla transition-colors group-hover:text-haz">
              {funcion.pelicula_titulo}
            </span>
            <span className="text-tenue">{funcion.sala.tipo_sala}</span>
            <span className="text-tenue">·</span>
            <span className="text-tenue">{funcion.asientos_disponibles} libres</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
