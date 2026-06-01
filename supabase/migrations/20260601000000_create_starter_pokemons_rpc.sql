do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'trainer_pokemons_user_id_dex_id_key'
      and conrelid = 'public.trainer_pokemons'::regclass
  ) then
    alter table public.trainer_pokemons
    add constraint trainer_pokemons_user_id_dex_id_key unique (user_id, dex_id);
  end if;
end;
$$;

create or replace function public.create_starter_pokemons(p_dex_ids integer[])
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  unique_dex_ids integer[];
begin
  if current_user_id is null then
    raise exception using
      errcode = '28000',
      message = 'not_authenticated';
  end if;

  select array_agg(dex_id order by dex_id)
  into unique_dex_ids
  from (
    select distinct unnest(p_dex_ids) as dex_id
  ) as dex_ids;

  if coalesce(array_length(unique_dex_ids, 1), 0) <> 3 then
    raise exception using
      errcode = '22023',
      message = 'starter_pokemons_require_three_unique_dex_ids';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(current_user_id::text, 0));

  if exists (
    select 1
    from public.trainer_pokemons
    where user_id = current_user_id
  ) then
    raise exception using
      errcode = '23505',
      message = 'starter_pokemons_already_selected';
  end if;

  insert into public.trainer_pokemons (user_id, dex_id)
  select current_user_id, dex_id
  from unnest(unique_dex_ids) as dex_id;
end;
$$;

grant execute on function public.create_starter_pokemons(integer[]) to authenticated;
