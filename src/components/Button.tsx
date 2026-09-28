import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'

type Variante = 'primario' | 'secundario' | 'fantasma' | 'peligro'
type Tamano = 'sm' | 'md' | 'lg'

const variantes: Record<Variante, string> = {
  primario:
    'bg-haz text-noche hover:bg-haz-suave active:translate-y-px disabled:bg-borde disabled:text-tenue',
  secundario:
    'bg-sala-alta text-pantalla border border-borde hover:border-haz/60 hover:text-haz disabled:text-tenue',
  fantasma: 'bg-transparent text-tenue hover:text-pantalla disabled:text-borde',
  peligro:
    'bg-transparent text-alerta border border-alerta/40 hover:bg-alerta/10 disabled:text-tenue disabled:border-borde',
}

const tamanos: Record<Tamano, string> = {
  sm: 'h-9 px-3.5 text-xs',
  md: 'h-11 px-5 text-sm',
  lg: 'h-13 px-7 text-sm sm:h-14 sm:px-9 sm:text-base',
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide transition-all duration-200 disabled:cursor-not-allowed select-none'

interface PropsBase {
  variante?: Variante
  tamano?: Tamano
  className?: string
  children: ReactNode
}

interface PropsBoton extends PropsBase, Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className'> {}

export const Button = ({
  variante = 'primario',
  tamano = 'md',
  className,
  children,
  ...resto
}: PropsBoton) => (
  <button className={cn(base, variantes[variante], tamanos[tamano], className)} {...resto}>
    {children}
  </button>
)

interface PropsEnlace extends PropsBase {
  to: string
  state?: unknown
}

export const ButtonLink = ({
  to,
  state,
  variante = 'primario',
  tamano = 'md',
  className,
  children,
}: PropsEnlace) => (
  <Link
    to={to}
    state={state}
    className={cn(base, variantes[variante], tamanos[tamano], className)}
  >
    {children}
  </Link>
)
