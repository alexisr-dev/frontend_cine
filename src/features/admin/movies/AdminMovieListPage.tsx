import { useState } from 'react'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, ButtonLink } from '@/components/Button'
import { Loader } from '@/components/Loader'
import { EmptyState, ErrorState } from '@/components/States'
import { Modal } from '@/components/Modal'
import { avisar } from '@/components/Toast'
import { mensajeDeError } from '@/lib/axios'
import { formatearFecha } from '@/lib/format'
import { cn } from '@/lib/cn'
import { eliminarPelicula, listarPeliculasAdmin } from './api'
import type { PeliculaDetalle } from '@/types'

export const AdminMovieListPage = () => {
  const [pagina, setPagina] = useState(1)
  const [porBorrar, setPorBorrar] = useState<PeliculaDetalle | null>(null)
  const queryClient = useQueryClient()

  const peliculas = useQuery({
    queryKey: ['admin-peliculas', pagina],
    queryFn: () => listarPeliculasAdmin({ page: pagina, page_size: 15 }),
    placeholderData: keepPreviousData,
  })

  const eliminar = useMutation({
    mutationFn: (id: number) => eliminarPelicula(id),
    onSuccess: () => {
      avisar.exito('Pelicula eliminada')
      setPorBorrar(null)
      queryClient.invalidateQueries({ queryKey: ['admin-peliculas'] })
    },
    onError: (error) => {
      avisar.error(mensajeDeError(error, 'No se pudo eliminar la pelicula'))
    },
  })

  return (
    <section className="contenedor py-14 sm:py-20">
      <div className="flex flex-col gap-6 border-b border-borde pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Administracion</p>
          <h1 className="mt-3 text-4xl sm:text-5xl">Peliculas</h1>
        </div>
        <ButtonLink to="/admin/peliculas/nueva">Agregar pelicula</ButtonLink>
      </div>

      {peliculas.isLoading ? (
        <Loader etiqueta="Cargando peliculas" />
      ) : peliculas.isError ? (
        <div className="mt-10">
          <ErrorState
            descripcion={mensajeDeError(peliculas.error)}
            onReintentar={() => peliculas.refetch()}
          />
        </div>
      ) : peliculas.data && peliculas.data.results.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            titulo="Sin peliculas"
            descripcion="Todavia no agregas ninguna pelicula al catalogo."
            accion={<ButtonLink to="/admin/peliculas/nueva">Agregar la primera</ButtonLink>}
          />
        </div>
      ) : (
        <>
          <div className="mt-8 flex flex-col gap-3">
            {peliculas.data?.results.map((pelicula) => (
              <div
                key={pelicula.id}
                className="panel flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-xl">{pelicula.titulo}</h3>
                    <span
                      className={cn(
                        'rounded-full border px-3 py-0.5 font-mono text-[0.625rem] tracking-widest uppercase',
                        pelicula.activa
                          ? 'border-haz/60 text-haz'
                          : 'border-borde text-tenue',
                      )}
                    >
                      {pelicula.activa ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm text-tenue">
                    {pelicula.fecha_estreno ? formatearFecha(pelicula.fecha_estreno) : 'Sin fecha de estreno'}
                    {' · '}
                    {pelicula.duracion_legible}
                    {pelicula.generos.length > 0
                      ? ` · ${pelicula.generos.map((genero) => genero.nombre).join(', ')}`
                      : ''}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <ButtonLink to={`/admin/peliculas/${pelicula.id}/editar`} variante="secundario" tamano="sm">
                    Editar
                  </ButtonLink>
                  <Button variante="peligro" tamano="sm" onClick={() => setPorBorrar(pelicula)}>
                    Eliminar
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {peliculas.data && peliculas.data.pages > 1 ? (
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
                {peliculas.data.page} / {peliculas.data.pages}
              </span>
              <Button
                variante="secundario"
                tamano="sm"
                disabled={pagina >= peliculas.data.pages}
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
        titulo="Eliminar pelicula"
        descripcion={`Vas a eliminar "${porBorrar?.titulo}". Si tiene funciones programadas no se podra eliminar.`}
        textoConfirmar="Eliminar"
        varianteConfirmar="peligro"
        procesando={eliminar.isPending}
        onConfirmar={() => porBorrar && eliminar.mutate(porBorrar.id)}
        onCerrar={() => setPorBorrar(null)}
      />
    </section>
  )
}
