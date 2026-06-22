-- Unity 전투 세션 검증과 완료 보상을 하나의 트랜잭션으로 저장하는 RPC
create table if not exists public.unity_battle_sessions (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  floor integer not null check (floor >= 1),
  player_deck_dex_ids integer[] not null default '{}'::integer[],
  player_deck_type_ids text[] not null default '{}'::text[],
  player_deck_instance_ids text[] not null default '{}'::text[],
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '1 hour'),
  completed_at timestamptz
);

alter table public.unity_battle_sessions enable row level security;

grant select, insert on public.unity_battle_sessions to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'unity_battle_sessions'
      and policyname = 'unity_battle_sessions_select_own'
  ) then
    create policy unity_battle_sessions_select_own
    on public.unity_battle_sessions
    for select
    to authenticated
    using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'unity_battle_sessions'
      and policyname = 'unity_battle_sessions_insert_own'
  ) then
    create policy unity_battle_sessions_insert_own
    on public.unity_battle_sessions
    for insert
    to authenticated
    with check (auth.uid() = user_id);
  end if;
end;
$$;

drop function if exists public.complete_unity_battle(integer, boolean, integer, integer[], text[], text[]);

create or replace function public.complete_unity_battle(
  p_battle_session_id uuid,
  p_won boolean,
  p_turn_count integer
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_session_floor integer;
  v_session_completed_at timestamptz;
  v_session_expires_at timestamptz;
  v_player_deck_dex_ids integer[];
  v_player_deck_type_ids text[];
  v_player_deck_instance_ids text[];
  v_previous_current_floor integer;
  v_previous_max_cleared_floor integer;
  v_previous_lives integer;
  v_reward_pack_count integer := 1;
  v_reward_granted boolean := false;
  v_next_floor integer;
  v_retries_left integer;
begin
  if v_user_id is null then
    raise exception using
      errcode = '28000',
      message = 'not_authenticated';
  end if;

  if p_battle_session_id is null then
    raise exception using
      errcode = '22023',
      message = 'invalid_battle_session';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_user_id::text, 0));

  select
    s.floor,
    s.completed_at,
    s.expires_at,
    s.player_deck_dex_ids,
    s.player_deck_type_ids,
    s.player_deck_instance_ids
  into
    v_session_floor,
    v_session_completed_at,
    v_session_expires_at,
    v_player_deck_dex_ids,
    v_player_deck_type_ids,
    v_player_deck_instance_ids
  from public.unity_battle_sessions s
  where s.id = p_battle_session_id
    and s.user_id = v_user_id
  for update;

  if not found then
    raise exception using
      errcode = '22023',
      message = 'battle_session_not_found';
  end if;

  if v_session_completed_at is not null then
    raise exception using
      errcode = '23505',
      message = 'battle_session_already_completed';
  end if;

  if v_session_expires_at < now() then
    raise exception using
      errcode = '22023',
      message = 'battle_session_expired';
  end if;

  select coalesce(tf.reward_pack_count, 1)
  into v_reward_pack_count
  from public.tower_floors tf
  where tf.floor = v_session_floor;

  v_reward_pack_count := coalesce(v_reward_pack_count, 1);

  select
    coalesce(tp.current_floor, v_session_floor),
    coalesce(tp.max_cleared_floor, 0),
    coalesce(tp.player_lives, 4)
  into v_previous_current_floor, v_previous_max_cleared_floor, v_previous_lives
  from public.tower_progress tp
  where tp.user_id = v_user_id
  for update;

  if not found then
    v_previous_current_floor := v_session_floor;
    v_previous_max_cleared_floor := 0;
    v_previous_lives := 4;
  end if;

  update public.unity_battle_sessions
  set completed_at = now()
  where id = p_battle_session_id;

  insert into public.battle_histories (
    user_id,
    floor,
    won,
    turn_count,
    player_deck_dex_ids,
    player_deck_type_ids,
    fought_at
  ) values (
    v_user_id,
    v_session_floor,
    p_won,
    greatest(coalesce(p_turn_count, 0), 0),
    coalesce(v_player_deck_dex_ids, '{}'::integer[]),
    coalesce(v_player_deck_type_ids, '{}'::text[]),
    now()
  );

  if p_won then
    v_next_floor := v_session_floor + 1;
    v_reward_granted := v_session_floor > v_previous_max_cleared_floor;

    insert into public.tower_progress (
      user_id,
      current_floor,
      max_cleared_floor,
      player_lives
    ) values (
      v_user_id,
      greatest(v_previous_current_floor, v_next_floor),
      greatest(v_previous_max_cleared_floor, v_session_floor),
      v_previous_lives
    )
    on conflict (user_id) do update set
      current_floor = excluded.current_floor,
      max_cleared_floor = excluded.max_cleared_floor,
      player_lives = excluded.player_lives;

    if v_reward_granted then
      insert into public.pack_inventory (id, pack_count)
      values (v_user_id, v_reward_pack_count)
      on conflict (id) do update set
        pack_count = coalesce(public.pack_inventory.pack_count, 0) + excluded.pack_count;

      update public.owned_pokemon op
      set level = coalesce(op.level, 1) + 1
      where op.user_id = v_user_id
        and op.instance_id::text = any(coalesce(v_player_deck_instance_ids, '{}'::text[]));
    end if;

    return jsonb_build_object(
      'reward_pack_count', case when v_reward_granted then v_reward_pack_count else 0 end,
      'reward_granted', v_reward_granted,
      'next_floor', v_next_floor
    );
  end if;

  v_retries_left := greatest(v_previous_lives - 1, 0);

  insert into public.tower_progress (
    user_id,
    current_floor,
    max_cleared_floor,
    player_lives
  ) values (
    v_user_id,
    v_previous_current_floor,
    v_previous_max_cleared_floor,
    v_retries_left
  )
  on conflict (user_id) do update set
    current_floor = excluded.current_floor,
    max_cleared_floor = excluded.max_cleared_floor,
    player_lives = excluded.player_lives;

  return jsonb_build_object(
    'reward_pack_count', 0,
    'reward_granted', false,
    'retries_left', v_retries_left
  );
end;
$$;

grant execute on function public.complete_unity_battle(uuid, boolean, integer) to authenticated;
