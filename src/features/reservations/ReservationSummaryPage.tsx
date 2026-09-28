import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Button, ButtonLink } from '@/components/Button'
import { Loader } from '@/components/Loader'
import { ErrorState } from '@/components/States'
import { BadgeReserva } from '@/components/Badge'
import { Countdown } from '@/components/Countdown'
import { Modal } from '@/components/Modal'
import { avisar } from '@/components/Toast'
import { mensajeDeError } from '@/lib/axios'
import { formatearDinero, formatearFechaCorta, formatearHora } from '@/lib/format'
import { PosterArt } from '@/features/movies/PosterArt'
import { cancelarReserva, obtenerReserva } from './api'

export const ReservationSummaryPage = () => {
  const { id } = useParams()
  const reservaId = Number(id)
  const navegar = useNavigate()
  const clienteConsultas = useQueryClient()
  const [confirmandoCancelacion, setConfirmandoCancelacion] = useState(false)

  const reserva = useQuery({
    queryKey: ['reserva', reservaId],
    queryFn: () => obtenerReserva(reservaId),
    enabled: Number.isFinite(reservaId),
    staleTime: 0,
  })

  const cancelar = useMutation({
    mutationFn: () => cancelarReserva(reservaId),
    onSuccess: () => {
      setConfirmandoCancelacion(false)
      clienteConsultas.invalidateQueries({ queryKey: ['reserva', reservaId] })
      clienteConsultas.invalidateQueries({ queryKey: ['mis-reservas'] })
      avisar.info('Reserva cancelada. Las butacas volvieron al plano.')
      navegar('/mis-reservas')
    },
    onError: (error) => avisar.error(mensajeDeError(error, 'No se pudo cancelar')),
  })

  if (reserva.isLoading) return <Loader etiqueta="Recuperando tu reserva" />
  if (reserva.isError || !reserva.data) {
    return (
      <div className="contenedor py-20">
        <ErrorState
          titulo="Reserva no encontrada"
          descripcion={mensajeDeError(reserva.error, 'Esta reserva no existe o no es tuya')}
        />
      </div>
    )
  }

  const datos = reserva.data
  const pendiente = datos.estado === 'pendiente'
  const confirmada = datos.estado === 'confirmada'

  return (
    <section className="contenedor py-8 sm:py-12 lg:py-16">
      <nav className="mb-6 flex items-center gap-2 font-mono text-[0.6875rem] tracking-widest text-tenue uppercase">
        <Link to="/mis-reservas" className="transition-colors hover:text-haz">
          Mis boletos
        </Link>
        <span aria-hidden>/</span>
        <span className="text-pantalla">{datos.codigo_reserva}</span>
      </nav>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex flex-col gap-4 border-b border-borde pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Paso 3 de 3 · Revisa y paga</p>
            <h1 className="mt-3 text-[clamp(2rem,6vw,4rem)] leading-[0.9]">Tu reserva</h1>
            <p className="mt-3 font-mono text-sm tracking-widest text-haz">
              {datos.codigo_reserva}
            </p>
          </div>
          <BadgeReserva estado={datos.estado} />
        </div>

        {pendiente ? (
          <div className="mt-7 flex flex-col gap-3 rounded-xl border border-haz/30 bg-haz/8 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-pantalla/90">
              Tus butacas estan apartadas. Paga antes de que se acabe el tiempo o vuelven al plano.
            </p>
            <Countdown
              segundos={datos.segundos_restantes}
              onTerminar={() => {
                avisar.error('El tiempo se agoto y las butacas volvieron al plano')
                reserva.refetch()
              }}
            />
          </div>
        ) : null}

        <div className="mt-9 grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start lg:gap-10">
          <div className="panel overflow-hidden">
            <div className="flex gap-4 border-b border-borde p-5 sm:gap-6 sm:p-7">
              <div className="aspect-[2/3] w-20 shrink-0 overflow-hidden rounded-lg border border-borde sm:w-28">
                <PosterArt
                  titulo={datos.funcion.pelicula.titulo}
                  posterUrl={datos.funcion.pelicula.poster_url}
                  compacto
                />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-2xl leading-tight sm:text-3xl">
                  {datos.funcion.pelicula.titulo}
                </h2>
                <p className="mt-2.5 font-mono text-[0.6875rem] tracking-wider text-tenue uppercase">
                  {datos.funcion.pelicula.duracion_legible}
                  {datos.funcion.pelicula.clasificacion
                    ? ` · ${datos.funcion.pelicula.clasificacion}`
                    : ''}
                </p>
                <div className="mt-4 grid gap-x-6 gap-y-3 xs:grid-cols-2">
                  <div>
                    <p className="eyebrow">Dia</p>
                    <p className="mt-1 text-sm">
                      {formatearFechaCorta(datos.funcion.fecha_hora_inicio)}
                    </p>
                  </div>
                  <div>
                    <p className="eyebrow">Hora</p>
                    <p className="mt-1 font-mono text-sm text-haz">
                      {formatearHora(datos.funcion.fecha_hora_inicio)}
                    </p>
                  </div>
                  <div>
                    <p className="eyebrow">Complejo</p>
                    <p className="mt-1 text-sm">{datos.funcion.sala.cine.nombre}</p>
                  </div>
                  <div>
                    <p className="eyebrow">Sala</p>
                    <p className="mt-1 text-sm">
                      {datos.funcion.sala.nombre} · {datos.funcion.sala.tipo_sala}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-7">
              <p className="eyebrow">
                {datos.asientos.length} {datos.asientos.length === 1 ? 'butaca' : 'butacas'}
              </p>
              <ul className="mt-4 flex flex-col gap-3">
                {datos.asientos.map((asiento) => (
                  <li
                    key={asiento.id}
                    className="flex items-center justify-between gap-3 border-b border-borde pb-3 last:border-0 last:pb-0"
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-t-md rounded-b-sm border border-haz/50 bg-haz/15 font-mono text-xs font-semibold text-haz">
                        {asiento.etiqueta}
                      </span>
                      <span className="text-sm">
                        Fila {asiento.fila}, butaca {asiento.numero}
                        <span className="ml-2 font-mono text-[0.625rem] tracking-wider text-tenue uppercase">
                          {asiento.tipo}
                        </span>
                      </span>
                    </span>
                    <span className="font-mono text-sm tabular-nums">
                      {formatearDinero(asiento.precio_pagado)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <aside className="panel p-5 sm:p-6 lg:sticky lg:top-24">
            <p className="eyebrow">Total a pagar</p>
            <p className="mt-2 font-display text-5xl tabular-nums">{formatearDinero(datos.total)}</p>
            <p className="mt-2 font-mono text-[0.625rem] tracking-wider text-tenue uppercase">
              Impuestos incluidos
            </p>

            <div className="mt-7 flex flex-col gap-3">
              {pendiente ? (
                <>
                  <ButtonLink to={`/reservas/${datos.id}/pago`} tamano="lg">
                    Pagar ahora
                  </ButtonLink>
                  <Button
                    variante="peligro"
                    onClick={() => setConfirmandoCancelacion(true)}
                    disabled={cancelar.isPending}
                  >
                    Cancelar reserva
                  </Button>
                </>
              ) : confirmada ? (
                <>
                  <ButtonLink to={`/reservas/${datos.id}/boleto`} tamano="lg">
                    Ver mi boleto
                  </ButtonLink>
                  <Button variante="peligro" onClick={() => setConfirmandoCancelacion(true)}>
                    Cancelar reserva
                  </Button>
                </>
              ) : (
                <ButtonLink to="/" tamano="lg">
                  Volver a la cartelera
                </ButtonLink>
              )}
            </div>

            {datos.pago ? (
              <div className="mt-7 border-t border-borde pt-5">
                <p className="eyebrow">Pago</p>
                <p className="mt-2 text-sm capitalize">{datos.pago.estado}</p>
                {datos.pago.transaccion_externa_id ? (
                  <p className="mt-1 font-mono text-[0.625rem] break-all text-tenue">
                    {datos.pago.transaccion_externa_id}
                  </p>
                ) : null}
              </div>
            ) : null}
          </aside>
        </div>
      </motion.div>

      <Modal
        abierto={confirmandoCancelacion}
        titulo="Cancelar esta reserva"
        descripcion={`Las ${datos.asientos.length} butacas vuelven al plano y cualquiera podra tomarlas. Esta accion no se revierte.`}
        textoConfirmar="Si, cancelar"
        textoCancelar="Conservarla"
        varianteConfirmar="peligro"
        procesando={cancelar.isPending}
        onConfirmar={() => cancelar.mutate()}
        onCerrar={() => setConfirmandoCancelacion(false)}
      />
    </section>
  )
}
