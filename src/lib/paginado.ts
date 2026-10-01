import type { Paginado } from '@/types'

// Algunos listados sin paginar en el backend (generos, cines, funciones) pueden llegar como
// array plano o envueltos en { results }; esto devuelve siempre la primera pagina como array.
export const resultadosDe = <T>(data: T[] | Paginado<T> | null | undefined): T[] => {
  if (Array.isArray(data)) return data
  return data?.results ?? []
}
