import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, ButtonLink } from '@/components/Button'
import { Loader } from '@/components/Loader'
import { EmptyState, ErrorState } from '@/components/States'
import { Modal } from '@/components/Modal'
import { avisar } from '@/components/Toast'
import { mensajeDeError } from '@/lib/axios'
import { eliminarCine, listarCinesAdmin } from './api'
import type { Cine } from '@/types'

export const AdminCinemaListPage = () => {
  const [porBorrar, setPorBorrar] = useState<Cine | null>(null)
  const queryClient = useQueryClient()

  const cines = useQuery({ queryKey: ['admin-cines'], queryFn: listarCinesAdmin })

  const eliminar = useMutation({
    mutationFn: (id: number) => eliminarCine(id),
    onSuccess: () => {
      avisar.exito('Cine eliminado')
      setPorBorrar(null)
      queryClient.invalidateQueries({ queryKey: ['admin-cines'] })
    },
    onError: (error) => {
      avisar.error(mensajeDeError(error, 'No se pudo eliminar el cine'))
    },
  })

  return (
    <section className="contenedor py-14 sm:py-20">
      <div className="flex flex-col gap-6 border-b border-borde pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Administracion</p>
          <h1 className="mt-3 text-4xl sm:text-5xl">Cines</h1>
        </div>
        <ButtonLink to="/admin/cines/nuevo">Agregar cine</ButtonLink>
      </div>

      {cines.isLoading ? (
        <Loader etiqueta="Cargando cines" />
      ) : cines.isError ? (
        <div className="mt-10">
          <ErrorState
            descripcion={mensajeDeError(cines.error)}
            onReintentar={() => cines.refetch()}
          />
        </div>
      ) : cines.data && cines.data.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            titulo="Sin cines"
            descripcion="Todavia no agregas ningun cine."
            accion={<ButtonLink to="/admin/cines/nuevo">Agregar el primero</ButtonLink>}
          />
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-3">
          {cines.data?.map((cine) => (
            <div
              key={cine.id}
              className="panel flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <h3 className="text-xl">{cine.nombre}</h3>
                <p className="mt-1.5 text-sm text-tenue">
                  {[cine.direccion, cine.ciudad, cine.telefono].filter(Boolean).join(' · ') ||
                    'Sin datos adicionales'}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <ButtonLink to={`/admin/cines/${cine.id}/editar`} variante="secundario" tamano="sm">
                  Editar
                </ButtonLink>
                <Button variante="peligro" tamano="sm" onClick={() => setPorBorrar(cine)}>
                  Eliminar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        abierto={porBorrar !== null}
        titulo="Eliminar cine"
        descripcion={`Vas a eliminar "${porBorrar?.nombre}". Si tiene salas con funciones no se podra eliminar.`}
        textoConfirmar="Eliminar"
        varianteConfirmar="peligro"
        procesando={eliminar.isPending}
        onConfirmar={() => porBorrar && eliminar.mutate(porBorrar.id)}
        onCerrar={() => setPorBorrar(null)}
      />
    </section>
  )
}
