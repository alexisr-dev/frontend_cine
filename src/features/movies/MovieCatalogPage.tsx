import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ButtonLink, Button } from '@/components/Button'
import { Loader, Skeleton } from '@/components/Loader'
import { EmptyState, ErrorState } from '@/components/States'
import { mensajeDeError } from '@/lib/axios'
import { formatearHora, etiquetaDeDia } from '@/lib/format'
import { cn } from '@/lib/cn'
import { listarFunciones } from '@/features/showtimes/api'
import type { Funcion } from '@/types'
import { listarGeneros, listarPeliculas } from './api'
import { MovieCard } from './MovieCard'
import { Marquesina } from './Marquesina'
import { PosterArt } from './PosterArt'

const ORDENES = [
  { valor: '-fecha_estreno', texto: 'Estrenos' },
  { valor: '-calificacion', texto: 'Mejor valoradas' },
  { valor: 'titulo', texto: 'A-Z' },
  { valor: 'duracion_min', texto: 'Mas cortas' },
]

const Hero = ({ funciones }: { funciones: Funcion[] }) => {
  const destacada = funciones[0]
  if (!destacada) return null

  return (
    <section className="grano relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(90% 60% at 50% -15%, rgba(255,194,75,0.16) 0%, transparent 60%)',
        }}
      />
      <svg
        className="pointer-events-none absolute inset-x-0 top-0 h-full w-full opacity-70"
        viewBox="0 0 100 60"
        preserveAspectRatio="none"
        aria-hidden
        style={{ animation: 'haz-parpadeo 6s infinite ease-in-out' }}
      >
        <path d="M50 -4 L14 60 L86 60 Z" fill="url(#haz)" />
        <defs>
          <linearGradient id="haz" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFC24B" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#FFC24B" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      <div className="contenedor relative grid gap-10 py-14 sm:py-20 lg:grid-cols-[1.35fr_1fr] lg:items-center lg:gap-16 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="eyebrow">
            Proxima funcion · {etiquetaDeDia(destacada.fecha_hora_inicio)}{' '}
            {formatearHora(destacada.fecha_hora_inicio)} · {destacada.sala.nombre}
          </p>
          <h1 className="mt-5 text-[clamp(2.75rem,11vw,7.5rem)] leading-[0.84]">
            {destacada.pelicula_titulo}
          </h1>
          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs tracking-widest text-tenue uppercase">
            <span className="text-haz">{destacada.sala.tipo_sala}</span>
            <span>{destacada.idioma}</span>
            {destacada.subtitulos ? <span>Subtitulada</span> : null}
            <span>
              {destacada.asientos_disponibles} de {destacada.asientos_totales} butacas libres
            </span>
          </div>
          <div className="mt-9 flex flex-col gap-3 xs:flex-row">
            <ButtonLink to={`/funciones/${destacada.id}/asientos`} tamano="lg">
              Elegir butaca
            </ButtonLink>
            <ButtonLink
              to={`/peliculas/${destacada.pelicula_id}`}
              variante="secundario"
              tamano="lg"
            >
              Ver la pelicula
            </ButtonLink>
          </div>
        </motion.div>

        <motion.div
          className="mx-auto w-full max-w-[17rem] sm:max-w-[20rem] lg:max-w-none"
          initial={{ opacity: 0, y: 30, rotate: -3 }}
          animate={{ opacity: 1, y: 0, rotate: -2 }}
          transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link
            to={`/peliculas/${destacada.pelicula_id}`}
            className="block aspect-[2/3] overflow-hidden rounded-2xl border border-borde shadow-[0_40px_120px_-30px_rgba(255,194,75,0.35)] transition-transform duration-500 hover:rotate-0"
          >
            <PosterArt titulo={destacada.pelicula_titulo} posterUrl={destacada.pelicula_poster_url} />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

export const MovieCatalogPage = () => {
  const [busqueda, setBusqueda] = useState('')
  const [terminoRetrasado, setTerminoRetrasado] = useState('')
  const [genero, setGenero] = useState<string>('')
  const [orden, setOrden] = useState(ORDENES[0].valor)
  const [pagina, setPagina] = useState(1)

  useEffect(() => {
    const temporizador = window.setTimeout(() => {
      setTerminoRetrasado(busqueda)
      setPagina(1)
    }, 350)
    return () => window.clearTimeout(temporizador)
  }, [busqueda])

  const generos = useQuery({ queryKey: ['generos'], queryFn: listarGeneros, staleTime: 600_000 })

  const proximas = useQuery({
    queryKey: ['funciones', 'proximas'],
    queryFn: () => listarFunciones(),
    staleTime: 60_000,
  })

  const catalogo = useQuery({
    queryKey: ['peliculas', terminoRetrasado, genero, orden, pagina],
    queryFn: () =>
      listarPeliculas({
        search: terminoRetrasado || undefined,
        genero: genero || undefined,
        ordering: orden,
        page: pagina,
        page_size: 15,
      }),
    placeholderData: keepPreviousData,
  })

  const destacadas = useMemo(() => (proximas.data ?? []).slice(0, 12), [proximas.data])

  return (
    <>
      {proximas.isLoading ? (
        <div className="contenedor py-20">
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <Hero funciones={destacadas} />
      )}

      <Marquesina funciones={destacadas} />

      <section className="contenedor py-14 sm:py-20">
        <div className="flex flex-col gap-6 border-b border-borde pb-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow">Cartelera completa</p>
            <h2 className="mt-3 text-4xl sm:text-5xl">Que quieres ver</h2>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
            <label className="relative flex-1 lg:w-72">
              <span className="sr-only">Buscar pelicula</span>
              <svg
                viewBox="0 0 24 24"
                className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-tenue"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" strokeLinecap="round" />
              </svg>
              <input
                type="search"
                value={busqueda}
                onChange={(evento) => setBusqueda(evento.target.value)}
                placeholder="Titulo, director o reparto"
                className="h-11 w-full rounded-full border border-borde bg-sala pr-4 pl-11 text-sm placeholder:text-tenue/60 focus:border-haz/60 focus:outline-none"
              />
            </label>

            <select
              value={orden}
              onChange={(evento) => {
                setOrden(evento.target.value)
                setPagina(1)
              }}
              className="h-11 rounded-full border border-borde bg-sala px-4 text-sm focus:border-haz/60 focus:outline-none"
              aria-label="Ordenar cartelera"
            >
              {ORDENES.map((opcion) => (
                <option key={opcion.valor} value={opcion.valor} className="bg-sala">
                  {opcion.texto}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0 sm:pb-0">
          <button
            type="button"
            onClick={() => {
              setGenero('')
              setPagina(1)
            }}
            className={cn(
              'shrink-0 rounded-full border px-4 py-1.5 font-mono text-[0.6875rem] tracking-widest uppercase transition-colors',
              genero === '' ? 'border-haz bg-haz text-noche' : 'border-borde text-tenue hover:text-pantalla',
            )}
          >
            Todo
          </button>
          {(generos.data ?? []).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setGenero(item.nombre)
                setPagina(1)
              }}
              className={cn(
                'shrink-0 rounded-full border px-4 py-1.5 font-mono text-[0.6875rem] tracking-widest uppercase transition-colors',
                genero === item.nombre
                  ? 'border-haz bg-haz text-noche'
                  : 'border-borde text-tenue hover:text-pantalla',
              )}
            >
              {item.nombre}
            </button>
          ))}
        </div>

        {catalogo.isLoading ? (
          <Loader etiqueta="Revelando la cartelera" />
        ) : catalogo.isError ? (
          <div className="mt-10">
            <ErrorState
              descripcion={mensajeDeError(catalogo.error)}
              onReintentar={() => catalogo.refetch()}
            />
          </div>
        ) : catalogo.data && catalogo.data.results.length === 0 ? (
          <div className="mt-10">
            <EmptyState
              titulo="Sin coincidencias"
              descripcion="Ninguna pelicula de la cartelera coincide con ese filtro. Prueba con otro genero o borra la busqueda."
              accion={
                <Button
                  variante="secundario"
                  onClick={() => {
                    setBusqueda('')
                    setGenero('')
                  }}
                >
                  Ver toda la cartelera
                </Button>
              }
            />
          </div>
        ) : (
          <>
            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4 xl:grid-cols-5 3xl:grid-cols-6">
              {catalogo.data?.results.map((pelicula, indice) => (
                <MovieCard key={pelicula.id} pelicula={pelicula} indice={indice} />
              ))}
            </div>

            {catalogo.data && catalogo.data.pages > 1 ? (
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
                  {catalogo.data.page} / {catalogo.data.pages}
                </span>
                <Button
                  variante="secundario"
                  tamano="sm"
                  disabled={pagina >= catalogo.data.pages}
                  onClick={() => setPagina((valor) => valor + 1)}
                >
                  Siguiente
                </Button>
              </div>
            ) : null}
          </>
        )}
      </section>
    </>
  )
}
