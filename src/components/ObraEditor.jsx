'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function ObraEditor({ obra, artistas, onDone, onCancel }) {
  const [form, setForm] = useState(obra ? {
    artista_id: obra.artista_id,
    titulo: obra.titulo || '',
    descripcion: obra.descripcion || '',
    tecnica: obra.tecnica || '',
    anio: obra.anio || '',
    edicion: obra.edicion || '',
    precio_clp: obra.precio_clp || '',
    dimensiones: obra.dimensiones || '',
    papel: obra.papel || '',
    imagen_principal: obra.imagen_principal || '',
    fotos_extra: obra.fotos_extra || [],
    disponible: obra.disponible ?? true,
    vendida: obra.vendida ?? false,
    destacada: obra.destacada ?? false,
    visible: obra.visible ?? true,
  } : {
    artista_id: artistas[0]?.id || '',
    titulo: '', descripcion: '', tecnica: '', anio: '', edicion: '',
    precio_clp: '', dimensiones: '', papel: '',
    imagen_principal: '', fotos_extra: [],
    disponible: true, vendida: false, destacada: false, visible: true,
  })
  const [subiendo, setSubiendo] = useState(false)
  const [msg, setMsg] = useState(null)
  const [saving, setSaving] = useState(false)

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function subirImagen(e, slot) {
    const file = e.target.files[0]
    if (!file) return
    setSubiendo(true); setMsg(null)
    try {
      const ext = file.name.split('.').pop().toLowerCase()
      const slug = (form.titulo || 'obra').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)
      const path = `obras/${slug}-${Date.now()}${slot !== 'main' ? '-' + slot : ''}.${ext}`
      const { error } = await supabase.storage.from('obras').upload(path, file, { contentType: file.type })
      if (error) throw error
      const { data } = supabase.storage.from('obras').getPublicUrl(path)
      if (slot === 'main') set('imagen_principal', data.publicUrl)
      else set('fotos_extra', [...form.fotos_extra, data.publicUrl])
    } catch (err) {
      setMsg('Error subiendo: ' + err.message)
    }
    setSubiendo(false)
  }

  async function guardar(e) {
    e.preventDefault()
    setSaving(true); setMsg(null)
    const payload = {
      ...form,
      precio_clp: form.precio_clp ? parseInt(form.precio_clp) : null,
      anio: form.anio ? parseInt(form.anio) : null,
      fotos_extra: form.fotos_extra.filter(Boolean),
    }
    let error
    if (obra) ({ error } = await supabase.from('obras').update(payload).eq('id', obra.id))
    else ({ error } = await supabase.from('obras').insert(payload))
    if (error) setMsg('⛔ ' + error.message)
    else onDone()
    setSaving(false)
  }

  async function eliminar() {
    if (!confirm(`¿Eliminar "${form.titulo}"? No se puede deshacer.`)) return
    await supabase.from('obras').delete().eq('id', obra.id)
    onDone()
  }

  return (
    <form onSubmit={guardar} style={{ background: '#fff', border: '1px solid #e0dcd4', padding: 24, maxWidth: 720 }}>
      <h2 style={{ marginTop: 0, fontWeight: 500 }}>{obra ? 'Editar' : 'Nueva'} obra</h2>

      <div style={grid}>
        <label style={lbl}>Artista
          <select value={form.artista_id} onChange={e => set('artista_id', e.target.value)} style={inp} required>
            {artistas.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
          </select>
        </label>
        <label style={lbl}>Título *
          <input value={form.titulo} onChange={e => set('titulo', e.target.value)} style={inp} required />
        </label>
      </div>

      <label style={lbl}>Descripción
        <textarea value={form.descripcion} onChange={e => set('descripcion', e.target.value)} rows={3} style={{ ...inp, width: '100%' }} />
      </label>

      <div style={grid}>
        <label style={lbl}>Técnica
          <input value={form.tecnica} onChange={e => set('tecnica', e.target.value)} placeholder="xilografía, linograbado…" style={inp} list="tecnicas" />
          <datalist id="tecnicas">
            <option value="Xilografía" /><option value="Linograbado" /><option value="Litografía" />
            <option value="Grabado en metal" /><option value="Serigrafía" /><option value="Monocopias" />
          </datalist>
        </label>
        <label style={lbl}>Año
          <input type="number" min="1900" max="2100" value={form.anio} onChange={e => set('anio', e.target.value)} style={inp} />
        </label>
      </div>

      <div style={grid}>
        <label style={lbl}>Edición
          <input value={form.edicion} onChange={e => set('edicion', e.target.value)} placeholder='ej: "1/7" o "ed. de 20"' style={inp} />
        </label>
        <label style={lbl}>Precio (CLP)
          <input type="number" min="0" step="1000" value={form.precio_clp} onChange={e => set('precio_clp', e.target.value)} placeholder="vacío = consultar" style={inp} />
        </label>
      </div>

      <div style={grid}>
        <label style={lbl}>Dimensiones
          <input value={form.dimensiones} onChange={e => set('dimensiones', e.target.value)} placeholder="30 × 40 cm" style={inp} />
        </label>
        <label style={lbl}>Papel
          <input value={form.papel} onChange={e => set('papel', e.target.value)} placeholder="opcional" style={inp} />
        </label>
      </div>

      {/* FOTOS */}
      <fieldset style={fset}>
        <legend style={legend}>Fotos</legend>
        {form.imagen_principal && (
          <img src={form.imagen_principal} alt="principal" style={{ width: 140, height: 175, objectFit: 'cover', marginBottom: 8, display: 'block', border: '1px solid #ddd' }} />
        )}
        <label style={lbl}>Foto principal
          <input type="file" accept="image/*" onChange={e => subirImagen(e, 'main')} />
        </label>

        {(form.fotos_extra.length > 0) && (
          <div style={{ display: 'flex', gap: 8, margin: '10px 0' }}>
            {form.fotos_extra.map((f, i) => (
              <img key={i} src={f} alt={`extra ${i + 1}`} style={{ width: 70, height: 88, objectFit: 'cover', border: '1px solid #ddd' }} />
            ))}
          </div>
        )}
        <label style={lbl}>Fotos adicionales (una a la vez)
          <input type="file" accept="image/*" onChange={e => subirImagen(e, 'extra')} />
        </label>
        {subiendo && <p style={{ fontSize: 12, color: '#888' }}>Subiendo foto…</p>}
      </fieldset>

      {/* ESTADO */}
      <fieldset style={fset}>
        <legend style={legend}>Estado</legend>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 14 }}>
          <label><input type="checkbox" checked={form.disponible} onChange={e => set('disponible', e.target.checked)} /> Disponible</label>
          <label><input type="checkbox" checked={form.vendida} onChange={e => set('vendida', e.target.checked)} /> Vendida</label>
          <label><input type="checkbox" checked={form.destacada} onChange={e => set('destacada', e.target.checked)} /> ⭐ Destacada (portada)</label>
          <label><input type="checkbox" checked={form.visible} onChange={e => set('visible', e.target.checked)} /> Visible al público</label>
        </div>
      </fieldset>

      {msg && <p style={{ color: msg.startsWith('⛔') ? '#c00' : '#888', fontSize: 13 }}>{msg}</p>}

      <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
        <button type="submit" disabled={saving} style={btnPrimary}>{saving ? 'Guardando…' : 'Guardar'}</button>
        <button type="button" onClick={onCancel} style={btnGhost}>Cancelar</button>
        {obra && <button type="button" onClick={eliminar} style={{ ...btnGhost, color: '#c00', borderColor: '#c00', marginLeft: 'auto' }}>Eliminar</button>}
      </div>
    </form>
  )
}

const grid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 12 }
const lbl = { fontSize: 13, color: '#555', display: 'grid', gap: 4 }
const inp = { padding: '9px 12px', border: '1px solid #d5d0c6', fontSize: 14, width: '100%', boxSizing: 'border-box', fontFamily: 'inherit' }
const fset = { border: '1px solid #e0dcd4', padding: 16, margin: '16px 0' }
const legend = { fontFamily: 'monospace', fontSize: 11, letterSpacing: 2, color: '#777', padding: '0 8px' }
const btnPrimary = { padding: '11px 22px', background: '#1a1a1a', color: '#faf8f4', border: 0, fontFamily: 'monospace', letterSpacing: 1, cursor: 'pointer' }
const btnGhost = { padding: '11px 18px', background: 'transparent', border: '1px solid #ccc', cursor: 'pointer', fontFamily: 'monospace' }
