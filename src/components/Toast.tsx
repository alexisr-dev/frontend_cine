import { create } from 'zustand'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/cn'

type TipoAviso = 'exito' | 'error' | 'info'

interface Aviso {
  id: number
  tipo: TipoAviso
  mensaje: string
}

interface EstadoAvisos {
  avisos: Aviso[]
  mostrar: (mensaje: string, tipo?: TipoAviso) => void
  descartar: (id: number) => void
}

export const useToastStore = create<EstadoAvisos>((set, get) => ({
  avisos: [],
  mostrar: (mensaje, tipo = 'info') => {
    const id = Date.now() + Math.random()
    set({ avisos: [...get().avisos, { id, tipo, mensaje }] })
    window.setTimeout(() => get().descartar(id), 4500)
  },
  descartar: (id) => set({ avisos: get().avisos.filter((aviso) => aviso.id !== id) }),
}))

export const avisar = {
  exito: (mensaje: string) => useToastStore.getState().mostrar(mensaje, 'exito'),
  error: (mensaje: string) => useToastStore.getState().mostrar(mensaje, 'error'),
  info: (mensaje: string) => useToastStore.getState().mostrar(mensaje, 'info'),
}

const bordes: Record<TipoAviso, string> = {
  exito: 'border-menta/50 text-menta',
  error: 'border-alerta/50 text-alerta',
  info: 'border-haz/50 text-haz',
}

export const ToastViewport = () => {
  const avisos = useToastStore((estado) => estado.avisos)
  const descartar = useToastStore((estado) => estado.descartar)

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end sm:p-0">
      <AnimatePresence initial={false}>
        {avisos.map((aviso) => (
          <motion.button
            key={aviso.id}
            layout
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => descartar(aviso.id)}
            className={cn(
              'pointer-events-auto w-full max-w-sm rounded-xl border bg-sala px-4 py-3 text-left text-sm shadow-2xl backdrop-blur',
              bordes[aviso.tipo],
            )}
          >
            {aviso.mensaje}
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  )
}
