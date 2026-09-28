import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Loader } from '@/components/Loader'
import { ErrorState } from '@/components/States'
import { Badge } from '@/components/Badge'
import { mensajeDeError } from '@/lib/axios'
import { claveDeFecha, formatearFecha, idDeYoutube } from '@/lib/format'
import { funcionesDePelicula } from '@/features/showtimes/api'
import { ShowtimePicker } from '@/features/showtimes/ShowtimePicker'
import { obtenerPelicula } from './api'
import { PosterArt } from './PosterArt'
import { CastGrid } from './CastGrid'

export const MovieDetailPage = () => {
  const { id } = useParams()
  const peliculaId = Number(id)
  const [fechaActiva, setFechaActiva] = useState('')

  const pelicula = useQuery({
    queryKey: ['pelicula', peliculaId],
    queryFn: () => obtenerPelicula(peliculaId),
    enabled: Number.isFinite(peliculaId),
  })

  const funciones = useQuery({
    queryKey: ['funciones', 'pelicula', peliculaId],
    queryFn: () => funcionesDePelicula(peliculaId),
    enabled: Number.isFinite(peliculaId),
    staleTime: 30_000,
  })

  useEffect(() => {
    if (!fechaActiva && funciones.data && funciones.data.length > 0) {
      setFechaActiva(claveDeFecha(funciones.data[0].fecha_hora_inicio))
    }
  }, [funciones.data, fechaActiva])

  if (pelicula.isLoading) return <Loader etiqueta="Cargando la ficha" />
  if (pelicula.isError || !pelicula.data) {
    return (
      <div className="contenedor py-20">
        <ErrorState
          titulo="Pelicula no encontrada"
          descripcion={mensajeDeError(pelicula.error, 'Esta pelicula ya no esta en cartelera')}
        />
      </div>
    )
  }

  const datos = pelicula.data

  return (
    <>
      <section className="grano relative overflow-hidden border-b border-borde">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(85% 70% at 20% 0%, rgba(255,194,75,0.12) 0%, transparent 58%)',
          }}
        />
        <div className="contenedor relative grid gap-8 py-10 sm:py-14 lg:grid-cols-[19rem_1fr] lg:gap-14 lg:py-20 xl:grid-cols-[22rem_1fr]">
          <motion.div
            className="mx-auto w-44 sm:w-56 lg:mx-0 lg:w-full"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="aspect-[2/3] overflow-hidden rounded-2xl border border-borde shadow-[0_30px_90px_-40px_rgba(255,194,75,0.4)]">
              <PosterArt
                titulo={datos.titulo}
                posterUrl={datos.poster_url}
                generos={datos.generos.map((genero) => genero.nombre)}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <nav className="mb-6 flex items-center gap-2 font-mono text-[0.6875rem] tracking-widest text-tenue uppercase">
              <Link to="/" className="transition-colors hover:text-haz">
                Cartelera
              </Link>
              <span aria-hidden>/</span>
              <span className="text-pantalla">{datos.titulo}</span>
            </nav>

            <h1 className="text-[clamp(2.25rem,7vw,5rem)] leading-[0.88]">{datos.titulo}</h1>
            {datos.titulo_original && datos.titulo_original !== datos.titulo ? (
              <p className="mt-3 font-mono text-xs tracking-widest text-tenue uppercase">
                {datos.titulo_original}
              </p>
            ) : null}

            <div className="mt-6 flex flex-wrap items-center gap-2">
              {datos.clasificacion ? <Badge tono="haz">{datos.clasificacion}</Badge> : null}
              <Badge>{datos.duracion_legible}</Badge>
              <Badge tono="menta">{Number(datos.calificacion).toFixed(1)} / 10</Badge>
              {datos.generos.map((genero) => (
                <Badge key={genero.id}>{genero.nombre}</Badge>
              ))}
            </div>

            {datos.sinopsis ? (
              <p className="mt-7 max-w-2xl text-[0.9375rem] leading-relaxed text-pantalla/85 sm:text-base">
                {datos.sinopsis}
              </p>
            ) : null}

            <dl className="mt-9 grid max-w-2xl grid-cols-1 gap-x-10 gap-y-5 border-t border-borde pt-7 sm:grid-cols-2">
              {datos.director ? (
                <div>
                  <dt className="eyebrow">Direccion</dt>
                  <dd className="mt-1.5 text-sm">{datos.director}</dd>
                </div>
              ) : null}
              {datos.fecha_estreno ? (
                <div>
                  <dt className="eyebrow">Estreno</dt>
                  <dd className="mt-1.5 text-sm">{formatearFecha(datos.fecha_estreno)}</dd>
                </div>
              ) : null}
              {datos.idioma_original ? (
                <div>
                  <dt className="eyebrow">Idioma original</dt>
                  <dd className="mt-1.5 text-sm">{datos.idioma_original}</dd>
                </div>
              ) : null}
            </dl>
          </motion.div>
        </div>
      </section>

      {datos.trailer_url && idDeYoutube(datos.trailer_url) ? (
        <section className="contenedor py-12 sm:py-16">
          <p className="eyebrow">Trailer</p>
          <h2 className="mt-3 text-3xl sm:text-4xl">Antes de entrar a la sala</h2>
          <div className="mt-8 aspect-video w-full overflow-hidden rounded-2xl border border-borde">
            <iframe
              src={`https://www.youtube.com/embed/${idDeYoutube(datos.trailer_url)}`}
              title={`Trailer de ${datos.titulo}`}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </section>
      ) : null}

      {datos.reparto_detalle.length > 0 ? (
        <section className="contenedor py-12 sm:py-16">
          <p className="eyebrow">Reparto</p>
          <h2 className="mt-3 text-3xl sm:text-4xl">Quien esta en pantalla</h2>
          <div className="mt-8">
            <CastGrid reparto={datos.reparto_detalle} />
          </div>
        </section>
      ) : null}

      <section className="contenedor py-12 sm:py-16">
        <p className="eyebrow">Paso 1 de 3</p>
        <h2 className="mt-3 text-4xl sm:text-5xl">Elige tu funcion</h2>
        <p className="mt-3 max-w-xl text-sm text-tenue">
          Cada horario muestra cuantas butacas quedan libres en este momento.
        </p>

        <div className="mt-9">
          {funciones.isLoading ? (
            <Loader etiqueta="Buscando horarios" />
          ) : funciones.isError ? (
            <ErrorState
              descripcion={mensajeDeError(funciones.error)}
              onReintentar={() => funciones.refetch()}
            />
          ) : (
            <ShowtimePicker
              funciones={funciones.data ?? []}
              fechaActiva={fechaActiva}
              onCambiarFecha={setFechaActiva}
            />
          )}
        </div>
      </section>
    </>
  )
}
