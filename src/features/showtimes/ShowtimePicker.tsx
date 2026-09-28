import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'
import { claveDeFecha, etiquetaDeDia, formatearHora, mesCorto, numeroDeDia } from '@/lib/format'
import type { Funcion } from '@/types'

interface Props {
  funciones: Funcion[]
  fechaActiva: string
  onCambiarFecha: (fecha: string) => void
  mostrarPelicula?: boolean
}

const ocupacion = (funcion: Funcion) => {
  if (funcion.asientos_totales === 0) return 0
  return 1 - funcion.asientos_disponibles / funcion.asientos_totales
}

export const ShowtimePicker = ({
  funciones,
  fechaActiva,
  onCambiarFecha,
  mostrarPelicula,
}: Props) => {
  const porFecha = useMemo(() => {
    const mapa = new Map<string, Funcion[]>()
    funciones.forEach((funcion) => {
      const clave = claveDeFecha(funcion.fecha_hora_inicio)
      mapa.set(clave, [...(mapa.get(clave) ?? []), funcion])
    })
    return mapa
  }, [funciones])

  const fechas = useMemo(() => Array.from(porFecha.keys()).sort(), [porFecha])
  const delDia = porFecha.get(fechaActiva) ?? []

  const porCine = useMemo(() => {
    const mapa = new Map<string, Funcion[]>()
    delDia.forEach((funcion) => {
      const clave = funcion.sala.cine.nombre
      mapa.set(clave, [...(mapa.get(clave) ?? []), funcion])
    })
    return Array.from(mapa.entries())
  }, [delDia])

  if (fechas.length === 0) {
    return (
      <p className="panel px-6 py-10 text-center text-sm text-tenue">
        No hay funciones programadas por ahora. Vuelve a revisar manana.
      </p>
    )
  }

  return (
    <div>
      <div className="-mx-4 flex gap-2.5 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0">
        {fechas.map((fecha) => {
          const referencia = porFecha.get(fecha)![0].fecha_hora_inicio
          const activa = fecha === fechaActiva
          return (
            <button
              key={fecha}
              type="button"
              onClick={() => onCambiarFecha(fecha)}
              className={cn(
                'flex w-[4.5rem] shrink-0 flex-col items-center gap-0.5 rounded-xl border px-3 py-3 transition-colors sm:w-20',
                activa
                  ? 'border-haz bg-haz text-noche'
                  : 'border-borde bg-sala text-tenue hover:border-haz/50 hover:text-pantalla',
              )}
              aria-pressed={activa}
            >
              <span className="font-mono text-[0.625rem] tracking-widest uppercase">
                {etiquetaDeDia(referencia)}
              </span>
              <span className="font-display text-2xl leading-none">{numeroDeDia(referencia)}</span>
              <span className="font-mono text-[0.625rem] tracking-widest uppercase">
                {mesCorto(referencia)}
              </span>
            </button>
          )
        })}
      </div>

      <div className="mt-8 flex flex-col gap-8">
        {porCine.map(([cine, lista]) => (
          <div key={cine}>
            <div className="flex items-baseline justify-between gap-4 border-b border-borde pb-3">
              <h3 className="text-xl sm:text-2xl">{cine}</h3>
              <span className="font-mono text-[0.6875rem] tracking-widest text-tenue uppercase">
                {lista.length} funciones
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {lista
                .slice()
                .sort((a, b) => a.fecha_hora_inicio.localeCompare(b.fecha_hora_inicio))
                .map((funcion, indice) => {
                  const lleno = funcion.asientos_disponibles === 0
                  const casiLleno = !lleno && ocupacion(funcion) > 0.8
                  return (
                    <motion.div
                      key={funcion.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: Math.min(indice * 0.03, 0.3) }}
                    >
                      <Link
                        to={lleno ? '#' : `/funciones/${funcion.id}/asientos`}
                        aria-disabled={lleno}
                        onClick={(evento) => lleno && evento.preventDefault()}
                        className={cn(
                          'group flex h-full flex-col gap-2 rounded-xl border bg-sala p-3.5 transition-all sm:p-4',
                          lleno
                            ? 'cursor-not-allowed border-borde opacity-45'
                            : 'border-borde hover:-translate-y-0.5 hover:border-haz/60',
                        )}
                      >
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="font-display text-2xl leading-none sm:text-3xl">
                            {formatearHora(funcion.fecha_hora_inicio)}
                          </span>
                          <span className="rounded border border-borde px-1.5 py-0.5 font-mono text-[0.5625rem] tracking-wider text-haz uppercase">
                            {funcion.sala.tipo_sala}
                          </span>
                        </div>

                        {mostrarPelicula ? (
                          <h4 className="line-clamp-2 text-base leading-tight transition-colors group-hover:text-haz">
                            {funcion.pelicula_titulo}
                          </h4>
                        ) : null}

                        <p className="font-mono text-[0.625rem] tracking-wider text-tenue uppercase">
                          {funcion.sala.nombre} · {funcion.idioma}
                          {funcion.subtitulos ? ' · SUB' : ''}
                        </p>

                        <div className="mt-auto pt-2">
                          <div className="h-1 overflow-hidden rounded-full bg-borde">
                            <div
                              className={cn(
                                'h-full rounded-full transition-all duration-500',
                                lleno ? 'bg-terciopelo' : casiLleno ? 'bg-alerta' : 'bg-menta',
                              )}
                              style={{ width: `${Math.round(ocupacion(funcion) * 100)}%` }}
                            />
                          </div>
                          <p className="mt-1.5 font-mono text-[0.625rem] tracking-wider text-tenue">
                            {lleno ? 'Agotada' : `${funcion.asientos_disponibles} libres`}
                          </p>
                        </div>
                      </Link>
                    </motion.div>
                  )
                })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
