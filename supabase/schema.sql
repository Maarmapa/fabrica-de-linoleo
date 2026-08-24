-- Fábrica de Linóleo — esquema completo
-- Ejecutar en SQL Editor de Supabase

-- ============ ARTISTAS ============
create table if not exists artistas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  slug text unique not null,
  bio text,
  instagram text,
  foto_url text,
  orden int default 0,
  visible boolean default true,
  created_at timestamptz default now()
);

-- ============ OBRAS ============
create table if not exists obras (
  id uuid primary key default gen_random_uuid(),
  artista_id uuid references artistas(id) on delete cascade,
  titulo text not null,
  descripcion text,
  tecnica text,            -- xilografía, linograbado, etc.
  anio int,
  edicion text,            -- ej: "1/7", "edición de 20"
  precio_clp int,          -- null = no a la venta / consultar
  dimensiones text,        -- ej: "30 × 40 cm"
  papel text,              -- opcional: tipo de papel
  imagen_principal text,   -- URL pública en storage
  fotos_extra text[],      -- URLs adicionales
  disponible boolean default true,
  vendida boolean default false,
  destacada boolean default false,
  orden int default 0,
  visible boolean default true,
  created_at timestamptz default now()
);

create index if not exists obras_artista_idx on obras(artista_id);

-- ============ RLS (seguridad) ============
alter table artistas enable row level security;
alter table obras enable row level security;

-- Público: solo lectura de lo visible
create policy "public read artistas" on artistas for select using (visible = true);
create policy "public read obras" on obras for select using (visible = true);

-- Admin autenticado: todo acceso
create policy "admin write artistas" on artistas for all to authenticated using (true) with check (true);
create policy "admin write obras" on obras for all to authenticated using (true) with check (true);

-- ============ STORAGE: bucket de fotos ============
insert into storage.buckets (id, name, public) values ('obras', 'obras', true) on conflict do nothing;

create policy "public read fotos" on storage.objects for select using (bucket_id = 'obras');
create policy "admin upload" on storage.objects for insert to authenticated with check (bucket_id = 'obras');
create policy "admin update" on storage.objects for update to authenticated using (bucket_id = 'obras');
create policy "admin delete" on storage.objects for delete to authenticated using (bucket_id = 'obras');

-- ============ DATOS INICIALES ============
insert into artistas (nombre, slug, bio, instagram, orden) values
  ('map', 'map', 'Artista del linóleo y la xilografía. Miembro fundador de la Fábrica de Linóleo.', 'maarmapa', 1),
  ('Artista 2', 'artista-2', null, null, 2),
  ('Artista 3', 'artista-3', null, null, 3),
  ('Artista 4', 'artista-4', null, null, 4),
  ('Artista 5', 'artista-5', null, null, 5),
  ('Artista 6', 'artista-6', null, null, 6)
on conflict (slug) do nothing;
