-- STARBONDS: row level security + explicit Data API grants
-- New tables are not auto-exposed to the Data API, so every grant is explicit.

-- ============================================================
-- Enable RLS everywhere
-- ============================================================
alter table public.profiles enable row level security;
alter table public.tags enable row level security;
alter table public.profile_tags enable row level security;
alter table public.artworks enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.posts enable row level security;
alter table public.likes enable row level security;
alter table public.comments enable row level security;
alter table public.follows enable row level security;
alter table public.listings enable row level security;
alter table public.swipes enable row level security;
alter table public.conversations enable row level security;
alter table public.matches enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.blocks enable row level security;
alter table public.reports enable row level security;

-- ============================================================
-- Grants
-- ============================================================
revoke all on all tables in schema public from anon, authenticated;
revoke all on all functions in schema public from public, anon, authenticated;
revoke all on all functions in schema private from public, anon, authenticated;

-- Public (logged-out) read access for shareable pages
grant select on
  public.profiles, public.tags, public.profile_tags, public.artworks,
  public.groups, public.group_members, public.posts, public.likes,
  public.comments, public.follows, public.listings
to anon;

grant select on all tables in schema public to authenticated;

-- Insert (column-scoped where the table has server-managed columns)
grant insert on public.profile_tags, public.likes, public.follows, public.swipes, public.blocks to authenticated;
grant insert (owner_id, title, description, images, year) on public.artworks to authenticated;
grant insert (slug, name, description, cover_path, owner_id, is_private) on public.groups to authenticated;
grant insert (group_id, profile_id) on public.group_members to authenticated;
grant insert (author_id, body, media, post_type, artwork_id, group_id) on public.posts to authenticated;
grant insert (post_id, author_id, body) on public.comments to authenticated;
grant insert (seller_id, kind, title, description, price_cents, currency, images, artwork_id, medium_tag_id, status)
  on public.listings to authenticated;
grant insert (conversation_id, sender_id, body, media_path) on public.messages to authenticated;
grant insert (reporter_id, target_type, target_id, reason) on public.reports to authenticated;

-- Update (column-scoped)
grant update (username, display_name, bio, avatar_path, website, location, links, open_to_collab, locale, onboarded)
  on public.profiles to authenticated;
grant update (title, description, images, year) on public.artworks to authenticated;
grant update (name, description, cover_path, is_private) on public.groups to authenticated;
grant update (body, media, post_type, artwork_id) on public.posts to authenticated;
grant update (kind, title, description, price_cents, currency, images, artwork_id, medium_tag_id, status)
  on public.listings to authenticated;
grant update (direction) on public.swipes to authenticated;
grant update (read_at) on public.notifications to authenticated;

-- Delete
grant delete on
  public.profile_tags, public.artworks, public.groups, public.group_members, public.posts,
  public.likes, public.comments, public.follows, public.listings, public.notifications, public.blocks
to authenticated;

grant usage on all sequences in schema public to authenticated;

-- Helpers used inside policies / invoker RPCs
grant usage on schema private to anon, authenticated;
grant execute on function private.is_blocked_between(uuid, uuid) to anon, authenticated;
grant execute on function private.is_group_member(uuid) to anon, authenticated;
grant execute on function private.can_view_group(uuid) to anon, authenticated;

-- RPCs: signed-in users only
grant execute on function public.get_match_candidates(integer) to authenticated;
grant execute on function public.get_discover_feed(integer, integer) to authenticated;
grant execute on function public.get_following_feed(integer, timestamptz) to authenticated;
grant execute on function public.start_conversation(uuid, uuid) to authenticated;
grant execute on function public.mark_conversation_read(uuid) to authenticated;
grant execute on function public.delete_account() to authenticated;

-- ============================================================
-- Policies
-- ============================================================

-- profiles
create policy "profiles are public" on public.profiles
  for select to anon, authenticated using (true);
create policy "users update own profile" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- tags
create policy "tags are public" on public.tags
  for select to anon, authenticated using (true);

-- profile_tags
create policy "profile tags are public" on public.profile_tags
  for select to anon, authenticated using (true);
create policy "users add own tags" on public.profile_tags
  for insert to authenticated with check ((select auth.uid()) = profile_id);
create policy "users remove own tags" on public.profile_tags
  for delete to authenticated using ((select auth.uid()) = profile_id);

-- artworks
create policy "artworks are public" on public.artworks
  for select to anon, authenticated using (true);
create policy "users create own artworks" on public.artworks
  for insert to authenticated with check ((select auth.uid()) = owner_id);
create policy "users update own artworks" on public.artworks
  for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);
create policy "users delete own artworks" on public.artworks
  for delete to authenticated using ((select auth.uid()) = owner_id);

-- groups
create policy "groups are listed publicly" on public.groups
  for select to anon, authenticated using (true);
create policy "users create groups they own" on public.groups
  for insert to authenticated with check ((select auth.uid()) = owner_id);
create policy "owners update groups" on public.groups
  for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);
create policy "owners delete groups" on public.groups
  for delete to authenticated using ((select auth.uid()) = owner_id);

-- group_members
create policy "group members are visible" on public.group_members
  for select to anon, authenticated using (true);
create policy "users join public groups" on public.group_members
  for insert to authenticated
  with check (
    (select auth.uid()) = profile_id
    and exists (select 1 from public.groups g where g.id = group_id and not g.is_private)
  );
create policy "members leave or owners remove" on public.group_members
  for delete to authenticated
  using (
    (role <> 'owner' and (select auth.uid()) = profile_id)
    or exists (select 1 from public.groups g where g.id = group_id and g.owner_id = (select auth.uid()) and profile_id <> g.owner_id)
  );

-- posts
create policy "posts visible outside private groups" on public.posts
  for select to anon, authenticated
  using (group_id is null or private.can_view_group(group_id));
create policy "users create own posts" on public.posts
  for insert to authenticated
  with check (
    (select auth.uid()) = author_id
    and (group_id is null or private.is_group_member(group_id))
  );
create policy "users update own posts" on public.posts
  for update to authenticated
  using ((select auth.uid()) = author_id)
  with check ((select auth.uid()) = author_id);
create policy "users delete own posts" on public.posts
  for delete to authenticated using ((select auth.uid()) = author_id);

-- likes
create policy "likes visible with post" on public.likes
  for select to anon, authenticated
  using (exists (select 1 from public.posts p where p.id = post_id));
create policy "users like visible posts" on public.likes
  for insert to authenticated
  with check (
    (select auth.uid()) = profile_id
    and exists (select 1 from public.posts p where p.id = post_id)
  );
create policy "users unlike" on public.likes
  for delete to authenticated using ((select auth.uid()) = profile_id);

-- comments
create policy "comments visible with post" on public.comments
  for select to anon, authenticated
  using (exists (select 1 from public.posts p where p.id = post_id));
create policy "users comment on visible posts" on public.comments
  for insert to authenticated
  with check (
    (select auth.uid()) = author_id
    and exists (select 1 from public.posts p where p.id = post_id)
  );
create policy "authors or post owners delete comments" on public.comments
  for delete to authenticated
  using (
    (select auth.uid()) = author_id
    or exists (select 1 from public.posts p where p.id = post_id and p.author_id = (select auth.uid()))
  );

-- follows
create policy "follows are public" on public.follows
  for select to anon, authenticated using (true);
create policy "users follow others" on public.follows
  for insert to authenticated
  with check (
    (select auth.uid()) = follower_id
    and not private.is_blocked_between(follower_id, following_id)
  );
create policy "users unfollow" on public.follows
  for delete to authenticated using ((select auth.uid()) = follower_id);

-- listings
create policy "visible listings" on public.listings
  for select to anon, authenticated
  using (status <> 'hidden' or (select auth.uid()) = seller_id);
create policy "users create own listings" on public.listings
  for insert to authenticated with check ((select auth.uid()) = seller_id);
create policy "users update own listings" on public.listings
  for update to authenticated
  using ((select auth.uid()) = seller_id)
  with check ((select auth.uid()) = seller_id);
create policy "users delete own listings" on public.listings
  for delete to authenticated using ((select auth.uid()) = seller_id);

-- swipes
create policy "users see own swipes" on public.swipes
  for select to authenticated using ((select auth.uid()) = swiper_id);
create policy "users swipe" on public.swipes
  for insert to authenticated with check ((select auth.uid()) = swiper_id);
create policy "users change own swipe" on public.swipes
  for update to authenticated
  using ((select auth.uid()) = swiper_id)
  with check ((select auth.uid()) = swiper_id);

-- matches
create policy "users see own matches" on public.matches
  for select to authenticated using ((select auth.uid()) in (user_a, user_b));

-- conversations
create policy "members see conversations" on public.conversations
  for select to authenticated using ((select auth.uid()) in (user_a, user_b));

-- messages
create policy "members read messages" on public.messages
  for select to authenticated
  using (exists (select 1 from public.conversations c where c.id = conversation_id));
create policy "members send messages" on public.messages
  for insert to authenticated
  with check (
    (select auth.uid()) = sender_id
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and not private.is_blocked_between(c.user_a, c.user_b)
    )
  );

-- notifications
create policy "users see own notifications" on public.notifications
  for select to authenticated using ((select auth.uid()) = recipient_id);
create policy "users mark own notifications" on public.notifications
  for update to authenticated
  using ((select auth.uid()) = recipient_id)
  with check ((select auth.uid()) = recipient_id);
create policy "users delete own notifications" on public.notifications
  for delete to authenticated using ((select auth.uid()) = recipient_id);

-- blocks
create policy "users see own blocks" on public.blocks
  for select to authenticated using ((select auth.uid()) = blocker_id);
create policy "users block" on public.blocks
  for insert to authenticated with check ((select auth.uid()) = blocker_id);
create policy "users unblock" on public.blocks
  for delete to authenticated using ((select auth.uid()) = blocker_id);

-- reports
create policy "users see own reports" on public.reports
  for select to authenticated using ((select auth.uid()) = reporter_id);
create policy "users file reports" on public.reports
  for insert to authenticated with check ((select auth.uid()) = reporter_id);
