import { Outlet } from 'react-router-dom'
import { RutaAdmin } from './RutaAdmin'

export const AdminLayout = () => (
  <RutaAdmin>
    <Outlet />
  </RutaAdmin>
)
