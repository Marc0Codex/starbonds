-- STARBONDS: keep SECURITY DEFINER bodies out of the exposed `public` schema.
-- Public RPCs become SECURITY INVOKER wrappers around private implementations.

-- start_conversation
alter function public.start_conversation(uuid, uuid) set schema private;
alter function private.start_conversation(uuid, uuid) rename to start_conversation_impl;

create function public.start_conversation(p_other uuid, p_listing uuid default null)
returns uuid
language sql security invoker set search_path = ''
as $$
  select private.start_conversation_impl(p_other, p_listing);
$$;

-- mark_conversation_read
alter function public.mark_conversation_read(uuid) set schema private;
alter function private.mark_conversation_read(uuid) rename to mark_conversation_read_impl;

create function public.mark_conversation_read(p_conversation uuid)
returns void
language sql security invoker set search_path = ''
as $$
  select private.mark_conversation_read_impl(p_conversation);
$$;

-- delete_account
alter function public.delete_account() set schema private;
alter function private.delete_account() rename to delete_account_impl;

create function public.delete_account()
returns void
language sql security invoker set search_path = ''
as $$
  select private.delete_account_impl();
$$;

-- Grants
revoke all on function private.start_conversation_impl(uuid, uuid) from public, anon;
revoke all on function private.mark_conversation_read_impl(uuid) from public, anon;
revoke all on function private.delete_account_impl() from public, anon;
grant execute on function private.start_conversation_impl(uuid, uuid) to authenticated;
grant execute on function private.mark_conversation_read_impl(uuid) to authenticated;
grant execute on function private.delete_account_impl() to authenticated;

revoke all on function public.start_conversation(uuid, uuid) from public, anon;
revoke all on function public.mark_conversation_read(uuid) from public, anon;
revoke all on function public.delete_account() from public, anon;
grant execute on function public.start_conversation(uuid, uuid) to authenticated;
grant execute on function public.mark_conversation_read(uuid) to authenticated;
grant execute on function public.delete_account() to authenticated;
