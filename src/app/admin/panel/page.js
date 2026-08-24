'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import ObraEditor from '../../../components/ObraEditor'

export default function Panel() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [artistas, setArtistas] = useState([])
  const [obras, setObras] = useState([])
  const [tab, setTab] = useState('obras')
  const [editando, setEditando] = useState(null) // null | 'nueva' | obra
  const [editandoArtista, setEditandoArtista] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session) cargar()
  }, [session])

  async function cargar() {
    const [{ data: arts }, { data: obs }] = await Promise.all([
      supabase.from('artistas').select('*').order('orden'),
      supabase.from('obras').select('*, artistas(nombre, slug)').order('created_at', { ascending: false }),
    ])
    setArtistas(arts || [])
    setObras(obs || [])
  }

  async function logout() {
    await supabase.auth.signOut()
  }

  if (loading) return <main style={{ padding: 60, textAlign: 'center' }}>Cargando…</main>

  if (!session) {
    if (typeof window !== 'undefined') window.location.href = '/admin'
    return null
  }

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: 24 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0 20px', borderBottom: '1px solid #ddd' }}>
        <h1 style={{ fontSize: 18, fontWeight: 500, margin: 0 }}>Fábrica de Linóleo — Admin</h1>
        <button onClick={logout} style={ghost}>Salir</button>
      </header>

      <nav style={{ display: 'flex', gap: 8, margin: '16px 0' }}>
        <button onClick={() => setTab('obras')} style={tab === 'obras' ? tabOn : tabOff}>Obras ({obras.length})</button>
        <button onClick={() => setTab('artistas')} style={tab === 'artistas' ? tabOn : tabOff}>Artistas ({artistas.length})</button>
      </nav>

      {tab === 'obras' && !editando && (
        <>
          <button onClick={() => setEditando('nueva')} style={primary}>+ Nueva obra</button>
          <table style={tbl}>
            <thead><tr>{['Título','Artista','Técnica','Precio','Estado',''].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
            <tbody>
              {obras.map(o => (
                <tr key={o.id}>
                  <td style={td}>{o.titulo}</td>
                  <td style={td}>{o.artistas?.nombre}</td>
                  <td style={td}>{o.tecnica}</td>
                  <td style={td}>{o.precio_clp ? `$${o.precio_clp.toLocaleString('es-CL')}` : '—'}</td>
                  <td style={td}>{o.vendida ? '🔴 vendida' : o.disponible ? '🟢 disponible' : '⚪ oculta'}</td>
                  <td style={td}><button onClick={() => setEditando(o)} style={ghost}>editar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {tab === 'obras' && editando && (
        <ObraEditor obra={editando === 'nueva' ? null : editando} artistas={artistas} onDone={() => { setEditando(null); cargar() }} onCancel={() => setEditando(null)} />
      )}

      {tab === 'artistas' && (
        <div style={{ display: 'grid', gap: 12 }}>
          {artistas.map(a => <ArtistaRow key={a.id} a={a} onSaved={cargar} />)}
          <button onClick={() => setEditandoArtista(true)} style={ghost}>+ Nuevo artista</button>
        </div>
      )}
    </main>
  )
}

function ArtistaRow({ a, onSaved }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ ...a })
  const [subiendo, setSubiendo] = useState(false)

  async function guardar() {
    const { nombre, slug, bio, instagram, orden, visible } = form
    await supabase.from('artistas').update({ nombre, slug, bio, instagram, orden, visible }).eq('id', a.id)
    setOpen(false); onSaved()
  }

  async function subirFoto(e) {
    const file = e.target.files[0]
    if (!file) return
    setSubiendo(true)
    const ext = file.name.split('.').pop()
    const path = `artistas/${a.slug}-${Date.now()}.${ext}`
    await supabase.storage.from('obras').upload(path, file)
    const { data } = supabase.storage.from('obras').getPublicUrl(path)
    await supabase.from('artistas').update({ foto_url: data.publicUrl }).eq('id', a.id)
    setForm(f => ({ ...f, foto_url: data.publicUrl }))
    setSubiendo(false); onSaved()
  }

  return (
    <div style={{ border: '1px solid #e0dcd4', padding: 14, background: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{a.nombre} {a.instagram && <small style={{ color: '#999' }}>@{a.instagram}</small>}</span>
        <button onClick={() => setOpen(o => !o)} style={ghost}>{open ? 'cerrar' : 'editar'}</button>
      </div>
      {open && (
        <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
          <input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="nombre" style={inp} />
          <textarea value={form.bio || ''} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="bio" rows={3} style={inp} />
          <input value={form.instagram || ''} onChange={e => setForm({ ...form, instagram: e.target.value })} placeholder="instagram (sin @)" style={inp} />
          <label style={{ fontSize: 13 }}>
            Foto de perfil: <input type="file" accept="image/*" onChange={subirFoto} />
            {subiendo && ' subiendo…'}
          </label>
          <button onClick={guardar} style={primary}>Guardar artista</button>
        </div>
      )}
    </div>
  )
}

const tbl = { width: '100%', borderCollapse: 'collapse', marginTop: 12, background: '#fff', fontSize: 14 }
const th = { textAlign: 'left', padding: 10, borderBottom: '2px solid #ddd', fontFamily: 'monospace', fontSize: 11, letterSpacing: 1, color: '#777' }
const td = { padding: 10, borderBottom: '1px solid #eee' }
export { tbl, th, td }

const inp = { padding: '9px 12px', border: '1px solid #d5d0c6', fontSize: 14, width: '100%', boxSizing: 'border-box' }
const primary = { padding: '10px 18px', background: '#1a1a1a', color: '#faf8f4', border: 0, fontFamily: 'monospace', letterSpacing: 1, cursor: 'pointer' }
const ghost = { padding: '6px 12px', background: 'transparent', border: '1px solid #ccc', cursor: 'pointer', fontFamily: 'monospace', fontSize: 12 }
const tabOn = { padding: '8px 16px', background: '#1a1a1a', color: '#fff', border: 0, cursor: 'pointer', fontFamily: 'monospace' }
const tabOff = { padding: '8px 16px', background: 'transparent', border: '1px solid #ccc', cursor: 'pointer', fontFamily: 'monospace' }
