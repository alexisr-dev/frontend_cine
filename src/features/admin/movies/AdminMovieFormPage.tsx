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
import { listarGeneros } from '@/features/movies/api'
import { GenreMultiSelect } from './GenreMultiSelect'
import { actualizarPelicula, crearPelicula, obtenerPeliculaAdmin } from './api'
import type { PeliculaAdminInput, PeliculaDetalle } from '@/types'

interface FormData {
  titulo: string
  titulo_original: string
  sinopsis: string
  duracion_min: string
  clasificacion: string
  poster_url: string
  backdrop_url: string
  trailer_url: string
  idioma_original: string
  director: string
  reparto: string
  calificacion: string
  fecha_estreno: string
  activa: boolean
  generos: number[]
}

const formInicial: FormData = {
  titulo: '',
  titulo_original: '',
  sinopsis: '',
  duracion_min: '',
  clasificacion: '',
  poster_url: '',
  backdrop_url: '',
  trailer_url: '',
  idioma_original: '',
  director: '',
  reparto: '',
  calificacion: '',
  fecha_estreno: '',
  activa: true,
  generos: [],
}

const formDesdePelicula = (pelicula: PeliculaDetalle): FormData => ({
  titulo: pelicula.titulo,
  titulo_original: pelicula.titulo_original ?? '',
  sinopsis: pelicula.sinopsis ?? '',
  duracion_min: String(pelicula.duracion_min),
  clasificacion: pelicula.clasificacion ?? '',
  poster_url: pelicula.poster_url ?? '',
  backdrop_url: pelicula.backdrop_url ?? '',
  trailer_url: pelicula.trailer_url ?? '',
  idioma_original: pelicula.idioma_original ?? '',
  director: pelicula.director ?? '',
  reparto: pelicula.reparto ?? '',
  calificacion: pelicula.calificacion ?? '',
  fecha_estreno: pelicula.fecha_estreno ?? '',
  activa: pelicula.activa,
  generos: pelicula.generos.map((genero) => genero.id),
})

const aPayload = (datos: FormData): PeliculaAdminInput => ({
  titulo: datos.titulo,
  titulo_original: datos.titulo_original,
  sinopsis: datos.sinopsis,
  duracion_min: Number(datos.duracion_min),
  clasificacion: datos.clasificacion,
  poster_url: datos.poster_url,
  backdrop_url: datos.backdrop_url,
  trailer_url: datos.trailer_url,
  idioma_original: datos.idioma_original,
  director: datos.director,
  reparto: datos.reparto,
  calificacion: datos.calificacion || undefined,
  fecha_estreno: datos.fecha_estreno || null,
  activa: datos.activa,
  generos: datos.generos,
})

const Textarea = ({
  etiqueta,
  error,
  ayuda,
  ...resto
}: {
  etiqueta: string
  error?: string
  ayuda?: string
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) => {
  const id = useId()
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="eyebrow">
        {etiqueta}
      </label>
      <textarea
        id={id}
        aria-invalid={Boolean(error)}
        className={
          'min-h-28 w-full rounded-xl border bg-noche/70 px-4 py-3 text-sm text-pantalla transition-colors ' +
          'placeholder:text-tenue/60 focus:outline-none focus:ring-2 focus:ring-haz/50 ' +
          (error ? 'border-alerta' : 'border-borde focus:border-haz/60')
        }
        {...resto}
      />
      {error ? (
        <p className="font-mono text-xs text-alerta">{error}</p>
      ) : ayuda ? (
        <p className="font-mono text-xs text-tenue">{ayuda}</p>
      ) : null}
    </div>
  )
}

export const AdminMovieFormPage = () => {
  const { id } = useParams<{ id: string }>()
  const esEdicion = Boolean(id)
  const navegar = useNavigate()
  const queryClient = useQueryClient()

  const [datos, setDatos] = useState<FormData>(formInicial)
  const [errores, setErrores] = useState<Record<string, string>>({})

  const generos = useQuery({ queryKey: ['generos'], queryFn: listarGeneros, staleTime: 600_000 })

  const pelicula = useQuery({
    queryKey: ['admin-pelicula', id],
    queryFn: () => obtenerPeliculaAdmin(Number(id)),
    enabled: esEdicion,
  })

  useEffect(() => {
    if (pelicula.data) setDatos(formDesdePelicula(pelicula.data))
  }, [pelicula.data])

  const cambiar =
    (campo: keyof FormData) => (evento: { target: { value: string } }) =>
      setDatos((previo) => ({ ...previo, [campo]: evento.target.value }))

  const mutacion = useMutation({
    mutationFn: () =>
      esEdicion ? actualizarPelicula(Number(id), aPayload(datos)) : crearPelicula(aPayload(datos)),
    onSuccess: () => {
      avisar.exito(esEdicion ? 'Pelicula actualizada' : 'Pelicula creada')
      queryClient.invalidateQueries({ queryKey: ['admin-peliculas'] })
      navegar('/admin/peliculas')
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

  if (esEdicion && pelicula.isLoading) return <Loader etiqueta="Cargando pelicula" />
  if (esEdicion && pelicula.isError) {
    return (
      <div className="contenedor py-20">
        <ErrorState
          descripcion={mensajeDeError(pelicula.error)}
          onReintentar={() => pelicula.refetch()}
        />
      </div>
    )
  }

  return (
    <section className="contenedor max-w-3xl py-14 sm:py-20">
      <p className="eyebrow">Administracion</p>
      <h1 className="mt-3 text-4xl sm:text-5xl">
        {esEdicion ? 'Editar pelicula' : 'Agregar pelicula'}
      </h1>

      <form onSubmit={enviar} className="mt-9 flex flex-col gap-5" noValidate>
        <Field
          etiqueta="Titulo"
          value={datos.titulo}
          onChange={cambiar('titulo')}
          error={errores.titulo}
          required
        />
        <Field
          etiqueta="Titulo original"
          value={datos.titulo_original}
          onChange={cambiar('titulo_original')}
          error={errores.titulo_original}
        />
        <Textarea
          etiqueta="Sinopsis"
          value={datos.sinopsis}
          onChange={cambiar('sinopsis')}
          error={errores.sinopsis}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            etiqueta="Duracion (minutos)"
            type="number"
            min={1}
            value={datos.duracion_min}
            onChange={cambiar('duracion_min')}
            error={errores.duracion_min}
            required
          />
          <Field
            etiqueta="Clasificacion"
            placeholder="PG-13"
            value={datos.clasificacion}
            onChange={cambiar('clasificacion')}
            error={errores.clasificacion}
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            etiqueta="Fecha de estreno"
            type="date"
            value={datos.fecha_estreno}
            onChange={cambiar('fecha_estreno')}
            error={errores.fecha_estreno}
          />
          <Field
            etiqueta="Calificacion"
            type="number"
            step="0.1"
            min={0}
            max={10}
            value={datos.calificacion}
            onChange={cambiar('calificacion')}
            error={errores.calificacion}
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            etiqueta="Director"
            value={datos.director}
            onChange={cambiar('director')}
            error={errores.director}
          />
          <Field
            etiqueta="Idioma original"
            value={datos.idioma_original}
            onChange={cambiar('idioma_original')}
            error={errores.idioma_original}
          />
        </div>
        <Field
          etiqueta="Reparto"
          value={datos.reparto}
          onChange={cambiar('reparto')}
          error={errores.reparto}
          ayuda="Separa los nombres con comas"
        />
        <Field
          etiqueta="URL del poster"
          type="url"
          value={datos.poster_url}
          onChange={cambiar('poster_url')}
          error={errores.poster_url}
        />
        <Field
          etiqueta="URL del backdrop"
          type="url"
          value={datos.backdrop_url}
          onChange={cambiar('backdrop_url')}
          error={errores.backdrop_url}
        />
        <Field
          etiqueta="URL del trailer"
          type="url"
          value={datos.trailer_url}
          onChange={cambiar('trailer_url')}
          error={errores.trailer_url}
        />

        <GenreMultiSelect
          generos={generos.data ?? []}
          seleccionados={datos.generos}
          onCambiar={(ids) => setDatos((previo) => ({ ...previo, generos: ids }))}
          error={errores.generos}
        />

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
            {mutacion.isPending ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear pelicula'}
          </Button>
          <ButtonLink to="/admin/peliculas" variante="secundario" tamano="lg">
            Cancelar
          </ButtonLink>
        </div>
      </form>
    </section>
  )
}
