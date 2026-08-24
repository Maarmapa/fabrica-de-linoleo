'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(false)

  async function login(e) {
    e.preventDefault()
    setLoading(true); setMsg(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setMsg('⛔ ' + error.message)
    else window.location.href = '/admin/panel'
    setLoading(false)
  }

  return (
    <main style={{ maxWidth: 380, margin: '80px auto', padding: 20 }}>
      <h1 style={{ fontSize: 22, fontWeight: 400, textAlign: 'center' }}>Fábrica de Linóleo</h1>
      <p style={{ textAlign: 'center', fontFamily: 'monospace', fontSize: 12, color: '#888', letterSpacing: 2 }}>ADMIN</p>

      <form onSubmit={login} style={{ display: 'grid', gap: 12, marginTop: 30 }}>
        <input type="email" required placeholder="correo" value={email} onChange={e => setEmail(e.target.value)} style={inp} />
        <input type="password" required placeholder="contraseña" value={password} onChange={e => setPassword(e.target.value)} style={inp} />
        <button disabled={loading} style={btn}>{loading ? 'Entrando…' : 'Entrar'}</button>
      </form>
      {msg && <p style={{ color: '#c00', fontSize: 13, marginTop: 14 }}>{msg}</p>}
    </main>
  )
}

const inp = { padding: '11px 14px', border: '1px solid #d5d0c6', background: '#fff', fontSize: 14 }
const btn = { padding: '12px', background: '#1a1a1a', color: '#faf8f4', border: 0, fontFamily: 'monospace', letterSpacing: 2, cursor: 'pointer' }
