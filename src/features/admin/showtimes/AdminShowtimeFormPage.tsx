import { useEffect, useId, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, ButtonLink } from '@/components/Button'
import { Field } from '@/components/Field'
import { Loader } from '@/components/Loader'
import { ErrorState } from '@/components/States'
import { avisar } from '@/components/Toast'
import { detallesDeError, mensajeDeError } from '@/lib/axios'
import { listarPeliculasAdmin } from '@/features/admin/movies/api'
import { listarSalasAdmin } from '@/features/admin/theaters/api'
import { actualizarFuncion, crearFuncion, obtenerFuncionAdmin } from './api'
import type { FuncionDetalle } from '@/types'

interface FormData {
  pelicula: string
  sala: string
  fecha_hora_inicio: string
  idioma: string
  subtitulos: boolean
  precio_base: string
  activa: boolean
}

const formInicial: FormData = {
  pelicula: '',
  sala: '',
  fecha_hora_inicio: '',
  idioma: 'Espanol',
  subtitulos: false,
  precio_base: '',
  activa: true,
}

const aInputLocal = (iso: string) => {
  const fecha = new Date(iso)
  const desplazo = fecha.getTimezoneOffset()
  return new Date(fecha.getTime() - desplazo * 60_000).toISOString().slice(0, 16)
}

const formDesdeFuncion = (funcion: FuncionDetalle): FormData => ({
  pelicula: String(funcion.pelicula_id),
  sala: String(funcion.sala.id),
  fecha_hora_inicio: aInputLocal(funcion.fecha_hora_inicio),
  idioma: funcion.idioma ?? '',
  subtitulos: funcion.subtitulos,
  precio_base: funcion.precio_base,
  activa: funcion.activa,
})

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
        className="h-12 w-full rounded-xl border border-borde bg-noche/70 px-4 text-sm text-pantalla transition-colors focus:border-haz/60 focus:outline-none focus:ring-2 focus:ring-haz/50 disabled:opacity-50"
        {...resto}
      >
        {children}
      </select>
    </div>
  )
}

export const AdminShowtimeFormPage = () => {
  const { id } = useParams<{ id: string }>()
  const esEdicion = Boolean(id)
  const navegar = useNavigate()
  const queryClient = useQueryClient()

  const [datos, setDatos] = useState<FormData>(formInicial)
  const [errores, setErrores] = useState<Record<string, string>>({})

  const peliculas = useQuery({
    queryKey: ['admin-peliculas-todas'],
    queryFn: () => listarPeliculasAdmin({ page: 1, page_size: 100 }),
  })
  const salas = useQuery({
    queryKey: ['admin-salas-todas'],
    queryFn: () => listarSalasAdmin({ page: 1, page_size: 100 }),
  })

  const funcion = useQuery({
    queryKey: ['admin-funcion', id],
    queryFn: () => obtenerFuncionAdmin(Number(id)),
    enabled: esEdicion,
  })

  useEffect(() => {
    if (funcion.data) setDatos(formDesdeFuncion(funcion.data))
  }, [funcion.data])

  const cambiar =
    (campo: keyof FormData) => (evento: { target: { value: string } }) =>
      setDatos((previo) => ({ ...previo, [campo]: evento.target.value }))

  const mutacion = useMutation({
    mutationFn: () => {
      const fecha = new Date(datos.fecha_hora_inicio).toISOString()
      if (esEdicion) {
        return actualizarFuncion(Number(id), {
          fecha_hora_inicio: fecha,
          idioma: datos.idioma,
          subtitulos: datos.subtitulos,
          precio_base: datos.precio_base,
          activa: datos.activa,
        })
      }
      return crearFuncion({
        pelicula: Number(datos.pelicula),
        sala: Number(datos.sala),
        fecha_hora_inicio: fecha,
        idioma: datos.idioma,
        subtitulos: datos.subtitulos,
        precio_base: datos.precio_base,
        activa: datos.activa,
      })
    },
    onSuccess: () => {
      avisar.exito(esEdicion ? 'Funcion actualizada' : 'Funcion programada')
      queryClient.invalidateQueries({ queryKey: ['admin-funciones'] })
      navegar('/admin/funciones')
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

  if (esEdicion && funcion.isLoading) return <Loader etiqueta="Cargando funcion" />
  if (esEdicion && funcion.isError) {
    return (
      <div className="contenedor py-20">
        <ErrorState
          descripcion={mensajeDeError(funcion.error)}
          onReintentar={() => funcion.refetch()}
        />
      </div>
    )
  }

  return (
    <section className="contenedor max-w-2xl py-14 sm:py-20">
      <p className="eyebrow">Administracion</p>
      <h1 className="mt-3 text-4xl sm:text-5xl">
        {esEdicion ? 'Editar funcion' : 'Programar funcion'}
      </h1>

      <form onSubmit={enviar} className="mt-9 flex flex-col gap-5" noValidate>
        <Select
          etiqueta="Pelicula"
          value={datos.pelicula}
          onChange={cambiar('pelicula')}
          disabled={esEdicion}
          required
        >
          <option value="" disabled>
            Selecciona una pelicula
          </option>
          {(peliculas.data?.results ?? []).map((pelicula) => (
            <option key={pelicula.id} value={pelicula.id}>
              {pelicula.titulo}
            </option>
          ))}
        </Select>

        <Select
          etiqueta="Sala"
          value={datos.sala}
          onChange={cambiar('sala')}
          disabled={esEdicion}
          required
        >
          <option value="" disabled>
            Selecciona una sala
          </option>
          {(salas.data?.results ?? []).map((sala) => (
            <option key={sala.id} value={sala.id}>
              {sala.cine.nombre} · {sala.nombre} ({sala.tipo_sala})
            </option>
          ))}
        </Select>

        <Field
          etiqueta="Fecha y hora de inicio"
          type="datetime-local"
          value={datos.fecha_hora_inicio}
          onChange={cambiar('fecha_hora_inicio')}
          error={errores.fecha_hora_inicio}
          required
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            etiqueta="Idioma"
            value={datos.idioma}
            onChange={cambiar('idioma')}
            error={errores.idioma}
          />
          <Field
            etiqueta="Precio base"
            type="number"
            step="0.01"
            min={0}
            value={datos.precio_base}
            onChange={cambiar('precio_base')}
            error={errores.precio_base}
            required
          />
        </div>

        <label className="flex items-center gap-2.5 text-sm text-pantalla">
          <input
            type="checkbox"
            checked={datos.subtitulos}
            onChange={(evento) =>
              setDatos((previo) => ({ ...previo, subtitulos: evento.target.checked }))
            }
            className="h-4 w-4 rounded border-borde bg-noche/70 accent-haz"
          />
          Subtitulada
        </label>

        <label className="flex items-center gap-2.5 text-sm text-pantalla">
          <input
            type="checkbox"
            checked={datos.activa}
            onChange={(evento) => setDatos((previo) => ({ ...previo, activa: evento.target.checked }))}
            className="h-4 w-4 rounded border-borde bg-noche/70 accent-haz"
          />
          Visible en la cartelera publica
        </label>

        <div className="mt-2 flex flex-col gap-3 xs:flex-row">
          <Button type="submit" tamano="lg" disabled={mutacion.isPending}>
            {mutacion.isPending ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Programar funcion'}
          </Button>
          <ButtonLink to="/admin/funciones" variante="secundario" tamano="lg">
            Cancelar
          </ButtonLink>
        </div>
      </form>
    </section>
  )
}
