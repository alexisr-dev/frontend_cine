import { cn } from '@/lib/cn'

export const Loader = ({ etiqueta = 'Cargando' }: { etiqueta?: string }) => (
  <div className="flex flex-col items-center justify-center gap-4 py-24" role="status">
    <div className="flex items-end gap-1" aria-hidden>
      {[0, 1, 2, 3, 4].map((indice) => (
        <span
          key={indice}
          className="w-1.5 rounded-full bg-haz"
          style={{
            height: '1.75rem',
            animation: `haz-parpadeo 1.1s ${indice * 0.12}s infinite ease-in-out`,
          }}
        />
      ))}
    </div>
    <p className="eyebrow">{etiqueta}</p>
  </div>
)

export const Skeleton = ({ className }: { className?: string }) => (
  <div
    className={cn('animate-pulse rounded-xl bg-sala-alta', className)}
    style={{ animationDuration: '1.6s' }}
  />
)
