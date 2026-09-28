import { ButtonLink } from '@/components/Button'

const SECCIONES = [
  { to: '/admin/peliculas', titulo: 'Peliculas', descripcion: 'Catalogo, portadas, reparto y trailers.' },
  { to: '/admin/cines', titulo: 'Cines', descripcion: 'Complejos y su informacion de contacto.' },
  { to: '/admin/salas', titulo: 'Salas', descripcion: 'Salas de proyeccion y su distribucion de butacas.' },
  { to: '/admin/funciones', titulo: 'Funciones', descripcion: 'Horarios programados por sala.' },
  { to: '/admin/reservas', titulo: 'Reservas', descripcion: 'Todas las reservas de todos los clientes.' },
  { to: '/admin/pagos', titulo: 'Pagos', descripcion: 'Pagos procesados y reembolsos.' },
  { to: '/admin/usuarios', titulo: 'Usuarios', descripcion: 'Roles y estado de las cuentas.' },
]

export const AdminDashboardPage = () => (
  <section className="contenedor py-14 sm:py-20">
    <p className="eyebrow">Administracion</p>
    <h1 className="mt-3 text-4xl sm:text-5xl">Panel de Cinema Aurora</h1>
    <p className="mt-4 max-w-xl text-sm text-tenue">
      Gestiona el catalogo, la programacion y las cuentas del cine desde un solo lugar.
    </p>

    <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {SECCIONES.map((seccion) => (
        <div key={seccion.to} className="panel flex flex-col gap-4 p-6">
          <div>
            <h2 className="text-2xl">{seccion.titulo}</h2>
            <p className="mt-2 text-sm text-tenue">{seccion.descripcion}</p>
          </div>
          <ButtonLink to={seccion.to} variante="secundario" className="mt-auto self-start">
            Abrir
          </ButtonLink>
        </div>
      ))}
    </div>
  </section>
)
