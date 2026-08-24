# Fábrica de Linóleo — catálogo multi-artista

Web pública + panel admin para el colectivo. Next.js 14 + Supabase (DB, auth, storage).

## Setup (una vez)

### 1. Supabase
1. Crear proyecto en [supabase.com](https://supabase.com) (plan free)
2. SQL Editor → pegar y correr `supabase/schema.sql` completo
3. Authentication → Users → **Add user**: tu correo + contraseña (este es el login del admin)
4. Copiar de Settings → API: `Project URL` y `anon public key`

### 2. Vercel
1. Subir esta carpeta a un repo GitHub nuevo y conectar en [vercel.com](https://vercel.com)
   (o `vercel` CLI desde la carpeta)
2. Settings → Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon key
3. Deploy

### 3. Entrar al admin
`tudominio.vercel.app/admin` → correo + contraseña del paso 1.3

## Qué puede hacer el admin

- **Obras**: crear/editar/eliminar — título, artista, descripción, técnica (con sugerencias), año, edición ("1/7"), precio CLP, dimensiones, papel, foto principal + fotos adicionales
- **Estados por obra**: disponible / vendida / ⭐ destacada (aparece en portada) / visible-oculta
- **Artistas**: nombre, bio, Instagram, foto de perfil, orden

## Seguridad

- Público solo ve lo marcado "visible" (RLS policies en la DB)
- El admin es el único usuario autenticado que crees en Supabase
- Las fotos viven en Storage público (solo lectura); subir/borrar exige sesión
- La key anon es pública por diseño — sin sesión no se escribe nada

## Estructura

```
src/app/page.js              portada: destacadas + artistas
src/app/artista/[slug]/      página de cada artista con sus obras
src/app/obra/[id]/           ficha de obra (fotos, ficha técnica, precio, WhatsApp)
src/app/admin/               login + panel de edición
supabase/schema.sql          tablas + RLS + storage bucket
```
