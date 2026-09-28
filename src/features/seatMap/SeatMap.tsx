import { useState } from 'react'
import { Seat } from './Seat'
import { cn } from '@/lib/cn'
import type { AsientoMapa, FilaMapa } from '@/types'

interface Props {
  filas: FilaMapa[]
  seleccionados: Set<number>
  limiteAlcanzado: boolean
  onAlternar: (asiento: AsientoMapa) => void
}

const ZOOMS = [0.75, 1, 1.35]

export const SeatMap = ({ filas, seleccionados, limiteAlcanzado, onAlternar }: Props) => {
  const [nivelZoom, setNivelZoom] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 640 ? 0 : 1,
  )
  const zoom = ZOOMS[nivelZoom]
  const anchoFila = Math.max(...filas.map((fila) => fila.asientos.length), 1)
  const pasillo = Math.ceil(anchoFila / 2)

  return (
    <div className="relative min-w-0">
      <div className="mb-6 flex items-center justify-between gap-4">
        <p className="eyebrow">Paso 2 de 3 · Elige butaca</p>
        <div className="flex items-center gap-1 rounded-full border border-borde p-1">
          <button
            type="button"
            onClick={() => setNivelZoom((valor) => Math.max(0, valor - 1))}
            disabled={nivelZoom === 0}
            className="flex h-7 w-7 items-center justify-center rounded-full text-tenue transition-colors hover:text-haz disabled:opacity-30"
            aria-label="Alejar el mapa"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="2.5" aria-hidden>
              <path d="M6 12h12" strokeLinecap="round" />
            </svg>
          </button>
          <span className="w-10 text-center font-mono text-[0.625rem] tracking-wider text-tenue">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setNivelZoom((valor) => Math.min(ZOOMS.length - 1, valor + 1))}
            disabled={nivelZoom === ZOOMS.length - 1}
            className="flex h-7 w-7 items-center justify-center rounded-full text-tenue transition-colors hover:text-haz disabled:opacity-30"
            aria-label="Acercar el mapa"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="2.5" aria-hidden>
              <path d="M12 6v12M6 12h12" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grano relative overflow-hidden rounded-2xl border border-borde bg-noche">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(120% 55% at 50% 0%, rgba(255,194,75,0.13) 0%, transparent 62%)',
          }}
        />

        <div className="relative px-3 pt-7 sm:px-6 sm:pt-9">
          <div className="mx-auto max-w-2xl">
            <svg viewBox="0 0 300 26" className="w-full" aria-hidden>
              <path
                d="M6 22 Q150 -6 294 22"
                fill="none"
                stroke="#FFC24B"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path d="M6 22 Q150 -6 294 22 L294 26 L6 26 Z" fill="url(#brillo)" opacity="0.5" />
              <defs>
                <linearGradient id="brillo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFC24B" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#FFC24B" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
            <p className="mt-1 text-center font-mono text-[0.625rem] tracking-[0.4em] text-haz/70 uppercase">
              Pantalla
            </p>
          </div>
        </div>

        <div className="relative overflow-x-auto px-3 pt-8 pb-7 sm:px-6 sm:pt-10 sm:pb-9">
          <div
            className="mx-auto flex w-max flex-col gap-[var(--separacion)]"
            style={
              {
                '--asiento': `${1.375 * zoom}rem`,
                '--separacion': `${0.3125 * zoom}rem`,
              } as React.CSSProperties
            }
          >
            {filas.map((fila) => (
              <div key={fila.fila} className="flex items-center gap-2 sm:gap-3">
                <span className="w-4 shrink-0 text-center font-mono text-[0.625rem] font-medium text-tenue">
                  {fila.fila}
                </span>

                <div className="flex gap-[var(--separacion)]">
                  {fila.asientos.map((asiento, indice) => (
                    <div
                      key={asiento.funcion_asiento_id}
                      className={cn(indice === pasillo && 'ml-[calc(var(--asiento)*0.75)]')}
                    >
                      <Seat
                        asiento={asiento}
                        seleccionado={seleccionados.has(asiento.funcion_asiento_id)}
                        bloqueadoPorLimite={limiteAlcanzado}
                        onAlternar={onAlternar}
                      />
                    </div>
                  ))}
                </div>

                <span className="w-4 shrink-0 text-center font-mono text-[0.625rem] font-medium text-tenue">
                  {fila.fila}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex flex-wrap items-center justify-center gap-x-5 gap-y-2.5 border-t border-borde px-4 py-4">
          {[
            { clase: 'border-borde bg-sala-alta', texto: 'Libre' },
            { clase: 'border-haz bg-haz', texto: 'Tuya' },
            { clase: 'border-terciopelo/50 bg-terciopelo/35', texto: 'Ocupada' },
            { clase: 'border-dashed border-tenue/40 bg-sala', texto: 'Apartada' },
            { clase: 'border-haz/45 bg-sala-alta', texto: 'VIP' },
          ].map((item) => (
            <span key={item.texto} className="flex items-center gap-2">
              <span className={cn('h-3 w-3 rounded-t-sm rounded-b-[2px] border', item.clase)} />
              <span className="font-mono text-[0.625rem] tracking-wider text-tenue uppercase">
                {item.texto}
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
