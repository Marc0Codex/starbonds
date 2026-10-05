-- STARBONDS: core schema (types, tables, indexes)

create schema if not exists private;

-- ---------- Types ----------
create type public.tag_kind as enum ('medium', 'style', 'goal');
create type public.post_type as enum ('general', 'collaboration', 'showcase');
create type public.listing_kind as enum ('artwork', 'service');
create type public.listing_status as enum ('active', 'sold', 'hidden');
create type public.swipe_direction as enum ('like', 'pass');
create type public.notification_type as enum ('like', 'comment', 'follow', 'match', 'group_join');
create type public.report_target as enum ('profile', 'post', 'comment', 'listing', 'message');

-- ---------- Profiles & tags ----------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_]{3,30}$'),
  display_name text not null check (char_length(display_name) between 1 and 60),
  bio text check (char_length(bio) <= 500),
  avatar_path text,
  website text check (char_length(website) <= 200),
  location text check (char_length(location) <= 80),
  links jsonb not null default '[]'::jsonb check (jsonb_typeof(links) = 'array'),
  open_to_collab boolean not null default true,
  locale text not null default 'es' check (locale in ('es', 'en')),
  onboarded boolean not null default false,
  followers_count integer not null default 0,
  following_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tags (
  id smallint generated always as identity primary key,
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  kind public.tag_kind not null,
  name_es text not null,
  name_en text not null
);
create index tags_kind_idx on public.tags (kind);

create table public.profile_tags (
  profile_id uuid not null references public.profiles (id) on delete cascade,
  tag_id smallint not null references public.tags (id) on delete cascade,
  primary key (profile_id, tag_id)
);
create index profile_tags_tag_idx on public.profile_tags (tag_id, profile_id);

-- ---------- Portfolio ----------
create table public.artworks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  description text check (char_length(description) <= 2000),
  images text[] not null check (cardinality(images) between 1 and 10),
  year smallint check (year between 1000 and 2200),
  created_at timestamptz not null default now()
);
create index artworks_owner_idx on public.artworks (owner_id, created_at desc);

-- ---------- Community ----------
create table public.groups (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{3,50}$'),
  name text not null check (char_length(name) between 3 and 80),
  description text check (char_length(description) <= 1000),
  cover_path text,
  owner_id uuid not null references public.profiles (id) on delete cascade,
  is_private boolean not null default false,
  members_count integer not null default 0,
  created_at timestamptz not null default now()
);
create index groups_owner_idx on public.groups (owner_id);

create table public.group_members (
  group_id uuid not null references public.groups (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  joined_at timestamptz not null default now(),
  primary key (group_id, profile_id)
);
create index group_members_profile_idx on public.group_members (profile_id);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null default '' check (char_length(body) <= 2000),
  media text[] not null default '{}' check (cardinality(media) <= 10),
  post_type public.post_type not null default 'general',
  artwork_id uuid references public.artworks (id) on delete set null,
  group_id uuid references public.groups (id) on delete cascade,
  likes_count integer not null default 0,
  comments_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint posts_not_empty check (char_length(body) > 0 or cardinality(media) > 0)
);
create index posts_author_idx on public.posts (author_id, created_at desc);
create index posts_group_idx on public.posts (group_id, created_at desc) where group_id is not null;
create index posts_created_idx on public.posts (created_at desc);
create index posts_artwork_idx on public.posts (artwork_id) where artwork_id is not null;

create table public.likes (
  post_id uuid not null references public.posts (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, profile_id)
);
create index likes_profile_idx on public.likes (profile_id);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);
create index comments_post_idx on public.comments (post_id, created_at);
create index comments_author_idx on public.comments (author_id);

create table public.follows (
  follower_id uuid not null references public.profiles (id) on delete cascade,
  following_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);
create index follows_following_idx on public.follows (following_id);

-- ---------- Marketplace ----------
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles (id) on delete cascade,
  kind public.listing_kind not null,
  title text not null check (char_length(title) between 3 and 120),
  description text not null default '' check (char_length(description) <= 4000),
  price_cents integer not null check (price_cents >= 0),
  currency text not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
  images text[] not null default '{}' check (cardinality(images) <= 10),
  artwork_id uuid references public.artworks (id) on delete set null,
  medium_tag_id smallint references public.tags (id) on delete set null,
  status public.listing_status not null default 'active',
  -- reserved for Stripe Connect (phase 9)
  stripe_price_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index listings_seller_idx on public.listings (seller_id, created_at desc);
create index listings_browse_idx on public.listings (status, kind, created_at desc);
create index listings_medium_idx on public.listings (medium_tag_id) where medium_tag_id is not null;
create index listings_artwork_idx on public.listings (artwork_id) where artwork_id is not null;

-- ---------- Matching & messaging ----------
create table public.swipes (
  swiper_id uuid not null references public.profiles (id) on delete cascade,
  target_id uuid not null references public.profiles (id) on delete cascade,
  direction public.swipe_direction not null,
  created_at timestamptz not null default now(),
  primary key (swiper_id, target_id),
  check (swiper_id <> target_id)
);
create index swipes_target_idx on public.swipes (target_id, direction);

-- One conversation per pair of artists (user_a < user_b)
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references public.profiles (id) on delete cascade,
  user_b uuid not null references public.profiles (id) on delete cascade,
  listing_id uuid references public.listings (id) on delete set null,
  a_last_read_at timestamptz not null default now(),
  b_last_read_at timestamptz not null default now(),
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_a, user_b),
  check (user_a < user_b)
);
create index conversations_user_b_idx on public.conversations (user_b);
create index conversations_listing_idx on public.conversations (listing_id) where listing_id is not null;

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references public.profiles (id) on delete cascade,
  user_b uuid not null references public.profiles (id) on delete cascade,
  conversation_id uuid references public.conversations (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (user_a, user_b),
  check (user_a < user_b)
);
create index matches_user_b_idx on public.matches (user_b);
create index matches_conversation_idx on public.matches (conversation_id);

create table public.messages (
  id bigint generated always as identity primary key,
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null default '' check (char_length(body) <= 4000),
  media_path text,
  created_at timestamptz not null default now(),
  constraint messages_not_empty check (char_length(body) > 0 or media_path is not null)
);
create index messages_conversation_idx on public.messages (conversation_id, created_at desc);
create index messages_sender_idx on public.messages (sender_id);

-- ---------- Activity & moderation ----------
create table public.notifications (
  id bigint generated always as identity primary key,
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  actor_id uuid references public.profiles (id) on delete cascade,
  type public.notification_type not null,
  entity_id uuid,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_recipient_idx on public.notifications (recipient_id, created_at desc);
create index notifications_unread_idx on public.notifications (recipient_id) where read_at is null;
create index notifications_actor_idx on public.notifications (actor_id);

create table public.blocks (
  blocker_id uuid not null references public.profiles (id) on delete cascade,
  blocked_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);
create index blocks_blocked_idx on public.blocks (blocked_id);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  target_type public.report_target not null,
  target_id text not null,
  reason text not null check (char_length(reason) between 3 and 1000),
  status text not null default 'open' check (status in ('open', 'reviewed', 'dismissed')),
  created_at timestamptz not null default now()
);
create index reports_reporter_idx on public.reports (reporter_id);
