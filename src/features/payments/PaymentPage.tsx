import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Button } from '@/components/Button'
import { Field } from '@/components/Field'
import { Loader } from '@/components/Loader'
import { ErrorState } from '@/components/States'
import { Countdown } from '@/components/Countdown'
import { avisar } from '@/components/Toast'
import { detallesDeError, mensajeDeError } from '@/lib/axios'
import { formatearDinero, formatearFechaCorta, formatearHora } from '@/lib/format'
import { cn } from '@/lib/cn'
import { obtenerReserva } from '@/features/reservations/api'
import type { MetodoPago } from '@/types'
import { pagarReserva } from './api'

const METODOS: { valor: MetodoPago; titulo: string; detalle: string }[] = [
  { valor: 'tarjeta', titulo: 'Tarjeta', detalle: 'Credito o debito' },
  { valor: 'paypal', titulo: 'PayPal', detalle: 'Saldo o cuenta ligada' },
  { valor: 'efectivo', titulo: 'Taquilla', detalle: 'Pagas al llegar' },
]

const agruparTarjeta = (valor: string) =>
  valor
    .replace(/\D/g, '')
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, '$1 ')
    .trim()

const formatearExpiracion = (valor: string) => {
  const digitos = valor.replace(/\D/g, '').slice(0, 4)
  return digitos.length <= 2 ? digitos : `${digitos.slice(0, 2)}/${digitos.slice(2)}`
}

export const PaymentPage = () => {
  const { id } = useParams()
  const reservaId = Number(id)
  const navegar = useNavigate()
  const clienteConsultas = useQueryClient()

  const [metodo, setMetodo] = useState<MetodoPago>('tarjeta')
  const [titular, setTitular] = useState('')
  const [numero, setNumero] = useState('')
  const [expiracion, setExpiracion] = useState('')
  const [cvv, setCvv] = useState('')
  const [errores, setErrores] = useState<Record<string, string>>({})

  const claveIdempotencia = useMemo(
    () => `pago-${reservaId}-${crypto.randomUUID()}`,
    [reservaId],
  )

  const reserva = useQuery({
    queryKey: ['reserva', reservaId],
    queryFn: () => obtenerReserva(reservaId),
    enabled: Number.isFinite(reservaId),
    staleTime: 0,
  })

  const pago = useMutation({
    mutationFn: () =>
      pagarReserva(
        reservaId,
        {
          metodo_pago: metodo,
          nombre_titular: titular,
          numero_tarjeta: numero.replace(/\s/g, ''),
          expiracion,
          cvv,
        },
        claveIdempotencia,
      ),
    onSuccess: (respuesta) => {
      clienteConsultas.invalidateQueries({ queryKey: ['reserva', reservaId] })
      clienteConsultas.invalidateQueries({ queryKey: ['mis-reservas'] })
      if (respuesta.pago.estado === 'aprobado') {
        avisar.exito('Pago aprobado. Tu boleto ya esta listo.')
        navegar(`/reservas/${reservaId}/boleto`)
        return
      }
      avisar.error(respuesta.pago.mensaje ?? 'El emisor rechazo el cargo')
    },
    onError: (error) => {
      setErrores(detallesDeError(error))
      avisar.error(mensajeDeError(error, 'No se pudo procesar el pago'))
    },
  })

  const enviar = (evento: FormEvent) => {
    evento.preventDefault()
    setErrores({})
    pago.mutate()
  }

  if (reserva.isLoading) return <Loader etiqueta="Preparando el cobro" />
  if (reserva.isError || !reserva.data) {
    return (
      <div className="contenedor py-20">
        <ErrorState
          titulo="Reserva no disponible"
          descripcion={mensajeDeError(reserva.error, 'Esta reserva no existe o no es tuya')}
        />
      </div>
    )
  }

  const datos = reserva.data

  if (datos.estado !== 'pendiente') {
    return (
      <div className="contenedor py-20">
        <ErrorState
          titulo={datos.estado === 'confirmada' ? 'Ya esta pagada' : 'Reserva inactiva'}
          descripcion={
            datos.estado === 'confirmada'
              ? 'Esta reserva ya se pago. Encuentra el boleto en tu historial.'
              : 'Esta reserva expiro o fue cancelada. Vuelve a elegir tus butacas.'
          }
          onReintentar={() => navegar('/mis-reservas')}
        />
      </div>
    )
  }

  return (
    <section className="contenedor py-8 sm:py-12 lg:py-16">
      <nav className="mb-6 flex items-center gap-2 font-mono text-[0.6875rem] tracking-widest text-tenue uppercase">
        <Link to={`/reservas/${datos.id}`} className="transition-colors hover:text-haz">
          {datos.codigo_reserva}
        </Link>
        <span aria-hidden>/</span>
        <span className="text-pantalla">Pago</span>
      </nav>

      <div className="flex flex-col gap-4 border-b border-borde pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Ultimo paso</p>
          <h1 className="mt-3 text-[clamp(2rem,6vw,4rem)] leading-[0.9]">Pagar</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="eyebrow">Tiempo restante</span>
          <Countdown
            segundos={datos.segundos_restantes}
            onTerminar={() => {
              avisar.error('Se acabo el tiempo. Vuelve a elegir tus butacas.')
              navegar(`/funciones/${datos.funcion.id}/asientos`)
            }}
          />
        </div>
      </div>

      <div className="mt-9 grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start lg:gap-10">
        <motion.form
          onSubmit={enviar}
          className="panel p-5 sm:p-7"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          noValidate
        >
          <p className="eyebrow">Como quieres pagar</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {METODOS.map((opcion) => (
              <button
                key={opcion.valor}
                type="button"
                onClick={() => setMetodo(opcion.valor)}
                aria-pressed={metodo === opcion.valor}
                className={cn(
                  'flex flex-col items-start gap-0.5 rounded-xl border px-4 py-3 text-left transition-colors',
                  metodo === opcion.valor
                    ? 'border-haz bg-haz/10'
                    : 'border-borde hover:border-haz/40',
                )}
              >
                <span
                  className={cn(
                    'text-sm font-medium',
                    metodo === opcion.valor ? 'text-haz' : 'text-pantalla',
                  )}
                >
                  {opcion.titulo}
                </span>
                <span className="font-mono text-[0.625rem] tracking-wider text-tenue uppercase">
                  {opcion.detalle}
                </span>
              </button>
            ))}
          </div>

          {metodo === 'tarjeta' ? (
            <div className="mt-8 flex flex-col gap-5">
              <Field
                etiqueta="Nombre del titular"
                autoComplete="cc-name"
                placeholder="Como aparece en la tarjeta"
                value={titular}
                onChange={(evento) => setTitular(evento.target.value)}
                error={errores.nombre_titular}
                required
              />
              <Field
                etiqueta="Numero de tarjeta"
                autoComplete="cc-number"
                inputMode="numeric"
                placeholder="4242 4242 4242 4242"
                value={numero}
                onChange={(evento) => setNumero(agruparTarjeta(evento.target.value))}
                error={errores.numero_tarjeta}
                ayuda="Modo prueba: 4242 4242 4242 4242 se aprueba"
                required
              />
              <div className="grid grid-cols-2 gap-5">
                <Field
                  etiqueta="Vence"
                  autoComplete="cc-exp"
                  inputMode="numeric"
                  placeholder="12/29"
                  value={expiracion}
                  onChange={(evento) => setExpiracion(formatearExpiracion(evento.target.value))}
                  error={errores.expiracion}
                  required
                />
                <Field
                  etiqueta="CVV"
                  autoComplete="cc-csc"
                  inputMode="numeric"
                  placeholder="123"
                  value={cvv}
                  onChange={(evento) => setCvv(evento.target.value.replace(/\D/g, '').slice(0, 4))}
                  error={errores.cvv}
                  required
                />
              </div>
            </div>
          ) : (
            <p className="mt-8 rounded-xl border border-dashed border-borde px-5 py-6 text-sm text-tenue">
              {metodo === 'paypal'
                ? 'Al confirmar te enviamos a PayPal en modo prueba y volvemos con el resultado.'
                : 'Reservamos tus butacas y pagas en la taquilla al llegar. Presenta tu codigo.'}
            </p>
          )}

          <Button
            type="submit"
            tamano="lg"
            className="mt-8 w-full"
            disabled={pago.isPending || datos.segundos_restantes <= 0}
          >
            {pago.isPending ? 'Procesando...' : `Pagar ${formatearDinero(datos.total)}`}
          </Button>

          <p className="mt-4 flex items-center justify-center gap-2 font-mono text-[0.625rem] tracking-wider text-tenue uppercase">
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <rect x="4" y="10" width="16" height="10" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
            Cobro unico protegido con clave de idempotencia
          </p>
        </motion.form>

        <aside className="panel p-5 sm:p-6 lg:sticky lg:top-24">
          <p className="eyebrow">Resumen</p>
          <h2 className="mt-3 text-2xl leading-tight">{datos.funcion.pelicula.titulo}</h2>
          <p className="mt-2 font-mono text-[0.6875rem] tracking-wider text-tenue uppercase">
            {formatearFechaCorta(datos.funcion.fecha_hora_inicio)} ·{' '}
            {formatearHora(datos.funcion.fecha_hora_inicio)} · {datos.funcion.sala.nombre}
          </p>

          <ul className="mt-5 flex flex-col gap-2 border-t border-borde pt-5">
            {datos.asientos.map((asiento) => (
              <li key={asiento.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="font-mono text-xs tracking-wider text-tenue">
                  {asiento.etiqueta} · {asiento.tipo}
                </span>
                <span className="font-mono tabular-nums">
                  {formatearDinero(asiento.precio_pagado)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex items-baseline justify-between border-t border-borde pt-5">
            <span className="eyebrow">Total</span>
            <span className="font-display text-3xl tabular-nums">
              {formatearDinero(datos.total)}
            </span>
          </div>
        </aside>
      </div>
    </section>
  )
}
