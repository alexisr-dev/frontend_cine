import { useMemo, useState } from 'react'
import { cn } from '@/lib/cn'

const hash = (texto: string) => {
  let valor = 2166136261
  for (let indice = 0; indice < texto.length; indice += 1) {
    valor ^= texto.charCodeAt(indice)
    valor = Math.imul(valor, 16777619)
  }
  return Math.abs(valor)
}

const PALETAS = [
  { base: 232, acento: 205, nombre: 'medianoche' },
  { base: 315, acento: 340, nombre: 'terciopelo' },
  { base: 22, acento: 38, nombre: 'proyector' },
  { base: 172, acento: 158, nombre: 'sala verde' },
  { base: 268, acento: 292, nombre: 'butaca' },
  { base: 350, acento: 14, nombre: 'cortina' },
]

const FIGURAS = ['circulo', 'arco', 'barras', 'diagonal'] as const

interface Props {
  titulo: string
  posterUrl?: string | null
  generos?: string[]
  className?: string
  compacto?: boolean
}

export const PosterArt = ({ titulo, posterUrl, generos = [], className, compacto }: Props) => {
  const [falloImagen, setFalloImagen] = useState(false)

  const arte = useMemo(() => {
    const semilla = hash(titulo)
    const paleta = PALETAS[semilla % PALETAS.length]
    const desvio = (semilla >> 3) % 14
    const base = (paleta.base + desvio) % 360
    const acento = (paleta.acento + desvio) % 360
    return {
      figura: FIGURAS[(semilla >> 5) % FIGURAS.length],
      fondo: `linear-gradient(${152 + ((semilla >> 7) % 40)}deg, hsl(${base} 44% 15%) 0%, hsl(${base} 40% 8%) 55%, hsl(${acento} 34% 6%) 100%)`,
      acento: `hsl(${acento} 74% 64%)`,
      acentoTenue: `hsl(${base} 58% 48%)`,
      rotacion: ((semilla >> 9) % 14) - 7,
    }
  }, [titulo])

  const lineas = useMemo(() => {
    const palabras = titulo.split(' ').filter(Boolean)
    if (palabras.length <= 3) return palabras
    const objetivo = Math.ceil(palabras.length / 2)
    const grupos: string[] = []
    for (let indice = 0; indice < palabras.length; indice += objetivo) {
      grupos.push(palabras.slice(indice, indice + objetivo).join(' '))
    }
    return grupos
  }, [titulo])

  if (posterUrl && !falloImagen) {
    return (
      <img
        src={posterUrl}
        alt={`Poster de ${titulo}`}
        loading="lazy"
        onError={() => setFalloImagen(true)}
        className={cn('h-full w-full object-cover', className)}
      />
    )
  }

  const escalaTitulo =
    lineas.length >= 3
      ? 'text-[1rem] xs:text-[1.15rem] sm:text-[1.5rem] lg:text-[1.6rem]'
      : 'text-[1.2rem] xs:text-[1.4rem] sm:text-[1.75rem] lg:text-[1.9rem]'

  return (
    <div
      className={cn(
        'grano relative flex h-full w-full flex-col justify-between overflow-hidden',
        className,
      )}
      style={{ background: arte.fondo }}
      role="img"
      aria-label={`Cartel generado para ${titulo}`}
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 150"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        {arte.figura === 'circulo' && (
          <>
            <circle cx="50" cy="46" r="30" fill={arte.acento} opacity="0.15" />
            <circle cx="50" cy="46" r="30" fill="none" stroke={arte.acento} strokeWidth="0.5" opacity="0.5" />
            <circle cx="50" cy="46" r="15" fill="none" stroke={arte.acentoTenue} strokeWidth="0.4" opacity="0.65" />
          </>
        )}
        {arte.figura === 'arco' && (
          <>
            <path d="M-10 96 Q50 24 110 96 Z" fill={arte.acento} opacity="0.14" />
            <path d="M-10 96 Q50 24 110 96" fill="none" stroke={arte.acento} strokeWidth="0.5" opacity="0.55" />
            <path d="M-10 110 Q50 48 110 110" fill="none" stroke={arte.acentoTenue} strokeWidth="0.4" opacity="0.45" />
          </>
        )}
        {arte.figura === 'barras' &&
          [0, 1, 2, 3, 4, 5].map((indice) => (
            <rect
              key={indice}
              x={9 + indice * 14.5}
              y={16 + indice * 6}
              width="6.5"
              height={72 - indice * 7}
              fill={arte.acento}
              opacity={0.1 + indice * 0.03}
            />
          ))}
        {arte.figura === 'diagonal' && (
          <>
            <path d="M0 104 L100 18 L100 104 Z" fill={arte.acento} opacity="0.13" />
            <path d="M0 104 L100 18" stroke={arte.acento} strokeWidth="0.5" opacity="0.55" fill="none" />
            <path d="M0 78 L100 -8" stroke={arte.acentoTenue} strokeWidth="0.4" opacity="0.4" fill="none" />
          </>
        )}
        <rect x="0" y="88" width="100" height="62" fill="url(#velo)" />
        <defs>
          <linearGradient id="velo" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.72" />
          </linearGradient>
        </defs>
      </svg>

      <div
        className={cn(
          'relative z-10 flex items-start justify-between',
          compacto ? 'p-2.5' : 'p-4 sm:p-5',
        )}
      >
        <span
          className="font-mono text-[0.5rem] tracking-[0.3em] uppercase opacity-70 sm:text-[0.5625rem]"
          style={{ color: arte.acento }}
        >
          Aurora
        </span>
        <span
          className="h-2 w-2 rounded-full"
          style={{ background: arte.acento, transform: `rotate(${arte.rotacion}deg)` }}
        />
      </div>

      <div className={cn('relative z-10', compacto ? 'p-2.5' : 'p-4 sm:p-5')}>
        <h3
          className={cn(
            'font-display uppercase text-pantalla',
            compacto ? 'text-base leading-[0.92]' : `${escalaTitulo} leading-[0.9]`,
          )}
        >
          {lineas.map((linea, indice) => (
            <span key={`${linea}-${indice}`} className="block text-balance">
              {linea}
            </span>
          ))}
        </h3>
        {generos.length > 0 && !compacto && (
          <p
            className="mt-2.5 font-mono text-[0.5625rem] tracking-[0.18em] uppercase opacity-85"
            style={{ color: arte.acento }}
          >
            {generos.slice(0, 2).join(' · ')}
          </p>
        )}
      </div>
    </div>
  )
}
