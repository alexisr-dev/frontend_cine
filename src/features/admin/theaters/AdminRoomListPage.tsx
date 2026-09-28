import { useState } from 'react'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, ButtonLink } from '@/components/Button'
import { Loader } from '@/components/Loader'
import { EmptyState, ErrorState } from '@/components/States'
import { Modal } from '@/components/Modal'
import { avisar } from '@/components/Toast'
import { mensajeDeError } from '@/lib/axios'
import { cn } from '@/lib/cn'
import { eliminarSala, listarSalasAdmin } from './api'
import type { Sala } from '@/types'

export const AdminRoomListPage = () => {
  const [pagina, setPagina] = useState(1)
  const [porBorrar, setPorBorrar] = useState<Sala | null>(null)
  const queryClient = useQueryClient()

  const salas = useQuery({
    queryKey: ['admin-salas', pagina],
    queryFn: () => listarSalasAdmin({ page: pagina, page_size: 15 }),
    placeholderData: keepPreviousData,
  })

  const eliminar = useMutation({
    mutationFn: (id: number) => eliminarSala(id),
    onSuccess: () => {
      avisar.exito('Sala eliminada')
      setPorBorrar(null)
      queryClient.invalidateQueries({ queryKey: ['admin-salas'] })
    },
    onError: (error) => {
      avisar.error(mensajeDeError(error, 'No se pudo eliminar la sala'))
    },
  })

  return (
    <section className="contenedor py-14 sm:py-20">
      <div className="flex flex-col gap-6 border-b border-borde pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Administracion</p>
          <h1 className="mt-3 text-4xl sm:text-5xl">Salas</h1>
        </div>
        <ButtonLink to="/admin/salas/nueva">Agregar sala</ButtonLink>
      </div>

      {salas.isLoading ? (
        <Loader etiqueta="Cargando salas" />
      ) : salas.isError ? (
        <div className="mt-10">
          <ErrorState
            descripcion={mensajeDeError(salas.error)}
            onReintentar={() => salas.refetch()}
          />
        </div>
      ) : salas.data && salas.data.results.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            titulo="Sin salas"
            descripcion="Todavia no agregas ninguna sala."
            accion={<ButtonLink to="/admin/salas/nueva">Agregar la primera</ButtonLink>}
          />
        </div>
      ) : (
        <>
          <div className="mt-8 flex flex-col gap-3">
            {salas.data?.results.map((sala) => (
              <div
                key={sala.id}
                className="panel flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-xl">
                      {sala.cine.nombre} · {sala.nombre}
                    </h3>
                    <span
                      className={cn(
                        'rounded-full border px-3 py-0.5 font-mono text-[0.625rem] tracking-widest uppercase',
                        sala.activa ? 'border-haz/60 text-haz' : 'border-borde text-tenue',
                      )}
                    >
                      {sala.activa ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm text-tenue">
                    {sala.tipo_sala} · {sala.capacidad} butacas
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <ButtonLink to={`/admin/salas/${sala.id}/editar`} variante="secundario" tamano="sm">
                    Editar
                  </ButtonLink>
                  <Button variante="peligro" tamano="sm" onClick={() => setPorBorrar(sala)}>
                    Eliminar
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {salas.data && salas.data.pages > 1 ? (
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
                {salas.data.page} / {salas.data.pages}
              </span>
              <Button
                variante="secundario"
                tamano="sm"
                disabled={pagina >= salas.data.pages}
                onClick={() => setPagina((valor) => valor + 1)}
              >
                Siguiente
              </Button>
            </div>
          ) : null}
        </>
      )}

      <Modal
        abierto={porBorrar !== null}
        titulo="Eliminar sala"
        descripcion={`Vas a eliminar "${porBorrar?.nombre}". Si tiene funciones programadas no se podra eliminar.`}
        textoConfirmar="Eliminar"
        varianteConfirmar="peligro"
        procesando={eliminar.isPending}
        onConfirmar={() => porBorrar && eliminar.mutate(porBorrar.id)}
        onCerrar={() => setPorBorrar(null)}
      />
    </section>
  )
}
