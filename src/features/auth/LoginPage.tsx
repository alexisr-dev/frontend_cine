import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/Button'
import { Field } from '@/components/Field'
import { avisar } from '@/components/Toast'
import { detallesDeError, mensajeDeError } from '@/lib/axios'
import { login } from './api'
import { useAuthStore } from './authStore'

export const LoginPage = () => {
  const iniciarSesion = useAuthStore((estado) => estado.iniciarSesion)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errores, setErrores] = useState<Record<string, string>>({})

  const mutacion = useMutation({
    mutationFn: () => login(email, password),
    onSuccess: (datos) => {
      iniciarSesion(datos.usuario, datos.access, datos.refresh)
      avisar.exito(`Hola de nuevo, ${datos.usuario.nombre}`)
    },
    onError: (error) => {
      setErrores(detallesDeError(error))
      avisar.error(mensajeDeError(error, 'Email o contrasena incorrectos'))
    },
  })

  const enviar = (evento: FormEvent) => {
    evento.preventDefault()
    setErrores({})
    mutacion.mutate()
  }

  const usarDemo = () => {
    setEmail('demo@cine.pe')
    setPassword('Cine2026!')
  }

  const usarDemoAdmin = () => {
    setEmail('admin@cine.pe')
    setPassword('Cine2026!')
  }

  return (
    <div>
      <p className="eyebrow">Tu cuenta</p>
      <h1 className="mt-3 text-4xl sm:text-5xl">Entrar</h1>
      <p className="mt-4 text-sm text-tenue">
        Necesitas una cuenta para apartar butacas y guardar tus boletos.
      </p>

      <form onSubmit={enviar} className="mt-9 flex flex-col gap-5" noValidate>
        <Field
          etiqueta="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="tu@correo.pe"
          value={email}
          onChange={(evento) => setEmail(evento.target.value)}
          error={errores.email}
          required
        />
        <Field
          etiqueta="Contrasena"
          type="password"
          autoComplete="current-password"
          placeholder="Tu contrasena"
          value={password}
          onChange={(evento) => setPassword(evento.target.value)}
          error={errores.password}
          required
        />
        <Button type="submit" tamano="lg" disabled={mutacion.isPending} className="mt-2 w-full">
          {mutacion.isPending ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>

      <div className="panel mt-7 divide-y divide-borde overflow-hidden">
        <p className="eyebrow px-4 pt-3.5 pb-2.5">Cuentas de prueba</p>
        <button
          type="button"
          onClick={usarDemo}
          className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-sala-alta"
        >
          <span>
            <span className="block text-sm text-pantalla">Cliente</span>
            <span className="mt-0.5 block font-mono text-[0.6875rem] text-tenue">demo@cine.pe</span>
          </span>
          <span className="shrink-0 font-mono text-[0.625rem] tracking-widest text-haz uppercase">
            Usar
          </span>
        </button>
        <button
          type="button"
          onClick={usarDemoAdmin}
          className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-sala-alta"
        >
          <span>
            <span className="block text-sm text-pantalla">Administrador</span>
            <span className="mt-0.5 block font-mono text-[0.6875rem] text-tenue">admin@cine.pe</span>
          </span>
          <span className="shrink-0 font-mono text-[0.625rem] tracking-widest text-haz uppercase">
            Usar
          </span>
        </button>
      </div>

      <p className="mt-8 text-sm text-tenue">
        No tienes cuenta?{' '}
        <Link to="/registro" className="text-haz underline-offset-4 hover:underline">
          Crear una
        </Link>
      </p>
    </div>
  )
}
