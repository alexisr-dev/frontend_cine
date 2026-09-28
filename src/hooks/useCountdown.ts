import { useEffect, useRef, useState } from 'react'

export const useCountdown = (segundosIniciales: number, alTerminar?: () => void) => {
  const [restantes, setRestantes] = useState(Math.max(0, segundosIniciales))
  const finalizado = useRef(false)
  const callback = useRef(alTerminar)
  callback.current = alTerminar

  useEffect(() => {
    finalizado.current = false
    setRestantes(Math.max(0, segundosIniciales))
  }, [segundosIniciales])

  useEffect(() => {
    if (restantes <= 0) {
      if (!finalizado.current && segundosIniciales > 0) {
        finalizado.current = true
        callback.current?.()
      }
      return
    }
    const temporizador = window.setTimeout(() => setRestantes((valor) => valor - 1), 1000)
    return () => window.clearTimeout(temporizador)
  }, [restantes, segundosIniciales])

  return restantes
}
