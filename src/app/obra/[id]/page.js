import { supabase } from '../../../lib/supabase'
import Link from 'next/link'

export const revalidate = 60

export default async function ObraPage({ params }) {
  const { data: obra } = await supabase
    .from('obras')
    .select('*, artistas(*)')
    .eq('id', params.id)
    .single()

  if (!obra) return <main style={{ padding: 60, textAlign: 'center' }}><h1>Obra no encontrada</h1></main>

  const fotos = [obra.imagen_principal, ...(obra.fotos_extra || [])].filter(Boolean)

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: 24 }}>
      <Link href={`/artista/${obra.artistas?.slug || ''}`} style={{ fontSize: 13, fontFamily: 'monospace', color: '#a05a00', textDecoration: 'none' }}>← {obra.artistas?.nombre}</Link>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 40, marginTop: 24 }}>
        <div>
          {fotos.map((f, i) => (
            <img key={i} src={f} alt={obra.titulo} style={{ width: '100%', marginBottom: 12, border: '1px solid #e0dcd4' }} />
          ))}
        </div>

        <div>
          <h1 style={{ fontSize: 30, fontWeight: 400, margin: '0 0 4px' }}>{obra.titulo}</h1>
          <p style={{ fontFamily: 'monospace', fontSize: 13, color: '#888', margin: '0 0 20px' }}>
            {[obra.tecnica, obra.edicion, obra.anio].filter(Boolean).join(' · ')}
          </p>

          {obra.descripcion && <p style={{ color: '#444', lineHeight: 1.7 }}>{obra.descripcion}</p>}

          <table style={{ marginTop: 24, fontSize: 14, borderCollapse: 'collapse' }}>
            <tbody>
              {obra.dimensiones && <tr><td style={tdk}>Dimensiones</td><td style={tdv}>{obra.dimensiones}</td></tr>}
              {obra.papel && <tr><td style={tdk}>Papel</td><td style={tdv}>{obra.papel}</td></tr>}
              {obra.anio && <tr><td style={tdk}>Año</td><td style={tdv}>{obra.anio}</td></tr>}
              {obra.edicion && <tr><td style={tdk}>Edición</td><td style={tdv}>{obra.edicion}</td></tr>}
            </tbody>
          </table>

          <div style={{ marginTop: 32 }}>
            {obra.vendida ? (
              <p style={{ fontFamily: 'monospace', color: '#999', letterSpacing: 2 }}>— VENDIDA —</p>
            ) : obra.precio_clp ? (
              <>
                <p style={{ fontSize: 26 }}>${obra.precio_clp.toLocaleString('es-CL')} CLP</p>
                <a
                  href={`https://wa.me/569${'XXXXXXXX'.replace('X','') }?text=${encodeURIComponent(`Hola! Me interesa "${obra.titulo}" de ${obra.artistas?.nombre} (${obra.precio_clp ? `$${obra.precio_clp.toLocaleString('es-CL')}` : 'precio a consultar'})`)}`}
                  target="_blank" rel="noopener noreferrer"
                  style={btn}
                >Consultar por WhatsApp</a>
              </>
            ) : obra.disponible ? (
              <a href={`https://www.instagram.com/fabricadelinoleo`} target="_blank" rel="noopener noreferrer" style={btn}>Consultar en Instagram</a>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  )
}

const tdk = { padding: '6px 16px 6px 0', color: '#888', verticalAlign: 'top', whiteSpace: 'nowrap' }
const tdv = { padding: '6px 0', verticalAlign: 'top' }
const btn = {
  display: 'inline-block', background: '#1a1a1a', color: '#faf8f4',
  padding: '12px 24px', textDecoration: 'none', fontFamily: 'monospace',
  fontSize: 13, letterSpacing: 1,
}
