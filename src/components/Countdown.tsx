import { useCountdown } from '@/hooks/useCountdown'
import { relojRegresivo } from '@/lib/format'
import { cn } from '@/lib/cn'

interface Props {
  segundos: number
  onTerminar?: () => void
  className?: string
  compacto?: boolean
}

export const Countdown = ({ segundos, onTerminar, className, compacto }: Props) => {
  const restantes = useCountdown(segundos, onTerminar)
  const urgente = restantes > 0 && restantes <= 60

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 font-mono tabular-nums',
        urgente ? 'text-alerta' : 'text-haz',
        compacto ? 'text-sm' : 'text-lg',
        className,
      )}
      aria-live="polite"
    >
      <span
        className={cn('h-1.5 w-1.5 rounded-full', urgente ? 'bg-alerta' : 'bg-haz')}
        style={urgente ? { animation: 'haz-parpadeo 0.8s infinite' } : undefined}
        aria-hidden
      />
      {relojRegresivo(restantes)}
    </span>
  )
}
