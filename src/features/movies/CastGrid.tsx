import { useState } from 'react'
import type { ActorReparto } from '@/types'

const inicialesDe = (nombre: string) => {
  const partes = nombre.split(' ').filter(Boolean)
  const primera = partes[0]?.charAt(0) ?? ''
  const ultima = partes.length > 1 ? partes[partes.length - 1].charAt(0) : ''
  return `${primera}${ultima}`.toUpperCase()
}

const ActorCard = ({ actor }: { actor: ActorReparto }) => {
  const [falloImagen, setFalloImagen] = useState(false)
  const mostrarFoto = actor.foto_url && !falloImagen

  return (
    <div className="w-28 shrink-0 sm:w-32">
      <div className="aspect-square overflow-hidden rounded-full border border-borde bg-sala-alta">
        {mostrarFoto ? (
          <img
            src={actor.foto_url ?? undefined}
            alt={actor.nombre}
            loading="lazy"
            onError={() => setFalloImagen(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-mono text-lg text-tenue">
            {inicialesDe(actor.nombre)}
          </div>
        )}
      </div>
      <p className="mt-2.5 text-center text-sm text-pantalla">{actor.nombre}</p>
      {actor.personaje ? (
        <p className="text-center text-xs text-tenue">{actor.personaje}</p>
      ) : null}
    </div>
  )
}

export const CastGrid = ({ reparto }: { reparto: ActorReparto[] }) => {
  if (reparto.length === 0) return null

  return (
    <div className="-mx-4 flex gap-5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:justify-start sm:px-0">
      {reparto.map((actor) => (
        <ActorCard key={actor.nombre} actor={actor} />
      ))}
    </div>
  )
}
