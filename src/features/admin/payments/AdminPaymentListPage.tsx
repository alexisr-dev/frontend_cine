import { useState } from 'react'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/Button'
import { Badge } from '@/components/Badge'
import { Loader } from '@/components/Loader'
import { EmptyState, ErrorState } from '@/components/States'
import { Modal } from '@/components/Modal'
import { avisar } from '@/components/Toast'
import { mensajeDeError } from '@/lib/axios'
import { formatearDinero, formatearFechaHora } from '@/lib/format'
import { cn } from '@/lib/cn'
import { listarPagosAdmin, reembolsarPago } from './api'
import type { EstadoPago, PagoAdmin } from '@/types'

const FILTROS: { valor: EstadoPago | undefined; texto: string }[] = [
  { valor: undefined, texto: 'Todos' },
  { valor: 'aprobado', texto: 'Aprobados' },
  { valor: 'pendiente', texto: 'Pendientes' },
  { valor: 'rechazado', texto: 'Rechazados' },
  { valor: 'reembolsado', texto: 'Reembolsados' },
]

const TONO_ESTADO: Record<EstadoPago, 'haz' | 'menta' | 'alerta' | 'neutro'> = {
  pendiente: 'haz',
  aprobado: 'menta',
  rechazado: 'alerta',
  reembolsado: 'neutro',
}

export const AdminPaymentListPage = () => {
  const [pagina, setPagina] = useState(1)
  const [estado, setEstado] = useState<EstadoPago | undefined>(undefined)
  const [porReembolsar, setPorReembolsar] = useState<PagoAdmin | null>(null)
  const queryClient = useQueryClient()

  const pagos = useQuery({
    queryKey: ['admin-pagos', pagina, estado],
    queryFn: () => listarPagosAdmin({ page: pagina, page_size: 15, estado }),
    placeholderData: keepPreviousData,
  })

  const reembolsar = useMutation({
    mutationFn: (id: number) => reembolsarPago(id),
    onSuccess: () => {
      avisar.exito('Pago reembolsado')
      setPorReembolsar(null)
      queryClient.invalidateQueries({ queryKey: ['admin-pagos'] })
    },
    onError: (error) => {
      avisar.error(mensajeDeError(error, 'No se pudo reembolsar el pago'))
    },
  })

  return (
    <section className="contenedor py-14 sm:py-20">
      <p className="eyebrow">Administracion</p>
      <h1 className="mt-3 text-4xl sm:text-5xl">Pagos</h1>

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

      {pagos.isLoading ? (
        <Loader etiqueta="Cargando pagos" />
      ) : pagos.isError ? (
        <div className="mt-10">
          <ErrorState
            descripcion={mensajeDeError(pagos.error)}
            onReintentar={() => pagos.refetch()}
          />
        </div>
      ) : pagos.data && pagos.data.results.length === 0 ? (
        <div className="mt-10">
          <EmptyState titulo="Sin pagos" descripcion="No hay pagos con este filtro." />
        </div>
      ) : (
        <>
          <div className="mt-8 flex flex-col gap-3">
            {pagos.data?.results.map((pago) => (
              <div
                key={pago.id}
                className="panel flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-xl">{formatearDinero(pago.monto)}</h3>
                    <Badge tono={TONO_ESTADO[pago.estado]}>{pago.estado}</Badge>
                  </div>
                  <p className="mt-1.5 text-sm text-tenue">
                    {pago.codigo_reserva} · {pago.usuario_email} · {pago.metodo_pago}
                  </p>
                  <p className="mt-1 text-sm text-tenue">
                    {pago.procesado_en ? formatearFechaHora(pago.procesado_en) : 'Sin procesar'}
                    {pago.mensaje ? ` · ${pago.mensaje}` : ''}
                  </p>
                </div>
                {pago.estado === 'aprobado' ? (
                  <div className="flex shrink-0 gap-2">
                    <Button variante="peligro" tamano="sm" onClick={() => setPorReembolsar(pago)}>
                      Reembolsar
                    </Button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          {pagos.data && pagos.data.pages > 1 ? (
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
                {pagos.data.page} / {pagos.data.pages}
              </span>
              <Button
                variante="secundario"
                tamano="sm"
                disabled={pagina >= pagos.data.pages}
                onClick={() => setPagina((valor) => valor + 1)}
              >
                Siguiente
              </Button>
            </div>
          ) : null}
        </>
      )}

      <Modal
        abierto={porReembolsar !== null}
        titulo="Reembolsar pago"
        descripcion={`Vas a reembolsar ${porReembolsar ? formatearDinero(porReembolsar.monto) : ''} de la reserva ${porReembolsar?.codigo_reserva}.`}
        textoConfirmar="Reembolsar"
        varianteConfirmar="peligro"
        procesando={reembolsar.isPending}
        onConfirmar={() => porReembolsar && reembolsar.mutate(porReembolsar.id)}
        onCerrar={() => setPorReembolsar(null)}
      />
    </section>
  )
}
