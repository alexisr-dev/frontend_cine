import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/Button'
import { Field } from '@/components/Field'
import { avisar } from '@/components/Toast'
import { detallesDeError, mensajeDeError } from '@/lib/axios'
import { registrar } from './api'
import type { DatosRegistro } from './api'
import { useAuthStore } from './authStore'

const inicial: DatosRegistro = {
  email: '',
  nombre: '',
  apellido: '',
  telefono: '',
  password: '',
  password_confirm: '',
}

export const RegisterPage = () => {
  const iniciarSesion = useAuthStore((estado) => estado.iniciarSesion)
  const [datos, setDatos] = useState(inicial)
  const [errores, setErrores] = useState<Record<string, string>>({})

  const cambiar = (campo: keyof DatosRegistro) => (evento: { target: { value: string } }) =>
    setDatos((previo) => ({ ...previo, [campo]: evento.target.value }))

  const mutacion = useMutation({
    mutationFn: () => registrar(datos),
    onSuccess: (respuesta) => {
      iniciarSesion(respuesta.usuario, respuesta.access, respuesta.refresh)
      avisar.exito('Cuenta creada. Ya puedes apartar butacas.')
    },
    onError: (error) => {
      setErrores(detallesDeError(error))
      avisar.error(mensajeDeError(error, 'Revisa los datos del formulario'))
    },
  })

  const enviar = (evento: FormEvent) => {
    evento.preventDefault()
    setErrores({})
    if (datos.password !== datos.password_confirm) {
      setErrores({ password_confirm: 'Las contrasenas no coinciden' })
      return
    }
    mutacion.mutate()
  }

  return (
    <div>
      <p className="eyebrow">Tu cuenta</p>
      <h1 className="mt-3 text-4xl sm:text-5xl">Crear cuenta</h1>
      <p className="mt-4 text-sm text-tenue">
        Tarda menos que elegir pelicula. Solo necesitamos un email y una contrasena.
      </p>

      <form onSubmit={enviar} className="mt-9 flex flex-col gap-5" noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            etiqueta="Nombre"
            autoComplete="given-name"
            placeholder="Alexis"
            value={datos.nombre}
            onChange={cambiar('nombre')}
            error={errores.nombre}
            required
          />
          <Field
            etiqueta="Apellido"
            autoComplete="family-name"
            placeholder="Nunez"
            value={datos.apellido}
            onChange={cambiar('apellido')}
            error={errores.apellido}
            required
          />
        </div>
        <Field
          etiqueta="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="tu@correo.pe"
          value={datos.email}
          onChange={cambiar('email')}
          error={errores.email}
          required
        />
        <Field
          etiqueta="Telefono"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          placeholder="987654321"
          value={datos.telefono ?? ''}
          onChange={cambiar('telefono')}
          error={errores.telefono}
          ayuda="Opcional, lo usamos si hay un cambio de funcion"
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            etiqueta="Contrasena"
            type="password"
            autoComplete="new-password"
            placeholder="Minimo 8 caracteres"
            value={datos.password}
            onChange={cambiar('password')}
            error={errores.password}
            required
          />
          <Field
            etiqueta="Repite la contrasena"
            type="password"
            autoComplete="new-password"
            placeholder="Otra vez"
            value={datos.password_confirm}
            onChange={cambiar('password_confirm')}
            error={errores.password_confirm}
            required
          />
        </div>
        <Button type="submit" tamano="lg" disabled={mutacion.isPending} className="mt-2 w-full">
          {mutacion.isPending ? 'Creando cuenta...' : 'Crear cuenta'}
        </Button>
      </form>

      <p className="mt-8 text-sm text-tenue">
        Ya tienes cuenta?{' '}
        <Link to="/entrar" className="text-haz underline-offset-4 hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  )
}
