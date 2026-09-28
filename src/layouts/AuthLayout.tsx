import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Logo } from '@/components/Logo'
import { useAuth } from '@/hooks/useAuth'
import { usePrefiereMenosMovimiento } from '@/hooks/useMediaQuery'
import { listarPeliculas } from '@/features/movies/api'

const PosterWall = () => {
  const menosMovimiento = usePrefiereMenosMovimiento()
  const peliculas = useQuery({
    queryKey: ['peliculas', 'muro-login'],
    queryFn: () => listarPeliculas({ page: 1, page_size: 18 }),
    staleTime: 600_000,
  })

  const carteles = (peliculas.data?.results ?? []).filter((pelicula) => pelicula.poster_url)
  if (carteles.length < 6) return null

  const columnas = [carteles.filter((_, i) => i % 3 === 0), carteles.filter((_, i) => i % 3 === 1), carteles.filter((_, i) => i % 3 === 2)]

  return (
    <div className="absolute inset-0 flex gap-3 p-3" aria-hidden>
      {columnas.map((columna, indice) => (
        <div key={indice} className="relative flex-1 overflow-hidden">
          <div
            className="flex flex-col gap-3"
            style={
              menosMovimiento
                ? undefined
                : {
                    animation: `deriva-vertical ${34 + indice * 6}s linear infinite`,
                    animationDirection: indice === 1 ? 'reverse' : 'normal',
                  }
            }
          >
            {[...columna, ...columna].map((pelicula, i) => (
              <div
                key={`${pelicula.id}-${i}`}
                className="aspect-[2/3] w-full shrink-0 overflow-hidden rounded-lg"
              >
                <img
                  src={pelicula.poster_url ?? undefined}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export const AuthLayout = () => {
  const { autenticado, cargando } = useAuth()
  const ubicacion = useLocation()

  if (cargando) return null
  if (autenticado) {
    const destino = (ubicacion.state as { desde?: string } | null)?.desde ?? '/'
    return <Navigate to={destino} replace />
  }

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr] xl:grid-cols-[1.25fr_1fr]">
      <div className="grano relative hidden overflow-hidden border-r border-borde bg-noche lg:block">
        <PosterWall />

        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(10,11,16,0.94) 0%, rgba(10,11,16,0.55) 22%, rgba(10,11,16,0.62) 68%, rgba(10,11,16,0.97) 100%), radial-gradient(70% 60% at 0% 100%, rgba(255,194,75,0.16) 0%, transparent 60%)',
          }}
        />

        <div className="relative flex h-full flex-col justify-between p-12 xl:p-16">
          <Logo
            className="w-fit rounded-full border border-borde/80 bg-noche/60 px-4 py-2 backdrop-blur-sm"
            tamanoIcono="h-6 w-6"
            tamanoTexto="text-lg"
          />

          <div className="max-w-md rounded-2xl border border-borde/60 bg-noche/55 p-8 backdrop-blur-md">
            <p className="eyebrow">Sala 3 · IMAX</p>
            <h1 className="mt-4 text-5xl xl:text-6xl">
              La butaca
              <br />
              <span className="text-haz">que elijas</span>
              <br />
              se queda quieta
            </h1>
            <p className="mt-6 text-sm text-tenue">
              Entra con tu cuenta para apartar asientos, pagar y guardar tus boletos con codigo QR.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-5 py-12 sm:px-10">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <Logo className="mb-10 lg:hidden" />
          <Outlet />
        </motion.div>
      </div>
    </div>
  )
}
