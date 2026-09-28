import { useEffect, useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { Button, ButtonLink } from '@/components/Button'
import { Loader } from '@/components/Loader'
import { ErrorState } from '@/components/States'
import { avisar } from '@/components/Toast'
import { codigoDeError, mensajeDeError } from '@/lib/axios'
import { formatearDinero, formatearFechaCorta, formatearHora } from '@/lib/format'
import { useAuth } from '@/hooks/useAuth'
import { crearReserva } from '@/features/reservations/api'
import type { AsientoMapa } from '@/types'
import { obtenerMapa } from './api'
import { SeatMap } from './SeatMap'
import { MAX_ASIENTOS, useSeatMapStore } from './seatMapStore'

interface PropsResumen {
  seleccion: AsientoMapa[]
  total: number
  autenticado: boolean
  procesando: boolean
  onQuitar: (funcionAsientoId: number) => void
  onContinuar: () => void
}

const ResumenSeleccion = ({
  seleccion,
  total,
  autenticado,
  procesando,
  onQuitar,
  onContinuar,
}: PropsResumen) => (
  <div className="panel p-5 sm:p-6">
    <p className="eyebrow">Tu seleccion</p>

    {seleccion.length === 0 ? (
      <p className="mt-4 text-sm text-tenue">
        Toca las butacas del plano. Puedes elegir hasta {MAX_ASIENTOS} por compra.
      </p>
    ) : (
      <ul className="mt-4 flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {seleccion.map((asiento) => (
            <motion.li
              key={asiento.funcion_asiento_id}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-between gap-3 border-b border-borde pb-2 last:border-0"
            >
              <span className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-t-md rounded-b-sm bg-haz font-mono text-[0.625rem] font-semibold text-noche">
                  {asiento.numero}
                </span>
                <span className="text-sm">
                  Fila {asiento.fila}
                  <span className="ml-2 font-mono text-[0.625rem] tracking-wider text-tenue uppercase">
                    {asiento.tipo}
                  </span>
                </span>
              </span>
              <span className="flex items-center gap-3">
                <span className="font-mono text-sm tabular-nums">
                  {formatearDinero(asiento.precio)}
                </span>
                <button
                  type="button"
                  onClick={() => onQuitar(asiento.funcion_asiento_id)}
                  className="text-tenue transition-colors hover:text-alerta"
                  aria-label={`Soltar butaca ${asiento.etiqueta}`}
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                  </svg>
                </button>
              </span>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    )}

    <div className="mt-6 flex items-baseline justify-between border-t border-borde pt-5">
      <span className="eyebrow">Total</span>
      <span className="font-display text-3xl tabular-nums">{formatearDinero(total)}</span>
    </div>

    <Button
      tamano="lg"
      className="mt-5 w-full"
      disabled={seleccion.length === 0 || procesando}
      onClick={onContinuar}
    >
      {procesando
        ? 'Apartando...'
        : autenticado
          ? `Apartar ${seleccion.length || ''} ${seleccion.length === 1 ? 'butaca' : 'butacas'}`
          : 'Entrar para apartar'}
    </Button>

    <p className="mt-3 text-center font-mono text-[0.625rem] tracking-wider text-tenue">
      Las butacas quedan tuyas 10 minutos mientras pagas
    </p>
  </div>
)

export const SeatMapPage = () => {
  const { id } = useParams()
  const funcionId = Number(id)
  const navegar = useNavigate()
  const { autenticado } = useAuth()

  const seleccion = useSeatMapStore((estado) => estado.seleccion)
  const alternar = useSeatMapStore((estado) => estado.alternar)
  const quitar = useSeatMapStore((estado) => estado.quitar)
  const limpiar = useSeatMapStore((estado) => estado.limpiar)
  const abrirFuncion = useSeatMapStore((estado) => estado.abrirFuncion)

  useEffect(() => {
    if (Number.isFinite(funcionId)) abrirFuncion(funcionId)
  }, [funcionId, abrirFuncion])

  const mapa = useQuery({
    queryKey: ['mapa', funcionId],
    queryFn: () => obtenerMapa(funcionId),
    enabled: Number.isFinite(funcionId),
    refetchInterval: 12_000,
    staleTime: 0,
  })

  const seleccionados = useMemo(
    () => new Set(seleccion.map((asiento) => asiento.funcion_asiento_id)),
    [seleccion],
  )

  const total = useMemo(
    () => seleccion.reduce((suma, asiento) => suma + Number(asiento.precio), 0),
    [seleccion],
  )

  useEffect(() => {
    if (!mapa.data || seleccion.length === 0) return
    const libres = new Set(
      mapa.data.filas
        .flatMap((fila) => fila.asientos)
        .filter((asiento) => asiento.estado === 'disponible')
        .map((asiento) => asiento.funcion_asiento_id),
    )
    const perdidos = seleccion.filter((asiento) => !libres.has(asiento.funcion_asiento_id))
    if (perdidos.length > 0) {
      perdidos.forEach((asiento) => quitar(asiento.funcion_asiento_id))
      avisar.error(
        `Alguien tomo ${perdidos.map((asiento) => asiento.etiqueta).join(', ')} antes que tu`,
      )
    }
  }, [mapa.data, seleccion, quitar])

  const reservar = useMutation({
    mutationFn: () =>
      crearReserva(
        funcionId,
        seleccion.map((asiento) => asiento.funcion_asiento_id),
      ),
    onSuccess: (reserva) => {
      limpiar()
      navegar(`/reservas/${reserva.id}`)
    },
    onError: (error) => {
      avisar.error(mensajeDeError(error, 'No se pudo apartar la seleccion'))
      if (codigoDeError(error) === 'asiento_no_disponible') {
        limpiar()
        mapa.refetch()
      }
    },
  })

  const continuar = () => {
    if (seleccion.length === 0) return
    if (!autenticado) {
      navegar('/entrar', { state: { desde: `/funciones/${funcionId}/asientos` } })
      return
    }
    reservar.mutate()
  }

  if (mapa.isLoading) return <Loader etiqueta="Levantando el plano de la sala" />
  if (mapa.isError || !mapa.data) {
    return (
      <div className="contenedor py-20">
        <ErrorState
          titulo="Sala no disponible"
          descripcion={mensajeDeError(mapa.error, 'Esta funcion ya no acepta reservas')}
          onReintentar={() => mapa.refetch()}
        />
      </div>
    )
  }

  const { funcion, filas, resumen } = mapa.data

  const propsResumen = {
    seleccion,
    total,
    autenticado,
    procesando: reservar.isPending,
    onQuitar: quitar,
    onContinuar: continuar,
  }

  return (
    <section className="contenedor py-8 sm:py-12">
      <nav className="mb-6 flex flex-wrap items-center gap-2 font-mono text-[0.6875rem] tracking-widest text-tenue uppercase">
        <Link to="/" className="transition-colors hover:text-haz">
          Cartelera
        </Link>
        <span aria-hidden>/</span>
        <Link to={`/peliculas/${funcion.pelicula.id}`} className="transition-colors hover:text-haz">
          {funcion.pelicula.titulo}
        </Link>
        <span aria-hidden>/</span>
        <span className="text-pantalla">Butacas</span>
      </nav>

      <div className="flex flex-col gap-5 border-b border-borde pb-7 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-[clamp(2rem,6vw,3.75rem)] leading-[0.9]">{funcion.pelicula.titulo}</h1>
          <p className="mt-3 font-mono text-xs tracking-widest text-tenue uppercase">
            {formatearFechaCorta(funcion.fecha_hora_inicio)} ·{' '}
            <span className="text-haz">{formatearHora(funcion.fecha_hora_inicio)}</span> ·{' '}
            {funcion.sala.cine.nombre} · {funcion.sala.nombre} · {funcion.sala.tipo_sala}
          </p>
        </div>
        <div className="flex gap-6">
          <div>
            <p className="eyebrow">Libres</p>
            <p className="mt-1 font-display text-3xl text-menta tabular-nums">
              {resumen.disponibles}
            </p>
          </div>
          <div>
            <p className="eyebrow">Capacidad</p>
            <p className="mt-1 font-display text-3xl tabular-nums">{resumen.total}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-start lg:gap-10 xl:grid-cols-[minmax(0,1fr)_23rem]">
        <SeatMap
          filas={filas}
          seleccionados={seleccionados}
          limiteAlcanzado={seleccion.length >= MAX_ASIENTOS}
          onAlternar={alternar}
        />

        <aside className="hidden lg:sticky lg:top-24 lg:block">
          <ResumenSeleccion {...propsResumen} />
        </aside>
      </div>

      <div className="mt-8 lg:hidden">
        <ResumenSeleccion {...propsResumen} />
      </div>

      <AnimatePresence>
        {seleccion.length > 0 && (
          <motion.div
            className="fixed inset-x-0 bottom-0 z-40 border-t border-borde bg-noche/95 backdrop-blur-xl lg:hidden"
            initial={{ y: 90 }}
            animate={{ y: 0 }}
            exit={{ y: 90 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            <div className="contenedor flex items-center justify-between gap-4 py-3">
              <div className="min-w-0">
                <p className="truncate font-mono text-[0.625rem] tracking-wider text-tenue uppercase">
                  {seleccion.map((asiento) => asiento.etiqueta).join(' · ')}
                </p>
                <p className="font-display text-2xl tabular-nums">{formatearDinero(total)}</p>
              </div>
              <Button onClick={continuar} disabled={reservar.isPending} className="shrink-0">
                {reservar.isPending ? 'Apartando...' : autenticado ? 'Apartar' : 'Entrar'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {seleccion.length > 0 ? <div className="h-20 lg:hidden" aria-hidden /> : null}

      <div className="mt-12 flex flex-col gap-3 border-t border-borde pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-md text-sm text-tenue">
          Prefieres otro horario? La misma pelicula se proyecta varias veces al dia.
        </p>
        <ButtonLink to={`/peliculas/${funcion.pelicula.id}`} variante="secundario" tamano="sm">
          Ver otros horarios
        </ButtonLink>
      </div>
    </section>
  )
}
