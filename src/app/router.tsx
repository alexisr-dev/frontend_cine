import { createBrowserRouter } from 'react-router-dom'
import { MainLayout } from '@/layouts/MainLayout'
import { AuthLayout } from '@/layouts/AuthLayout'
import { RutaPrivada } from './RutaPrivada'
import { AdminLayout } from './AdminLayout'
import { AdminDashboardPage } from '@/features/admin/AdminDashboardPage'
import { AdminMovieListPage } from '@/features/admin/movies/AdminMovieListPage'
import { AdminMovieFormPage } from '@/features/admin/movies/AdminMovieFormPage'
import { AdminCinemaListPage } from '@/features/admin/theaters/AdminCinemaListPage'
import { AdminCinemaFormPage } from '@/features/admin/theaters/AdminCinemaFormPage'
import { AdminRoomListPage } from '@/features/admin/theaters/AdminRoomListPage'
import { AdminRoomFormPage } from '@/features/admin/theaters/AdminRoomFormPage'
import { AdminShowtimeListPage } from '@/features/admin/showtimes/AdminShowtimeListPage'
import { AdminShowtimeFormPage } from '@/features/admin/showtimes/AdminShowtimeFormPage'
import { AdminReservationListPage } from '@/features/admin/reservations/AdminReservationListPage'
import { AdminPaymentListPage } from '@/features/admin/payments/AdminPaymentListPage'
import { AdminUserListPage } from '@/features/admin/users/AdminUserListPage'
import { AdminUserFormPage } from '@/features/admin/users/AdminUserFormPage'
import { MovieCatalogPage } from '@/features/movies/MovieCatalogPage'
import { MovieDetailPage } from '@/features/movies/MovieDetailPage'
import { ShowtimeListPage } from '@/features/showtimes/ShowtimeListPage'
import { SeatMapPage } from '@/features/seatMap/SeatMapPage'
import { ReservationSummaryPage } from '@/features/reservations/ReservationSummaryPage'
import { ReservationHistoryPage } from '@/features/reservations/ReservationHistoryPage'
import { PaymentPage } from '@/features/payments/PaymentPage'
import { TicketPage } from '@/features/payments/TicketPage'
import { LoginPage } from '@/features/auth/LoginPage'
import { RegisterPage } from '@/features/auth/RegisterPage'
import { NotFoundPage } from '@/components/NotFoundPage'

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: '/', element: <MovieCatalogPage /> },
      { path: '/peliculas/:id', element: <MovieDetailPage /> },
      { path: '/funciones', element: <ShowtimeListPage /> },
      { path: '/funciones/:id/asientos', element: <SeatMapPage /> },
      {
        path: '/reservas/:id',
        element: (
          <RutaPrivada>
            <ReservationSummaryPage />
          </RutaPrivada>
        ),
      },
      {
        path: '/reservas/:id/pago',
        element: (
          <RutaPrivada>
            <PaymentPage />
          </RutaPrivada>
        ),
      },
      {
        path: '/reservas/:id/boleto',
        element: (
          <RutaPrivada>
            <TicketPage />
          </RutaPrivada>
        ),
      },
      {
        path: '/mis-reservas',
        element: (
          <RutaPrivada>
            <ReservationHistoryPage />
          </RutaPrivada>
        ),
      },
      {
        path: '/admin',
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminDashboardPage /> },
          { path: 'peliculas', element: <AdminMovieListPage /> },
          { path: 'peliculas/nueva', element: <AdminMovieFormPage /> },
          { path: 'peliculas/:id/editar', element: <AdminMovieFormPage /> },
          { path: 'cines', element: <AdminCinemaListPage /> },
          { path: 'cines/nuevo', element: <AdminCinemaFormPage /> },
          { path: 'cines/:id/editar', element: <AdminCinemaFormPage /> },
          { path: 'salas', element: <AdminRoomListPage /> },
          { path: 'salas/nueva', element: <AdminRoomFormPage /> },
          { path: 'salas/:id/editar', element: <AdminRoomFormPage /> },
          { path: 'funciones', element: <AdminShowtimeListPage /> },
          { path: 'funciones/nueva', element: <AdminShowtimeFormPage /> },
          { path: 'funciones/:id/editar', element: <AdminShowtimeFormPage /> },
          { path: 'reservas', element: <AdminReservationListPage /> },
          { path: 'pagos', element: <AdminPaymentListPage /> },
          { path: 'usuarios', element: <AdminUserListPage /> },
          { path: 'usuarios/nuevo', element: <AdminUserFormPage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: '/entrar', element: <LoginPage /> },
      { path: '/registro', element: <RegisterPage /> },
    ],
  },
])
