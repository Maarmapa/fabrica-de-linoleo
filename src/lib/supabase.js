import { createBrowserClient } from '@supabase/ssr'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

let _client = null

/** Cliente singleton, creado al primer uso (no al importar) para no romper el build. */
export function getSupabase() {
  if (!_client) _client = createBrowserClient(url, key)
  return _client
}

/** Export compatible: resuelve llamadas al cliente real solo cuando se usa. */
export const supabase = new Proxy({}, {
  get(_t, prop) {
    return Reflect.get(getSupabase(), prop)
  },
})
