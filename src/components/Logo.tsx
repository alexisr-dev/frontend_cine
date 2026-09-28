import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'

interface Props {
  className?: string
  tamanoIcono?: string
  tamanoTexto?: string
}

export const Logo = ({ className, tamanoIcono = 'h-8 w-8', tamanoTexto = 'text-xl sm:text-2xl' }: Props) => (
  <Link
    to="/"
    className={cn('flex items-center gap-2.5', className)}
    aria-label="Cinema Aurora, ir al inicio"
  >
    <span
      className={cn(
        'flex shrink-0 items-center justify-center rounded-[0.6rem] bg-gradient-to-t from-haz to-haz-suave',
        tamanoIcono,
      )}
    >
      <svg viewBox="0 0 24 24" className="h-[68%] w-[68%]" aria-hidden>
        <path d="M2 17.5 A10 10 0 0 1 22 17.5" fill="none" stroke="#0A0B10" strokeWidth="1.15" strokeLinecap="round" opacity="0.45" />
        <path d="M4.5 17.5 A7.5 7.5 0 0 1 19.5 17.5" fill="none" stroke="#0A0B10" strokeWidth="1.15" strokeLinecap="round" opacity="0.7" />
        <path d="M7 17.5 A5 5 0 0 1 17 17.5 Z" fill="#0A0B10" />
        <path d="M1.5 17.5 H22.5" stroke="#0A0B10" strokeWidth="1.15" strokeLinecap="round" />
      </svg>
    </span>
    <span className={cn('font-display leading-none tracking-wide', tamanoTexto)}>
      Cinema<span className="text-haz">Aurora</span>
    </span>
  </Link>
)
