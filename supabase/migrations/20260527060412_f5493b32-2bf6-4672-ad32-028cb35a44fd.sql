
revoke execute on function public.has_role(uuid, app_role) from public, anon, authenticated;
revoke execute on function public.adj_likes_count() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- Restrict storage SELECT to specific paths (not bucket listing)
drop policy if exists "photos bucket public read" on storage.objects;
create policy "photos bucket public read object" on storage.objects for select using (bucket_id = 'photos');
