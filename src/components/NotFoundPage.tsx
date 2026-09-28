import { ButtonLink } from './Button'

export const NotFoundPage = () => (
  <div className="contenedor flex min-h-[65vh] flex-col items-center justify-center gap-5 py-20 text-center">
    <p className="eyebrow">Error 404</p>
    <h1 className="text-6xl sm:text-8xl">Sala vacia</h1>
    <p className="max-w-md text-sm text-tenue">
      Esta direccion no proyecta nada. Vuelve a la cartelera y elige una funcion.
    </p>
    <ButtonLink to="/" className="mt-2">
      Ver cartelera
    </ButtonLink>
  </div>
)
