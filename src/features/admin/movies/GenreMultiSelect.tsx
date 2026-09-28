import { cn } from '@/lib/cn'
import type { Genero } from '@/types'

interface Props {
  generos: Genero[]
  seleccionados: number[]
  onCambiar: (ids: number[]) => void
  error?: string
}

export const GenreMultiSelect = ({ generos, seleccionados, onCambiar, error }: Props) => {
  const alternar = (id: number) => {
    onCambiar(
      seleccionados.includes(id)
        ? seleccionados.filter((valor) => valor !== id)
        : [...seleccionados, id],
    )
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="eyebrow">Generos</span>
      <div className="flex flex-wrap gap-2">
        {generos.map((genero) => {
          const activo = seleccionados.includes(genero.id)
          return (
            <button
              key={genero.id}
              type="button"
              onClick={() => alternar(genero.id)}
              aria-pressed={activo}
              className={cn(
                'shrink-0 rounded-full border px-4 py-1.5 font-mono text-[0.6875rem] tracking-widest uppercase transition-colors',
                activo
                  ? 'border-haz bg-haz text-noche'
                  : 'border-borde text-tenue hover:text-pantalla',
              )}
            >
              {genero.nombre}
            </button>
          )
        })}
      </div>
      {error ? <p className="font-mono text-xs text-alerta">{error}</p> : null}
    </div>
  )
}
