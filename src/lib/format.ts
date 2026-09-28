export const ZONA_CINE = 'America/Lima'

const LOCALE = 'es-PE'

const dinero = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: 'PEN',
  minimumFractionDigits: 2,
})

const hora = new Intl.DateTimeFormat(LOCALE, {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: ZONA_CINE,
})

const fechaLarga = new Intl.DateTimeFormat(LOCALE, {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: ZONA_CINE,
})

const fechaCorta = new Intl.DateTimeFormat(LOCALE, {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  timeZone: ZONA_CINE,
})

const soloDia = new Intl.DateTimeFormat(LOCALE, { weekday: 'short', timeZone: ZONA_CINE })
const soloMes = new Intl.DateTimeFormat(LOCALE, { month: 'short', timeZone: ZONA_CINE })
const partesISO = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  timeZone: ZONA_CINE,
})

export const formatearDinero = (valor: string | number) =>
  dinero.format(typeof valor === 'string' ? Number(valor) : valor)

export const formatearHora = (iso: string) => hora.format(new Date(iso))

export const formatearFecha = (iso: string) => fechaLarga.format(new Date(iso))

export const formatearFechaCorta = (iso: string) =>
  fechaCorta.format(new Date(iso)).replace(/\./g, '')

export const formatearFechaHora = (iso: string) =>
  `${formatearFechaCorta(iso)} · ${formatearHora(iso)}`

export const diaDeSemana = (iso: string) => soloDia.format(new Date(iso)).replace('.', '')

export const mesCorto = (iso: string) => soloMes.format(new Date(iso)).replace('.', '')

export const claveDeFecha = (iso: string) => partesISO.format(new Date(iso))

export const numeroDeDia = (iso: string) => Number(claveDeFecha(iso).slice(-2))

export const anioDe = (iso: string | null) => (iso ? Number(claveDeFecha(iso).slice(0, 4)) : null)

const desplazarDias = (dias: number) => {
  const fecha = new Date()
  fecha.setDate(fecha.getDate() + dias)
  return partesISO.format(fecha)
}

export const esHoy = (iso: string) => claveDeFecha(iso) === desplazarDias(0)

export const esManana = (iso: string) => claveDeFecha(iso) === desplazarDias(1)

export const etiquetaDeDia = (iso: string) => {
  if (esHoy(iso)) return 'Hoy'
  if (esManana(iso)) return 'Manana'
  return diaDeSemana(iso)
}

export const relojRegresivo = (segundos: number) => {
  const minutos = Math.floor(Math.max(0, segundos) / 60)
  const resto = Math.max(0, segundos) % 60
  return `${String(minutos).padStart(2, '0')}:${String(resto).padStart(2, '0')}`
}

export const iniciales = (nombre: string, apellido: string) =>
  `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase()

export const idDeYoutube = (url: string) => {
  try {
    return new URL(url).searchParams.get('v')
  } catch {
    return null
  }
}
