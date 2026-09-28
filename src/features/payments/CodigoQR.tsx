import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

interface Props {
  valor: string
  tamano?: number
}

export const CodigoQR = ({ valor, tamano = 200 }: Props) => {
  const [imagen, setImagen] = useState('')

  useEffect(() => {
    let vigente = true
    QRCode.toDataURL(valor, {
      width: tamano * 2,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark: '#0A0B10', light: '#E8E4D9' },
    })
      .then((url) => {
        if (vigente) setImagen(url)
      })
      .catch(() => setImagen(''))
    return () => {
      vigente = false
    }
  }, [valor, tamano])

  if (!imagen) {
    return (
      <div
        className="animate-pulse rounded-lg bg-pantalla/20"
        style={{ width: tamano, height: tamano }}
        aria-hidden
      />
    )
  }

  return (
    <img
      src={imagen}
      alt={`Codigo QR del boleto ${valor}`}
      width={tamano}
      height={tamano}
      className="rounded-lg"
    />
  )
}
