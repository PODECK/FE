create or replace function public.claim_daily_mission_reward(p_mission_id text)
returns jsonb
language plpgsql
as $function$
declare
  v_user_id uuid := auth.uid();
  v_mission_date date := (now() at time zone 'Asia/Seoul')::date;
  v_today_start timestamptz := ((now() at time zone 'Asia/Seoul')::date::timestamp at time zone 'Asia/Seoul');
  v_tomorrow_start timestamptz := ((((now() at time zone 'Asia/Seoul')::date + 1)::timestamp) at time zone 'Asia/Seoul');

  v_progress public.daily_mission_progress;
  v_reward_pack_count int;
  v_today_wins int;
  v_type_wins int;
begin
  if v_user_id is null then
    return jsonb_build_object(
      'ok', false,
      'message', '로그인이 필요합니다.'
    );
  end if;

  if p_mission_id not in ('attendance', 'battle-win', 'type-win') then
    return jsonb_build_object(
      'ok', false,
      'message', '올바르지 않은 미션입니다.'
    );
  end if;

  select *
  into v_progress
  from public.ensure_daily_mission_progress();

  select *
  into v_progress
  from public.daily_mission_progress
  where user_id = v_user_id
    and mission_date = v_mission_date
  for update;

  if p_mission_id = 'attendance' then
    if v_progress.attendance_claimed then
      return jsonb_build_object('ok', false, 'message', '이미 수령한 보상입니다.');
    end if;

    v_reward_pack_count := 1;
  end if;

  if p_mission_id = 'battle-win' then
    if v_progress.battle_win_claimed then
      return jsonb_build_object('ok', false, 'message', '이미 수령한 보상입니다.');
    end if;

    select count(*)
    into v_today_wins
    from public.battle_histories
    where user_id = v_user_id
      and won = true
      and fought_at >= v_today_start
      and fought_at < v_tomorrow_start;

    if v_today_wins < 3 then
      return jsonb_build_object('ok', false, 'message', '아직 미션 조건을 달성하지 못했습니다.');
    end if;

    v_reward_pack_count := 3;
  end if;

  if p_mission_id = 'type-win' then
    if v_progress.type_win_claimed then
      return jsonb_build_object('ok', false, 'message', '이미 수령한 보상입니다.');
    end if;

    select count(*)
    into v_type_wins
    from public.battle_histories
    where user_id = v_user_id
      and won = true
      and player_deck_type_ids @> array[v_progress.target_type::text]
      and fought_at >= v_today_start
      and fought_at < v_tomorrow_start;

    if v_type_wins < 1 then
      return jsonb_build_object('ok', false, 'message', '아직 미션 조건을 달성하지 못했습니다.');
    end if;

    v_reward_pack_count := 1;
  end if;

  insert into public.pack_inventory (
    id,
    pack_count
  )
  values (
    v_user_id,
    v_reward_pack_count
  )
  on conflict (id)
  do update
  set pack_count = public.pack_inventory.pack_count + excluded.pack_count;

  update public.daily_mission_progress
  set
    attendance_claimed = case
      when p_mission_id = 'attendance' then true
      else attendance_claimed
    end,
    battle_win_claimed = case
      when p_mission_id = 'battle-win' then true
      else battle_win_claimed
    end,
    type_win_claimed = case
      when p_mission_id = 'type-win' then true
      else type_win_claimed
    end,
    updated_at = now()
  where user_id = v_user_id
    and mission_date = v_mission_date;

  return jsonb_build_object(
    'ok', true,
    'message', '보상을 수령했습니다.',
    'rewardPackCount', v_reward_pack_count
  );
end;
$function$;
