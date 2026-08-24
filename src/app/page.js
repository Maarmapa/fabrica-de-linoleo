import { supabase } from '../lib/supabase'
import Link from 'next/link'

export const revalidate = 60

export default async function Home() {
  const { data: artistas } = await supabase
    .from('artistas')
    .select('*, obras(*)')
    .eq('visible', true)
    .order('orden')

  const malla = artistas?.flatMap(a => a.obras || []).filter(o => o.destacada) || []

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: 24 }}>
      {/* HEADER */}
      <header style={{ textAlign: 'center', padding: '60px 0 40px' }}>
        <h1 style={{ fontSize: 42, fontWeight: 400, letterSpacing: 2, margin: 0 }}>
          FÁBRICA DE LINÓLEO
        </h1>
        <p style={{ fontFamily: 'monospace', fontSize: 13, color: '#666', letterSpacing: 3, marginTop: 12 }}>
          GRABADO · XILOGRAFÍA · LINOGRAFÍA — COLECTIVO CHILENO
        </p>
      </header>

      {/* OBRAS DESTACADAS */}
      {malla.length > 0 && (
        <section style={{ marginBottom: 60 }}>
          <h2 style={{ fontSize: 14, fontFamily: 'monospace', color: '#888', letterSpacing: 2, marginBottom: 16 }}>DESTACADAS</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 20 }}>
            {malla.map(obra => (
              <Link key={obra.id} href={`/obra/${obra.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                {obra.imagen_principal && (
                  <img src={obra.imagen_principal} alt={obra.titulo} style={{ width: '100%', aspectRatio: '4/5', objectFit: 'cover', border: '1px solid #e0dcd4' }} />
                )}
                <p style={{ marginTop: 8, fontSize: 15 }}>{obra.titulo}</p>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#888' }}>{obra.tecnica}{obra.anio ? ` · ${obra.anio}` : ''}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ARTISTAS */}
      <section>
        <h2 style={{ fontSize: 14, fontFamily: 'monospace', color: '#888', letterSpacing: 2, marginBottom: 16 }}>ARTISTAS</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 28 }}>
          {artistas?.map(a => {
            const obras = (a.obras || []).filter(o => o.visible !== false)
            return (
              <Link key={a.id} href={`/artista/${a.slug}`} style={{ textDecoration: 'none', color: 'inherit', border: '1px solid #e0dcd4', padding: 20, background: '#fff' }}>
                {a.foto_url && (
                  <img src={a.foto_url} alt={a.nombre} style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', marginBottom: 12 }} />
                )}
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 500 }}>{a.nombre}</h3>
                <p style={{ fontSize: 13, color: '#777', margin: '6px 0 10px' }}>{a.bio?.slice(0, 90)}{a.bio?.length > 90 ? '…' : ''}</p>
                <p style={{ fontSize: 12, fontFamily: 'monospace', color: '#a05a00' }}>
                  {obras.length} obra{obras.length !== 1 ? 's' : ''}
                  {a.instagram && ` · @${a.instagram}`}
                </p>
              </Link>
            )
          })}
        </div>
      </section>

      <footer style={{ textAlign: 'center', padding: '70px 0 30px', fontSize: 12, color: '#999', fontFamily: 'monospace', letterSpacing: 1 }}>
        FÁBRICA DE LINÓLEO — SANTIAGO DE CHILE · <a href="https://www.instagram.com/fabricadelinoleo" target="_blank" rel="noopener noreferrer" style={{ color: '#a05a00' }}>@fabricadelinoleo</a>
      </footer>
    </main>
  )
}
