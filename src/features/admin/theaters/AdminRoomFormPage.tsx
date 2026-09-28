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
import { actualizarSala, crearSala, listarCinesAdmin, obtenerSalaAdmin } from './api'
import type { Sala } from '@/types'

interface FormData {
  cine: string
  nombre: string
  tipo_sala: string
  activa: boolean
  filas: string
  asientos_por_fila: string
}

const formInicial: FormData = {
  cine: '',
  nombre: '',
  tipo_sala: '2D',
  activa: true,
  filas: '',
  asientos_por_fila: '',
}

const formDesdeSala = (sala: Sala): FormData => ({
  cine: String(sala.cine.id),
  nombre: sala.nombre,
  tipo_sala: sala.tipo_sala,
  activa: sala.activa,
  filas: '',
  asientos_por_fila: '',
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
        className="h-12 w-full rounded-xl border border-borde bg-noche/70 px-4 text-sm text-pantalla transition-colors focus:border-haz/60 focus:outline-none focus:ring-2 focus:ring-haz/50"
        {...resto}
      >
        {children}
      </select>
    </div>
  )
}

export const AdminRoomFormPage = () => {
  const { id } = useParams<{ id: string }>()
  const esEdicion = Boolean(id)
  const navegar = useNavigate()
  const queryClient = useQueryClient()

  const [datos, setDatos] = useState<FormData>(formInicial)
  const [errores, setErrores] = useState<Record<string, string>>({})

  const cines = useQuery({ queryKey: ['admin-cines'], queryFn: listarCinesAdmin })

  const sala = useQuery({
    queryKey: ['admin-sala', id],
    queryFn: () => obtenerSalaAdmin(Number(id)),
    enabled: esEdicion,
  })

  useEffect(() => {
    if (sala.data) setDatos(formDesdeSala(sala.data))
  }, [sala.data])

  useEffect(() => {
    if (!esEdicion && !datos.cine && cines.data && cines.data.length > 0) {
      setDatos((previo) => ({ ...previo, cine: String(cines.data[0].id) }))
    }
  }, [cines.data, esEdicion, datos.cine])

  const cambiar =
    (campo: keyof FormData) => (evento: { target: { value: string } }) =>
      setDatos((previo) => ({ ...previo, [campo]: evento.target.value }))

  const mutacion = useMutation({
    mutationFn: () => {
      const payload = {
        cine: Number(datos.cine),
        nombre: datos.nombre,
        tipo_sala: datos.tipo_sala,
        activa: datos.activa,
        ...(esEdicion
          ? {}
          : { filas: Number(datos.filas), asientos_por_fila: Number(datos.asientos_por_fila) }),
      }
      return esEdicion ? actualizarSala(Number(id), payload) : crearSala(payload)
    },
    onSuccess: () => {
      avisar.exito(esEdicion ? 'Sala actualizada' : 'Sala creada')
      queryClient.invalidateQueries({ queryKey: ['admin-salas'] })
      navegar('/admin/salas')
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

  if (esEdicion && sala.isLoading) return <Loader etiqueta="Cargando sala" />
  if (esEdicion && sala.isError) {
    return (
      <div className="contenedor py-20">
        <ErrorState
          descripcion={mensajeDeError(sala.error)}
          onReintentar={() => sala.refetch()}
        />
      </div>
    )
  }

  return (
    <section className="contenedor max-w-2xl py-14 sm:py-20">
      <p className="eyebrow">Administracion</p>
      <h1 className="mt-3 text-4xl sm:text-5xl">{esEdicion ? 'Editar sala' : 'Agregar sala'}</h1>

      <form onSubmit={enviar} className="mt-9 flex flex-col gap-5" noValidate>
        <Select etiqueta="Cine" value={datos.cine} onChange={cambiar('cine')} required>
          <option value="" disabled>
            Selecciona un cine
          </option>
          {(cines.data ?? []).map((cine) => (
            <option key={cine.id} value={cine.id}>
              {cine.nombre}
            </option>
          ))}
        </Select>
        {errores.cine ? <p className="font-mono text-xs text-alerta">{errores.cine}</p> : null}

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            etiqueta="Nombre"
            placeholder="Sala 1"
            value={datos.nombre}
            onChange={cambiar('nombre')}
            error={errores.nombre}
            required
          />
          <Select etiqueta="Tipo" value={datos.tipo_sala} onChange={cambiar('tipo_sala')}>
            <option value="2D">2D</option>
            <option value="3D">3D</option>
            <option value="IMAX">IMAX</option>
            <option value="4DX">4DX</option>
          </Select>
        </div>

        {!esEdicion ? (
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              etiqueta="Filas"
              type="number"
              min={1}
              max={26}
              value={datos.filas}
              onChange={cambiar('filas')}
              error={errores.filas}
              ayuda="Las ultimas 2 filas se marcan VIP automaticamente"
              required
            />
            <Field
              etiqueta="Butacas por fila"
              type="number"
              min={1}
              max={40}
              value={datos.asientos_por_fila}
              onChange={cambiar('asientos_por_fila')}
              error={errores.asientos_por_fila}
              required
            />
          </div>
        ) : null}

        <label className="flex items-center gap-2.5 text-sm text-pantalla">
          <input
            type="checkbox"
            checked={datos.activa}
            onChange={(evento) => setDatos((previo) => ({ ...previo, activa: evento.target.checked }))}
            className="h-4 w-4 rounded border-borde bg-noche/70 accent-haz"
          />
          Sala activa
        </label>

        <div className="mt-2 flex flex-col gap-3 xs:flex-row">
          <Button type="submit" tamano="lg" disabled={mutacion.isPending}>
            {mutacion.isPending ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear sala'}
          </Button>
          <ButtonLink to="/admin/salas" variante="secundario" tamano="lg">
            Cancelar
          </ButtonLink>
        </div>
      </form>
    </section>
  )
}
