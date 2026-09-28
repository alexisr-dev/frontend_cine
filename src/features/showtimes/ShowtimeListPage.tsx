import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Loader } from '@/components/Loader'
import { EmptyState, ErrorState } from '@/components/States'
import { ButtonLink } from '@/components/Button'
import { mensajeDeError } from '@/lib/axios'
import { claveDeFecha } from '@/lib/format'
import { cn } from '@/lib/cn'
import { listarCines, listarFunciones } from './api'
import { ShowtimePicker } from './ShowtimePicker'

export const ShowtimeListPage = () => {
  const [cineId, setCineId] = useState<number | ''>('')
  const [fechaActiva, setFechaActiva] = useState('')

  const cines = useQuery({ queryKey: ['cines'], queryFn: listarCines, staleTime: 600_000 })

  const funciones = useQuery({
    queryKey: ['funciones', 'todas', cineId],
    queryFn: () => listarFunciones(cineId ? { cine: cineId } : {}),
    staleTime: 30_000,
  })

  const primeraFecha = useMemo(() => {
    const lista = funciones.data ?? []
    return lista.length > 0 ? claveDeFecha(lista[0].fecha_hora_inicio) : ''
  }, [funciones.data])

  useEffect(() => {
    if (primeraFecha && !fechaActiva) setFechaActiva(primeraFecha)
  }, [primeraFecha, fechaActiva])

  useEffect(() => {
    setFechaActiva('')
  }, [cineId])

  return (
    <section className="contenedor py-12 sm:py-16 lg:py-20">
      <p className="eyebrow">Programacion</p>
      <h1 className="mt-3 text-[clamp(2.5rem,8vw,5.5rem)] leading-[0.88]">Todas las funciones</h1>
      <p className="mt-4 max-w-lg text-sm text-tenue">
        Ocho dias de programacion en seis salas. Filtra por complejo y elige el horario que te
        acomode.
      </p>

      <div className="mt-9 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCineId('')}
          className={cn(
            'rounded-full border px-4 py-2 font-mono text-[0.6875rem] tracking-widest uppercase transition-colors',
            cineId === '' ? 'border-haz bg-haz text-noche' : 'border-borde text-tenue hover:text-pantalla',
          )}
        >
          Los dos complejos
        </button>
        {(cines.data ?? []).map((cine) => (
          <button
            key={cine.id}
            type="button"
            onClick={() => setCineId(cine.id)}
            className={cn(
              'rounded-full border px-4 py-2 font-mono text-[0.6875rem] tracking-widest uppercase transition-colors',
              cineId === cine.id
                ? 'border-haz bg-haz text-noche'
                : 'border-borde text-tenue hover:text-pantalla',
            )}
          >
            {cine.nombre}
          </button>
        ))}
      </div>

      <div className="mt-10">
        {funciones.isLoading ? (
          <Loader etiqueta="Cargando programacion" />
        ) : funciones.isError ? (
          <ErrorState
            descripcion={mensajeDeError(funciones.error)}
            onReintentar={() => funciones.refetch()}
          />
        ) : (funciones.data ?? []).length === 0 ? (
          <EmptyState
            titulo="Nada programado"
            descripcion="Este complejo no tiene funciones proximas. Prueba con el otro o revisa la cartelera."
            accion={<ButtonLink to="/">Ver cartelera</ButtonLink>}
          />
        ) : (
          <ShowtimePicker
            funciones={funciones.data ?? []}
            fechaActiva={fechaActiva}
            onCambiarFecha={setFechaActiva}
            mostrarPelicula
          />
        )}
      </div>
    </section>
  )
}
