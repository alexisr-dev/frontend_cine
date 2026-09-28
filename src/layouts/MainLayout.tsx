import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Button, ButtonLink } from '@/components/Button'
import { Logo } from '@/components/Logo'
import { useAuth, useSesionExpirada } from '@/hooks/useAuth'
import { iniciales } from '@/lib/format'
import { cn } from '@/lib/cn'

const enlaces = [
  { to: '/', texto: 'Cartelera', exacto: true },
  { to: '/funciones', texto: 'Funciones' },
  { to: '/mis-reservas', texto: 'Mis boletos' },
]

export const MainLayout = () => {
  const { usuario, autenticado, cerrarSesion } = useAuth()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [desplazado, setDesplazado] = useState(false)
  const ubicacion = useLocation()
  useSesionExpirada()

  const enlacesVisibles =
    usuario?.rol === 'admin' ? [...enlaces, { to: '/admin', texto: 'Admin' }] : enlaces

  useEffect(() => setMenuAbierto(false), [ubicacion.pathname])

  useEffect(() => {
    const alDesplazar = () => setDesplazado(window.scrollY > 12)
    alDesplazar()
    window.addEventListener('scroll', alDesplazar, { passive: true })
    return () => window.removeEventListener('scroll', alDesplazar)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuAbierto ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuAbierto])

  return (
    <div className="flex min-h-dvh flex-col">
      <header
        className={cn(
          'sticky top-0 z-40 transition-[padding] duration-300',
          desplazado ? 'px-3 pt-3 sm:px-6 sm:pt-4' : 'px-4 pt-0 sm:px-7 lg:px-10 3xl:px-16',
        )}
      >
        <div className="mx-auto w-full max-w-[90rem] 3xl:max-w-[104rem]">
          <div
            className={cn(
              'relative flex h-16 items-center justify-between gap-4 rounded-full border transition-all duration-300 lg:h-[4.25rem]',
              desplazado
                ? 'rounded-[1.75rem] border-borde bg-noche/85 px-6 shadow-[0_16px_50px_-20px_rgba(255,194,75,0.35)] backdrop-blur-xl sm:px-7'
                : 'border-transparent bg-transparent px-0',
            )}
          >
            {desplazado && (
              <>
                <span
                  className="absolute top-1/2 -left-2.5 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-haz"
                  style={{ animation: 'haz-parpadeo 2.6s infinite ease-in-out' }}
                  aria-hidden
                />
                <span
                  className="absolute top-1/2 -right-2.5 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-haz"
                  style={{ animation: 'haz-parpadeo 2.6s 1.3s infinite ease-in-out' }}
                  aria-hidden
                />
              </>
            )}

            <Logo />

            <nav className="hidden items-center gap-1 lg:flex" aria-label="Principal">
              {enlacesVisibles.map((enlace) => (
                <NavLink
                  key={enlace.to}
                  to={enlace.to}
                  end={enlace.exacto}
                  className="relative rounded-full px-4 py-2 text-sm transition-colors"
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.span
                          layoutId="nav-activo"
                          className="absolute inset-0 rounded-full border border-haz/30 bg-haz/10"
                          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        />
                      )}
                      <span className={cn('relative z-10', isActive ? 'text-haz' : 'text-tenue hover:text-pantalla')}>
                        {enlace.texto}
                      </span>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              {autenticado ? (
                <div className="hidden items-center gap-3 lg:flex">
                  <Link
                    to="/mis-reservas"
                    className="flex items-center gap-2.5 rounded-full border border-borde py-1.5 pr-4 pl-1.5 transition-colors hover:border-haz/50"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-haz font-mono text-xs font-semibold text-noche">
                      {iniciales(usuario!.nombre, usuario!.apellido)}
                    </span>
                    <span className="text-sm text-pantalla">{usuario!.nombre}</span>
                  </Link>
                  <Button variante="fantasma" tamano="sm" onClick={cerrarSesion}>
                    Salir
                  </Button>
                </div>
              ) : (
                <div className="hidden items-center gap-2 lg:flex">
                  <ButtonLink to="/entrar" variante="fantasma" tamano="sm">
                    Entrar
                  </ButtonLink>
                  <ButtonLink to="/registro" tamano="sm">
                    Crear cuenta
                  </ButtonLink>
                </div>
              )}

              <button
                type="button"
                onClick={() => setMenuAbierto((valor) => !valor)}
                className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-full border border-borde lg:hidden"
                aria-label={menuAbierto ? 'Cerrar menu' : 'Abrir menu'}
                aria-expanded={menuAbierto}
              >
                <span
                  className={cn(
                    'h-px w-4 bg-pantalla transition-transform duration-300',
                    menuAbierto && 'translate-y-[3.5px] rotate-45',
                  )}
                />
                <span
                  className={cn(
                    'h-px w-4 bg-pantalla transition-transform duration-300',
                    menuAbierto && '-translate-y-[3.5px] -rotate-45',
                  )}
                />
              </button>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuAbierto && (
          <motion.div
            className="fixed inset-x-0 top-16 bottom-0 z-30 bg-noche/97 backdrop-blur-xl lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <nav className="contenedor flex flex-col gap-1 pt-8" aria-label="Menu movil">
              {enlacesVisibles.map((enlace, indice) => (
                <motion.div
                  key={enlace.to}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + indice * 0.05, duration: 0.3 }}
                >
                  <NavLink
                    to={enlace.to}
                    end={enlace.exacto}
                    className={({ isActive }) =>
                      cn(
                        'block border-b border-borde py-5 font-display text-3xl uppercase transition-colors',
                        isActive ? 'text-haz' : 'text-pantalla',
                      )
                    }
                  >
                    {enlace.texto}
                  </NavLink>
                </motion.div>
              ))}

              <div className="mt-8 flex flex-col gap-3">
                {autenticado ? (
                  <>
                    <p className="eyebrow">Sesion de {usuario!.email}</p>
                    <Button variante="secundario" onClick={cerrarSesion}>
                      Cerrar sesion
                    </Button>
                  </>
                ) : (
                  <>
                    <ButtonLink to="/entrar" variante="secundario">
                      Entrar
                    </ButtonLink>
                    <ButtonLink to="/registro">Crear cuenta</ButtonLink>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="mt-20 border-t border-borde">
        <div className="contenedor flex flex-col gap-8 py-12 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-sm text-tenue">
              Seis salas, cinco funciones diarias y la butaca que elijas apartada diez minutos
              mientras decides.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-10 gap-y-3 sm:gap-x-16">
            <div className="flex flex-col gap-2">
              <p className="eyebrow">Ir a</p>
              {enlaces.map((enlace) => (
                <Link
                  key={enlace.to}
                  to={enlace.to}
                  className="text-sm text-tenue transition-colors hover:text-haz"
                >
                  {enlace.texto}
                </Link>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              <p className="eyebrow">Sucursales</p>
              <span className="text-sm text-tenue">Av. Larco 1301, Miraflores, Lima</span>
              <span className="text-sm text-tenue">Av. Espana 1900, Trujillo</span>
            </div>
          </div>
        </div>
        <div className="contenedor border-t border-borde py-6">
          <p className="font-mono text-xs tracking-widest text-tenue uppercase">
            Proyecto de portafolio · Django REST + React · 2026
          </p>
        </div>
      </footer>
    </div>
  )
}
