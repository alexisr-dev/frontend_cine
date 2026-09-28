import { useState } from 'react'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/Button'
import { BadgeReserva } from '@/components/Badge'
import { Loader } from '@/components/Loader'
import { EmptyState, ErrorState } from '@/components/States'
import { Modal } from '@/components/Modal'
import { avisar } from '@/components/Toast'
import { mensajeDeError } from '@/lib/axios'
import { formatearDinero, formatearFechaHora } from '@/lib/format'
import { cn } from '@/lib/cn'
import { cancelarReserva, listarReservasAdmin } from './api'
import type { EstadoReserva, ReservaAdmin } from '@/types'

const FILTROS: { valor: EstadoReserva | undefined; texto: string }[] = [
  { valor: undefined, texto: 'Todas' },
  { valor: 'pendiente', texto: 'Pendientes' },
  { valor: 'confirmada', texto: 'Confirmadas' },
  { valor: 'cancelada', texto: 'Canceladas' },
  { valor: 'expirada', texto: 'Expiradas' },
]

export const AdminReservationListPage = () => {
  const [pagina, setPagina] = useState(1)
  const [estado, setEstado] = useState<EstadoReserva | undefined>(undefined)
  const [porCancelar, setPorCancelar] = useState<ReservaAdmin | null>(null)
  const queryClient = useQueryClient()

  const reservas = useQuery({
    queryKey: ['admin-reservas', pagina, estado],
    queryFn: () => listarReservasAdmin({ page: pagina, page_size: 15, estado }),
    placeholderData: keepPreviousData,
  })

  const cancelar = useMutation({
    mutationFn: (id: number) => cancelarReserva(id),
    onSuccess: () => {
      avisar.exito('Reserva cancelada')
      setPorCancelar(null)
      queryClient.invalidateQueries({ queryKey: ['admin-reservas'] })
    },
    onError: (error) => {
      avisar.error(mensajeDeError(error, 'No se pudo cancelar la reserva'))
    },
  })

  return (
    <section className="contenedor py-14 sm:py-20">
      <p className="eyebrow">Administracion</p>
      <h1 className="mt-3 text-4xl sm:text-5xl">Reservas</h1>

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTROS.map((filtro) => (
          <button
            key={filtro.texto}
            type="button"
            onClick={() => {
              setEstado(filtro.valor)
              setPagina(1)
            }}
            className={cn(
              'shrink-0 rounded-full border px-4 py-1.5 font-mono text-[0.6875rem] tracking-widest uppercase transition-colors',
              estado === filtro.valor
                ? 'border-haz bg-haz text-noche'
                : 'border-borde text-tenue hover:text-pantalla',
            )}
          >
            {filtro.texto}
          </button>
        ))}
      </div>

      {reservas.isLoading ? (
        <Loader etiqueta="Cargando reservas" />
      ) : reservas.isError ? (
        <div className="mt-10">
          <ErrorState
            descripcion={mensajeDeError(reservas.error)}
            onReintentar={() => reservas.refetch()}
          />
        </div>
      ) : reservas.data && reservas.data.results.length === 0 ? (
        <div className="mt-10">
          <EmptyState titulo="Sin reservas" descripcion="No hay reservas con este filtro." />
        </div>
      ) : (
        <>
          <div className="mt-8 flex flex-col gap-3">
            {reservas.data?.results.map((reserva) => (
              <div
                key={reserva.id}
                className="panel flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-xl">{reserva.pelicula_titulo}</h3>
                    <BadgeReserva estado={reserva.estado} />
                  </div>
                  <p className="mt-1.5 text-sm text-tenue">
                    {reserva.codigo_reserva} · {reserva.usuario_email}
                  </p>
                  <p className="mt-1 text-sm text-tenue">
                    {formatearFechaHora(reserva.fecha_hora_inicio)} · {reserva.cine_nombre} ·{' '}
                    {reserva.sala_nombre} · {reserva.asientos.length} butacas ·{' '}
                    {formatearDinero(reserva.total)}
                  </p>
                </div>
                {reserva.estado === 'pendiente' || reserva.estado === 'confirmada' ? (
                  <div className="flex shrink-0 gap-2">
                    <Button variante="peligro" tamano="sm" onClick={() => setPorCancelar(reserva)}>
                      Cancelar
                    </Button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          {reservas.data && reservas.data.pages > 1 ? (
            <div className="mt-12 flex items-center justify-center gap-3">
              <Button
                variante="secundario"
                tamano="sm"
                disabled={pagina <= 1}
                onClick={() => setPagina((valor) => valor - 1)}
              >
                Anterior
              </Button>
              <span className="font-mono text-xs tracking-widest text-tenue">
                {reservas.data.page} / {reservas.data.pages}
              </span>
              <Button
                variante="secundario"
                tamano="sm"
                disabled={pagina >= reservas.data.pages}
                onClick={() => setPagina((valor) => valor + 1)}
              >
                Siguiente
              </Button>
            </div>
          ) : null}
        </>
      )}

      <Modal
        abierto={porCancelar !== null}
        titulo="Cancelar reserva"
        descripcion={`Vas a cancelar la reserva ${porCancelar?.codigo_reserva} de ${porCancelar?.usuario_email}.`}
        textoConfirmar="Cancelar reserva"
        varianteConfirmar="peligro"
        procesando={cancelar.isPending}
        onConfirmar={() => porCancelar && cancelar.mutate(porCancelar.id)}
        onCerrar={() => setPorCancelar(null)}
      />
    </section>
  )
}
