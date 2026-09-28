import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, ButtonLink } from '@/components/Button'
import { Field } from '@/components/Field'
import { Loader } from '@/components/Loader'
import { ErrorState } from '@/components/States'
import { avisar } from '@/components/Toast'
import { detallesDeError, mensajeDeError } from '@/lib/axios'
import { actualizarCine, crearCine, obtenerCineAdmin } from './api'
import type { Cine, CineAdminInput } from '@/types'

const formInicial: CineAdminInput = { nombre: '', direccion: '', ciudad: '', telefono: '' }

const formDesdeCine = (cine: Cine): CineAdminInput => ({
  nombre: cine.nombre,
  direccion: cine.direccion ?? '',
  ciudad: cine.ciudad ?? '',
  telefono: cine.telefono ?? '',
})

export const AdminCinemaFormPage = () => {
  const { id } = useParams<{ id: string }>()
  const esEdicion = Boolean(id)
  const navegar = useNavigate()
  const queryClient = useQueryClient()

  const [datos, setDatos] = useState<CineAdminInput>(formInicial)
  const [errores, setErrores] = useState<Record<string, string>>({})

  const cine = useQuery({
    queryKey: ['admin-cine', id],
    queryFn: () => obtenerCineAdmin(Number(id)),
    enabled: esEdicion,
  })

  useEffect(() => {
    if (cine.data) setDatos(formDesdeCine(cine.data))
  }, [cine.data])

  const cambiar =
    (campo: keyof CineAdminInput) => (evento: { target: { value: string } }) =>
      setDatos((previo) => ({ ...previo, [campo]: evento.target.value }))

  const mutacion = useMutation({
    mutationFn: () => (esEdicion ? actualizarCine(Number(id), datos) : crearCine(datos)),
    onSuccess: () => {
      avisar.exito(esEdicion ? 'Cine actualizado' : 'Cine creado')
      queryClient.invalidateQueries({ queryKey: ['admin-cines'] })
      navegar('/admin/cines')
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

  if (esEdicion && cine.isLoading) return <Loader etiqueta="Cargando cine" />
  if (esEdicion && cine.isError) {
    return (
      <div className="contenedor py-20">
        <ErrorState
          descripcion={mensajeDeError(cine.error)}
          onReintentar={() => cine.refetch()}
        />
      </div>
    )
  }

  return (
    <section className="contenedor max-w-2xl py-14 sm:py-20">
      <p className="eyebrow">Administracion</p>
      <h1 className="mt-3 text-4xl sm:text-5xl">{esEdicion ? 'Editar cine' : 'Agregar cine'}</h1>

      <form onSubmit={enviar} className="mt-9 flex flex-col gap-5" noValidate>
        <Field
          etiqueta="Nombre"
          value={datos.nombre}
          onChange={cambiar('nombre')}
          error={errores.nombre}
          required
        />
        <Field
          etiqueta="Direccion"
          value={datos.direccion}
          onChange={cambiar('direccion')}
          error={errores.direccion}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            etiqueta="Ciudad"
            value={datos.ciudad}
            onChange={cambiar('ciudad')}
            error={errores.ciudad}
          />
          <Field
            etiqueta="Telefono"
            type="tel"
            value={datos.telefono}
            onChange={cambiar('telefono')}
            error={errores.telefono}
          />
        </div>

        <div className="mt-2 flex flex-col gap-3 xs:flex-row">
          <Button type="submit" tamano="lg" disabled={mutacion.isPending}>
            {mutacion.isPending ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear cine'}
          </Button>
          <ButtonLink to="/admin/cines" variante="secundario" tamano="lg">
            Cancelar
          </ButtonLink>
        </div>
      </form>
    </section>
  )
}
