-- STARBONDS: helper functions, triggers and RPCs
-- Privileged helpers/triggers live in the unexposed `private` schema.

-- ============================================================
-- Helpers used by RLS policies
-- ============================================================
create or replace function private.is_blocked_between(a uuid, b uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.blocks
    where (blocker_id = a and blocked_id = b)
       or (blocker_id = b and blocked_id = a)
  );
$$;

create or replace function private.is_group_member(g uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.group_members
    where group_id = g and profile_id = (select auth.uid())
  );
$$;

create or replace function private.can_view_group(g uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.groups gr
    where gr.id = g
      and (
        not gr.is_private
        or exists (
          select 1 from public.group_members gm
          where gm.group_id = gr.id and gm.profile_id = (select auth.uid())
        )
      )
  );
$$;

-- ============================================================
-- Generic triggers
-- ============================================================
create or replace function private.set_updated_at()
returns trigger
language plpgsql set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function private.set_updated_at();
create trigger posts_updated_at before update on public.posts
  for each row execute function private.set_updated_at();
create trigger listings_updated_at before update on public.listings
  for each row execute function private.set_updated_at();

-- ============================================================
-- New auth user -> profile
-- ============================================================
create or replace function private.handle_new_user()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  base text;
  candidate text;
  n integer := 0;
begin
  base := lower(coalesce(
    nullif(new.raw_user_meta_data ->> 'username', ''),
    split_part(coalesce(new.email, ''), '@', 1)
  ));
  base := regexp_replace(base, '[^a-z0-9_]', '', 'g');
  if char_length(base) < 3 then
    base := base || 'artist';
  end if;
  base := left(base, 24);
  candidate := base;

  while exists (select 1 from public.profiles where username = candidate) loop
    n := n + 1;
    candidate := base || '_' || n::text;
  end loop;

  insert into public.profiles (id, username, display_name, avatar_path, locale)
  values (
    new.id,
    candidate,
    left(coalesce(
      nullif(new.raw_user_meta_data ->> 'display_name', ''),
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'name', ''),
      candidate
    ), 60),
    nullif(new.raw_user_meta_data ->> 'avatar_url', ''),
    case when new.raw_user_meta_data ->> 'locale' = 'en' then 'en' else 'es' end
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- ============================================================
-- Follows: counters + notification
-- ============================================================
create or replace function private.on_follow_change()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update public.profiles set followers_count = followers_count + 1 where id = new.following_id;
    update public.profiles set following_count = following_count + 1 where id = new.follower_id;
    insert into public.notifications (recipient_id, actor_id, type, entity_id)
    values (new.following_id, new.follower_id, 'follow', new.follower_id);
    return new;
  end if;

  update public.profiles set followers_count = greatest(followers_count - 1, 0) where id = old.following_id;
  update public.profiles set following_count = greatest(following_count - 1, 0) where id = old.follower_id;
  return old;
end;
$$;

create trigger follows_change
  after insert or delete on public.follows
  for each row execute function private.on_follow_change();

-- ============================================================
-- Likes: counter + notification
-- ============================================================
create or replace function private.on_like_change()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  author uuid;
begin
  if tg_op = 'INSERT' then
    update public.posts set likes_count = likes_count + 1
      where id = new.post_id returning author_id into author;
    if author is not null and author <> new.profile_id then
      insert into public.notifications (recipient_id, actor_id, type, entity_id)
      values (author, new.profile_id, 'like', new.post_id);
    end if;
    return new;
  end if;

  update public.posts set likes_count = greatest(likes_count - 1, 0) where id = old.post_id;
  return old;
end;
$$;

create trigger likes_change
  after insert or delete on public.likes
  for each row execute function private.on_like_change();

-- ============================================================
-- Comments: counter + notification
-- ============================================================
create or replace function private.on_comment_change()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  author uuid;
begin
  if tg_op = 'INSERT' then
    update public.posts set comments_count = comments_count + 1
      where id = new.post_id returning author_id into author;
    if author is not null and author <> new.author_id then
      insert into public.notifications (recipient_id, actor_id, type, entity_id)
      values (author, new.author_id, 'comment', new.post_id);
    end if;
    return new;
  end if;

  update public.posts set comments_count = greatest(comments_count - 1, 0) where id = old.post_id;
  return old;
end;
$$;

create trigger comments_change
  after insert or delete on public.comments
  for each row execute function private.on_comment_change();

-- ============================================================
-- Groups: owner membership, counters, join notification
-- ============================================================
create or replace function private.on_group_created()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.group_members (group_id, profile_id, role)
  values (new.id, new.owner_id, 'owner');
  return new;
end;
$$;

create trigger groups_created
  after insert on public.groups
  for each row execute function private.on_group_created();

create or replace function private.on_group_member_change()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  owner uuid;
begin
  if tg_op = 'INSERT' then
    update public.groups set members_count = members_count + 1
      where id = new.group_id returning owner_id into owner;
    if owner is not null and owner <> new.profile_id then
      insert into public.notifications (recipient_id, actor_id, type, entity_id)
      values (owner, new.profile_id, 'group_join', new.group_id);
    end if;
    return new;
  end if;

  update public.groups set members_count = greatest(members_count - 1, 0) where id = old.group_id;
  return old;
end;
$$;

create trigger group_members_change
  after insert or delete on public.group_members
  for each row execute function private.on_group_member_change();

-- ============================================================
-- Blocks: remove follows in both directions
-- ============================================================
create or replace function private.on_block()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  delete from public.follows
  where (follower_id = new.blocker_id and following_id = new.blocked_id)
     or (follower_id = new.blocked_id and following_id = new.blocker_id);
  return new;
end;
$$;

create trigger blocks_created
  after insert on public.blocks
  for each row execute function private.on_block();

-- ============================================================
-- Swipes: mutual like -> match + conversation + notifications
-- ============================================================
create or replace function private.on_swipe()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  a uuid := least(new.swiper_id, new.target_id);
  b uuid := greatest(new.swiper_id, new.target_id);
  conv uuid;
  match_id uuid;
begin
  if new.direction <> 'like' then
    return new;
  end if;

  if not exists (
    select 1 from public.swipes
    where swiper_id = new.target_id and target_id = new.swiper_id and direction = 'like'
  ) then
    return new;
  end if;

  if private.is_blocked_between(a, b) then
    return new;
  end if;

  insert into public.conversations (user_a, user_b)
  values (a, b)
  on conflict (user_a, user_b) do update set user_a = excluded.user_a
  returning id into conv;

  insert into public.matches (user_a, user_b, conversation_id)
  values (a, b, conv)
  on conflict (user_a, user_b) do nothing
  returning id into match_id;

  if match_id is not null then
    insert into public.notifications (recipient_id, actor_id, type, entity_id)
    values
      (new.swiper_id, new.target_id, 'match', match_id),
      (new.target_id, new.swiper_id, 'match', match_id);
  end if;

  return new;
end;
$$;

create trigger swipes_match
  after insert or update of direction on public.swipes
  for each row execute function private.on_swipe();

-- ============================================================
-- Messages: bump conversation, mark sender as read
-- ============================================================
create or replace function private.on_message()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  update public.conversations
  set last_message_at = new.created_at,
      a_last_read_at = case when user_a = new.sender_id then new.created_at else a_last_read_at end,
      b_last_read_at = case when user_b = new.sender_id then new.created_at else b_last_read_at end
  where id = new.conversation_id;
  return new;
end;
$$;

create trigger messages_created
  after insert on public.messages
  for each row execute function private.on_message();

-- ============================================================
-- Public RPCs
-- ============================================================

-- Match candidates ranked by shared tags (goals weigh more),
-- with a small boost for artists with few followers.
create or replace function public.get_match_candidates(p_limit integer default 20)
returns table (
  id uuid,
  username text,
  display_name text,
  avatar_path text,
  bio text,
  location text,
  followers_count integer,
  score double precision,
  shared_tag_ids smallint[],
  tag_ids smallint[]
)
language sql stable security invoker set search_path = ''
as $$
  with my_tags as (
    select pt.tag_id, t.kind
    from public.profile_tags pt
    join public.tags t on t.id = pt.tag_id
    where pt.profile_id = (select auth.uid())
  ),
  candidates as (
    select p.*
    from public.profiles p
    where (select auth.uid()) is not null
      and p.id <> (select auth.uid())
      and p.onboarded
      and p.open_to_collab
      and not exists (
        select 1 from public.swipes s
        where s.swiper_id = (select auth.uid()) and s.target_id = p.id
      )
      and not private.is_blocked_between((select auth.uid()), p.id)
  )
  select
    c.id, c.username, c.display_name, c.avatar_path, c.bio, c.location, c.followers_count,
    (
      coalesce(sum(case
        when mt.tag_id is null then 0
        when mt.kind = 'goal' then 3
        else 2
      end), 0)
      + 1.5 / (1 + ln(1 + c.followers_count))
    )::double precision as score,
    coalesce(array_agg(mt.tag_id) filter (where mt.tag_id is not null), '{}')::smallint[] as shared_tag_ids,
    coalesce((select array_agg(pt2.tag_id) from public.profile_tags pt2 where pt2.profile_id = c.id), '{}')::smallint[] as tag_ids
  from candidates c
  left join public.profile_tags pt on pt.profile_id = c.id
  left join my_tags mt on mt.tag_id = pt.tag_id
  group by c.id, c.username, c.display_name, c.avatar_path, c.bio, c.location, c.followers_count
  order by score desc, random()
  limit least(greatest(p_limit, 1), 50);
$$;

-- Discover feed: recency + visibility boost for less-followed artists + engagement.
create or replace function public.get_discover_feed(p_limit integer default 20, p_offset integer default 0)
returns setof public.posts
language sql stable security invoker set search_path = ''
as $$
  select po.*
  from public.posts po
  join public.profiles au on au.id = po.author_id
  where po.created_at > now() - interval '30 days'
    and po.group_id is null
    and po.author_id <> (select auth.uid())
    and not private.is_blocked_between((select auth.uid()), po.author_id)
  order by (
      - extract(epoch from (now() - po.created_at)) / 3600.0
      + 48.0 / (1 + ln(1 + au.followers_count))
      + 6 * ln(1 + po.likes_count + 2 * po.comments_count)
    ) desc,
    po.id
  limit least(greatest(p_limit, 1), 50)
  offset greatest(p_offset, 0);
$$;

-- Following feed: own posts, followed artists, joined groups.
create or replace function public.get_following_feed(p_limit integer default 20, p_before timestamptz default null)
returns setof public.posts
language sql stable security invoker set search_path = ''
as $$
  select po.*
  from public.posts po
  where (
      po.author_id = (select auth.uid())
      or po.author_id in (select f.following_id from public.follows f where f.follower_id = (select auth.uid()))
      or po.group_id in (select gm.group_id from public.group_members gm where gm.profile_id = (select auth.uid()))
    )
    and (p_before is null or po.created_at < p_before)
  order by po.created_at desc
  limit least(greatest(p_limit, 1), 50);
$$;

-- Open (or reuse) the conversation with another artist.
-- Allowed when the two artists matched, or when contacting the seller of an active listing.
create or replace function public.start_conversation(p_other uuid, p_listing uuid default null)
returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  me uuid := (select auth.uid());
  a uuid;
  b uuid;
  conv uuid;
  valid_listing boolean;
begin
  if me is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;
  if p_other is null or p_other = me then
    raise exception 'invalid recipient' using errcode = '22023';
  end if;
  if private.is_blocked_between(me, p_other) then
    raise exception 'not allowed' using errcode = '42501';
  end if;

  a := least(me, p_other);
  b := greatest(me, p_other);

  valid_listing := p_listing is not null and exists (
    select 1 from public.listings
    where id = p_listing and seller_id = p_other and status = 'active'
  );

  select id into conv from public.conversations where user_a = a and user_b = b;
  if conv is not null then
    if valid_listing then
      update public.conversations set listing_id = p_listing where id = conv;
    end if;
    return conv;
  end if;

  if not (valid_listing or exists (select 1 from public.matches where user_a = a and user_b = b)) then
    raise exception 'not allowed' using errcode = '42501';
  end if;

  insert into public.conversations (user_a, user_b, listing_id)
  values (a, b, case when valid_listing then p_listing end)
  returning id into conv;
  return conv;
end;
$$;

create or replace function public.mark_conversation_read(p_conversation uuid)
returns void
language sql security definer set search_path = ''
as $$
  update public.conversations
  set a_last_read_at = case when user_a = (select auth.uid()) then now() else a_last_read_at end,
      b_last_read_at = case when user_b = (select auth.uid()) then now() else b_last_read_at end
  where id = p_conversation
    and (select auth.uid()) in (user_a, user_b);
$$;

-- Permanently delete the signed-in user's account (cascades to profile data).
create or replace function public.delete_account()
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  me uuid := (select auth.uid());
begin
  if me is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;
  delete from auth.users where id = me;
end;
$$;
