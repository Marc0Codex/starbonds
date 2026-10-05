-- STARBONDS: storage buckets/policies and realtime publication

-- ============================================================
-- Buckets
--   avatars/<uid>/...            public
--   artworks/<uid>/...           public (portfolio, posts, listings, group covers)
--   chat-media/<conversation>/...  private
-- ============================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 2097152,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('artworks', 'artworks', true, 15728640,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']),
  ('chat-media', 'chat-media', false, 10485760,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do nothing;

-- Public buckets: owners manage files inside their own <uid>/ folder.
-- (select is required for upsert; public URLs do not need it)
create policy "owners read own public files" on storage.objects
  for select to authenticated
  using (
    bucket_id in ('avatars', 'artworks')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
create policy "owners upload public files" on storage.objects
  for insert to authenticated
  with check (
    bucket_id in ('avatars', 'artworks')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
create policy "owners update public files" on storage.objects
  for update to authenticated
  using (
    bucket_id in ('avatars', 'artworks')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id in ('avatars', 'artworks')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
create policy "owners delete public files" on storage.objects
  for delete to authenticated
  using (
    bucket_id in ('avatars', 'artworks')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Chat media: only the two members of the conversation.
create policy "members read chat media" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'chat-media'
    and exists (
      select 1 from public.conversations c
      where c.id::text = (storage.foldername(name))[1]
        and (select auth.uid()) in (c.user_a, c.user_b)
    )
  );
create policy "members upload chat media" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'chat-media'
    and exists (
      select 1 from public.conversations c
      where c.id::text = (storage.foldername(name))[1]
        and (select auth.uid()) in (c.user_a, c.user_b)
    )
  );

-- ============================================================
-- Realtime (postgres_changes respects RLS)
-- ============================================================
alter publication supabase_realtime add table public.messages, public.notifications, public.conversations;
