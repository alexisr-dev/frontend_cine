export type RolUsuario = 'cliente' | 'admin'

export type EstadoAsiento = 'disponible' | 'reservado' | 'ocupado' | 'bloqueado'

export type TipoAsiento = 'estandar' | 'vip' | 'discapacitado'

export type EstadoReserva = 'pendiente' | 'confirmada' | 'cancelada' | 'expirada'

export type EstadoPago = 'pendiente' | 'aprobado' | 'rechazado' | 'reembolsado'

export type MetodoPago = 'tarjeta' | 'stripe' | 'paypal' | 'efectivo'

export interface Usuario {
  id: number
  email: string
  nombre: string
  apellido: string
  nombre_completo: string
  telefono: string | null
  rol: RolUsuario
  email_verificado: boolean
  created_at: string
}

export interface UsuarioAdmin extends Usuario {
  is_active: boolean
}

export interface UsuarioAdminInput {
  rol?: RolUsuario
  is_active?: boolean
}

export interface UsuarioAdminCreateInput {
  email: string
  nombre: string
  apellido: string
  telefono?: string
  rol: RolUsuario
  password: string
}

export interface Genero {
  id: number
  nombre: string
}

export interface Pelicula {
  id: number
  titulo: string
  titulo_original: string | null
  duracion_min: number
  duracion_legible: string
  clasificacion: string | null
  poster_url: string | null
  backdrop_url: string | null
  calificacion: string
  fecha_estreno: string | null
  generos: Genero[]
}

export interface PeliculaAdminInput {
  titulo: string
  titulo_original?: string
  sinopsis?: string
  duracion_min: number
  clasificacion?: string
  poster_url?: string
  backdrop_url?: string
  trailer_url?: string
  idioma_original?: string
  director?: string
  reparto?: string
  calificacion?: string
  fecha_estreno?: string | null
  activa: boolean
  generos: number[]
}

export interface ActorReparto {
  nombre: string
  personaje: string | null
  foto_url: string | null
}

export interface PeliculaDetalle extends Pelicula {
  sinopsis: string | null
  trailer_url: string | null
  idioma_original: string | null
  director: string | null
  reparto: string | null
  reparto_lista: string[]
  reparto_detalle: ActorReparto[]
  activa: boolean
}

export interface Cine {
  id: number
  nombre: string
  direccion: string | null
  ciudad: string | null
  telefono: string | null
}

export interface CineAdminInput {
  nombre: string
  direccion?: string
  ciudad?: string
  telefono?: string
}

export interface Sala {
  id: number
  nombre: string
  tipo_sala: string
  capacidad: number
  activa: boolean
  cine: Cine
}

export interface SalaAdminInput {
  cine: number
  nombre: string
  tipo_sala: string
  activa: boolean
  filas?: number
  asientos_por_fila?: number
}

export interface Funcion {
  id: number
  pelicula_id: number
  pelicula_titulo: string
  pelicula_poster_url: string | null
  sala: Sala
  fecha_hora_inicio: string
  fecha_hora_fin: string
  idioma: string | null
  subtitulos: boolean
  precio_base: string
  activa: boolean
  asientos_disponibles: number
  asientos_totales: number
}

export interface FuncionDetalle extends Funcion {
  pelicula: Pelicula
}

export interface FuncionAdminInput {
  pelicula?: number
  sala?: number
  fecha_hora_inicio: string
  idioma?: string
  subtitulos: boolean
  precio_base: string
  activa: boolean
}

export interface AsientoMapa {
  funcion_asiento_id: number
  asiento_id: number
  fila: string
  numero: number
  etiqueta: string
  tipo: TipoAsiento
  estado: EstadoAsiento
  precio: string
  activo: boolean
}

export interface FilaMapa {
  fila: string
  asientos: AsientoMapa[]
}

export interface ResumenMapa {
  total: number
  disponibles: number
  reservados: number
  ocupados: number
}

export interface MapaAsientos {
  funcion: FuncionDetalle
  filas: FilaMapa[]
  resumen: ResumenMapa
  servidor_hora: string
}

export interface ReservaAsiento {
  id: number
  funcion_asiento_id: number
  etiqueta: string
  fila: string
  numero: number
  tipo: TipoAsiento
  precio_pagado: string
}

export interface PagoResumen {
  id: number
  estado: EstadoPago
  monto: string
  metodo_pago: MetodoPago
  transaccion_externa_id: string | null
  procesado_en: string | null
}

export interface Reserva {
  id: number
  codigo_reserva: string
  estado: EstadoReserva
  total: string
  expira_en: string
  segundos_restantes: number
  created_at: string
  usuario_email: string
  funcion: FuncionDetalle
  asientos: ReservaAsiento[]
  pago: PagoResumen | null
  ticket: { codigo_qr: string; emitido_en: string } | null
}

export interface ReservaResumen {
  id: number
  codigo_reserva: string
  estado: EstadoReserva
  total: string
  expira_en: string
  segundos_restantes: number
  created_at: string
  pelicula_titulo: string
  poster_url: string | null
  sala_nombre: string
  cine_nombre: string
  fecha_hora_inicio: string
  asientos: ReservaAsiento[]
}

export interface ReservaAdmin extends ReservaResumen {
  usuario_id: number
  usuario_email: string
}

export interface Pago {
  id: number
  reserva_id: number
  monto: string
  metodo_pago: MetodoPago
  estado: EstadoPago
  transaccion_externa_id: string | null
  tarjeta_ultimos4: string | null
  mensaje: string | null
  procesado_en: string | null
  created_at: string
}

export interface PagoAdmin extends Pago {
  codigo_reserva: string
  usuario_email: string
}

export interface RespuestaPago {
  pago: Pago
  reserva: Reserva
  reutilizado: boolean
}

export interface Ticket {
  id: number
  codigo_qr: string
  emitido_en: string
  codigo_reserva: string
  pelicula_titulo: string
  sala_nombre: string
  cine_nombre: string
  fecha_hora_inicio: string
  asientos: string[]
}

export interface Paginado<T> {
  count: number
  page: number
  pages: number
  page_size: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface ErrorApi {
  codigo: string
  mensaje: string
  detalles?: Record<string, string[]> | string[]
  request_id?: string
}
