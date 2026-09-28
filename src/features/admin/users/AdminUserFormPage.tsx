import { useId, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, ButtonLink } from '@/components/Button'
import { Field } from '@/components/Field'
import { avisar } from '@/components/Toast'
import { detallesDeError, mensajeDeError } from '@/lib/axios'
import { crearUsuarioAdmin } from './api'
import type { RolUsuario, UsuarioAdminCreateInput } from '@/types'

const formInicial: UsuarioAdminCreateInput = {
  email: '',
  nombre: '',
  apellido: '',
  telefono: '',
  rol: 'cliente',
  password: '',
}

const Select = ({
  etiqueta,
  children,
  ...resto
}: { etiqueta: string } & React.SelectHTMLAttributes<HTMLSelectElement>) => {
  const id = useId()
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="eyebrow">
        {etiqueta}
      </label>
      <select
        id={id}
        className="h-12 w-full rounded-xl border border-borde bg-noche/70 px-4 text-sm text-pantalla transition-colors focus:border-haz/60 focus:outline-none focus:ring-2 focus:ring-haz/50"
        {...resto}
      >
        {children}
      </select>
    </div>
  )
}

export const AdminUserFormPage = () => {
  const navegar = useNavigate()
  const queryClient = useQueryClient()

  const [datos, setDatos] = useState<UsuarioAdminCreateInput>(formInicial)
  const [errores, setErrores] = useState<Record<string, string>>({})

  const cambiar =
    (campo: keyof UsuarioAdminCreateInput) => (evento: { target: { value: string } }) =>
      setDatos((previo) => ({ ...previo, [campo]: evento.target.value }))

  const mutacion = useMutation({
    mutationFn: () => crearUsuarioAdmin(datos),
    onSuccess: () => {
      avisar.exito('Usuario creado')
      queryClient.invalidateQueries({ queryKey: ['admin-usuarios'] })
      navegar('/admin/usuarios')
    },
    onError: (error) => {
      setErrores(detallesDeError(error))
      avisar.error(mensajeDeError(error, 'Revisa los datos del formulario'))
    },
  })

  const enviar = (evento: FormEvent) => {
    evento.preventDefault()
    setErrores({})
    mutacion.mutate()
  }

  return (
    <section className="contenedor max-w-2xl py-14 sm:py-20">
      <p className="eyebrow">Administracion</p>
      <h1 className="mt-3 text-4xl sm:text-5xl">Agregar usuario</h1>

      <form onSubmit={enviar} className="mt-9 flex flex-col gap-5" noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            etiqueta="Nombre"
            value={datos.nombre}
            onChange={cambiar('nombre')}
            error={errores.nombre}
            required
          />
          <Field
            etiqueta="Apellido"
            value={datos.apellido}
            onChange={cambiar('apellido')}
            error={errores.apellido}
            required
          />
        </div>
        <Field
          etiqueta="Email"
          type="email"
          value={datos.email}
          onChange={cambiar('email')}
          error={errores.email}
          required
        />
        <Field
          etiqueta="Telefono"
          type="tel"
          value={datos.telefono}
          onChange={cambiar('telefono')}
          error={errores.telefono}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <Select
            etiqueta="Rol"
            value={datos.rol}
            onChange={(evento) =>
              setDatos((previo) => ({ ...previo, rol: evento.target.value as RolUsuario }))
            }
          >
            <option value="cliente">Cliente</option>
            <option value="admin">Administrador</option>
          </Select>
          <Field
            etiqueta="Contrasena"
            type="password"
            placeholder="Minimo 8 caracteres"
            value={datos.password}
            onChange={cambiar('password')}
            error={errores.password}
            required
          />
        </div>

        <div className="mt-2 flex flex-col gap-3 xs:flex-row">
          <Button type="submit" tamano="lg" disabled={mutacion.isPending}>
            {mutacion.isPending ? 'Creando...' : 'Crear usuario'}
          </Button>
          <ButtonLink to="/admin/usuarios" variante="secundario" tamano="lg">
            Cancelar
          </ButtonLink>
        </div>
      </form>
    </section>
  )
}
