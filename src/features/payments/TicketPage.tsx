import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ButtonLink, Button } from '@/components/Button'
import { Loader } from '@/components/Loader'
import { ErrorState } from '@/components/States'
import { mensajeDeError } from '@/lib/axios'
import { formatearFecha, formatearHora } from '@/lib/format'
import { obtenerTicket } from './api'
import { CodigoQR } from './CodigoQR'

export const TicketPage = () => {
  const { id } = useParams()
  const reservaId = Number(id)

  const ticket = useQuery({
    queryKey: ['ticket', reservaId],
    queryFn: () => obtenerTicket(reservaId),
    enabled: Number.isFinite(reservaId),
  })

  if (ticket.isLoading) return <Loader etiqueta="Imprimiendo tu boleto" />
  if (ticket.isError || !ticket.data) {
    return (
      <div className="contenedor py-20">
        <ErrorState
          titulo="Boleto no emitido"
          descripcion={mensajeDeError(
            ticket.error,
            'Esta reserva todavia no tiene boleto. Completa el pago primero.',
          )}
        />
      </div>
    )
  }

  const datos = ticket.data

  return (
    <section className="contenedor py-10 sm:py-16">
      <nav className="mb-8 flex items-center gap-2 font-mono text-[0.6875rem] tracking-widest text-tenue uppercase">
        <Link to="/mis-reservas" className="transition-colors hover:text-haz">
          Mis boletos
        </Link>
        <span aria-hidden>/</span>
        <span className="text-pantalla">{datos.codigo_reserva}</span>
      </nav>

      <div className="mx-auto max-w-xl text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-menta/40 bg-menta/10"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6 text-menta" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
            <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
        <h1 className="mt-6 text-[clamp(2rem,7vw,3.5rem)] leading-[0.9]">Boleto emitido</h1>
        <p className="mt-4 text-sm text-tenue">
          Muestra este codigo en la entrada de la sala. Tambien lo guardamos en tu historial.
        </p>
      </div>

      <motion.div
        className="mx-auto mt-10 max-w-md"
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="overflow-hidden rounded-2xl bg-pantalla text-noche shadow-[0_40px_90px_-40px_rgba(255,194,75,0.4)]">
          <div className="flex items-center justify-between border-b border-dashed border-noche/25 px-6 py-4">
            <span className="font-display text-xl tracking-wide">
              Cinema<span className="text-terciopelo">Aurora</span>
            </span>
            <span className="font-mono text-[0.625rem] tracking-[0.25em] uppercase opacity-60">
              Admite {datos.asientos.length}
            </span>
          </div>

          <div className="px-6 pt-6 pb-5">
            <p className="font-mono text-[0.625rem] tracking-[0.25em] uppercase opacity-55">
              Pelicula
            </p>
            <h2 className="mt-1.5 text-3xl leading-[0.92] text-noche">{datos.pelicula_titulo}</h2>

            <dl className="mt-6 grid grid-cols-2 gap-x-5 gap-y-4">
              <div>
                <dt className="font-mono text-[0.625rem] tracking-[0.25em] uppercase opacity-55">
                  Fecha
                </dt>
                <dd className="mt-1 text-sm font-medium">
                  {formatearFecha(datos.fecha_hora_inicio)}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[0.625rem] tracking-[0.25em] uppercase opacity-55">
                  Hora
                </dt>
                <dd className="mt-1 font-mono text-sm font-semibold">
                  {formatearHora(datos.fecha_hora_inicio)}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[0.625rem] tracking-[0.25em] uppercase opacity-55">
                  Complejo
                </dt>
                <dd className="mt-1 text-sm font-medium">{datos.cine_nombre}</dd>
              </div>
              <div>
                <dt className="font-mono text-[0.625rem] tracking-[0.25em] uppercase opacity-55">
                  Sala
                </dt>
                <dd className="mt-1 text-sm font-medium">{datos.sala_nombre}</dd>
              </div>
            </dl>

            <div className="mt-6">
              <p className="font-mono text-[0.625rem] tracking-[0.25em] uppercase opacity-55">
                Butacas
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {datos.asientos.map((etiqueta) => (
                  <span
                    key={etiqueta}
                    className="rounded-t-md rounded-b-sm bg-noche px-2.5 py-1 font-mono text-xs font-semibold text-pantalla"
                  >
                    {etiqueta}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="relative border-t border-dashed border-noche/25">
            <span className="absolute -top-3 -left-3 h-6 w-6 rounded-full bg-noche" aria-hidden />
            <span className="absolute -top-3 -right-3 h-6 w-6 rounded-full bg-noche" aria-hidden />
            <div className="flex flex-col items-center gap-4 px-6 py-7">
              <CodigoQR valor={datos.codigo_qr} tamano={168} />
              <div className="text-center">
                <p className="font-mono text-[0.625rem] tracking-[0.25em] uppercase opacity-55">
                  Codigo de reserva
                </p>
                <p className="mt-1 font-mono text-lg font-semibold tracking-[0.2em]">
                  {datos.codigo_reserva}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="mx-auto mt-9 flex max-w-md flex-col gap-3 sm:flex-row">
        <Button variante="secundario" className="flex-1" onClick={() => window.print()}>
          Imprimir boleto
        </Button>
        <ButtonLink to="/mis-reservas" className="flex-1">
          Ver mis boletos
        </ButtonLink>
      </div>
    </section>
  )
}
