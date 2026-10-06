-- RLS hardening after security review.

-- 2) Messages: explicit membership instead of relying on the conversations policy,
--    and attachments must live in the conversation's own storage folder.
drop policy "members read messages" on public.messages;
create policy "members read messages" on public.messages
  for select to authenticated
  using (exists (
    select 1 from public.conversations c
    where c.id = messages.conversation_id
      and (select auth.uid()) in (c.user_a, c.user_b)
  ));

drop policy "members send messages" on public.messages;
create policy "members send messages" on public.messages
  for insert to authenticated
  with check (
    (select auth.uid()) = sender_id
    and (media_path is null or media_path like conversation_id::text || '/%')
    and exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and (select auth.uid()) in (c.user_a, c.user_b)
        and not private.is_blocked_between(c.user_a, c.user_b)
    )
  );

-- 3) Blocked users can't like or comment on each other's posts.
drop policy "users like visible posts" on public.likes;
create policy "users like visible posts" on public.likes
  for insert to authenticated
  with check (
    (select auth.uid()) = profile_id
    and exists (
      select 1 from public.posts p
      where p.id = likes.post_id and not private.is_blocked_between(profile_id, p.author_id)
    )
  );

drop policy "users comment on visible posts" on public.comments;
create policy "users comment on visible posts" on public.comments
  for insert to authenticated
  with check (
    (select auth.uid()) = author_id
    and exists (
      select 1 from public.posts p
      where p.id = comments.post_id and not private.is_blocked_between(author_id, p.author_id)
    )
  );

-- 4) Swipes: a blocked pair can't swipe each other (prevents matches/conversations).
drop policy "users swipe" on public.swipes;
create policy "users swipe" on public.swipes
  for insert to authenticated
  with check ((select auth.uid()) = swiper_id and not private.is_blocked_between(swiper_id, target_id));

-- 5) Sane bounds on free-form fields not yet constrained.
alter table public.listings add constraint listings_price_cents_max check (price_cents <= 100000000);
alter table public.profiles add constraint profiles_links_max check (jsonb_array_length(links) <= 10);
