import { useEffect, useState } from 'react'

export const useMediaQuery = (consulta: string) => {
  const [coincide, setCoincide] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(consulta).matches,
  )

  useEffect(() => {
    const lista = window.matchMedia(consulta)
    const manejar = (evento: MediaQueryListEvent) => setCoincide(evento.matches)
    setCoincide(lista.matches)
    lista.addEventListener('change', manejar)
    return () => lista.removeEventListener('change', manejar)
  }, [consulta])

  return coincide
}

export const useEsMovil = () => useMediaQuery('(max-width: 639px)')
export const useEsTablet = () => useMediaQuery('(min-width: 640px) and (max-width: 1023px)')
export const useEsEscritorio = () => useMediaQuery('(min-width: 1024px)')
export const usePrefiereMenosMovimiento = () =>
  useMediaQuery('(prefers-reduced-motion: reduce)')
