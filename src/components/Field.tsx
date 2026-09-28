import { useId } from 'react'
import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  etiqueta: string
  error?: string
  ayuda?: string
  className?: string
}

export const Field = ({ etiqueta, error, ayuda, className, ...resto }: Props) => {
  const id = useId()
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="eyebrow">
        {etiqueta}
      </label>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(
          'h-12 w-full rounded-xl border bg-noche/70 px-4 text-sm text-pantalla transition-colors',
          'placeholder:text-tenue/60 focus:outline-none focus:ring-2 focus:ring-haz/50',
          error ? 'border-alerta' : 'border-borde focus:border-haz/60',
        )}
        {...resto}
      />
      {error ? (
        <p id={`${id}-error`} className="font-mono text-xs text-alerta">
          {error}
        </p>
      ) : ayuda ? (
        <p className="font-mono text-xs text-tenue">{ayuda}</p>
      ) : null}
    </div>
  )
}
