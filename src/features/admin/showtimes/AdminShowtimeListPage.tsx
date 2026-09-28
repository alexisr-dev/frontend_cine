import { useState } from 'react'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, ButtonLink } from '@/components/Button'
import { Loader } from '@/components/Loader'
import { EmptyState, ErrorState } from '@/components/States'
import { Modal } from '@/components/Modal'
import { avisar } from '@/components/Toast'
import { mensajeDeError } from '@/lib/axios'
import { formatearFechaHora } from '@/lib/format'
import { cn } from '@/lib/cn'
import { actualizarFuncion, listarFuncionesAdmin } from './api'
import type { FuncionDetalle } from '@/types'

const FILTROS = [
  { valor: undefined, texto: 'Todas' },
  { valor: true, texto: 'Activas' },
  { valor: false, texto: 'Canceladas' },
] as const

export const AdminShowtimeListPage = () => {
  const [pagina, setPagina] = useState(1)
  const [filtroActiva, setFiltroActiva] = useState<boolean | undefined>(undefined)
  const [porCambiar, setPorCambiar] = useState<FuncionDetalle | null>(null)
  const queryClient = useQueryClient()

  const funciones = useQuery({
    queryKey: ['admin-funciones', pagina, filtroActiva],
    queryFn: () => listarFuncionesAdmin({ page: pagina, page_size: 15, activa: filtroActiva }),
    placeholderData: keepPreviousData,
  })

  const cambiarEstado = useMutation({
    mutationFn: (funcion: FuncionDetalle) =>
      actualizarFuncion(funcion.id, {
        fecha_hora_inicio: funcion.fecha_hora_inicio,
        subtitulos: funcion.subtitulos,
        precio_base: funcion.precio_base,
        activa: !funcion.activa,
      }),
    onSuccess: () => {
      avisar.exito('Funcion actualizada')
      setPorCambiar(null)
      queryClient.invalidateQueries({ queryKey: ['admin-funciones'] })
    },
    onError: (error) => {
      avisar.error(mensajeDeError(error, 'No se pudo actualizar la funcion'))
    },
  })

  return (
    <section className="contenedor py-14 sm:py-20">
      <div className="flex flex-col gap-6 border-b border-borde pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Administracion</p>
          <h1 className="mt-3 text-4xl sm:text-5xl">Funciones</h1>
        </div>
        <ButtonLink to="/admin/funciones/nueva">Programar funcion</ButtonLink>
      </div>

      <div className="mt-6 flex gap-2">
        {FILTROS.map((filtro) => (
          <button
            key={filtro.texto}
            type="button"
            onClick={() => {
              setFiltroActiva(filtro.valor)
              setPagina(1)
            }}
            className={cn(
              'shrink-0 rounded-full border px-4 py-1.5 font-mono text-[0.6875rem] tracking-widest uppercase transition-colors',
              filtroActiva === filtro.valor
                ? 'border-haz bg-haz text-noche'
                : 'border-borde text-tenue hover:text-pantalla',
            )}
          >
            {filtro.texto}
          </button>
        ))}
      </div>

      {funciones.isLoading ? (
        <Loader etiqueta="Cargando funciones" />
      ) : funciones.isError ? (
        <div className="mt-10">
          <ErrorState
            descripcion={mensajeDeError(funciones.error)}
            onReintentar={() => funciones.refetch()}
          />
        </div>
      ) : funciones.data && funciones.data.results.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            titulo="Sin funciones"
            descripcion="No hay funciones programadas con este filtro."
            accion={<ButtonLink to="/admin/funciones/nueva">Programar la primera</ButtonLink>}
          />
        </div>
      ) : (
        <>
          <div className="mt-8 flex flex-col gap-3">
            {funciones.data?.results.map((funcion) => (
              <div
                key={funcion.id}
                className="panel flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-xl">{funcion.pelicula_titulo}</h3>
                    <span
                      className={cn(
                        'rounded-full border px-3 py-0.5 font-mono text-[0.625rem] tracking-widest uppercase',
                        funcion.activa ? 'border-haz/60 text-haz' : 'border-borde text-tenue',
                      )}
                    >
                      {funcion.activa ? 'Activa' : 'Cancelada'}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm text-tenue">
                    {formatearFechaHora(funcion.fecha_hora_inicio)} · {funcion.sala.cine.nombre} ·{' '}
                    {funcion.sala.nombre} ({funcion.sala.tipo_sala}) ·{' '}
                    {funcion.asientos_disponibles}/{funcion.asientos_totales} libres
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <ButtonLink to={`/admin/funciones/${funcion.id}/editar`} variante="secundario" tamano="sm">
                    Editar
                  </ButtonLink>
                  <Button
                    variante={funcion.activa ? 'peligro' : 'secundario'}
                    tamano="sm"
                    onClick={() => setPorCambiar(funcion)}
                  >
                    {funcion.activa ? 'Cancelar' : 'Reactivar'}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {funciones.data && funciones.data.pages > 1 ? (
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
                {funciones.data.page} / {funciones.data.pages}
              </span>
              <Button
                variante="secundario"
                tamano="sm"
                disabled={pagina >= funciones.data.pages}
                onClick={() => setPagina((valor) => valor + 1)}
              >
                Siguiente
              </Button>
            </div>
          ) : null}
        </>
      )}

      <Modal
        abierto={porCambiar !== null}
        titulo={porCambiar?.activa ? 'Cancelar funcion' : 'Reactivar funcion'}
        descripcion={
          porCambiar?.activa
            ? `Vas a cancelar la funcion de "${porCambiar?.pelicula_titulo}". Dejara de verse en la cartelera publica.`
            : `Vas a reactivar la funcion de "${porCambiar?.pelicula_titulo}".`
        }
        textoConfirmar={porCambiar?.activa ? 'Cancelar funcion' : 'Reactivar'}
        varianteConfirmar={porCambiar?.activa ? 'peligro' : 'primario'}
        procesando={cambiarEstado.isPending}
        onConfirmar={() => porCambiar && cambiarEstado.mutate(porCambiar)}
        onCerrar={() => setPorCambiar(null)}
      />
    </section>
  )
}
