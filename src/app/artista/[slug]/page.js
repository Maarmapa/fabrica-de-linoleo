import { supabase } from '../../../lib/supabase'
import Link from 'next/link'

export const revalidate = 60

export default async function ArtistaPage({ params }) {
  const { data: artista } = await supabase
    .from('artistas')
    .select('*, obras(*)')
    .eq('slug', params.slug)
    .eq('visible', true)
    .single()

  if (!artista) return <main style={{ padding: 60, textAlign: 'center' }}><h1>Artista no encontrado</h1></main>

  const obras = (artista.obras || []).filter(o => o.visible)

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: 24 }}>
      <Link href="/" style={{ fontSize: 13, fontFamily: 'monospace', color: '#a05a00', textDecoration: 'none' }}>← Fábrica de Linóleo</Link>

      <header style={{ textAlign: 'center', padding: '40px 0' }}>
        {artista.foto_url && (
          <img src={artista.foto_url} alt={artista.nombre} style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', marginBottom: 16 }} />
        )}
        <h1 style={{ fontSize: 34, fontWeight: 400, margin: 0 }}>{artista.nombre}</h1>
        {artista.instagram && (
          <a href={`https://instagram.com/${artista.instagram}`} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'monospace', fontSize: 13, color: '#a05a00' }}>@{artista.instagram}</a>
        )}
        {artista.bio && <p style={{ maxWidth: 560, margin: '16px auto 0', color: '#555', lineHeight: 1.6 }}>{artista.bio}</p>}
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))', gap: 24 }}>
        {obras.map(o => (
          <Link key={o.id} href={`/obra/${o.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            {o.imagen_principal ? (
              <img src={o.imagen_principal} alt={o.titulo} style={{ width: '100%', aspectRatio: '4/5', objectFit: 'cover', border: '1px solid #e0dcd4' }} />
            ) : (
              <div style={{ width: '100%', aspectRatio: '4/5', background: '#eee', border: '1px solid #e0dcd4' }} />
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 8 }}>
              <p style={{ margin: 0, fontSize: 15 }}>{o.titulo}</p>
              {o.precio_clp && <p style={{ margin: 0, fontSize: 13, color: '#a05a00' }}>{o.precio_clp.toLocaleString('es-CL')}</p>}
            </div>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#888' }}>
              {[o.tecnica, o.edicion, o.anio].filter(Boolean).join(' · ')}
            </p>
          </Link>
        ))}
      </div>

      {obras.length === 0 && (
        <p style={{ textAlign: 'center', color: '#999', padding: 40 }}>Obras próximamente.</p>
      )}
    </main>
  )
}
