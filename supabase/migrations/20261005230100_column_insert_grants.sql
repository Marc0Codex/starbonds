-- Table-level INSERT let clients set created_at; restrict to the columns the app writes.
revoke insert on public.blocks, public.follows, public.likes, public.swipes from authenticated;
grant insert (blocker_id, blocked_id) on public.blocks to authenticated;
grant insert (follower_id, following_id) on public.follows to authenticated;
grant insert (post_id, profile_id) on public.likes to authenticated;
grant insert (swiper_id, target_id, direction) on public.swipes to authenticated;
