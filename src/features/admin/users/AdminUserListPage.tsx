import { useState } from 'react'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, ButtonLink } from '@/components/Button'
import { Badge } from '@/components/Badge'
import { Loader } from '@/components/Loader'
import { EmptyState, ErrorState } from '@/components/States'
import { Modal } from '@/components/Modal'
import { avisar } from '@/components/Toast'
import { mensajeDeError } from '@/lib/axios'
import { useAuth } from '@/hooks/useAuth'
import { actualizarUsuarioAdmin, listarUsuariosAdmin } from './api'
import type { UsuarioAdmin, UsuarioAdminInput } from '@/types'

interface AccionPendiente {
  usuario: UsuarioAdmin
  cambios: UsuarioAdminInput
  titulo: string
  descripcion: string
}

export const AdminUserListPage = () => {
  const { usuario: yo } = useAuth()
  const [pagina, setPagina] = useState(1)
  const [busqueda, setBusqueda] = useState('')
  const [accion, setAccion] = useState<AccionPendiente | null>(null)
  const queryClient = useQueryClient()

  const usuarios = useQuery({
    queryKey: ['admin-usuarios', pagina, busqueda],
    queryFn: () => listarUsuariosAdmin({ page: pagina, page_size: 15, search: busqueda || undefined }),
    placeholderData: keepPreviousData,
  })

  const actualizar = useMutation({
    mutationFn: (variables: { id: number; cambios: UsuarioAdminInput }) =>
      actualizarUsuarioAdmin(variables.id, variables.cambios),
    onSuccess: () => {
      avisar.exito('Usuario actualizado')
      setAccion(null)
      queryClient.invalidateQueries({ queryKey: ['admin-usuarios'] })
    },
    onError: (error) => {
      avisar.error(mensajeDeError(error, 'No se pudo actualizar el usuario'))
    },
  })

  const pedirCambioRol = (usuario: UsuarioAdmin) => {
    const nuevoRol = usuario.rol === 'admin' ? 'cliente' : 'admin'
    setAccion({
      usuario,
      cambios: { rol: nuevoRol },
      titulo: nuevoRol === 'admin' ? 'Hacer administrador' : 'Quitar administrador',
      descripcion: `Vas a cambiar el rol de ${usuario.email} a "${nuevoRol}".`,
    })
  }

  const pedirCambioActivo = (usuario: UsuarioAdmin) => {
    setAccion({
      usuario,
      cambios: { is_active: !usuario.is_active },
      titulo: usuario.is_active ? 'Desactivar cuenta' : 'Activar cuenta',
      descripcion: usuario.is_active
        ? `${usuario.email} no podra iniciar sesion hasta que la reactives.`
        : `${usuario.email} podra volver a iniciar sesion.`,
    })
  }

  return (
    <section className="contenedor py-14 sm:py-20">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Administracion</p>
          <h1 className="mt-3 text-4xl sm:text-5xl">Usuarios</h1>
        </div>
        <ButtonLink to="/admin/usuarios/nuevo">Agregar usuario</ButtonLink>
      </div>

      <input
        type="search"
        value={busqueda}
        onChange={(evento) => {
          setBusqueda(evento.target.value)
          setPagina(1)
        }}
        placeholder="Buscar por nombre o email"
        className="mt-6 h-11 w-full max-w-sm rounded-full border border-borde bg-sala px-4 text-sm placeholder:text-tenue/60 focus:border-haz/60 focus:outline-none"
      />

      {usuarios.isLoading ? (
        <Loader etiqueta="Cargando usuarios" />
      ) : usuarios.isError ? (
        <div className="mt-10">
          <ErrorState
            descripcion={mensajeDeError(usuarios.error)}
            onReintentar={() => usuarios.refetch()}
          />
        </div>
      ) : usuarios.data && usuarios.data.results.length === 0 ? (
        <div className="mt-10">
          <EmptyState titulo="Sin usuarios" descripcion="No hay usuarios con ese criterio." />
        </div>
      ) : (
        <>
          <div className="mt-8 flex flex-col gap-3">
            {usuarios.data?.results.map((usuario) => {
              const esUnoMismo = usuario.id === yo?.id
              return (
                <div
                  key={usuario.id}
                  className="panel flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl">{usuario.nombre_completo}</h3>
                      <Badge tono={usuario.rol === 'admin' ? 'haz' : 'neutro'}>{usuario.rol}</Badge>
                      <Badge tono={usuario.is_active ? 'menta' : 'alerta'}>
                        {usuario.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                    <p className="mt-1.5 text-sm text-tenue">
                      {usuario.email}
                      {usuario.telefono ? ` · ${usuario.telefono}` : ''}
                    </p>
                  </div>
                  {esUnoMismo ? (
                    <p className="font-mono text-xs tracking-widest text-tenue uppercase">
                      Esta eres tu
                    </p>
                  ) : (
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Button variante="secundario" tamano="sm" onClick={() => pedirCambioRol(usuario)}>
                        {usuario.rol === 'admin' ? 'Quitar admin' : 'Hacer admin'}
                      </Button>
                      <Button
                        variante={usuario.is_active ? 'peligro' : 'secundario'}
                        tamano="sm"
                        onClick={() => pedirCambioActivo(usuario)}
                      >
                        {usuario.is_active ? 'Desactivar' : 'Activar'}
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {usuarios.data && usuarios.data.pages > 1 ? (
            <div className="mt-12 flex items-center justify-center gap-3">
              <Button
                variante="secundario"
                tamano="sm"
                disabled={pagina <= 1}
                onClick={() => setPagina((valor) => valor - 1)}
              >
                Anterior
              </Button>
              <span className="font-mono text-xs tracking-widest text-tenue">
                {usuarios.data.page} / {usuarios.data.pages}
              </span>
              <Button
                variante="secundario"
                tamano="sm"
                disabled={pagina >= usuarios.data.pages}
                onClick={() => setPagina((valor) => valor + 1)}
              >
                Siguiente
              </Button>
            </div>
          ) : null}
        </>
      )}

      <Modal
        abierto={accion !== null}
        titulo={accion?.titulo ?? ''}
        descripcion={accion?.descripcion}
        textoConfirmar="Confirmar"
        varianteConfirmar="peligro"
        procesando={actualizar.isPending}
        onConfirmar={() => accion && actualizar.mutate({ id: accion.usuario.id, cambios: accion.cambios })}
        onCerrar={() => setAccion(null)}
      />
    </section>
  )
}
