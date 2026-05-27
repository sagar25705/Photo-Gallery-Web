
-- ROLES
create type public.app_role as enum ('admin', 'user');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  username text unique,
  bio text,
  avatar_url text,
  website text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  unique (user_id, role)
);

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;

-- PHOTOS
create table public.photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  image_url text not null,
  storage_path text,
  title text not null,
  description text,
  category text,
  tags text[] default '{}',
  location text,
  camera text,
  lens text,
  capture_date date,
  likes_count int not null default 0,
  downloads_count int not null default 0,
  created_at timestamptz not null default now()
);
create index photos_user_id_idx on public.photos(user_id);
create index photos_created_at_idx on public.photos(created_at desc);
create index photos_category_idx on public.photos(category);

create table public.likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  photo_id uuid not null references public.photos(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, photo_id)
);

create table public.saved_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  photo_id uuid not null references public.photos(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, photo_id)
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  photo_id uuid not null references public.photos(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  comment text not null,
  created_at timestamptz not null default now()
);

create table public.followers (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references auth.users(id) on delete cascade,
  following_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(follower_id, following_id),
  check (follower_id <> following_id)
);

-- GRANTS
grant select on public.profiles to anon, authenticated;
grant insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

grant select on public.photos to anon, authenticated;
grant insert, update, delete on public.photos to authenticated;
grant all on public.photos to service_role;

grant select on public.likes to anon, authenticated;
grant insert, delete on public.likes to authenticated;
grant all on public.likes to service_role;

grant select, insert, delete on public.saved_photos to authenticated;
grant all on public.saved_photos to service_role;

grant select on public.comments to anon, authenticated;
grant insert, delete on public.comments to authenticated;
grant all on public.comments to service_role;

grant select on public.followers to anon, authenticated;
grant insert, delete on public.followers to authenticated;
grant all on public.followers to service_role;

-- RLS
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.photos enable row level security;
alter table public.likes enable row level security;
alter table public.saved_photos enable row level security;
alter table public.comments enable row level security;
alter table public.followers enable row level security;

create policy "profiles public read" on public.profiles for select using (true);
create policy "profiles self insert" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "profiles self update" on public.profiles for update to authenticated using (auth.uid() = id);
create policy "profiles admin update" on public.profiles for update to authenticated using (public.has_role(auth.uid(),'admin'));

create policy "roles self read" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

create policy "photos public read" on public.photos for select using (true);
create policy "photos owner insert" on public.photos for insert to authenticated with check (auth.uid() = user_id);
create policy "photos owner update" on public.photos for update to authenticated using (auth.uid() = user_id or public.has_role(auth.uid(),'admin'));
create policy "photos owner delete" on public.photos for delete to authenticated using (auth.uid() = user_id or public.has_role(auth.uid(),'admin'));

create policy "likes public read" on public.likes for select using (true);
create policy "likes self insert" on public.likes for insert to authenticated with check (auth.uid() = user_id);
create policy "likes self delete" on public.likes for delete to authenticated using (auth.uid() = user_id);

create policy "saved self read" on public.saved_photos for select to authenticated using (auth.uid() = user_id);
create policy "saved self insert" on public.saved_photos for insert to authenticated with check (auth.uid() = user_id);
create policy "saved self delete" on public.saved_photos for delete to authenticated using (auth.uid() = user_id);

create policy "comments public read" on public.comments for select using (true);
create policy "comments self insert" on public.comments for insert to authenticated with check (auth.uid() = user_id);
create policy "comments self delete" on public.comments for delete to authenticated using (auth.uid() = user_id or public.has_role(auth.uid(),'admin'));

create policy "followers public read" on public.followers for select using (true);
create policy "followers self insert" on public.followers for insert to authenticated with check (auth.uid() = follower_id);
create policy "followers self delete" on public.followers for delete to authenticated using (auth.uid() = follower_id);

-- Counter triggers
create or replace function public.adj_likes_count() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (tg_op = 'INSERT') then update public.photos set likes_count = likes_count + 1 where id = new.photo_id; return new;
  elsif (tg_op = 'DELETE') then update public.photos set likes_count = greatest(likes_count - 1, 0) where id = old.photo_id; return old;
  end if; return null;
end; $$;
create trigger likes_count_trg after insert or delete on public.likes for each row execute function public.adj_likes_count();

-- Auto profile + role on signup
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, username, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email,'@',1) || '_' || substr(new.id::text,1,6)),
    new.raw_user_meta_data->>'avatar_url'
  ) on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, case when new.email = 'gaurisagar343@gmail.com' then 'admin'::app_role else 'user'::app_role end)
  on conflict do nothing;
  return new;
end; $$;

create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- STORAGE bucket
insert into storage.buckets (id, name, public) values ('photos','photos', true) on conflict (id) do nothing;

create policy "photos bucket public read" on storage.objects for select using (bucket_id = 'photos');
create policy "photos bucket auth upload" on storage.objects for insert to authenticated with check (bucket_id = 'photos' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "photos bucket owner update" on storage.objects for update to authenticated using (bucket_id = 'photos' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "photos bucket owner delete" on storage.objects for delete to authenticated using (bucket_id = 'photos' and (auth.uid()::text = (storage.foldername(name))[1] or public.has_role(auth.uid(),'admin')));
