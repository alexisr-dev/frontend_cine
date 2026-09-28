import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PosterArt } from './PosterArt'
import { anioDe } from '@/lib/format'
import type { Pelicula } from '@/types'

export const MovieCard = ({ pelicula, indice = 0 }: { pelicula: Pelicula; indice?: number }) => (
  <motion.article
    initial={{ opacity: 0, y: 22 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45, delay: Math.min(indice * 0.045, 0.4), ease: [0.22, 1, 0.36, 1] }}
  >
    <Link to={`/peliculas/${pelicula.id}`} className="group block">
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-borde transition-colors duration-300 group-hover:border-haz/50">
        <div className="h-full w-full transition-transform duration-500 group-hover:scale-[1.04]">
          <PosterArt
            titulo={pelicula.titulo}
            posterUrl={pelicula.poster_url}
            generos={pelicula.generos.map((genero) => genero.nombre)}
          />
        </div>

        <div className="absolute inset-x-0 bottom-0 flex translate-y-2 items-center justify-between gap-2 bg-gradient-to-t from-noche via-noche/85 to-transparent px-3 pt-10 pb-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <span className="font-mono text-[0.625rem] tracking-widest text-haz uppercase">
            Ver funciones
          </span>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-haz text-noche">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
              <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>

        {pelicula.clasificacion ? (
          <span className="absolute top-2.5 right-2.5 rounded border border-pantalla/25 bg-noche/70 px-1.5 py-0.5 font-mono text-[0.5625rem] font-semibold tracking-wider text-pantalla backdrop-blur-sm">
            {pelicula.clasificacion}
          </span>
        ) : null}
      </div>

      <div className="mt-3">
        <h3 className="line-clamp-2 text-base leading-tight transition-colors group-hover:text-haz sm:text-lg">
          {pelicula.titulo}
        </h3>
        <p className="mt-1.5 font-mono text-[0.6875rem] tracking-wider text-tenue">
          {anioDe(pelicula.fecha_estreno) ?? 'Proximamente'} · {pelicula.duracion_legible} ·{' '}
          <span className="text-haz">{Number(pelicula.calificacion).toFixed(1)}</span>
        </p>
      </div>
    </Link>
  </motion.article>
)
