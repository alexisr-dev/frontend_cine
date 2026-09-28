import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from './Button'

interface Props {
  abierto: boolean
  titulo: string
  descripcion?: string
  children?: ReactNode
  textoConfirmar?: string
  textoCancelar?: string
  varianteConfirmar?: 'primario' | 'peligro'
  onConfirmar?: () => void
  onCerrar: () => void
  procesando?: boolean
}

export const Modal = ({
  abierto,
  titulo,
  descripcion,
  children,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Volver',
  varianteConfirmar = 'primario',
  onConfirmar,
  onCerrar,
  procesando,
}: Props) => {
  useEffect(() => {
    if (!abierto) return
    const alPresionar = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') onCerrar()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', alPresionar)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', alPresionar)
    }
  }, [abierto, onCerrar])

  return createPortal(
    <AnimatePresence>
      {abierto && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-noche/80 p-4 backdrop-blur-sm sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onCerrar}
          role="dialog"
          aria-modal="true"
          aria-label={titulo}
        >
          <motion.div
            className="panel w-full max-w-lg p-6 sm:p-8"
            initial={{ y: 24, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 16, scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            onClick={(evento) => evento.stopPropagation()}
          >
            <h2 className="text-2xl sm:text-3xl">{titulo}</h2>
            {descripcion ? <p className="mt-3 text-sm text-tenue">{descripcion}</p> : null}
            {children ? <div className="mt-5">{children}</div> : null}
            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button variante="fantasma" onClick={onCerrar} disabled={procesando}>
                {textoCancelar}
              </Button>
              {onConfirmar ? (
                <Button variante={varianteConfirmar} onClick={onConfirmar} disabled={procesando}>
                  {procesando ? 'Procesando...' : textoConfirmar}
                </Button>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
