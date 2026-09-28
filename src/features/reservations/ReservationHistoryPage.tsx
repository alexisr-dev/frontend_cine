import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ButtonLink } from '@/components/Button'
import { Loader } from '@/components/Loader'
import { EmptyState, ErrorState } from '@/components/States'
import { BadgeReserva } from '@/components/Badge'
import { Countdown } from '@/components/Countdown'
import { mensajeDeError } from '@/lib/axios'
import { formatearDinero, formatearFechaCorta, formatearHora } from '@/lib/format'
import { cn } from '@/lib/cn'
import { useAuth } from '@/hooks/useAuth'
import { PosterArt } from '@/features/movies/PosterArt'
import { misReservas } from './api'

const FILTROS = [
  { valor: '', texto: 'Todas' },
  { valor: 'pendiente', texto: 'Por pagar' },
  { valor: 'confirmada', texto: 'Confirmadas' },
  { valor: 'cancelada', texto: 'Canceladas' },
  { valor: 'expirada', texto: 'Expiradas' },
]

export const ReservationHistoryPage = () => {
  const { usuario } = useAuth()
  const [filtro, setFiltro] = useState('')

  const reservas = useQuery({
    queryKey: ['mis-reservas', filtro],
    queryFn: () => misReservas(filtro || undefined),
    staleTime: 10_000,
  })

  return (
    <section className="contenedor py-10 sm:py-14 lg:py-20">
      <p className="eyebrow">Cuenta de {usuario?.email}</p>
      <h1 className="mt-3 text-[clamp(2.5rem,8vw,5.5rem)] leading-[0.88]">Mis boletos</h1>
      <p className="mt-4 max-w-lg text-sm text-tenue">
        Todo lo que has apartado y pagado, con el codigo QR listo para la entrada.
      </p>

      <div className="mt-8 -mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
        {FILTROS.map((opcion) => (
          <button
            key={opcion.valor}
            type="button"
            onClick={() => setFiltro(opcion.valor)}
            className={cn(
              'shrink-0 rounded-full border px-4 py-1.5 font-mono text-[0.6875rem] tracking-widest uppercase transition-colors',
              filtro === opcion.valor
                ? 'border-haz bg-haz text-noche'
                : 'border-borde text-tenue hover:text-pantalla',
            )}
          >
            {opcion.texto}
          </button>
        ))}
      </div>

      <div className="mt-9">
        {reservas.isLoading ? (
          <Loader etiqueta="Buscando tus boletos" />
        ) : reservas.isError ? (
          <ErrorState
            descripcion={mensajeDeError(reservas.error)}
            onReintentar={() => reservas.refetch()}
          />
        ) : (reservas.data?.results.length ?? 0) === 0 ? (
          <EmptyState
            titulo="Todavia nada"
            descripcion="Cuando apartes butacas apareceran aqui con su codigo y su cuenta regresiva."
            accion={<ButtonLink to="/">Ver cartelera</ButtonLink>}
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2 3xl:grid-cols-3">
            {reservas.data?.results.map((reserva, indice) => (
              <motion.div
                key={reserva.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: Math.min(indice * 0.05, 0.35) }}
              >
                <Link
                  to={`/reservas/${reserva.id}`}
                  className="panel group flex gap-4 p-4 transition-colors hover:border-haz/50 sm:gap-5 sm:p-5"
                >
                  <div className="aspect-[2/3] w-20 shrink-0 overflow-hidden rounded-lg border border-borde sm:w-24">
                    <PosterArt
                      titulo={reserva.pelicula_titulo}
                      posterUrl={reserva.poster_url}
                      compacto
                    />
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="line-clamp-2 text-lg leading-tight transition-colors group-hover:text-haz sm:text-xl">
                        {reserva.pelicula_titulo}
                      </h2>
                      <BadgeReserva estado={reserva.estado} />
                    </div>

                    <p className="mt-2 font-mono text-[0.625rem] tracking-wider text-tenue uppercase">
                      {formatearFechaCorta(reserva.fecha_hora_inicio)} ·{' '}
                      {formatearHora(reserva.fecha_hora_inicio)} · {reserva.sala_nombre}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {reserva.asientos.map((asiento) => (
                        <span
                          key={asiento.id}
                          className="rounded-t-md rounded-b-sm border border-borde px-2 py-0.5 font-mono text-[0.625rem] text-tenue"
                        >
                          {asiento.etiqueta}
                        </span>
                      ))}
                    </div>

                    <div className="mt-auto flex items-end justify-between gap-3 pt-4">
                      <span className="font-mono text-[0.625rem] tracking-widest text-tenue">
                        {reserva.codigo_reserva}
                      </span>
                      {reserva.estado === 'pendiente' ? (
                        <Countdown segundos={reserva.segundos_restantes} compacto />
                      ) : (
                        <span className="font-display text-xl tabular-nums">
                          {formatearDinero(reserva.total)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
